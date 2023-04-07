import tmi from 'tmi.js';
import HandlerMap from "./HandlerMap.mjs";
import {
    Constants
}
from './Constants.mjs';
import {
    Secrets
}
from './Secrets.mjs';
import {
    exec
}
from 'child_process';
import {
    FileRepository
}
from "./FileRepository.mjs";

export default class ChatBot extends HandlerMap {
    constructor(username, secrets, chatDelay, commands) {
        // console.log("ChatBot.ctor " + commands);
        super();
        var self = this;
        secrets = new Secrets(secrets);
        var instance = this;
        this.commands = commands ?? new Map();

        // Define configuration options
        const opts = {
            identity: {
                username: username,
                password: secrets.tmi
            }
        };

        this.commandState = new Map();
        this.chatDelay = chatDelay;
        this.channels = new Set();

        FileRepository.readChatBotState().then(function (data) {
            try {
                var arr = JSON.parse(data);
                for (let i = 0; i < arr.length; i++) {
                    self.commandState.set(arr[i][0], arr[i][1]);
                }
            } catch (e) {
                //no state data saved
            }
        });

        // Create a client with our options
        this.client = new tmi.client(opts);

        // Register our event handlers (defined below)
        this.client.on('message', function (target, context, msg, isSelf) {
            instance.onMessageHandler.call(instance, target, context, msg, isSelf);
        });
        this.AddHandler("message", function (x) {
            instance.processCommand(x);
        }, true);
        this.client.on('connected', function (address, port) {
            instance.onConnectedHandler.call(instance, address, port);
        });

        // Connect to Twitch:
        this.client.connect();
    }

    createCommandState(state) {
        var stateId = crypto.randomUUID();
        this.commandState.set(stateId, state);
        FileRepository.saveChatBotState(Array.from(this.commandState.entries()));
        return stateId;
    }

    createChannelCommandState(channel, state) {
        this.commandState.set(channel, state);
        FileRepository.saveChatBotState(Array.from(this.commandState.entries()));
    }

    getCommandState(id) {
        return this.commandState.get(id);
    }

    setCommandState(id, state) {
        var state = this.commandState.set(id, state);
        FileRepository.saveChatBotState(Array.from(this.commandState.entries()));
    }

    deleteCommandState(id) {
        this.commandState.delete(id);
        FileRepository.saveChatBotState(Array.from(this.commandState.entries()));
    }

    joinChannel(name) {
        this.channels.add(name);
        return this.client.join(name);
    }

    leaveChannel(name) {
        if (this.channels.has(name)) {
            this.channels.delete(name);
            return this.client.part(name);
        } else {
            return Promise.resolve(null);
        }
    }

    addCommand(key, value) {
        this.commands.set(key, value);
    }

    enableCommand(key, value) {
        var command = this.commands.get(key);
        comand.enabled = true;
        this.commands.set(key, command);
    }

    disableCommand(key, value) {
        var command = this.commands.get(key);
        comand.enabled = false;
        this.commands.set(key, command);
    }

    // Called every time a message comes in
    onMessageHandler(target, context, msg, isSelf) {

        //example message
        /*
        interpreting chat
        #crimebastard

    {
        'badge-info': null,
        badges: {
        broadcaster: '1'
        },
        'client-nonce': 'e56934cc3a372a24f9b4a3acd94382c1',
        color: '#8A2BE2',
        'display-name': 'Crimebastard',
        emotes: {
        '116625': ['18-25'],
        '166263': ['27-35'],
        '305890916': ['37-46'],
        '555555584': ['15-16'],
        emotesv2_880ee86f4d544cab81ab9b609da2ed7e: ['48-59'],
        emotesv2_3b10f370b0e242e1a23f69e8b24c9f5c: ['2-13']
        },
        'first-msg': false,
        flags: null,
        id: 'c36f61ec-c947-435e-9e52-ab29306e66e8',
        mod: false,
        'returning-chatter': false,
        'room-id': '109465513',
        subscriber: false,
        'tmi-sent-ts': '1672998396672',
        turbo: false,
        'user-id': '109465513',
        'user-type': null,
        'emotes-raw': '305890916:37-46/emotesv2_880ee86f4d544cab81ab9b609da2ed7e:48-59/emotesv2_3b10f370b0e242e1a23f69e8b24c9f5c:2-13/555555584:15-16/116625:18-25/166263:27-35',
        'badge-info-raw': null,
        'badges-raw': 'broadcaster/1',
        username: 'crimebastard',
        'message-type': 'chat'
        }

        a beatclWiggle <3 CurseLit TwitchLit beatclLove beatclGLONKY
        false
         */

        // FileRepository.log(target, context.username, msg, self);
        // if (self) {
        // FileRepository.log("Ignore messages from the bot");

        // return;
        // } // Ignore messages from the bot

        this.ExecuteHandlers("message", {
            target: target,
            msg: msg,
            context: context,
            "self": isSelf,
            chatBot: this
        });
    }

    hasRole(context, role) {
        if (role === "" || role === Constants.chatRoles.viewer) {
            return true;
        } else if (role === Constants.chatRoles.subscriber) {
            return context.subscriber;
        } else if (role === Constants.chatRoles.moderator) {
            return context.mod;
        } else if (role === Constants.chatRoles.broadcaster) {
            return context.badges.broadcaster === "1";
        } else {
            return false;
        }
    }

    processCommand(obj) {
        var self = this;
        // Remove whitespace from chat message
        const commandName = obj.msg.trim();
        var match = commandName.match(Constants.commandRegex);

        if (match?.index === 0 && match[1]?.length > 0) {
            var commandObject = this.commands.get(match[1]);
            FileRepository.log("processCommand commands " + Array.from(this.commands.entries()).join("\r\n"));
            FileRepository.log("processCommand match " + match);
            FileRepository.log("processCommand command " + JSON.stringify(commandObject));
            FileRepository.log("processCommand enabled " + commandObject?.enabled);
            FileRepository.log("processCommand role " + this.hasRole(obj.context, commandObject?.role));

            if (commandObject?.enabled && this.hasRole(obj.context, commandObject?.role)) {

                FileRepository.log("processCommand checking cooldown");
                if (commandObject.lastExecution + commandObject.cooldown < Date.now()) {
                    FileRepository.log("processCommand running command");
                    commandObject.lastExecution = Date.now();
                    obj.args = match[2];
                    // console.log("processCommand sending Message");
                    return self.sendMessage(obj.target.substr(1), commandObject.handler(obj));
                } else {
                    // console.log("processCommand debounced", commandObject.lastExecution, commandObject.cooldown);
                    return self.sendMessage(obj.target.substr(1), "Wait for command to cool down in " +
                        (commandObject.lastExecution + commandObject.cooldown - Date.now()) +
                        " ms");
                }
            }
        }
    }

    sendMessage(channel, text) {
        FileRepository.log("sendMessage " + channel + ": " + text);
        if (text && text.length > 0) {
            return this.client.say(channel, text);
        }
    }

    action(channel, text) {
        return this.client.action(channel, text);
    }

    sendMessages(channel, messages) {
        var self = this;
        if (messages.length > 0) {

            return messages.reduce(function (a, c, i, arr) {
                // return new Promise(function(resolve, reject){
                // setTimeout(function(){
                return a.then(function () {
                    return self.sendMessage(channel, c);
                })
                .then(function () {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve();
                        }, self.chatDelay);
                    });
                });
                // resolve();
                // }, delay);
                // });
            }, Promise.resolve());
        } else {
            return null;

        }
    }

    getCommandDescriptions() {
        return Array.from(this.commands.entries().map(function (x) {
                return x[0] + "\r\n" +
                x[1].description + "\r\n" +
                x[1].cooldown + "\r\n" +
                x[1].lastExecution + "\r\n" +
                x[1].role + "\r\n" +
                x[1].enabled + "\r\n";
            })).join("\r\n");
    }

    // Called every time the bot connects to Twitch chat
    onConnectedHandler(addr, port) {
        var self = this;
        FileRepository.log(`* Connected to ${addr}:${port}`);
    }
}

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
    TwitchChatMessageContext
}
from './TwitchChatMessageContext.mjs';
import {
    FileRepository
}
from "./FileRepository.mjs";
import {
    ChatCommand
}
from "./ChatCommand.mjs";
import {
    ChatCommands
}
from "./ChatCommands.mjs";
import ChatCommandManager from "./ChatCommandManager.mjs";

export default class ChatBot extends HandlerMap {
    constructor(config, secrets, oscManager) {
        super();
        var self = this;
        self.config = config;
        self.oscManager = oscManager;
        self.username = config.botName;
        secrets = new Secrets(secrets);
        // Define configuration options
        self.tmiOptions = {
            identity: {
                username: config.botName,
                password: secrets.tmi
            }
        };

        self.commandState = new Map();
        self.channels = new Set();
        self.chatCommandManager = new ChatCommandManager({
            config: self.config,
            oscManager: self.oscManager
        });

        self.loadCommands();
    }

    loadCommands() {
        var self = this;
        for (var command of ChatCommands.entries()) {
            var commandConstructed = new ChatCommand(command[1]);
            self.chatCommandManager.setCommand(command[0], commandConstructed);
        }
    }

    isConnected() {
        // console.log("this.client", this.client);
        return this.client?.server.length > 0;
    }

    connect() {

        var self = this;

        // Create a client with our options
        self.client = new tmi.client(self.tmiOptions);

        // Register our event handlers (defined below)
        self.client.on('message', function (target, context, msg, isSelf) {
            //todo parse args here?
            self.onMessageHandler.call(self, target, context, msg, isSelf);
        });
        self.AddHandler("message", function (x) {
            try {
                var commandMessage = self.chatCommandManager.getCommandResult(x);

                if (commandMessage) {

                    if (typeof commandMessage === "string" && commandMessage?.length > 0) {
                        //send one message
        // console.log("string message: ", commandMessage);
                        self.sendMessage(x.target.substr(1), commandMessage);
                    } else if (typeof commandMessage === "object" && commandMessage?.length > 0) {
                        //loop through the array and send a separate message for each item
        // console.log("array message: ", commandMessage);
                        self.sendMessages(x.target.substr(1), commandMessage);
                    } else if (commandMessage.then) {
                        //wait until the promise fulfils and then send a message
        // console.log("promise message: ", commandMessage);
                        commandMessage.then(function (message) {
                            if (message) {
								console.log(message);
                                self.sendMessage(x.target.substr(1), message);
                            }
                        });
                    } else if (typeof commandMessage === "function") {
                        //pass in a callback because the command will run more than once
        // console.log("function message: ", commandMessage);
                        commandMessage(function (message) {
                            self.sendMessage(x.target.substr(1), message);
                        });
                    }
                }
            } catch (e) {
                FileRepository.log(new Date(Date.now()).toISOString() + " \r\n " + e);
            }
        }, true);
        self.client.on('connected', function (address, port) {
            self.onConnectedHandler.call(self, address, port);
        });

        // Connect to Twitch:
        self.client.connect();
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

    // addCommand(key, value) {
    // this.commands.set(key, value);
    // }

    // enableCommand(key, value) {
    // var command = this.commands.get(key);
    // comand.enabled = true;
    // this.commands.set(key, command);
    // }

    // disableCommand(key, value) {
    // var command = this.commands.get(key);
    // comand.enabled = false;
    // this.commands.set(key, command);
    // }

    // Called every time a message comes in
    onMessageHandler(target, context, msg, isSelf) {
        var self = this;
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

        // } // Ignore messages from the bot

        var args = msg.split(" ");
        args.shift();

        this.ExecuteHandlers("message", {
            target: target,
            msg: msg,
            context: new TwitchChatMessageContext(context),
            "self": isSelf,
            chatBot: self,
            args: args
        });
    }

    sendMessage(channel, text) {
        if (!this.client) {
            this.connect();
        }

        if (text && text.length > 0) {
            return this.client?.say(channel, text)
            .catch(function (err) {
                console.log("error trying to say: \"" + text + "\" in channel: " + channel);
                console.log(err);
            });
        }
    }

    action(channel, text) {
        return this.client.action(channel, text);
    }

    sendMessages(channel, messages) {
        var self = this;
        if (messages?.length > 0) {

            return messages.reduce(function (a, c, i, arr) {
                return a.then(function () {
                    return self.sendMessage(channel, c);
                })
                .then(function () {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve();
                        }, self.config.chatDelay);
                    });
                });
            }, Promise.resolve());
        } else {
            return null;
        }
    }

    // Called every time the bot connects to Twitch chat
    onConnectedHandler(addr, port) {
        FileRepository.log(`* Connected to ${addr}:${port}`);
    }
}

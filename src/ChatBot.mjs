import Crypto from "crypto";
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
import User from "./User.mjs";
import RepeatingMessage from "./RepeatingMessage.mjs";
import ChatCommandManager from "./ChatCommandManager.mjs";

export default class ChatBot extends HandlerMap {
    constructor(app) {
        super();
        var self = this;
        self.app = app;
        self.twitchAPIProvider = app.twitchAPIProvider;
        self.config = app.config;
        self.oscManager = app.oscManager;
        self.username = app.config.botName;
        // Define configuration options
        self.tmiOptions = {
            identity: {
                username: app.config.botName,
                password: app.secrets.tmi
            },
            options: {
                skipMembership: false
            }
        };

        self.channels = new Map();
        self.chatCommandManager = new ChatCommandManager(self.app);

        self.repeatingMessages = new Map();
        self.repeatingMessageIntervals = new Map();
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

        self.client.on('join', joinHandler);
        self.client.on('part', partHandler);

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
                                //console.log(message);
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
        self.client.on('connected', function (address, port, connection) {
            FileRepository.log("Chatbot.connected handler " +
                JSON.stringify(address) +
                JSON.stringify(port) +
                JSON.stringify(self.client));
            self.onConnectedHandler.call(self, address, port);

            // connection.sendUTF('CAP REQ :twitch.tv/tags twitch.tv/commands');
        });

        // Connect to Twitch:
        self.client.connect();
        
        function joinPartHandler(channel, username, isSelf, action) {
            const obj = {
                channel: channel,
                username: username,
                isSelf: isSelf,
                timestamp: Date.now(),
                action: action
            };

            FileRepository.saveChatMessage(JSON.stringify(obj));
        }
        
        function joinHandler(channel, username, isSelf) {
            joinPartHandler(channel, username, isSelf, "JOIN");
        }

        function partHandler(channel, username, isSelf) {
            joinPartHandler(channel, username, isSelf, "PART");
        }
    }

    joinChannel(name) {
        let self = this;

        return self.app.twitchAPIProvider.getUserInfo({
            login: name
        }, function (res) {
            let user = new User(res.data[0]);
            self.channels.set(name, {
                broadcasterId: user.id
            });
        })
        .then(function () {
            self.client.join(name);
        })
        .catch(function (e) {
            FileRepository.log(e);
        });
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
        FileRepository.log(`sendMessage ` + channel + " " + text);
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
        let self = this;

        setInterval(function () {
            self.getChatters();
        }, 5 * 60 * 1000);
    }

    getChannelChatters(channel) {
        let self = this;
        let channelState = self.channels.get(channel);

        if (!channelState?.chatters) {
            return self.getChatters().then(function () {
                return Promise.resolve(self.channels.get(channel).chatters);
            });
        } else {
            return Promise.resolve(channelState.chatters);
        }
    }

    getChatters() {
        FileRepository.log("ChatBot.getChatters ");
        let self = this;
        let promises = [];

        for (let channelkvp of self.channels) {
            FileRepository.log("ChatBot.getChatters channel " + channelkvp[0] + " " + JSON.stringify(channelkvp[1]));

            let channel = channelkvp[0];
            let channelState = channelkvp[1];

            if (channelState.broadcasterId) {
                FileRepository.log("ChatBot.getChatters push " + JSON.stringify(self.app.botUserInfo));
                promises.push(self.app.twitchAPIProvider.getChatters({
                        "broadcaster_id": channelState.broadcasterId,
                        "moderator_id": self.app.botUserInfo.id
                    }, function (result) {
                        FileRepository.log("ChatBot.getChatters result " + JSON.stringify(result));
                        const chatters = result;
                        channelState.chatters = chatters;

                        chatters.forEach(function (chatter) {
                            self.app.users.set(chatter.id, chatter);
                        });

                        FileRepository.saveUsers(Array.from(self.app.users.entries()));
                    }));
            } else {
                throw "channel has no broadcasterId";
            }
        }

        return Promise.all(promises).then(function () {
            return Promise.resolve(self.channels);
        });
    }

    toggleRepeatingMessage(key) {
        var self = this;
        let rm = self.repeatingMessages.get(key);
        rm.enabled = !rm.enabled;
        rm.iterations = 0;

        if (rm.enabled) {
            let interval = setInterval(function () {
                self.sendMessage(rm.channel, rm.message);
                rm.iterations++;

                if (rm.iterations >= rm.maxIterations) {
                    rm.enabled = false;
                    clearInterval(interval);
                    //tell the UI to uncheck the message

                    self.ExecuteHandlers("repeatingMessageTerminate", {
                        id: key
                    });
                }

                self.repeatingMessageIntervals.set(key, interval);
            }, rm.intervalSeconds * 1000);

        } else {
            let interval = self.repeatingMessageIntervals.get(key);
            clearInterval(interval);
        }
    }

    clearRepeatingMessages() {
        self.repeatingMessages = new Map();
    }

    addRepeatingMessage(data) {

        var self = this;
        var id = Crypto();

        var RepeatingMessage = new RepeatingMessage(data);

        self.repeatingMessages.set(id, RepeatingMessage);
    }

    removeRepeatingMessage(id) {
        var self = this;

        if (self.repeatingMessages.has(id)) {
            var message = self.repeatingMessages.get(id);
            clearInterval(message.interval);
            self.repeatingMessages.delete(id);
        }
    }
}

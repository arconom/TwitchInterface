import http from "http";
import WebServer from "./src/WebServer.mjs";
import ChatBot from "./src/ChatBot.mjs";
import OscManager from "./src/OscManager.mjs";
import OAuthProvider from "./src/OAuthProvider.mjs";
import {
    ApiScopes
}
from "./src/ApiScopes.mjs";
import {
    ChatScopes
}
from "./src/ChatScopes.mjs";
import {
    ChatCommandConfigItem
}
from "./src/ChatCommandConfigItem.mjs";
import {
    Secrets
}
from "./src/Secrets.mjs";
import {
    Config
}
from "./src/Config.mjs";
import {
    TwitchEndpoints
}
from "./src/TwitchEndpoints.mjs";
import TwitchAPIProvider from "./src/TwitchAPIProvider.mjs";
import EventSubListener from "./src/EventSubListener.mjs";
import {
    FileRepository
}
from "./src/FileRepository.mjs";
import {
    SubscriptionTypeNames,
    SubscriptionTypes
}
from "./src/SubscriptionTypes.mjs";
import {
    HTTPError
}
from "./src/HTTPError.mjs";
import PubSubListener from "./src/PubSubListener.mjs";
import WebUIInterface from "./src/webUIInterface.mjs";
import WebSocketListener from "./src/WebSocketListener.mjs";
import readline from "readline/promises";
import fs from 'fs';
import {
    Constants
}
from "./src/Constants.mjs";

import {
    open
}
from 'node:fs/promises';

process.on('warning', (warning) => {
    FileRepository.log(warning.name); // Print the warning name
    FileRepository.log(warning.message); // Print the warning message
    FileRepository.log(warning.stack); // Print the stack trace
});

class App {

    static activeApiScopes = [];
    static activeChatScopes = [];
    static botUserInfo;
    static chatLog = new Map();
    static config = {};
    static eventSubListener;
    static eventSubscriptionConfig = new Map();
    static oAuthProvider;
    static oscManager;
    static pubSubListener;
    static secrets = new Secrets();
    static twitchAPIProvider;
    static webServer;
    static webUIInterface = new WebUIInterface(8080);
    static subbed = false;
    static chatSaveTimeout = null;
    static isEventSubRunning = false;
    static isPubSubRunning = false;
    static isWebServerRunning = false;
    static users = new Map();
    static globalState = new Map();
    static pluginConfig = new Map();
    static pluginList = [];

    static chatBot;

    static pluginChatHandlers = [];

    // var VRChatInterface = new OscManager("127.0.0.1", 9000, "127.0.0.1", 9001);
    // var VRChatInterface = new OscManager("127.0.0.1", 5656, "127.0.0.1", 5657);
    // VRChatInterface.setEvent("/chatbox/input", true);
    // VRChatInterface.setEvent("/chatbox/Input", true);
    // VRChatInterface.setEvent("/input/Jump", true);

    static init() {

        App.globalState.set("chatlog", App.chatLog);
        App.globalState.set("filerepository", FileRepository);
        App.globalState.set("constants", Constants);
        App.loadChatScopes()
        .then(App.loadApiScopes)
        .then(App.loadConfig)
        .then(App.loadSecrets)
        .then(function () {
            App.initOscManager();
            App.initOAuthProvider();
            App.initTwitchAPIProvider();
            App.chatBot = new ChatBot(App.config, App.secrets, App.oscManager);
        })
        .then(App.loadOscMappings)
        .then(function () {
            return FileRepository.getPluginList()
            .then(function (list) {
                App.pluginList = list;
            }).then(function () {
                return FileRepository.readPluginConfig()
                .then(function (pluginConfig) {
                    App.pluginConfig = new Map(pluginConfig);
                    App.pluginList.forEach(function (plugin) {
                        if (!App.pluginConfig.get(plugin)) {
                            App.pluginConfig.set(plugin, false);
                        }
                    })
                });
            });
        })
        .then(function () {
            new Promise(function (resolve, reject) {
                App.twitchAPIProvider
                .getUserInfo(App.config.botName,
                    function (data) {
                    FileRepository.log("initializing user data", App.twitchAPIProvider.user);
                    App.botUserInfo = App.twitchAPIProvider.user[0];
                    resolve(data);
                });
            });

            FileRepository.readUsers()
            .then(function (data) {
                // FileRepository.log("got users " + data);
                App.users = new Map(JSON.parse(data));
            })
            .catch(function () {
                //no file
            });
            App.loadEventSubscriptions();
            App.twitchAPIProvider.getSubscriptions(null, function (data) {
                if (data?.length > 0) {
                    FileRepository.log("EventSub already running at startup");
                    App.isEventSubRunning = true;
                }
            });

            FileRepository.loadPlugins(App.pluginConfig)
            .then(function (plugins) {
                plugins.forEach(plugin => {
                    if (plugin.default.chatMessageHandler) {
                        App.pluginChatHandlers.push(plugin.default.chatMessageHandler);
                    }

                    //add commands to the list
                    if (plugin?.default .load) {
                            plugin.default.load(App.globalState)
                            .then(function (loadedPlugin) {
                                for (var command of plugin?.default .commands?.entries()) {
                                        FileRepository.log("adding command " + command);
                                        App.chatBot.chatCommandManager.setCommand(command[0], command[1]);

                                        if (!App.chatBot.chatCommandManager.getCommandConfig(command[0])) {
                                            App.chatBot.chatCommandManager.setCommandConfig(command[0], {
                                                key: command[0]
                                            });
                                        }

                                        if (plugin.default.exports) {
                                            // set a global state if the plugin has exports
                                            App.globalState.set(plugin.default.name, plugin.default.exports);
                                        }
                                    }
                            });
                        }
                        else {
                            FileRepository.log("plugin has no load function " + plugin.default);
                        }
                });
            });

        })
        .then(App.startWebServer);

    }

    //todo figure out a way to fix the maxlisteners error


    static loadEventSubscriptions() {

        return FileRepository.loadEventSubscriptions().then(function (data) {
            if (data) {
                FileRepository.log("loadEventSubscriptions " + data);

                JSON.parse(data)
                .forEach(function (x) {
                    App.eventSubscriptionConfig.set(x[0], x[1]);
                });
            } else {
                FileRepository.log("loadEventSubscriptions found no data");
            }
        });
    }

    static loadOscMappings() {
        return FileRepository.loadOscMappings().then(function (data) {
            if (data) {
                Array.from(JSON.parse(data))
                .forEach(function (x) {
                    App.oscManager.setEvent(x[0], x[1]);
                });
            }
        });
    }

    static loadConfig() {
        return FileRepository.loadConfig().then(function (data) {
            FileRepository.log("loadConfig " + data);
            try {
                App.config = new Config(JSON.parse(data));
            } catch (e) {
                App.config = new Config(null);
            }
        });
    }

    static loadApiScopes() {
        return FileRepository.loadApiScopes().then(function (data) {
            if (data !== undefined && data.length > 0) {
                FileRepository.log("App.activeApiScopes " + App.activeApiScopes);
                App.activeApiScopes = JSON.parse(data);
            }
        });
    }

    static loadChatScopes() {

        return FileRepository.loadChatScopes().then(function (data) {
            if (data !== undefined && data.length > 0) {
                App.activeChatScopes = JSON.parse(data);
            }
        }).catch(function(err){
			//file not exist, user needs to make one
		});
    }

    static loadSecrets() {

        FileRepository.log("loadSecrets ");
        return FileRepository.loadSecrets().then(function (data) {
            var d = null;
            try {
                d = JSON.parse(data);
            } catch (e) {
                //no data in the file
            }
            App.secrets = new Secrets(d);
        });
    }

    static startWebServer() {

        //todo make a way for plugins to create endpoints

        if (App.isWebServerRunning) {
            return;
        }

        FileRepository.log("startWebServer");
        let hostname = "127.0.0.1";
        let port = App.config.webServerPort;
        let routes = [];

        const Controller = new Map();

        Controller.set("/chat/say", {
            "GET": function (args) {
                throw "method not allowed";
            },
            "POST": function (args) {
                return App.chatBot.sendMessage(args.channel, args.message);
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },

        });

        Controller.set("/chat/channels", {
            "GET": function (args) {
                return Promise.resolve(Array.from(App.chatBot?.channels ?? []));
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        Controller.set("/chat/channels/saved", {
            "GET": function (args) {
                return FileRepository.readBookmarkedChannels();
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                return FileRepository.saveBookmarkedChannels(args);
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        Controller.set("/chat/join", {
            "GET": function (args) {
                // FileRepository.log("/chat/join", args);
                return App.chatBot.joinChannel(args.channel);
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        Controller.set("/chat/leave", {
            "GET": function (args) {
                // FileRepository.log("/chat/join", args);
                return App.chatBot.leaveChannel(args.channel);
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        Controller.set("/chat/start", {
            "GET": function (args) {
                return Promise.resolve(App.initChatBot());
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },

        });

        Controller.set("/chat/scopes", {
            "GET": function (args) {
                return Promise.resolve(Array.from(ChatScopes.entries()));
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },

        });

        Controller.set("/chat/commandstate", {
            "GET": function (args) {
                // FileRepository.log("/chat/scopes", ChatScopes.entries());
                return Promise.resolve(Array.from(App.chatBot?.commandState.entries() ?? []));
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },

        });

        Controller.set("/chat/commands", {
            "GET": function (args) {
                // FileRepository.log("/chat/scopes", ChatScopes.entries());
                return Promise.resolve(Array.from(App.chatBot?.chatCommandManager?.commands.entries() ?? []));
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },

        });

        Controller.set("/chat/command/config", {
            "GET": function (args) {
                return Promise.resolve(Array.from(App.chatBot?.chatCommandManager?.commandConfig.entries() ?? []));
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                if (!App.chatBot) {
                    return 400;
                }
                var map = new Map(Array.from(args));
                App.chatBot.chatCommandManager.commandConfig = map;
                return FileRepository.saveChatCommandConfig(args);
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },

        });

        Controller.set("/chat/scopes/active", {
            "GET": function (args) {
                FileRepository.log("/chat/scopes/active", App.activeChatScopes);
                return Promise.resolve(App.activeChatScopes);
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                if (args.length !== undefined && args.length !== null) {
                    App.activeChatScopes = args;
                    return FileRepository.saveChatScopes(args, function (x) {});
                }
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },

        });

        Controller.set("/pubsub/start", {
            "GET": function (args) {
                return App.startPubSub();
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        Controller.set("/eventsub/start", {
            "GET": function (args) {
                return App.startEventSub();
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        Controller.set("/eventsub/end", {
            "GET": function (args) {
                return App.endEventSub();
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        Controller.set("/eventsub/cost", {
            "GET": function (args) {
                return Promise.resolve({
                    cost: App.eventSubListener?.cost ?? 0,
                    maxCost: App.eventSubListener?.maxCost ?? 0
                });
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        Controller.set("/chatters", {
            "GET": function (args) {
                return App.twitchAPIProvider.getChatters(args.broadcasterId, args.moderatorId);
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },

        });

        Controller.set("/user", {
            "GET": function (args) {
                //get the user list
                //or get by id or login
                if (args?.id) {
                    FileRepository.log("getting user by id");
                    var vals = App.users.values();

                    for (let i = 0; i < vals.length; i++) {
                        if (vals[i].id === args) {
                            return vals[i];
                        }
                    }
                } else if (args?.login) {
                    FileRepository.log("getting user by login");
                    var vals = App.users.values();
                    for (let i = 0; i < vals.length; i++) {
                        if (vals[i].login === args.login) {
                            return vals[i];
                        }
                    }
                } else {
                    FileRepository.log("getting all users" + JSON.stringify(App.users));
                    var entries = Array.from(App.users?.entries())
                        FileRepository.log("getting all users" + JSON.stringify(entries));
                    return Promise.resolve(entries);
                }
            },
            "POST": function (args) {
                //add a user
                App.users.set(args.id, args);
                return FileRepository.saveUsers(App.users);
            },
            "PUT": function (args) {
                //update user
                App.users.set(args.id, args);
                return FileRepository.saveUsers(App.users);
            },
            "DELETE": function (args) {
                //remove a user from the list
                App.users.remove(args.id);
                return FileRepository.saveUsers(App.users);
            },
        });

        Controller.set("/user/bot", {
            "GET": function (args) {
                return Promise.resolve(App.botUserInfo);
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        Controller.set("/subscriptions/active", {
            "GET": function (args) {
                return App.twitchAPIProvider.getSubscriptions();
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        Controller.set("/subscriptions/configuration", {
            "GET": function (args) {
                return Promise.resolve(Array.from(App.eventSubscriptionConfig));
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                // FileRepository.log("PUT /subscriptions   " + JSON.stringify(args));
                //set the value, then write the file
                App.eventSubscriptionConfig = new Map(args);

                return FileRepository.saveEventSubscriptions(args);
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        Controller.set("/subscription/types", {
            "GET": function (args) {
                return Promise.resolve(Array.from(SubscriptionTypes.entries()));
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            }
        });

        Controller.set("/oscmappings", {
            "GET": function (args) {
                return Promise.resolve(Array.from(App.oscManager.events));
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                args.forEach(function (t) {
                    App.oscManager.setEvent(t[0], t[1]);
                });

                return FileRepository.saveOscMappings(Array.from(App.oscManager.events));
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },

        });

        Controller.set("/secrets", {
            "GET": function (args) {
                return Promise.resolve(App.secrets);
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                var obj = {};

                args.forEach(function (x) {
                    obj[x.title] = x.value;
                });

                return FileRepository.saveSecrets(obj);
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },

        });

        Controller.set("/config", {
            "GET": function (args) {
                return Promise.resolve(App.config);
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                var obj = {};

                args.forEach(function (x) {
                    obj[x.title] = x.value;
                });

                return FileRepository.saveConfig(obj);
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },

        });

        Controller.set("/plugin/config", {
            "GET": function (args) {
                return Promise.resolve(Array.from(App.pluginConfig.entries()));
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                args.forEach(function (t) {
                    App.pluginConfig.set(t[0], t[1]);
                });

                return FileRepository.savePluginConfig(Array.from(App.pluginConfig.entries()));
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },

        });

        Controller.set("/plugin", {
            "GET": function (args) {
                return Promise.resolve(Array.from(App.pluginList));
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },

        });

        Controller.set("/twitchendpoints", {
            "GET": function (args) {
                return Promise.resolve(Array.from(TwitchEndpoints.entries()));
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        Controller.set("/app/oauth", {
            "GET": function (args) {
                throw "method not allowed";
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                FileRepository.log("/app/oauth args " + args);
                // FileRepository.log("TwitchAPIProvider[args.key]", twitchAPIProvider[args.key]);
                return new Promise(function (resolve, reject) {
					App.initOAuthProvider();                
				});
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        Controller.set("/api", {
            "GET": function (args) {
                throw "method not allowed";
            },
            "POST": function (args) {
                FileRepository.log("/api args " + args);
                // FileRepository.log("TwitchAPIProvider[args.key]", twitchAPIProvider[args.key]);
                return new Promise(function (resolve, reject) {
                    App.twitchAPIProvider[args.key](args.args, function (data) {
                        FileRepository.log("api endpoint " + args.key + " returning " + JSON.stringify(data));

                        if (args.key === "getUserInfo") {
                            FileRepository.log("saving user info");
                            App.users.set(data[0].id, data[0]);
                            FileRepository.saveUsers(Array.from(App.users.entries()));
                        } else {
                            FileRepository.log("saving api info");
                            FileRepository.saveApiResults(args.key, JSON.stringify(data));
                        }
                        resolve(data);
                        // return data;
                    });
                });
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        Controller.set("/api/scopes", {
            "GET": function (args) {
                // FileRepository.log("/api/scopes", Array.from(ApiScopes.entries()));
                return Promise.resolve(Array.from(ApiScopes.entries()));
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        Controller.set("/api/scopes/active", {
            "GET": function (args) {
                // FileRepository.log("/api/scopes/active", activeApiScopes);
                return Promise.resolve(App.activeApiScopes);
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                // FileRepository.log("args", args);
                if (args.length !== undefined && args.length !== null) {
                    App.activeApiScopes = args;
                    return FileRepository.saveApiScopes(args);
                }
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },
        });

        App.webServer = new WebServer(hostname, port, App.config.preferredBrowser, Controller);
        App.webServer.start();
    }

    static initChatBot() {

        if (App.chatBot.isConnected()) {
            return Promise.resolve();
        }

        App.chatBot.AddHandler("message", function (x) {
            // console.log("chatbot message", x);
            // FileRepository.saveChatMessage(x.target.substr(1), x.msg);

            if (!x.self) {
                App.oscManager.send("/chat.message", JSON.stringify({
                        username: x.context.username,
                        message: x.msg
                    }), () => {});
            }

            var chatMessage = JSON.stringify({
                target: x.target,
                msg: x.msg,
                context: x.context,
                self: x.self,
            });

            App.webUIInterface.send(chatMessage);

            var key = x.target.substr(1);
            var channelMessages = App.chatLog.get(key);

            if (channelMessages?.length) {
                channelMessages.push(x);

                if (channelMessages.length > App.config.chatLogChannelHistory) {
                    channelMessages.pop();
                }
            } else {
                channelMessages = [x];
            }
            App.chatLog.set(key, channelMessages);

            /*
            // VRChatInterface.send("/chatbox/Input", "s=PopularRhinocerosBot: " +
            // x.target + " " +
            // x.context.username + ": " +
            // x.msg +
            // " b=true");

            // VRChatInterface.send("/chatbox/input", "PopularRhinocerosBot: " +
            // x.target + " " +
            // x.context.username + ": " +
            // x.msg
            // , true
            // );

            // VRChatInterface.send("/input/Jump", 1);
            // setTimeout(function(){
            // VRChatInterface.send("/input/Jump", 0);
            // }, 300);
             */
            FileRepository.saveChatMessage(chatMessage);
        }, true);

        App.pluginChatHandlers.forEach(function (handler) {
            App.chatBot.AddHandler("message", handler, true);
        });

        //example object passed to command
        /* {
        target: '#crimebastard',
        msg: '!prdefine lemurs',
        context: {
        'badge-info': null,
        badges: { broadcaster: '1' },
        'client-nonce': '',
        color: '#8A2BE2',
        'display-name': 'Crimebastard',
        emotes: null,
        'first-msg': false,
        flags: null,
        id: '',
        mod: false,
        'returning-chatter': false,
        'room-id': '109465513',
        subscriber: false,
        'tmi-sent-ts': '',
        turbo: false,
        'user-id': '',
        'user-type': null,
        'emotes-raw': null,
        'badge-info-raw': null,
        'badges-raw': 'broadcaster/1',
        username: 'crimebastard',
        'message-type': 'chat'
        },
        args: 'lemurs'
        }
         */

        FileRepository.log("connecting to chat");
        App.chatBot.connect();

        return Promise.resolve();
    }

    static endEventSub() {

        App.isEventSubRunning = false;
        return App.eventSubListener.close();
    }

    static startEventSub() {

        if (App.isEventSubRunning) {
            FileRepository.log("EventSub already running");

            return Promise.resolve(true);
        }

        // FileRepository.log("startEventSub " + eventSubscriptionConfig);
        App.eventSubListener = new EventSubListener(Constants.eventSubWebSocketUrl, App.config.listenerPort, App.oAuthProvider);

        var subs = new Map();

        for (var sub of App.eventSubscriptionConfig.entries()) {
            FileRepository.log("eventSubscriptionConfig " + JSON.stringify(sub));

            sub[1]
            .filter(function (x) {
                return x.enabled;
            })
            .forEach(function (x) {
                //build the conditions object
                // FileRepository.log("eventSubscriptionConfig.forEach " + JSON.stringify(x));
                subs.set(sub[0], {
                    condition: x.condition,
                    handler: function (data) {
                        App.oscManager.send("/" + data.payload.subscription.type, JSON.stringify(data));
                    }
                })
            });
        }
        // FileRepository.log("subs " + JSON.stringify(Array.from(subs.entries())));

        App.eventSubListener.AddHandler("message", function (event) {
            // FileRepository.log("eventSubListener message", event);
            var obj = JSON.parse(event.data);

            if (obj.metadata.message_type === Constants.session_welcome && !App.subbed) {
                // FileRepository.log("welcome in. do subs");
                App.subbed = true;
                for (var [key, value] of subs) {
                    FileRepository.log("sub: " + key + " " + JSON.stringify(value));
                    App.eventSubListener.subscribe(key, value.condition)
                    .then(function (x) {
                        if (x) {
                            FileRepository.log("startEventSub subscribed to " + JSON.stringify(x));
                        } else {
                            FileRepository.log("startEventSub subscription failed");
                        }
                    });
                }
            } else if (obj.metadata.message_type === "notification") {
                oscManager.send("/eventsub.message", event.data);
                // FileRepository.log("doing sub event " + obj.metadata.subscription_type);
                subs.get(obj.metadata.subscription_type).handler(obj);
            }
        }, true);
        return Promise.resolve(App.eventSubListener.connect());
    }

    static endPubSub() {

        App.isPubSubRunning = false;
        App.pubSubListener.close();
    }

    static startPubSub() {

        if (App.isPubSubRunning) {
            return;
        }
        App.pubSubListener = new PubSubListener(Constants.pubSubWebSocketUrl, App.oAuthProvider);

        App.pubSubListener.AddHandler("open", function () {
            App.pubSubListener.listen("channel.subscribe", function (req, res) {
                FileRepository.log("channel.subscribe handler", req, res);
            });
        }, false);
        return App.pubSubListener.connect()
    }

    static initOscManager() {

        App.oscManager = new OscManager(App.config.oscClientAddress,
                App.config.oscClientPort,
                App.config.oscServerAddress,
                App.config.oscServerPort);

    }

    static initOAuthProvider() {
        //todo client id missing error when txt file missing
        App.oAuthProvider = new OAuthProvider(App.config.redirectUri,
                App.config.listenerPort,
                App.secrets,
                App.config.preferredBrowser,
                App.activeApiScopes.concat(App.activeChatScopes));
    }

    static initTwitchAPIProvider() {
        App.twitchAPIProvider = new TwitchAPIProvider(App.oAuthProvider);
    }

}

App.init();

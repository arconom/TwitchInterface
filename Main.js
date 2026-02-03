import http from "http";
import openBrowser from "open";
import WebServer from "./src/WebServer.mjs";
import ChatBot from "./src/ChatBot.mjs";
import OscManager from "./src/OscManager.mjs";
import OAuthProvider from "./src/OAuthProvider.mjs";
import { ApiScopes } from "./src/ApiScopes.mjs";
import { ChatScopes } from "./src/ChatScopes.mjs";
import { ChatCommandConfigItem } from "./src/ChatCommandConfigItem.mjs";
import { Secrets } from "./src/Secrets.mjs";
import { Config } from "./src/Config.mjs";
import { TwitchEndpoints } from "./src/TwitchEndpoints.mjs";
import TwitchAPIProvider from "./src/TwitchAPIProvider.mjs";
import EventSubListener from "./src/EventSubListener.mjs";
import { FileRepository } from "./src/FileRepository.mjs";
import { SubscriptionTypeNames, SubscriptionTypes } from "./src/SubscriptionTypes.mjs";
import { HTTPError } from "./src/HTTPError.mjs";
import Wallet from "./src/Wallet.mjs";
import RepeatingMessage from "./src/RepeatingMessage.mjs";
import PubSubListener from "./src/PubSubListener.mjs";
import WebUIInterface from "./src/webUIInterface.mjs";
import ObsManager from "./src/ObsManager.mjs";
import { Constants } from "./src/Constants.mjs";

process.on('warning', (warning) => {
    FileRepository.log(warning.name); // Print the warning name
    FileRepository.log(warning.message); // Print the warning message
    FileRepository.log(warning.stack); // Print the stack trace
});

class App {
    static activeApiScopes = [];
    static activeChatScopes = [];
    static botUserInfo;
    static chatBot;
    static chatLog = new Map();
    static chatSaveTimeout = null;
    static config = {};
    static currencies = new Map();
    static eventSubListener;
    static eventSubscriptionConfig = new Map();
    static globalState = new Map();
    static isEventSubRunning = false;
    static isPubSubRunning = false;
    static isWebServerRunning = false;
    static oAuthProvider;
    static oscManager;
    static overlayWebSocket;
    static pluginChatHandlers = [];
    static pluginConfig = new Map();
    static pluginList = [];
    static pubSubListener;
    static secrets = new Secrets();
    static subbed = false;
    static twitchAPIProvider;
    static users = new Map();
    static wallets = new Map();
    // static actions = new Map();
    static variables = new Map();
    static webServer;
    static webUIInterface;

    // var VRChatInterface = new OscManager("127.0.0.1", 9000, "127.0.0.1", 9001);
    // var VRChatInterface = new OscManager("127.0.0.1", 5656, "127.0.0.1", 5657);
    // VRChatInterface.setEvent("/chatbox/input", true);
    // VRChatInterface.setEvent("/chatbox/Input", true);
    // VRChatInterface.setEvent("/input/Jump", true);


    static init() {
        FileRepository.log("App.init start");

        App.globalState.set("app", App);
        App.globalState.set("filerepository", FileRepository);
        App.globalState.set("constants", Constants);

        App.loadChatScopes()
        .then(App.loadApiScopes)
        .then(App.loadConfig)
        .then(App.loadSecrets)
        .then(App.loadCurrencies)
        .then(App.loadVariables)
        .then(function () {
            FileRepository.log("App.config.overlayWebSocketPort", App.config.overlayWebSocketPort);
            App.overlayWebSocket = new WebUIInterface(App.config.overlayWebSocketPort);
            App.webUIInterface = new WebUIInterface(App.config.webUIInterfacePort);

            App.initOscManager();
            App.initOAuthProvider();
            App.initTwitchAPIProvider();
            App.chatBot = new ChatBot(App);
        })
        .then(function () {
            FileRepository.log("App.init before readCommandState");
            FileRepository.readCommandState()
            .then(function (result) {
                // console.log(result);
                try {
                    App.chatBot.chatCommandManager.commandState = new Map(JSON.parse(result, Constants.reviver));
                } catch (e) {
                    FileRepository.log("Error loading command state: \r\n" + e);
                }
                // console.log(App.chatBot.chatCommandManager.commandState);
            });
        })
        .then(App.loadRepeatingMessages)
        .then(App.startObsManager)
        .then(App.loadOscMappings)
        .then(function () {
            FileRepository.log("App.init before getPluginList");
            return FileRepository.getPluginFolderList()
            .then(function (list) {
                App.pluginList = list;
            }).then(function () {
                return FileRepository.readPluginConfig()
                .then(function (pluginConfig) {
                    App.pluginConfig = new Map(pluginConfig);

                    //todo this uses the folder name, which is not optimal.
                    App.pluginList.forEach(function (plugin) {
                        if (!App.pluginConfig.get(plugin)) {
                            App.pluginConfig.set(plugin, {
                                active: false,
                                order: Infinity
                            });
                        }
                    })
                });
            });
        })
        // .then(function () {
        // return FileRepository.getImages()
        // .then(function (list) {
        // list.forEach(function (image) {
        // //send a websocket message to upload the image to the browser source
        // overlayWebSocket.send("");
        // });
        // });
        // })
        .then(function () {
            FileRepository.log("App.init before getUserInfo");

            App.twitchAPIProvider
            .getUserInfo(App.config.botName,
                function (res) {
                if (res && res.length > 0) {
                    App.botUserInfo = res[0];
                    FileRepository.log("App.botUserInfo " + JSON.stringify(App.botUserInfo));
                }
            })
            .catch(function (e) {
                FileRepository.Log("App.init error getting bot user info " + e);
            });

            FileRepository.log("App.init before readUsers");

            FileRepository.readUsers()
            .then(function (data) {
                // FileRepository.log("got users " + data);
                App.users = new Map(JSON.parse(data));
            })
            .catch(function () {
                //no file
            });

            FileRepository.readCurrencies()
            .then(function (data) {
                // FileRepository.log("got users " + data);
                App.currencies = new Map(JSON.parse(data));
            })
            .catch(function () {
                //no file
            });

            FileRepository.log("App.init before readWallets");
            FileRepository.readWallets()
            .then(function (data) {
                try {

                    data.foreach(function (x) {
                        const w = new Wallet(JSON.parse(x));
                        App.wallets.set(w.userId, w);
                    });
                } catch (e) {
                    App.wallets = new Map();
                }
            })
            .catch(function () {
                //no file
            });

            FileRepository.log("App.init before loadEventSubscriptions");
            App.loadEventSubscriptions();
            App.twitchAPIProvider.getSubscriptions(null, function (data) {
                if (data?.length > 0) {
                    FileRepository.log("EventSub already running at startup");
                    App.isEventSubRunning = true;
                }
            });

            const orderedMap = App.getPluginsInOrder();

            return FileRepository.loadPlugins(orderedMap)
            .then(function (plugins) {
                FileRepository.log("this should be visible");
                App.loadPlugins(plugins.map(x=>x.value), orderedMap);
                return Promise.resolve();
            })
            .catch(function (err) {
                FileRepository.log("Error loading plugins " + err);
                //return Promise.reject(err);
                return Promise.reject();
            });
        })
        .then(App.startWalletSaveInterval)
        .then(App.startWebServer)
        .then(App.startOverlay)
        .catch(function (e) {
            FileRepository.log("Main.init error " + e);
        });
    }

    static loadPlugins(plugins, orderedMap) {
        FileRepository.log("main.js loadPlugins");
        if (App.globalState == null || App.globalState == undefined) {
            throw "globalState should be something";
        }

        FileRepository.log("main.js loading plugins " + plugins
            .map(function (p) {
                return p?.default ?.name ?? p?.name ?? JSON.stringify(p?.name);
            }));

        const keys = Array.from(orderedMap.keys()).sort();

        FileRepository.log("main.js loadPlugins orderedMap " + orderedMap);
        FileRepository.log("main.js loadPlugins keys " + keys);

        for (const key of keys) {
            FileRepository.log("main.js loadPlugins key " + key);
            let pluginName = orderedMap.get(key);
            let pluginToLoad = plugins
                .find(function (element) {
                    return element?.default ?.name === pluginName
                });

            App.loadPlugin(pluginToLoad);
        }

        FileRepository.log("main.js finished loading plugins");
    }

    static getPluginsInOrder() {
        const orderedMap = new Map();

        // FileRepository.log("setting up orderedMap");

        //todo this is suboptimal data structure
        let keys = Array.from(App.pluginConfig.keys());

        keys.forEach(function (key) {
            // FileRepository.log("key " + key);
            // FileRepository.log("order " + App.pluginConfig.get(key).order);

            if (App.pluginConfig.get(key).active) {
                orderedMap.set(App.pluginConfig.get(key).order, key);
            }
        });

        FileRepository.log("getPluginsInOrder returning " + Array.from(orderedMap.entries()).sort((a,b) => a[0] - b[0]).join("\r\n"));
        return orderedMap;
    }

    static loadPlugin(pluginToLoad) {
        if (pluginToLoad) {
            //throw "pluginToLoad should not be null " + pluginName;
            FileRepository.log("loading plugin " + pluginToLoad.default.name);

            if (pluginToLoad.default.chatMessageHandler) {
                FileRepository.log("loading chatMessageHandler for plugin " + pluginToLoad.default.name);
                // console.log("adding chatMessageHandler");
                App.pluginChatHandlers.push(pluginToLoad.default.chatMessageHandler);
            }

            if (pluginToLoad.default.exports) {
                FileRepository.log("exports " + pluginToLoad.default.name);

                // set a global state if the plugin has exports
                // console.log("setting a value in globalState", pluginToLoad.default.name);
                App.globalState.set(pluginToLoad.default.name, pluginToLoad.default.exports);
            }

            if (pluginToLoad.default.config) {
                FileRepository.log("config " + pluginToLoad.default.name);
                const keys = Object.keys(pluginToLoad.default.config);
                keys.forEach(function (key) {
                    if (App.config[key] === null || App.config[key] === undefined) {
                        FileRepository.log("adding config key " + key);
                        App.config[key] = pluginToLoad.default.config[key];
                    }
                });
            }

            // add commands to the list
            if (pluginToLoad?.default .load) {
                    FileRepository.log("load " + pluginToLoad.default.name);
                    // console.log("globalstate at plugin load", Array.from(App.globalState.keys()));
                    // console.log("loading plugin", pluginToLoad.default.name);
                    pluginToLoad.default.load(App.globalState)
/*                     ?.then(function (loadedPlugin) {

                        FileRepository.log("plugin commands " + Array.from(pluginToLoad.default.commands.keys()));

                        for (var command of pluginToLoad?.default .commands?.entries()) {
                                FileRepository.log("loading plugin function " + command[0]);
                                App.chatBot.chatCommandManager.setCommand(command[0], command[1]);

                                if (!App.chatBot.chatCommandManager.getCommandConfig(command[0])) {
                                    App.chatBot.chatCommandManager.setCommandConfig(command[0], {
                                        key: command[0]
                                    });
                                }
                            }
                    });
 */                }
                else {
                    FileRepository.log("plugin has no load function " + pluginToLoad.default.name);
                }

                // for(let a of pluginToLoad?.default.actions)
                // {
                // App.actions.set(a.name, a);
                // }


                FileRepository.log("finished loading plugin " + pluginToLoad.default.name);
        }
    }

    static getActions() {
        FileRepository.log("getActions");

        let keys = App.globalState.keys();
        let returnMe = [];


        for (let key of keys) {
            FileRepository.log("getActions key " + key);
            let actionKeys = App.globalState.get(key).actions?.keys();
            // returnMe = returnMe.concat(Array.from(actionKeys ?? [])
                    // .map(x => key + "." + x));
            returnMe = returnMe.concat(Array.from(actionKeys ?? [])
                    .map(x => {
                        let action = App.globalState.get(key).actions.get(x);
                        action.displayName = key + "." + x;
                        return action;
                    }));
        }

        FileRepository.log("getActions returning " + JSON.stringify(returnMe));
        return returnMe;
    }

    //todo figure out a way to fix the maxlisteners error

    static startWalletSaveInterval() {
        FileRepository.log("startWalletSaveInterval");
        let interval = setInterval(function () {
            FileRepository.saveWallets(Array.from(App.wallets.entries()));
        }, 5 * 60 * 1000);
    }

    static loadEventSubscriptions() {
        FileRepository.log("App.loadEventSubscriptions");

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

    static loadRepeatingMessages() {
        FileRepository.log("App.loadRepeatingMessages");
        return FileRepository.readRepeatingMessages()
        .then(function (data) {
            if (data) {
                var arr = JSON.parse(JSON.parse(data));
                for (const x of arr) {
                    App.chatBot.repeatingMessages.set(x[0], new RepeatingMessage(x[1]));
                }
            }
        });
    }

    static loadOscMappings() {
        FileRepository.log("App.loadOscMappings");
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
        FileRepository.log("App.loadConfig");
        return FileRepository.loadConfig().then(function (data) {
            FileRepository.log("loadConfig " + data);
            try {
                App.config = new Config(JSON.parse(data));
            } catch (e) {
                FileRepository.log("Main.loadConfig " + e);
                App.config = new Config(null);
            }
        });
    }

    static loadApiScopes() {
        FileRepository.log("App.loadApiScopes");
        return FileRepository.loadApiScopes().then(function (data) {
            if (data !== undefined && data.length > 0) {
                App.activeApiScopes = JSON.parse(data);
                FileRepository.log("App.activeApiScopes " + App.activeApiScopes);
            }
        });
    }

    static loadChatScopes() {
        FileRepository.log("App.loadChatScopes");

        return FileRepository.loadChatScopes().then(function (data) {
            if (data !== undefined && data.length > 0) {
                App.activeChatScopes = JSON.parse(data);
            }
        }).catch(function (err) {
            //file not exist, user needs to make one
        });
    }

    static loadSecrets() {

        FileRepository.log("App.loadSecrets ");
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

    static loadCurrencies() {

        FileRepository.log("App.loadCurrencies ");
        return FileRepository.readCurrencies().then(function (data) {
            var d = null;
            try {
                d = new Map(JSON.parse(data).value);
            } catch (e) {
                //no data in the file
            }
            App.currencies = d;
        });
    }

    static loadVariables() {

        // FileRepository.log("App.loadVariables");
        return FileRepository.loadVariables().then(function (data) {
            // console.log("App.loadVariables", data);
            var d = null;
            try {
                d = new Map(JSON.parse(data).value);
            } catch (e) {
                //no data in the file
                console.log(e);
            }
            App.variables = d;
            // console.log("App.loadVariables App.variables", App.variables);
        });
    }

    static startOverlay() {
        FileRepository.log("App.startOverlay");
        let hostname = "127.0.0.1";
        let port = App.config.webServerPort;
        return openBrowser(hostname + ":" + port + "/overlay", {
            app: {
                name: "chrome"
            }
        });
    }

    static startObsManager() {
        App.ObsManager = new ObsManager("127.0.0.1", "4455", App.secrets.obspassword);

        App.globalState.set("obsManager", App.ObsManager);

        return App.ObsManager.connect().then(function (result) {
            FileRepository.log("ObsManager connected " + result);

            App.ObsManager.send("GetHotkeyList").then(function (res) {
                FileRepository.saveHotkeyList(res);
            });
        })
        .catch(function (e) {
            FileRepository.log("OBS connection error");
        });
    }

    static startWebServer() {
        FileRepository.log("App.startWebServer");

        //todo make a way for plugins to create endpoints
        //maybe not, name collisions are bad

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
                try {
                    return App.chatBot.sendMessage(args.channel, args.message);
                } catch (e) {
                    FileRepository.log(e);
                }
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
                return Promise.resolve(Array.from(App.chatBot?.chatCommandManager?.commandState?.entries() ?? []));
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

        //todo delete if not needed later
        /*
        Controller.set("/chat/commands", {
        "GET": function (args) {
        // FileRepository.log("/chat/scopes", ChatScopes.entries());
        return Promise.resolve(Array.from(App.chatBot?.chatCommandManager?.commands.entries() ?? []));
        },
        "POST": function (args) {
        throw "method not allowed";
        },
        "PUT": function (args) {
        if (App.chatBot) {
        let map = new Map(Array.from(args));
        App.chatBot?.chatCommandManager?.commands.entries() = map;
        return FileRepository.saveCommands(
        JSON.stringify(
        Array.from(
        App.chatBot?.chatCommandManager?.commands.entries())));
        } else {
        return 400;
        }
        throw "method not allowed";
        },
        "DELETE": function (args) {
        throw "method not allowed";
        },

        });
         */
        Controller.set("/chat/commands/toggle", {
            "GET": function (args) {
                throw "method not allowed";
            },
            "POST": function (args) {
                FileRepository.log("/chat/commands/toggle");
                App.chatBot?.chatCommandManager.toggleCommands();
                return Promise.resolve(App.chatBot?.chatCommandManager.commandsEnabledForViewers);
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (args) {
                throw "method not allowed";
            },

        });

        Controller.set("/chat/repeatingmessages", {
            "GET": function (args) {
                return Promise.resolve(Array.from(App.chatBot?.repeatingMessages.entries()) ?? []);
            },
            "POST": function (args) {
                throw "method not allowed";
            },
            "PUT": function (args) {
                if (App.chatBot) {
                    let map = new Map(Array.from(args));
                    App.chatBot.repeatingMessages = map;
                    return FileRepository.saveRepeatingMessages(
                        JSON.stringify(
                            Array.from(
                                App.chatBot?.repeatingMessages.entries())));
                } else {
                    return 400;
                }
            },
            "DELETE": function (params) {
                const id = parseInt(params.id);
                FileRepository.log("/chat/repeatingmessages DELETE " + id);
                FileRepository.log("App.chatBot?.repeatingMessages has " + App.chatBot?.repeatingMessages.has(parseInt(id)));
                FileRepository.log("App.chatBot?.repeatingMessages keys " + Array.from(App.chatBot?.repeatingMessages.keys()));

                //remove a repeating message
                App.chatBot?.repeatingMessages.delete(id);

                return FileRepository.saveRepeatingMessages(JSON.stringify(Array.from(App.chatBot?.repeatingMessages))).then(function () {
                    return FileRepository.readRepeatingMessages();
                });
            },
        });

        Controller.set("/chat/repeatingmessages/toggle", {
            "GET": function (args) {
                throw "method not allowed";
            },
            "POST": function (args) {
                App.chatBot?.toggleRepeatingMessage(args.id);
                return FileRepository
                .saveRepeatingMessages(
                    JSON.stringify(
                        Array.from(
                            App.chatBot?.repeatingMessages.entries())));
            },
            "PUT": function (args) {
                throw "method not allowed";
            },
            "DELETE": function (id) {
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
                FileRepository.Log("/chat/scopes/active " + JSON.stringify(args));
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
                    return App.getUserById(args.id);

                    // var vals = App.users.values();
                    // for (let i = 0; i < vals.length; i++) {
                        // if (vals[i].id === args) {
                            // return vals[i];
                        // }
                    // }
                } else if (args?.login) {
                    FileRepository.log("getting user by login");
                    App.getUserByLogin(args.login);

                    // var vals = App.users.values();
                    // for (let i = 0; i < vals.length; i++) {
                        // if (vals[i].login === args.login) {
                            // return vals[i];
                        // }
                    // }
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
                App.users.delete(args.id);
                return FileRepository.saveUsers(App.users);
            },
        });

        Controller.set("/currencies", {
            "GET": function (args) {
                //get the currency list
                //or get by id or login
                if (args?.name) {
                    FileRepository.log("getting currency by name");
                    var vals = App.currencies.values();

                    for (let i = 0; i < vals.length; i++) {
                        if (vals[i].id === args) {
                            return vals[i];
                        }
                    }
                } else {
                    var entries = Array.from(App.currencies?.entries() ?? [])
                    return Promise.resolve(entries);
                }
            },
            "POST": function (args) {
                //add a currency
                App.currencies.set(args.id, args);
                return FileRepository.saveCurrencies(App.currencies);
            },
            "PUT": function (args) {
                //update currency
                var map = new Map(args);
                App.currencies = map;
                console.log("App.currencies after PUT", App.currencies);
                return FileRepository.saveCurrencies(App.currencies);
            },
            "DELETE": function (args) {
                //remove a currency from the list
                App.currencies.delete(args.id);
                return FileRepository.saveCurrencies(App.currencies);
            },
        });

        Controller.set("/variables", {
            "GET": function (args) {
                //get the currency list
                //or get by id or login
                if (args?.name) {
                    FileRepository.log("getting variable by name");
                    var vals = App.variables.values();

                    for (let i = 0; i < vals.length; i++) {
                        if (vals[i].id === args) {
                            return vals[i];
                        }
                    }
                } else {
                    var entries = Array.from(App.variables?.entries()?? [])
                    return Promise.resolve(entries);
                }
            },
            "POST": function (args) {
                //add a currency
                App.variables.set(args.id, args);
                return FileRepository.saveVariables(App.variables);
            },
            "PUT": function (args) {
                //update currency
                console.log("variables.put", args);
                var map = new Map(args);
                App.variables = map;
                console.log("App.variables after PUT", App.variables);
                return FileRepository.saveVariables(App.variables);
            },
            "DELETE": function (args) {
                //remove a currency from the list
                App.variables.delete(args.id);
                return FileRepository.saveVariables(App.variables);
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

                FileRepository.log("/subscriptions/configuration " + JSON.stringify(args));

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

                App.config = obj;

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

                //example input
                // [["common", {
                // "active": true,
                // "order": null
                // }
                // ]]

                args.forEach(function (t, i) {
                    t[1].order = i;
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

        Controller.set("/actions", {
            "GET": function (args) {
                return Promise.resolve(App.getActions());
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
                // FileRepository.log("/app/oauth args " + args);
                // FileRepository.log("TwitchAPIProvider[args.key]", twitchAPIProvider[args.key]);
                return new Promise(function (resolve, reject) {
                    App.initOAuthProvider();
                    resolve();
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
                FileRepository.log("/api args " + JSON.stringify(args));
                // FileRepository.log("TwitchAPIProvider[args.key]", twitchAPIProvider[args.key]);
                return new Promise(function (resolve, reject) {
                    App.twitchAPIProvider[args.key](args.args, function (data) {
                        FileRepository.log("api endpoint " + args.key + " returning " + JSON.stringify(data));

                        if (args.key === "getUserInfo" && data && data.length > 0) {
                            FileRepository.log("saving user info");
                            App.users.set(data[0].id, data[0]);
                            FileRepository.saveUsers(Array.from(App.users.entries()));
                        } else {
                            FileRepository.log("saving api info");
                            FileRepository.saveApiResults(args.key, JSON.stringify(data));
                        }
                        resolve(data);
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
		// console.log("Init.initChatBot");

        if (App.chatBot.isConnected()) {
            return Promise.resolve();
        }

        App.chatBot.AddHandler("repeatingMessageTerminate", function (x) {
            FileRepository.log("repeatingMessageTerminate", x);
            App.webUIInterface.send(JSON.stringify({
                    "command": "repeatingMessageTerminate",
                    "arguments": {
                        "id": x.id
                    }
                }));
        });

        App.chatBot.AddHandler("message", function (x) {
            //todo this might be a bit too expensive to run this often
            // console.log("chatbot message", x);
            var chatMessage = JSON.stringify({
                target: x.target,
                msg: x.msg,
                context: x.context,
                self: x.self,
            });

            FileRepository.saveChatMessage(chatMessage);

            if (!x.self) {
                App.oscManager.send("/chat.message", JSON.stringify({
                        username: x.context.username,
                        message: x.msg
                    }), () => {});
            }

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
        }, true);

        //add any chat handlers in the plugins and flag them as persistent, so they aren't removed after 1 execution
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
        return App.eventSubListener?.close();
    }

    static startEventSub() {

        if (App.isEventSubRunning) {
            FileRepository.log("EventSub already running");

            // return Promise.resolve(true);
        }

        App.eventSubListener?.close();
        // FileRepository.log("startEventSub " + eventSubscriptionConfig);
        App.eventSubListener = new EventSubListener(Constants.eventSubWebSocketUrl, null /* App.config.listenerPort */, App.oAuthProvider);

        // FileRepository.log("subs " + JSON.stringify(Array.from(subs.entries())));

        App.eventSubListener.AddHandler("message", function (event) {
            var obj = JSON.parse(event.data);

            if (obj.metadata.message_type === Constants.session_welcome && !App.subbed) {
                FileRepository.log("welcome in. do subs");
                App.subbed = true;
                for (var [key, value] of App.eventSubscriptionConfig.entries()) {
                    FileRepository.log("Main. sub: " + key + " " + JSON.stringify(value));
                    App.eventSubListener.subscribe(key, value[0].condition)
                    .then(function (x) {
                        if (x) {
                            FileRepository.log("startEventSub subscribed to " + JSON.stringify(x));
                        } else {
                            FileRepository.log("startEventSub subscription failed");
                        }
                    });
                }
            } else if (obj.metadata.message_type === "notification") {
                App.oscManager?.send("/eventsub.message", event.data);
                FileRepository.log("doing sub event " + obj.metadata.subscription_type);

                const eventSubConfig = App.eventSubscriptionConfig.get(obj.metadata.subscription_type)[0];
                FileRepository.log("eventSubConfig " + JSON.stringify(eventSubConfig));

                eventSubConfig?.actions?.forEach(function (action) {
                    FileRepository.log("action" + JSON.stringify(action));
                    const pluginName = action.name.substr(0, action.name.indexOf("."));
                    const actionName = action.name.substr(action.name.indexOf(".") + 1);
                    const plugin = App.globalState.get(pluginName);

                    if (plugin !== null && plugin !== undefined) {
                        // FileRepository.log("plugin " + pluginName + " actions " + JSON.stringify(plugin));
                        FileRepository.log("plugin " + pluginName + " actions " + Array.from(plugin.actions.keys()));
                        FileRepository.log("actionName " + actionName);
                        const actionObject = plugin.actions.get(actionName);
                        FileRepository.log("actionObject" + JSON.stringify(actionObject));
                        actionObject?.handler(event.data);
                    } else {
                        const plugins = Array.from(App.globalState.keys());

                        FileRepository.log("Main.js could not find plugin " + pluginName);
                        FileRepository.log("plugin list " + plugins);
                    }
                });
                App.oscManager.send("/" + obj.metadata.subscription_type, JSON.stringify(event.data));
            }
        }, true);
        return Promise.resolve(); //App.eventSubListener.connect());
    }


/*     static doAction(key, scope) {
        // scope is globalState

        actions.get(key)(scope, perhaps the chat message);
    }
 */
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

        if (!App.oAuthProvider) {
            App.oAuthProvider = new OAuthProvider(App.config.redirectUri,
                    App.config.listenerPort,
                    App.secrets,
                    App.config.preferredBrowser,
                    App.activeApiScopes.concat(App.activeChatScopes));
        }
    }

    static initTwitchAPIProvider() {
        App.twitchAPIProvider = new TwitchAPIProvider(App.oAuthProvider);
    }

    static getWallet(userId, channel) {
        const key = userId + ":" + channel;
        if (!App.wallets.has(key)) {
            App.wallets.set(key, new Wallet({
                    userId: userId,
                    channel: channel
                }));
        }

        return App.wallets.get(key);
    }

	// ["984802343", {
	// "id": "984802343",
	// "login": "littlemiscakes",
	// "username": "LittleMiscakes",
	// "type": "",
	// "broadcasterType": "",
	// "description": "",
	// "profileImageUrl": "",
	// "offlineImageUrl": "",
	// "viewCount": 0,
	// "createdAt": "1970-01-01T00:00:00Z"

    static async getUserByLogin(query)
    {
        const login = query.replace("@",'');
        let users = Array.from(App.users.values());
        let user = users.find((x) => x.login === login);
        
        FileRepository.log("App.getUserByLogin" + " " + login);
        
        if (!!user)
        {
            await App.twitchAPIProvider
            .getUserInfo({login:login},
                function (res) {
                    
                FileRepository.log("App.getUserByLogin res \r\n" + JSON.stringify(res));
                    
                if (res && res.length > 0) {
                    user = res[0];
                }
            })
            .catch(function (e) {
                FileRepository.log("App.getUserByLogin error getting user info " + e);
            });
        }

        FileRepository.log("App.getUserByLogin returning " + JSON.stringify(user));
        return user;
    }

    static async getUserById(query)
    {
        FileRepository.log("App.getUserById" + " " + query);
        let user = users.get(query);
        
        if (!!user)
        {
            return await App.twitchAPIProvider
            .getUserInfo({id: query},
                function (res) {
                if (res && res.length > 0) {
                    user = res[0];
                }
            })
            .catch(function (e) {
                FileRepository.log("App.getUserByLogin error getting user info " + e);
            });
        }
        else
        {
            return user;
        }
    }


}

App.init();

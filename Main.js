import zl from "zip-lib";
import LanguageLookup from './src/languageLookup.mjs';
import {
    Worker,
    isMainThread,
    parentPort,
    workerData
}
from 'node:worker_threads';
import http from "http";
import WebServer from "./src/WebServer.mjs";
import ChatBot from "./src/ChatBot.mjs";
// import Wordle from "./src/Wordle.mjs";
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
    ChatCommand
}
from "./src/ChatCommand.mjs";
import {
    ChatCommands
}
from "./src/ChatCommands.mjs";
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
import PubSubListener from "./src/PubSubListener.mjs";
import WebUIInterface from "./src/webUIInterface.mjs";
import WebSocketListener from "./src/WebSocketListener.mjs";
import readline from "readline/promises";
import fs from 'fs';
import {
    Constants
}
from "./src/Constants.mjs";
import Gorkblorf from "./src/Gorkblorf.mjs";
import ChatCommandManager from "./src/ChatCommandManager.mjs";

import {
    open
}
from 'node:fs/promises';

process.on('warning', (warning) => {
    FileRepository.log(warning.name); // Print the warning name
    FileRepository.log(warning.message); // Print the warning message
    FileRepository.log(warning.stack); // Print the stack trace
});
var activeApiScopes = [];
var activeChatScopes = [];
var botUserInfo;
var chatLog = new Map();
var chatBot;
var config = {};
var eventSubListener;
var eventSubscriptionConfig = new Map();
var gorkblorf = new Gorkblorf();
var oAuthProvider;
var oscManager;
var pubSubListener;
var secrets = new Secrets();
var twitchAPIProvider;
var webServer;
var webUIInterface = new WebUIInterface(8080);
// var wordle;
var users = new Map();
// var VRChatInterface = new OscManager("127.0.0.1", 9000, "127.0.0.1", 9001);
// var VRChatInterface = new OscManager("127.0.0.1", 5656, "127.0.0.1", 5657);
// VRChatInterface.setEvent("/chatbox/input", true);
// VRChatInterface.setEvent("/chatbox/Input", true);
// VRChatInterface.setEvent("/input/Jump", true);
var subbed = false;
var chatSaveTimeout = null;

var isChatBotRunning = false;
var isEventSubRunning = false;
var isPubSubRunning = false;
var isWebServerRunning = false;
var globalState = new Map();
var chatCommandManager = null;

var subscriptionConditionState = {
    "broadcaster_user_id": null,
    "campaign_id": null // optional to specify campaign
,
    "category_id": null // optional to specify category/game
,
    "client_id": null,
    "extension_client_id": null,
    "moderator_user_id": null,
    "organization_id": null,
    "reward_id": null // optional; gets notifications for a specific reward
,
    "to_broadcaster_user_id": null // could provide from_broadcaster_user_id instead
,
    "user_id": null
};

//todo figure out a way to fix the maxlisteners error

function setGlobalState(key, value) {
    globalState.set(key, value);
}

function loadEventSubscriptions() {
    return FileRepository.loadEventSubscriptions().then(function (data) {
        if (data) {
            FileRepository.log("loadEventSubscriptions " + data);

            JSON.parse(data)
            .forEach(function (x) {
                eventSubscriptionConfig.set(x[0], x[1]);
            });
        } else {
            FileRepository.log("loadEventSubscriptions found no data");
        }
    });
}

function loadOscMappings() {
    return FileRepository.loadOscMappings().then(function (data) {
        if (data) {
            Array.from(JSON.parse(data))
            .forEach(function (x) {
                oscManager.setEvent(x[0], x[1]);
            });
        }
    });
}

function loadConfig() {
    return FileRepository.loadConfig().then(function (data) {
        FileRepository.log("loadConfig " + data);
        try {
            config = new Config(JSON.parse(data));
        } catch (e) {
            config = new Config(null);
        }
    });
}

function loadApiScopes() {
    return FileRepository.loadApiScopes().then(function (data) {
        if (data !== undefined && data.length > 0) {
            activeApiScopes = JSON.parse(data);
        }
    });
}

function loadChatScopes() {
    return FileRepository.loadChatScopes().then(function (data) {
        if (data !== undefined && data.length > 0) {
            activeChatScopes = JSON.parse(data);
        }
    });
}

function loadSecrets() {
    FileRepository.log("loadSecrets ");
    return FileRepository.loadSecrets().then(function (data) {
        var d = null;
        try {
            d = JSON.parse(data);
        } catch (e) {
            //no data in the file
        }
        secrets = new Secrets(d);
    });
}

function startWebServer() {
    if (isWebServerRunning) {
        return;
    }

    FileRepository.log("startWebServer");
    let hostname = "127.0.0.1";
    let port = config.webServerPort;
    let routes = [];

    const Controller = new Map();

    Controller.set("/say", {
        "GET": function (args) {
            throw "method not allowed";
        },
        "POST": function (args) {
            return chatBot.sendMessage(args.channel, args.message);
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
            return Promise.resolve(Array.from(chatBot?.channels ?? []));
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
            return chatBot.joinChannel(args.channel);
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
            return chatBot.leaveChannel(args.channel);
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

    Controller.set("/pubsub/start", {
        "GET": function (args) {
            return startPubSub();
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
            return startEventSub();
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
            return endEventSub();
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
                cost: eventSubListener?.cost ?? 0,
                maxCost: eventSubListener?.maxCost ?? 0
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
            return twitchAPIProvider.getChatters(args.broadcasterId, args.moderatorId);
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
                var vals = users.values();

                for (let i = 0; i < vals.length; i++) {
                    if (vals[i].id === args) {
                        return vals[i];
                    }
                }
            } else if (args?.login) {
                FileRepository.log("getting user by login");
                var vals = users.values();
                for (let i = 0; i < vals.length; i++) {
                    if (vals[i].login === args.login) {
                        return vals[i];
                    }
                }
            } else {
                FileRepository.log("getting all users" + JSON.stringify(users));
                var entries = Array.from(users?.entries())
                    FileRepository.log("getting all users" + JSON.stringify(entries));
                return Promise.resolve(entries);
            }
        },
        "POST": function (args) {
            //add a user
            users.set(args.id, args);
            return FileRepository.saveUsers(users);
        },
        "PUT": function (args) {
            //update user
            users.set(args.id, args);
            return FileRepository.saveUsers(users);
        },
        "DELETE": function (args) {
            //remove a user from the list
            users.remove(args.id);
            return FileRepository.saveUsers(users);
        },
    });

    Controller.set("/user/bot", {
        "GET": function (args) {
            return Promise.resolve(botUserInfo);
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
            return twitchAPIProvider.getSubscriptions();
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
            return Promise.resolve(Array.from(eventSubscriptionConfig));
        },
        "POST": function (args) {
            throw "method not allowed";
        },
        "PUT": function (args) {
            // FileRepository.log("PUT /subscriptions   " + JSON.stringify(args));
            //set the value, then write the file
            eventSubscriptionConfig = new Map(args);

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
            return Promise.resolve(Array.from(oscManager.events));
        },
        "POST": function (args) {
            throw "method not allowed";
        },
        "PUT": function (args) {
            args.forEach(function (t) {
                oscManager.setEvent(t[0], t[1]);
            });

            return FileRepository.saveOscMappings(Array.from(oscManager.events));
        },
        "DELETE": function (args) {
            throw "method not allowed";
        },

    });

    Controller.set("/secrets", {
        "GET": function (args) {
            return Promise.resolve(secrets);
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
            return Promise.resolve(config);
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

    Controller.set("/chat/start", {
        "GET": function (args) {
            return Promise.resolve(initChatBot());
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
            return Promise.resolve(Array.from(chatBot.commandState.entries()));
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

    Controller.set("/chat/scopes/active", {
        "GET": function (args) {
            FileRepository.log("/chat/scopes/active", activeChatScopes);
            return Promise.resolve(activeChatScopes);
        },
        "POST": function (args) {
            throw "method not allowed";
        },
        "PUT": function (args) {
            if (args.length !== undefined && args.length !== null) {
                activeChatScopes = args;
                return FileRepository.saveChatScopes(args, function (x) {});
            }
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

    Controller.set("/api", {
        "GET": function (args) {
            throw "method not allowed";
        },
        "POST": function (args) {
            FileRepository.log("/api args " + args);
            // FileRepository.log("TwitchAPIProvider[args.key]", twitchAPIProvider[args.key]);
            return new Promise(function (resolve, reject) {
                twitchAPIProvider[args.key](args.args, function (data) {
                    FileRepository.log("api endpoint " + args.key + " returning " + JSON.stringify(data));

                    if (args.key === "getUserInfo") {
                        FileRepository.log("saving user info");
                        users.set(data[0].id, data[0]);
                        FileRepository.saveUsers(Array.from(users.entries()));
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
            return Promise.resolve(activeApiScopes);
        },
        "POST": function (args) {
            throw "method not allowed";
        },
        "PUT": function (args) {
            // FileRepository.log("args", args);
            if (args.length !== undefined && args.length !== null) {
                activeApiScopes = args;
                return FileRepository.saveApiScopes(args);
            }
        },
        "DELETE": function (args) {
            throw "method not allowed";
        },
    });

    webServer = new WebServer(hostname, port, config.preferredBrowser, Controller);
    webServer.start();
}

function initChatBot() {

    if (isChatBotRunning) {
        return;
    }

    for (var command of ChatCommands.entries()) {
        var commandConstructed = new ChatCommand(command[1]);
        chatCommandManager.setCommand(command[0], commandConstructed);
    }

    chatBot = new ChatBot(config.botName, secrets, config.chatDelay, chatCommandManager);

    chatBot.AddHandler("message", function (x) {
        // console.log("chatbot message", x);
        // FileRepository.saveChatMessage(x.target.substr(1), x.msg);

        if (!x.self) {

            gorkblorf.read(x.msg, x.context["user-id"]);

            oscManager.send("/chat.message", JSON.stringify({
                    username: x.context.username,
                    message: x.msg
                }), () => {
                //client.close();
            });

            if (x.msg.toLowerCase().indexOf("@" + config.botName.toLowerCase()) > -1) {
                var respondingTo = "@" + x.context.username;
                var responseMessage = gorkblorf.getText(null, Math.ceil(Math.random() * 20));

                if (responseMessage.length === 0) {
                    responseMessage = "gorkblorf molunga spafs spafs spafs >><<";
                }
                chatBot.sendMessage(x.target.substr(1), respondingTo + " " + responseMessage);
            }
        }

        var chatMessage = JSON.stringify({
            target: x.target,
            msg: x.msg,
            context: x.context,
            self: x.self,

        });
        webUIInterface.send(chatMessage);

        var key = x.target.substr(1);
        var channelMessages = chatLog.get(key);

        if (channelMessages?.length) {
            channelMessages.push(x);

            if (channelMessages.length > config.chatLogChannelHistory) {
                channelMessages.pop();
            }
        } else {
            channelMessages = [x];
        }
        chatLog.set(key, channelMessages);

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

        FileRepository.saveChatMessage(chatMessage);
    }, true);

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

    isChatBotRunning = true;
    return Promise.resolve();
}

function endEventSub() {
    isEventSubRunning = false;
    return eventSubListener.close();
}

function startEventSub() {
    if (isEventSubRunning) {
        FileRepository.log("EventSub already running");

        return Promise.resolve(true);
    }

    // FileRepository.log("startEventSub " + eventSubscriptionConfig);
    eventSubListener = new EventSubListener(Constants.eventSubWebSocketUrl, config.listenerPort, oAuthProvider);

    var subs = new Map();

    for (var sub of eventSubscriptionConfig.entries()) {
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
                    oscManager.send("/" + data.payload.subscription.type, JSON.stringify(data));
                }
            })
        });
    }
    // FileRepository.log("subs " + JSON.stringify(Array.from(subs.entries())));

    eventSubListener.AddHandler("message", function (event) {
        // FileRepository.log("eventSubListener message", event);

        var obj = JSON.parse(event.data);

        if (obj.metadata.message_type === Constants.session_welcome && !subbed) {

            // FileRepository.log("welcome in. do subs");
            subbed = true;
            for (var [key, value] of subs) {
                FileRepository.log("sub: " + key + " " + JSON.stringify(value));
                eventSubListener.subscribe(key, value.condition)
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
    return Promise.resolve(eventSubListener.connect());
}

function endPubSub() {
    isPubSubRunning = false;
    pubSubListener.close();
}

function startPubSub() {
    if (isPubSubRunning) {
        return;
    }
    pubSubListener = new PubSubListener(Constants.pubSubWebSocketUrl, oAuthProvider);

    pubSubListener.AddHandler("open", function () {
        pubSubListener.listen("channel.subscribe", function (req, res) {
            FileRepository.log("channel.subscribe handler", req, res);
        });
    }, false);
    return pubSubListener.connect()
}

loadChatScopes()
.then(loadApiScopes)
.then(loadConfig)
.then(loadSecrets)
.then(function () {
    oscManager = new OscManager(config.oscClientAddress, config.oscClientPort, config.oscServerAddress, config.oscServerPort);
    chatCommandManager = new ChatCommandManager({
        config,
        oscManager
    });
})
.then(loadOscMappings)
.then(function () {

    // FileRepository.log("secrets loaded", data);
    subscriptionConditionState["client_id"] = secrets.clientId;

    FileRepository.log("scopes " + activeApiScopes.concat(activeChatScopes));

    //todo client id missing error when txt file missing
    oAuthProvider = new OAuthProvider(config.redirectUri, config.listenerPort, secrets, config.preferredBrowser, activeApiScopes.concat(activeChatScopes));
    twitchAPIProvider = new TwitchAPIProvider(oAuthProvider);

    new Promise(function (resolve, reject) {
        twitchAPIProvider
        .getUserInfo(config.broadcasterUsername,
            function (data) {
            FileRepository.log("initializing user data", twitchAPIProvider.user);
            subscriptionConditionState.broadcaster_user_id = twitchAPIProvider.user[0].id;
            subscriptionConditionState.user_id = twitchAPIProvider.user[0].id;
            resolve(data);
        });
    });

    new Promise(function (resolve, reject) {
        twitchAPIProvider
        .getUserInfo(config.botName,
            function (data) {
            FileRepository.log("initializing user data", twitchAPIProvider.user);
            botUserInfo = twitchAPIProvider.user[0];
            resolve(data);
        });
    });

    FileRepository.readUsers()
    .then(function (data) {
        // FileRepository.log("got users " + data);
        users = new Map(JSON.parse(data));
    })
    .catch(function () {
        //no file
    });
    loadEventSubscriptions();
    twitchAPIProvider.getSubscriptions(null, function (data) {
        if (data?.length > 0) {
            FileRepository.log("EventSub already running at startup");
            isEventSubRunning = true;
        }
    });

    FileRepository.loadPlugins(function (plugin) {
		
        //add commands to the list
        if (plugin?.default.load) {
        console.log("loading plugin", plugin.default.name);
            plugin.default.load(FileRepository.log)
            .then(function (loadedPlugin) {
                for (var command of plugin?.default.commands?.entries()) {
                    var commandConstructed = new ChatCommand(command[1]);
                    chatCommandManager.setCommand(command[0], commandConstructed);

                    if (plugin.default.state) {
                        // set a global state if the plugin has a state object
                        setGlobalState(plugin.default.name, plugin.default.state);
                    }
                }
            });
        }
		else{
			console.log("plugin has no load function", plugin.default);
		}
    });

})
.then(startWebServer)
.then(async function () {
    FileRepository.log("Gorkblorf is reading the chat log.  This takes a while.");

    FileRepository.loadChatMessages(
        function (msg) {
        var obj = JSON.parse(msg);
        var channelName = obj.target.substr(1);
        var messageList = chatLog.get(channelName);

        if (messageList?.length > 0) {
            messageList.push(obj);
        } else {
            messageList = [obj];
        }
        chatLog.set(channelName, messageList);
    })
    .then(async function (data) {

        //loading the text takes a long time because of levenshtein distance,
        //so we do it in another thread
        var worker = new Worker("./src/loadGorkblorf.js", {
            workerData: {
                chatLog: chatLog,
                gorkblorf: gorkblorf
            }
        });

        worker.on('message', function (data) {
            // console.log("message data", data);
            gorkblorf = new Gorkblorf(data.gorkblorf);
        });
        worker.on('error', function (err) {
            console.log("error", err);
        });
        worker.on('exit', (code) => {
            if (code !== 0)
                console.log(`Worker stopped with exit code ${code}`);
        });

        var startTime = Date.now();
        var keys = chatLog.keys();
        for (const key of keys) {
            var messages = chatLog.get(key);
            messages.forEach(function (x) {
                gorkblorf.read(x.msg, x.context["user-id"]);
            });
        }
        var endTime = Date.now();
        console.log("gorkblorf took " + (endTime - startTime) + " ms");
        console.log("checked words", gorkblorf.checkedWordCounter);
    });

});

import fs from 'fs';
import zl from "zip-lib";
import { CommonEnglishWords } from "./src/CommonEnglishWords.mjs";
import { EnglishPrefixes } from "./src/EnglishPrefixes.mjs";
import { EnglishSuffixes } from "./src/EnglishSuffixes.mjs";
import { EnglishSyllables } from "./src/EnglishSyllables.mjs";
import { WordSyllabizer } from "./src/WordSyllabizer.mjs";
import Currency from "../../src/Currency.mjs";

var EnglishDefinitions;
await import("./src/EnglishDefinitions.mjs").then(function (data) {
    EnglishDefinitions = data.EnglishDefinitions;
})
.catch(function (err) {
    zl.extract('./plugins/common/src/EnglishDefinitions.zip', "./plugins/common/src/")
    .then(async function (data) {
        await import("./src/EnglishDefinitions.mjs").then(function (data) {
            EnglishDefinitions = data.EnglishDefinitions;
        })
    }, function (err) {
        console.log("EnglishDefinitions.mjs error", err);
    })
    .catch(function (err) {
        console.log("EnglishDefinitions.mjs error", err);
    });
});

const commonActions = new Map();

//obj = {
// target: String,
// msg: String,
// context: TwitchChatMessageContext,
// "self": boolean,
// chatBot: Object<ChatBot>
// }

commonActions.set("Set Timer", {
    name: "Set Timer",
    defaultJSON: `{"notifyUser": false, "name": "", "seconds": 0, "repeat": false, "maxIterations": 1}`,
    description: "Set a timer, with a name and an option to repeat.  !prtimer @notifyUser name seconds repeat iterations",
    handler: function (globalState, obj, json) {
        const notifyUser = json?.notifyUser ?? obj.args[0];
        const name = json?.name ?? obj.args[1] ?? "noname";
        const seconds = json?.seconds ?? parseInt(obj.args[2]) ?? 60;
        const repeat = json?.repeat ?? obj.args[3] == "repeat" ? true : false;
        const maxIterations = json?.maxIterations ?? parseInt(obj.args[4]) ?? 1;
        const key = obj.target + stateKey;
        let iterations = 0;

        obj.chatBot.chatCommandManager.setCommandState(key + name, {
            seconds: seconds,
            repeat: repeat,
            notifyUser: notifyUser,
            name: name,
            iterations: iterations,
            maxIterations: maxIterations,
        });

        if (repeat) {
            return function (handler /* the caller passes a handler function into the call, usually it just looks for a string to post to the IRC channel */) {
                let state = obj.chatBot.chatCommandManager.getCommandState(key + name);
                let interval = setInterval(function () {

                    let state = obj.chatBot.chatCommandManager.getCommandState(key + name);
                    let message;

                    if (state.iterations < state.maxIterations) {
                        state.iterations++;
                        obj.chatBot.chatCommandManager.setCommandState(key + name, state);
                        // handler(`Timer ${name} tick ${notifyUser}`);
                        message = "Timer " + name + " tick " + notifyUser;
                    } else {
                        clearInterval(interval);
                        obj.chatBot.chatCommandManager.deleteCommandState(key + name);
                        // handler (`Timer ${name} has expired ${notifyUser}`);

                        message = "Timer " + name + " has expired " + notifyUser;
                    }

                    json.followOnActions?.forEach((x) => {
                        x.json = {};
                        x.json.message = message;
                        App.chatBot.chatCommandManager.doAction(obj, x);
                    });
                }, seconds * 1000);

                if (intervalMap.has(key + name)) {
                    clearInterval(intervalMap.get(key + name));
                }

                intervalMap.set(key + name, interval);

                obj.chatBot.chatCommandManager.setCommandState(key + name, state);
            };
        } else {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    obj.chatBot.chatCommandManager.deleteCommandState(key + name);

                    let message = "Timer " + name + " has expired " + notifyUser;

                    json.followOnActions?.forEach((x) => {
                        x.json = {};
                        x.json.message = message;
                        App.chatBot.chatCommandManager.doAction(obj, x);
                    });

                }, seconds * 1000);
            });
        }
    }
});

commonActions.set("Kill Timer", {
    name: "Kill Timer",
    description: "stop a timer by name",
    handler: function (globalState, obj, json) {
        const name = obj.args[0];
        const key = obj.target + stateKey;

        if (intervalMap.has(key + name)) {
            clearInterval(intervalMap.get(key + name));
        }

        obj.chatBot.chatCommandManager.deleteCommandState(key + name);
    }
});

commonActions.set("Show Text", {
    name: "Show Text",
    description: "Display text on the browser source",
    handler: function (globalState, obj, json) {
        FileRepository.saveOBSTextSource(json.message);
    }
});

commonActions.set("Give Currency To All Chatters", {
    name: "Give Currency To All Chatters",
    description: "Increases the value of the given currency type, by the given value",
    defaultJSON: `{currencyName: ""}`,
    handler: function (globalState, obj, json) {
        const FileRepository = globalState.get("filerepository");
        const Constants = globalState.get("constants");
        const App = globalState.get("app");
        FileRepository.log("Add Currency" + " " + obj);

        let channel = obj.target.trim().substr(1);

        App.chatBot.getChannelChatters(channel)
        .then(function (chatters) {
            chatters.forEach(function (chatter) {
                FileRepository.log("Adding Currency to chatter" + JSON.stringify(chatter));
                // add currency to each chatter's wallet
                let currency = new Currency(App.currencies.get(json.currencyName));
                currency.add(1);

                let wallet = App.getWallet(chatter.id, obj.target);
                wallet.addCurrency(currency);
            });
        });
    }
});

commonActions.set("Give Currency To A Chatter", {
    name: "Give Currency To A Chatter",
    description: "Increases the value of the given currency type, by the given value",
    defaultJSON: `{userId: "0", currencyName: "", currencyAmount: 0}`,
    handler: async function (globalState, obj, json) {
        const FileRepository = globalState.get("filerepository");
        const Constants = globalState.get("constants");
        const App = globalState.get("app");

        let chatterId = json.userId;
        if (!chatterId) {
            chatterId = parseInt(obj?.args[0]);

            if (isNaN(chatterId)) {
                let chatter = await App.getUserByLogin(obj?.args[0]);
                chatterId = chatter.id;

                FileRepository.log("asdfkjhasker9834r chatter " + JSON.stringify(chatter));
                if (!chatterId) {
                    return "User not found";
                }
            }
        }

        FileRepository.log("Give Currency To A Chatter" +
            " chatterId " + chatterId);

        let currencyName = json.currencyName;
        if (!currencyName) {
            currencyName = obj?.args[1];
        }

        let currencyAmount = json.currencyAmount;
        if (!currencyAmount) {
            currencyAmount = parseInt(obj?.args[2]);
        }

        let currency = new Currency(App.currencies.get(currencyName));
        currency.add(currencyAmount);

        let wallet = App.getWallet(chatterId, obj.target);
        wallet.addCurrency(currency);

        FileRepository.log("Give Currency To A Chatter" +
            " chatterId " + chatterId + " " +
            " currency " + JSON.stringify(currency));

    }
});

commonActions.set("Remove Currency From A Chatter", {
    name: "Remove Currency From A Chatter",
    description: "Decreases the value of the given currency type, by the given value",
    defaultJSON: `{userId: "0", currencyName: "", currencyAmount: 0}`,
    handler: async function (globalState, obj, json) {
        const FileRepository = globalState.get("filerepository");
        const Constants = globalState.get("constants");
        const App = globalState.get("app");

        let chatterId = json.userId;
        if (!chatterId) {
            chatterId = parseInt(obj?.args[0]);

            if (isNaN(chatterId)) {
                chatterId = await App.getUserByLogin(obj?.args[0]).id;

                if (!chatterId) {
                    return "User not found";
                }
            }
        }

        let currencyName = json.currencyName;
        if (!currencyName) {
            currencyName = obj?.args[1] ?? "";
        }

        let currencyAmount = json.currencyAmount;
        if (!currencyAmount) {
            currencyAmount = obj?.args[2] ?? 0;
        }

        let currency = new Currency(App.currencies.get(currencyName));
        currency.add(currencyAmount);

        let wallet = App.getWallet(chatterId, obj.target);
        wallet.subtractCurrency(currency);
    }
});

commonActions.set("Remove Currency From Current User", {
    name: "Remove Currency From Current User",
    description: "Decreases the value of the given currency type, by the given value",
    defaultJSON: `{currencyName: "", currencyAmount: 0}`,
    handler: function (globalState, obj, json) {
        const FileRepository = globalState.get("filerepository");
        const Constants = globalState.get("constants");
        const App = globalState.get("app");

        let chatterId = obj.context.userId;

        let currencyName = json.currencyName;
        if (!currencyName) {
            currencyName = obj?.args[0] ?? "";
        }

        let currencyAmount = json.currencyAmount;
        if (!currencyAmount) {
            currencyAmount = obj?.args[1] ?? "";
        }

        let currency = new Currency(App.currencies.get(currencyName));
        currency.add(currencyAmount);

        let wallet = App.getWallet(chatterId, obj.target);
        wallet.subtractCurrency(currency);
    }
});

commonActions.set("Get Currency Value", {
    name: "Get Currency Value",
    description: "Returns the value of the specified Currency",
    handler: function (globalState, obj, json) {
        const FileRepository = globalState.get("filerepository");
        const Constants = globalState.get("constants");
        const App = globalState.get("app");

        let channel = obj.target.trim().substr(1);

        App.chatBot.getChannelChatters(channel)
        .then(function (chatters) {

            // let chatterCount = chatters.length;

            chatters.forEach(function (chatter) {
                // add currency to each chatter's wallet
                let currency = new Currency(App.currencies.get(key));
                currency.add(1);

                let wallet = App.getWallet(chatter.id, obj.target);
                wallet.addCurrency(currency);
            });
        });
    }
});

commonActions.set("Random Message", {
    name: "Random Message",
    description: "Send a random message from a list in chat",
    defaultJSON: `{"messages": "[\"\"]"}`,
    handler: function (globalState, obj, json) {
        const FileRepository = globalState.get("filerepository");
        const Constants = globalState.get("constants");
        const App = globalState.get("app");

        FileRepository.log("Random Message " + JSON.stringify(json));

        let name = obj.args[0];
        if (!name) {
            name = getNickname();
        }
        const message = json.messages[Math.floor(Math.random() * json.messages.length)];
        App.chatBot.sendMessage(obj.target, message.replace("${name}", name));
    }
});

commonActions.set("Say", {
    name: "Say",
    description: "Send a message to chat",
    defaultJSON: `{"message": ""}`,
    handler: function (globalState, obj, json) {
        const FileRepository = globalState.get("filerepository");
        const Constants = globalState.get("constants");
        const App = globalState.get("app");
        let name = obj.args[0];
        if (!name) {
            name = getNickname();
        }
        App.chatBot.sendMessage(obj.target, json.message.replace("${name}", name));
    }
});

var plugin = {
    name: "common",

    //commands is a map of keys and functions that take an object as a parameter and return a string
    // {
    // target: target,
    // msg: msg,
    // context: new TwitchChatMessageContext(context),
    // "self": isSelf,
    // chatBot: self
    // }
    exports: {
        actions: commonActions,
        commonEnglishWords: CommonEnglishWords,
        englishDefinitions: EnglishDefinitions,
        englishPrefixes: EnglishPrefixes,
        englishSuffixes: EnglishSuffixes,
        englishSyllables: EnglishSyllables,
        wordSyllabizer: WordSyllabizer
    }
};

function getNickname() {
    var list = [
        "Champ",
        "Tiger",
        "Einstein",
        "Pal",
        "Friend",
        "Ol' Chap",
        "Buddy",
    ];

    return list[Math.floor(Math.random() * list.length)];
}

export default plugin;

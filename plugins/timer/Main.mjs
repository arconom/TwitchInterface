import {
    Constants
}
from "../../src/Constants.mjs";
var plugin = {
    name: "timer",

    //commands is a map of keys and functions that take an object as a parameter and return a string
    // {
    // target: target,
    // msg: msg,
    // context: new TwitchChatMessageContext(context),
    // "self": isSelf,
    // chatBot: self,
    // args: [] an array of strings split from the user input
    // }
    exports: {},
    commands: new Map(),
    load: function (globalState) {
        var FileRepository = globalState.get("filerepository");
        var Constants = globalState.get("constants");
        const stateKey = "timer"

            FileRepository.log("timer.load");

        // this function will be called by Main.js in the app
        //load whatever dependencies you need in here and do setup

        plugin.commands.set("prtimer", {
            description: "Set a timer, with a name and an option to repeat.  !prtimer name seconds repeat @notifyUser",
            handler: function (obj) {
                var name = obj.args[0];
                var seconds = parseInt(obj.args[1]);
                var repeat = obj.args[2] == "repeat" ? true : false;
                var notifyUser = obj.args[3];
                var interval = null;
                var key = obj.target + stateKey;

                if (!name) {
                    name = "timer";
                }
				
                if (!seconds) {
                    seconds = 60;
                }

                if (repeat) {

                    obj.chatBot.chatCommandManager.setCommandState(key, {
                        seconds: seconds,
                        repeat: repeat,
                        notifyUser: notifyUser,
                        name: name,
                        interval: interval
                    });

                    return function (handler) {
                        interval = setInterval(function () {
                            handler(`Timer ${name} tick ${notifyUser}`);
                        }, seconds * 1000);
                    };

                } else {
                    obj.chatBot.chatCommandManager.setCommandState(key, {
                        seconds: seconds,
                        repeat: repeat,
                        notifyUser: notifyUser,
                        name: name,
                        interval: interval
                    });
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve(`Timer ${name} has expired ${notifyUser}`);
                        }, seconds * 1000);
                    });
                }

            }
        });

        plugin.commands.set("prkilltimer", {
            description: "stop a timer by name",
            handler: function (obj) {
                var name = obj.args[0];
                var key = obj.target + stateKey;
                var length = 0;
                var maxAttempts = 0;

                if (obj.args) {
                    length = parseInt(obj.args);
                }

                var wordle = new Wordle(wordGenerator.getCommonWord(length), maxAttempts, wordGenerator);
                obj.chatBot.chatCommandManager.setCommandState(key, wordle.getState());
                return wordle.status();
            }
        });

        return Promise.resolve();

    }
};

export default plugin;

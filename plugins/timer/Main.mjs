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
            let intervalMap = new Map();

        FileRepository.log("timer.load");

        // this function will be called by Main.js in the app
        //load whatever dependencies you need in here and do setup

        plugin.commands.set("prtimer", {
            description: "Set a timer, with a name and an option to repeat.  !prtimer @notifyUser name seconds repeat iterations",
            handler: function (obj) {
                const notifyUser = obj.args[0];
                const seconds = parseInt(obj.args[2]) ?? 60;
                const repeat = obj.args[3] == "repeat" ? true : false;
                const maxIterations = parseInt(obj.args[4]) ?? 1;
                const name = obj.args[1] ?? "noname";
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

                            if (state.iterations < state.maxIterations) {
                                state.iterations++;
                                obj.chatBot.chatCommandManager.setCommandState(key + name, state);
                                handler(`Timer ${name} tick ${notifyUser}`);
                            } else {
                                clearInterval(interval);
                                obj.chatBot.chatCommandManager.deleteCommandState(key + name);
                                handler(`Timer ${name} has expired ${notifyUser}`);
                            }
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

                            resolve(`Timer ${name} has expired ${notifyUser}`);
                        }, seconds * 1000);
                    });
                }
            }
        });

        plugin.commands.set("prkilltimer", {
            description: "stop a timer by name",
            handler: function (obj) {
                const name = obj.args[0];
                const key = obj.target + stateKey;

                if (intervalMap.has(key + name)) {
                    clearInterval(intervalMap.get(key + name));
                }

                obj.chatBot.chatCommandManager.deleteCommandState(key + name);
            }
        });

        return Promise.resolve();
    }
};

export default plugin;

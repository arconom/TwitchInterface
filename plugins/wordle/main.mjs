import Wordle from "./src/Wordle.mjs";
import {
    Constants
}
from "../../src/Constants.mjs";
var plugin = {
    name: "Wordle",
    commands: new Map(),
    load: function (log) {
            console.log("wordle.load");
        //log = function(string)
        //we need the wordgenerator plugin to run this
        return import("../wordgenerator/Main.mjs")
        .then(function (module) {
            console.log("WordGenerator", module);
            var wordGenerator = new module.default();

            // plugin.commandState = {
            // wordGenerator: wordGenerator
            // };

            plugin.commands.set("prcwordle", {
                description: "",
                cooldown: 0,

                role: Constants.chatRoles.viewer,
                enabled: true,
                handler: function (obj) {
                    var length = 0;
                    if (obj.args) {
                        length = parseInt(obj.args);
                    }
                    var wordle = new Wordle(wordGenerator.getCommonWord(length));
                    var key = obj.target + "wordle";

                    obj.chatBot.commandManager.setCommandState(key, wordle);
                    return wordle.status();
                }
            });
            plugin.commands.set("prwordle", {
                description: "",
                cooldown: 0,

                role: Constants.chatRoles.viewer,
                enabled: true,
                handler: function (obj) {

                    var length = 0;
                    if (obj.args) {
                        length = parseInt(obj.args);
                    }
                    var key = obj.target + "wordle";

                    var wordle = new Wordle(wordGenerator.getRandomWord(length));
                    obj.chatBot.commandManager.setCommandState(obj.target.substr(1) + "wordle", wordle);
                    return wordle.status();
                }
            });
            plugin.commands.set("prguess", {
                description: "",
                cooldown: 0,

                role: Constants.chatRoles.viewer,
                enabled: true,
                handler: function (obj) {
                    if (obj && obj.args && obj.args.length > 0) {
                        var key = obj.target + "wordle";
                        var wordle = obj.chatBot.commandManager.getCommandState(key);

                        if (wordle) {
                            wordle.submit(obj.args);
                            return wordle.status();
                        } else {
                            return "wordle has not been started";
                        }
                    }
                }
            });
            plugin.commands.set("prwordlestatus", {
                description: "",
                cooldown: 0,

                role: Constants.chatRoles.viewer,
                enabled: true,
                handler: function (obj) {
                    var key = obj.target + "wordle";
                    var wordle = obj.chatBot.commandManager.getCommandState(key);

                    if (wordle) {
                        return wordle.status(true);
                    } else {
                        return "wordle has not been started";
                    }
                }
            });
        });
    }
};

export default plugin;

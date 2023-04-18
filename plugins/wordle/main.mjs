import Wordle from "./src/Wordle.mjs";
import {
    Constants
}
from "../../src/Constants.mjs";
var plugin = {
    name: "Wordle",
    commands: new Map(),
    load: function (log) {
        //log = function(string)
        //we need the wordgenerator plugin to run this
        import("../wordgenerator/Main.mjs")
        .then(function (module) {
            console.log("WordGenerator", module);
            var wordGenerator = new module.default();

            // plugin.commandState = {
            // wordGenerator: wordGenerator
            // };

            plugin.commands.set("prcwordle", {
                description: "",
                cooldown: 0,
                lastExecution: 0,
                role: Constants.chatRoles.viewer,
                enabled: true,
                handler: function (obj) {
                    var length = 0;
                    if (obj.args) {
                        length = parseInt(obj.args);
                    }
                    var wordle = new Wordle(wordGenerator.getCommonWord(length));
                    obj.chatBot.createChannelCommandState(obj.target.substr(1) + "wordle", wordle);
                    obj.chatBot.sendMessage(obj.target.substr(1), wordle.status());
                }
            });
            plugin.commands.set("prwordle", {
                description: "",
                cooldown: 0,
                lastExecution: 0,
                role: Constants.chatRoles.viewer,
                enabled: true,
                handler: function (obj) {

                    var length = 0;
                    if (obj.args) {
                        length = parseInt(obj.args);
                    }

                    var wordle = new Wordle(wordGenerator.getRandomWord(length));
                    obj.chatBot.createChannelCommandState(obj.target.substr(1) + "wordle", wordle);
                    obj.chatBot.sendMessage(obj.target.substr(1), wordle.status());
                }
            });
            plugin.commands.set("prguess", {
                description: "",
                cooldown: 0,
                lastExecution: 0,
                role: Constants.chatRoles.viewer,
                enabled: true,
                handler: function (obj) {
                    if (obj && obj.args && obj.args.length > 0) {
                        var wordle = obj.chatBot.getCommandState(obj.target.substr(1) + "wordle");

                        if (wordle) {
                            wordle.submit(obj.args);
                            obj.chatBot.sendMessage(obj.target.substr(1), wordle.status());
                        } else {
                            obj.chatBot.sendMessage(obj.target.substr(1), "wordle has not been started");
                        }
                    }
                }
            });
            plugin.commands.set("prwordlestatus", {
                description: "",
                cooldown: 0,
                lastExecution: 0,
                role: Constants.chatRoles.viewer,
                enabled: true,
                handler: function (obj) {
                    var wordle = obj.chatBot.getCommandState(obj.target.substr(1) + "wordle");

                    if (wordle) {
                        obj.chatBot.sendMessage(obj.target.substr(1), wordle.status(true));
                    } else {
                        obj.chatBot.sendMessage(obj.target.substr(1), "wordle has not been started");
                    }
                }
            });
        });
    }
};

export default plugin;

import Wordle from "./src/Wordle.mjs";

var plugin = {
    name: "wordle",

    //commands is a map of keys and functions that take an object as a parameter and return a string
    // {
    // target: string,
    // msg: string,
    // context: Object<TwitchChatMessageContext>,
    // "self": bool,
    // chatBot: Object<ChatBot>
    // }
    dependencies: ["wordgenerator"],
    commands: new Map(),
    load: function (globalState) {
        var FileRepository = globalState.get("filerepository");
        FileRepository.log("wordle.load");
        const stateKey = "wordle"

            // this function will be called by Main.js in the app
            //load whatever dependencies you need in here and do setup

            //we need the wordgenerator plugin to run this
            var Constants = globalState.get("constants");

        plugin.commands.set("prcwordle", {
            description: "",
            handler: function (obj) {
                var wordGenerator = globalState.get("wordgenerator").wordGenerator;
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
        plugin.commands.set("prwordle", {
            description: "",
            handler: function (obj) {
                var wordGenerator = globalState.get("wordgenerator").wordGenerator;
                var key = obj.target + stateKey;
                var length = 0;
                var maxAttempts = 0;

                if (obj.args) {
                    length = parseInt(obj.args);
                }

                var wordle = new Wordle(wordGenerator.getRandomWord(length), maxAttempts, wordGenerator);
                obj.chatBot.chatCommandManager.setCommandState(key, wordle.getState());
                return wordle.status();
            }
        });
        plugin.commands.set("prguess", {
            description: "",
            handler: function (obj) {
                if (obj && obj.args && obj.args.length > 0) {
                    var key = obj.target + stateKey;
                    var wordle;
                    var wordleState = obj.chatBot.chatCommandManager.getCommandState(key);

                    if (wordleState) {
                        wordle = new Wordle(wordleState);

                        if (wordle) {
                            wordle.submit(obj.args);

                            obj.chatBot.chatCommandManager.setCommandState(key, wordle.getState());

                            return wordle.status();
                        } else {
                            return "wordle has not been started";
                        }
                    }
                }
            }
        });
        plugin.commands.set("prwordlestatus", {
            description: "",
            handler: function (obj) {
                var key = obj.target + stateKey;
                var wordle;
                var wordleState = obj.chatBot.chatCommandManager.getCommandState(key);
                console.log("wordleState", wordleState);

                if (wordleState) {
                    wordle = new Wordle(wordleState);
                    console.log("wordle", wordle);

                    if (wordle) {
                        return wordle.status(true);
                    } else {
                        return "wordle has not been started";
                    }
                }
            }
        });

        return Promise.resolve();
    }
};

export default plugin;

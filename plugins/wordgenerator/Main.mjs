import WordGenerator from "./src/WordGenerator.mjs";

var plugin = {
    name: "wordgenerator",

    //commands is a map of keys and functions that take an object as a parameter and return a string
    // {
    // target: target,
    // msg: msg,
    // context: new TwitchChatMessageContext(context),
    // "self": isSelf,
    // chatBot: self
    // }
    exports: {
        wordGenerator: null, 
        actions: null
    },
    commands: new Map(),
    load: function (globalState) {
        const FileRepository = globalState.get("filerepository");
        FileRepository.log("wordgenerator.load");

        const Common = globalState.get("common");
        const Constants = globalState.get("constants");

        try {
            plugin.exports.wordGenerator = new WordGenerator(Common.commonEnglishWords, Common.englishDefinitions);
        } catch (e) {
            FileRepository.log(e);
        }

        plugin.exports.actions = new Map();
        
        plugin.exports.actions.set("Random Common Acronym", {
            name: "Random Common Acronym",
            description: "Generate an acronym using common words, pass the word to acronymize",
            handler: function (globalState, obj, json) {
                var msg = plugin.exports.wordGenerator.getCommonAcronym(obj.args[0].toLowerCase());
                return msg;
            }
        });
        plugin.commands.set("Random Acronym", {
            name: "Random Acronym",
            description: "Generate an acronym, pass the word to acronymize",
            handler: function (globalState, obj, json) {
                var msg = plugin.exports.wordGenerator.getAcronym(obj.args[0].toLowerCase());
                return msg;
            }
        });
        plugin.commands.set("Random Common Alliteration", {
            name: "Random Common Alliteration",
            description: "Generate an alliteration using common words, pass the first letter and then the number of words",
            handler: function (globalState, obj, json) {
                var msg = plugin.exports.wordGenerator.getCommonAlliteration(obj.args[0].toLowerCase(), parseInt(obj.args[1]));
                return msg;
            }
        });
        plugin.commands.set("Random Alliteration", {
            name: "Random Alliteration",
            description: "Generate an alliteration, pass the first letter and then the number of words",
            handler: function (globalState, obj, json) {
                var msg = plugin.exports.wordGenerator.getAlliteration(obj.args[0].toLowerCase(), parseInt(obj.args[1]));
                return msg;
            }
        });
        plugin.commands.set("Get Definition", {
            name: "Get Definition",
            description: "Get the definition of the given word, if no word is given, get the definition of the most recently generated random word",
            handler: function (globalState, obj, json) {
                var def = plugin.exports.wordGenerator.getDefinition(obj.args[0].toLowerCase());

                if (def) {
                    return (obj.args[0] ?? plugin.exports.wordGenerator.lastWord) + def;
                } else {
                    return "definition for " + obj.args[0] + " not found";
                }
            }
        });
        plugin.commands.set("Random Common Word", {
            name: "Random Common Word",
            description: "Generate a random common word, or up to 10 if a number is given",
            handler: commonWordHandler
        });
        plugin.commands.set("Random Word", {
            name: "Random Word",
            description: "Generate a random word, or up to 10 if a number is given",
            handler: wordHandler
        });
        plugin.commands.set("Random Definition", {
            name: "Random Definition",
            description: "Generate a random word and definition, or up to 10 if a number is given",
            handler: defHandler
        });

        function defHandler(globalState, obj, json) {
            var wordCount = parseInt(obj.args[0]);
            var words = [];

            if (isNaN(wordCount)) {
                wordCount = 1;
            }
            if (wordCount > 10) {
                wordCount = 10;
            }
            for (let i = 0; i < wordCount; i++) {
                words.push(plugin.exports.wordGenerator.getRandomDefinition());
            }

            return words.join("");
        }

        function commonWordHandler(globalState, obj, json) {
            var wordCount = parseInt(obj.args[0]);
            var words = [];

            if (isNaN(wordCount)) {
                wordCount = 1;
            }

            if (wordCount > 10) {
                wordCount = 10;
            }

            for (let i = 0; i < wordCount; i++) {
                words.push(plugin.exports.wordGenerator.getCommonWord());
            }

            return words.join("");
        }

        function wordHandler(globalState, obj, json) {
            var wordCount = parseInt(obj.args[0]);
            var words = [];

            if (isNaN(wordCount)) {
                wordCount = 1;
            }
            if (wordCount > 10) {
                wordCount = 10;
            }

            for (let i = 0; i < wordCount; i++) {
                words.push(plugin.exports.wordGenerator.getRandomWord());
            }

            return words.join("");
        }
        return Promise.resolve();
    }
};
export default plugin;

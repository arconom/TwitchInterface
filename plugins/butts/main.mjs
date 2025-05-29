
var plugin = {
    name: "butts",

    //commands is a map of keys and functions that take an object as a parameter and return a string
    // {
    // target: string,
    // msg: string,
    // context: Object<TwitchChatMessageContext>,
    // "self": bool,
    // chatBot: Object<ChatBot>
    // }
    config: {
        messageResponseFrequencyFloat: 0,
        textReplaceFrequencyFloat: 0,
        replacerWordListCommaDelimited: ""
    },
    chatMessageHandler: function (message) {
        plugin.FileRepository.log("butts.chatMessageHandler" + message.msg);
        plugin.FileRepository.log("butts.chatMessageHandler plugin.app.config.messageResponseFrequencyFloat" + plugin.app.config.messageResponseFrequencyFloat);
        plugin.FileRepository.log("butts.chatMessageHandler plugin.app.config.textReplaceFrequencyFloat" + plugin.app.config.textReplaceFrequencyFloat);
        plugin.FileRepository.log("butts.chatMessageHandler plugin.app.config.textReplaceFrequencyFloat" + plugin?.app?.config?.replacerWordListCommaDelimited);




        if (!plugin.replacerWordList) {
            // plugin.replacerWordList = plugin?.app?.config?.replacerWordListCommaDelimited.split(",") ?? [];
            plugin.replacerWordList = plugin.app.config.replacerWordListCommaDelimited.split(",") ?? [];
            plugin.FileRepository.log("butts.chatMessageHandler created wordlist " + plugin.replacerWordList);
        }

        if (!message.self && plugin.loadComplete) {

            let messageChanged = false;

            if (Math.random() < plugin.app.config.messageResponseFrequencyFloat) {
                const words = message.msg.split(" ");

                let newWords = [];

                for (let i = 0; i < words.length; i++) {
                    
                    let triggerValue = Math.random() + Math.random() * plugin.app.config.textReplaceFrequencyFloat;
                    
                    const doReplace = triggerValue < plugin.app.config.textReplaceFrequencyFloat
                    && words[i].indexOf("@") == -1;
                    
                    if (doReplace) {
                        
                        let syllables = plugin.WordSyllabizer.Syllabize(words[i]);
                        let syllableIndex = Math.floor(Math.random() * (syllables.length - 2) + 1);
                        let index = Math.floor(Math.random() * plugin.replacerWordList.length);
                        
                        syllables[syllableIndex] = plugin.replacerWordList[index];
                        newWords.push(syllables.join(""));
                        
                        messageChanged = true;
                    } else {
                        newWords.push(words[i]);
                    }
                }

                if (messageChanged) {
                    var responseMessage = newWords.join(" ");
                    message.chatBot.sendMessage(message.target.substr(1), responseMessage);
                }
            }
        }
    },
    commands: new Map(),
    load: function (globalState) {
        plugin.FileRepository = globalState.get("filerepository");
        plugin.FileRepository.log("butts.load");
        const stateKey = "butts";
        plugin.Common = globalState.get("common");

        plugin.WordSyllabizer = new plugin.Common.wordSyllabizer();


        // if this fails to load, it is because it is trying to load before Common,
        // so the order needs to be adjusted
        // this function will be called by Main.js in the app
        //load whatever dependencies you need in here and do setup

        //we need the wordgenerator plugin to run this
        var Constants = globalState.get("constants");
        plugin.app = globalState.get("app");

        plugin.commands.set("prbuttsignoreme", {
            description: "The bot won't butt you around any more.",
            handler: function (obj) {
                var key = obj.target + stateKey + ".ignore";

                let idList = obj.chatBot.chatCommandManager.getCommandState(key);
                idList.push(obj.context.userId);

                obj.chatBot.chatCommandManager.setCommandState(key, idList);
                return wordle.status();
            }
        });

        plugin.commands.set("prbuttsignore", {
            description: "The bot won't butt you around any more.",
            handler: function (obj) {
                var key = obj.target + stateKey + ".ignore";

                let idList = obj.chatBot.chatCommandManager.getCommandState(key);
                idList.push(obj.context.userId);

                obj.chatBot.chatCommandManager.setCommandState(key, idList);
                return wordle.status();
            }
        });

        plugin.commands.set("prbuttsme", {
            description: "The bot will give you butt.",
            handler: function (obj) {
                var key = obj.target + stateKey + ".ignore";

                let idList = obj.chatBot.chatCommandManager.getCommandState(key);
                
                const index = idList.indexOf(obj.context.userId);
                idList.splice(index, 1);

                obj.chatBot.chatCommandManager.setCommandState(key, idList);
                return wordle.status();
            }
        });

        plugin.loadComplete = true;
        return Promise.resolve();
    }
};

export default plugin;


var plugin = {
    name: "cardGame",

    //commands is a map of keys and functions that take an object as a parameter and return a string
    // {
    // target: string,
    // msg: string,
    // context: Object<TwitchChatMessageContext>,
    // "self": bool,
    // chatBot: Object<ChatBot>
    // }
    exports: {
        actions: null
    },
    commands: new Map(),
    load: function (globalState) {
        const App = globalState.get("app");
        const FileRepository = globalState.get("filerepository");
        FileRepository.log("cardGame.load");
        const stateKey = "cardGame";
        const OverlayWebSocket = App.overlayWebSocket;

        // this function will be called by Main.js in the app
        //load whatever dependencies you need in here and do setup
        var Constants = globalState.get("constants");

        plugin.exports.actions = new Map();

        plugin.exports.actions.set("Signup For Card Game", {
            name: "Signup For Card Game",
            defaultJson: `{}`,
            description: "put your name in the hat",
            handler: function (globalState, obj, json) {
                const key = obj.target + ":" + stateKey;

                let options = App.chatBot.chatCommandManager.getCommandState(key + ":waitingList") ?? new Set();
				options.add(obj.context.userId);


if two players, then start a game

                App.chatBot.chatCommandManager
                .setCommandState(key + ":options", optionsMap);


                return message;
            }
        });

        plugin.exports.actions.set("Start Match", {
            name: "Start Poll",
            defaultJson: `{"options": [""]}`,
            description: "start a poll, given a pipe delimited list of options",
            handler: function (globalState, obj, json) {
                const key = obj.target + ":" + stateKey;

                return message;
            }
        });


        return Promise.resolve();
    }
};

export default plugin;

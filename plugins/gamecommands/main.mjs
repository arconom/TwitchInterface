
var plugin = {
    name: "gamecommands",

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
        const App = globalState.get("app");
        const FileRepository = globalState.get("filerepository");
        const Constants = globalState.get("constants");
        const OverlayWebSocket = App.overlayWebSocket;
        const stateKey = "gamecommands";
        const currencyType = "game";
        FileRepository.log("rpgcommands.load");
        // this function will be called by Main.js in the app
        //load whatever dependencies you need in here and do setup

        plugin.commands.set("prsegment", {
            description: "Show the game segment message.",
            handler: function (obj) {
                let channel = obj.target.trim().substr(1);
                // let channelState = App.chatBot.channels.get(channel);

                // if (!channelState.chatters) {
                // App.chatBot.getChatters().then(function () {
                // process();
                // });
                // } else {
                // process();
                // }

                App.chatBot.getChannelChatters(channel)
                .then(function (chatters) {
                    process(chatters);
                });

                function process(chatters) {
                    // let chatters = channelState?.chatters;

                    if (chatters) {

                        let chatterCount = chatters?.length;

                        const key = obj.target + stateKey;

                        obj.chatBot.chatCommandManager.setCommandState(key + "chatterCount", chatterCount);

                        chatters.forEach(function (chatter) {
                            // add currency to each chatter's wallet
                            let currency = gameCurrency();
                            currency.add(1);

                            let wallet = App.getWallet(chatter.id, obj.target);
                            wallet.addCurrency(currency);

                            App.users.set(chatter.id, chatter);
                        });
                    }
                }

                let messageText = "Starting a new segment.  What kind of challenge shall I do for this segment?  Use !prsuggestoption <some words> to suggest a challenge.  Otherwise I'm going with the NSGNSNCNONENNENBB challenge";

                var message = new OverlayMessage({
                    text: messageText,
                    type: "",
                    images: [],
                    sounds: [],
                    duration: 0
                });

                OverlayWebSocket.send(JSON.stringify(message))
                ?.catch (function (e) {
                    FileRepository.log(e);
                });

                return messageText;
            }
        });

        function gameCurrency() {
            return new Currency({
                name: "game",
                value: 0,
                min: 0,
                max: 10
            });
        }

        return Promise.resolve();

    }
};

export default plugin;

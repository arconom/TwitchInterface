
var plugin = {
    name: "poll",

    //commands is a map of keys and functions that take an object as a parameter and return a string
    // {
    // target: string,
    // msg: string,
    // context: Object<TwitchChatMessageContext>,
    // "self": bool,
    // chatBot: Object<ChatBot>
    // }
    dependencies: [],
    commands: new Map(),
    load: function (globalState) {
        const App = globalState.get("app");
        const FileRepository = globalState.get("filerepository");
        FileRepository.log("poll.load");
        const stateKey = "poll"
            const OverlayWebSocket = App.overlayWebSocket;

        // this function will be called by Main.js in the app
        //load whatever dependencies you need in here and do setup

        var Constants = globalState.get("constants");

        plugin.commands.set("prpoll", {
            description: "start a poll, given a pipe delimited list of options",
            handler: function (obj) {
                const key = obj.target + stateKey;
                let list;

                if (obj.args) {
                    list = obj.args.join(" ").split("|");
                }

                let optionsMap = new Map();
                let votesMap = new Map();

                list.forEach((x, i) => {
                    optionsMap.set(i, x);
                });

                obj.chatBot.chatCommandManager.setCommandState(key + "options", optionsMap);
                obj.chatBot.chatCommandManager.setCommandState(key + "votes", votesMap);

                //use the overlay to display the options
                OverlayWebSocket.send(JSON.stringify({
                        text: getPollMessage(optionsMap, votesMap),
                        data: {},
                        type: "poll",
                        images: [],
                        sounds: []
                    }));
            }
        });

        plugin.commands.set("prendpoll", {
            description: "end the current poll",
            handler: function (obj) {
                const key = obj.target + stateKey;
                let options = obj.chatBot.chatCommandManager.getCommandState(key + "options");
                let votesMap = obj.chatBot.chatCommandManager.getCommandState(key + "votes");
                let totals = new Map();

                for (let vote of votesMap) {
                    if (!totals.has(vote[1])) {
                        totals.set(vote[1], 1);
                    } else {
                        var v = totals.get(vote[1]);
                        totals.set(vote[1], v + 1);
                    }
                }

                let highestValue = 0;
                let highestVote = 0;

                for (let count in totals) {
                    if (count[1] > highestValue) {
                        highestVote = count[0];
                        highestValue = count[1];
                    }
                }

                let returnMe = options.get(highestVote) + " was selected.";

                obj.chatBot.chatCommandManager.deleteCommandState(key + "options");
                obj.chatBot.chatCommandManager.deleteCommandState(key + "votes");


                //use the overlay to display the options
                OverlayWebSocket.send(JSON.stringify({
                        text: returnMe,
                        data: {},
                        type: "pollEnd",
                        images: [],
                        sounds: []
                    }));
					
                return returnMe;
            }
        });

        plugin.commands.set("prvote", {
            description: "vote on a specified poll option, !prvote #",
            handler: function (obj) {
                const key = obj.target + stateKey;
                let choice;

                if (obj.args) {
                    choice = parseInt(obj.args);
                }

                let optionsMap = obj.chatBot.chatCommandManager.getCommandState(key + "options");
                let votesMap = obj.chatBot.chatCommandManager.getCommandState(key + "votes");


                if (optionsMap.has(choice)) {
                    votesMap.set(obj.context.username, choice);
                    obj.chatBot.chatCommandManager.setCommandState(key + "votes", votesMap);
                }

                //use the overlay to display the options
                OverlayWebSocket.send(JSON.stringify({
                        text: getPollMessage(optionsMap, votesMap),
                        data: {},
                        type: "pollvote",
                        images: [],
                        sounds: []
                    }));
            }
        });

        function getPollMessage(optionsMap, votesMap) {
            let returnMe = "Type !prvote # to submit your vote.  ";

            for (let optionkvp of optionsMap) {

                let key = optionkvp[0];
                let value = optionkvp[1];
                let voteCount = 0;

                for (let votekvp of votesMap) {
                    if (votekvp[1] === key) {
                        voteCount++
                    }
                }

                returnMe += "\r\n" + key + ": (" + voteCount + " votes) " + value;

            }

            return returnMe;

        }

        return Promise.resolve();
    }
};

export default plugin;

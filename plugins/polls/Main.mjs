
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
        var FileRepository = globalState.get("filerepository");
        FileRepository.log("poll.load");
        const stateKey = "poll"

            // this function will be called by Main.js in the app
            //load whatever dependencies you need in here and do setup

            var Constants = globalState.get("constants");

        plugin.commands.set("prpoll", {
            description: "start a poll, given a pipe delimited list of options",
            handler: function (obj) {
                var key = obj.target + stateKey;
                var list;

                if (obj.args) {
                    list = obj.args.join("").split("|");
                }

                var returnMe = "/pin Type !prvote <option number> to submit your vote.  ";

                for (let i = 0; i < list.length; i++) {
                    returnMe += "(" + (i + 1) + ": " + list[i] + " ______ ";
                }

                var options = new Map();

                list.forEach((x, i) => {
                    options.set(i, x);
                });

                obj.chatBot.chatCommandManager.setCommandState(key + "options", options);
                obj.chatBot.chatCommandManager.setCommandState(key + "votes", new Map());
            }
        });

        plugin.commands.set("prendpoll", {
            description: "end the current poll",
            handler: function (obj) {
                var key = obj.target + stateKey;
                var options = obj.chatBot.chatCommandManager.getCommandState(key + "options");
                var votesMap = obj.chatBot.chatCommandManager.getCommandState(key + "votes");
                var totals = new Map();

                for (var vote of votesMap) {
                    if (!totals.has(vote[1])) {
                        totals.set(vote[1], 1);
                    } else {
                        var v = totals.get(vote[1]);
                        totals.set(vote[1], v + 1);
                    }
                }

                var highestValue = 0;
                var highestVote = 0;

                for (var count in totals) {
                    if (count[1] > highestValue) {
                        highestVote = count[0];
                        highestValue = count[1];
                    }
                }

                var returnMe = options.get(highestVote) + " was selected.";

                obj.chatBot.chatCommandManager.setCommandState(key + "options", null);
                obj.chatBot.chatCommandManager.setCommandState(key + "votes", null);

                return returnMe;
            }
        });

        plugin.commands.set("prvote", {
            description: "start a poll, given a pipe delimited list of options",
            handler: function (obj) {
                var key = obj.target + stateKey;
                var choice;

                if (obj.args) {
                    choice = parseInt(obj.args);
                }

                var options = obj.chatBot.chatCommandManager.getCommandState(key + "options");

                if (options.has(choice)) {
                    var votesMap = obj.chatBot.chatCommandManager.getCommandState(key + "votes");
                    votesMap.set(obj.context.username, choice);
                    obj.chatBot.chatCommandManager.setCommandState(key + "votes", votesMap);
                }
            }
        });

        return Promise.resolve();
    }
};

export default plugin;

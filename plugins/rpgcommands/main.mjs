var plugin = {
    name: "rpgcommands",

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
        const stateKey = "rpgcommands";
        const tiltDiceQuantity = 3;
        const tiltRatioCoefficient = 5;
        const averageScenesPerTilt = 3;
        const thresholdMin = 0.25;
        FileRepository.log("rpgcommands.load");
        // this function will be called by Main.js in the app
        //load whatever dependencies you need in here and do setup

        plugin.exports.actions = new Map();

        plugin.exports.actions.set("Roll Dice", {
            name: "Roll dice",
            description: "Roll the dice.  Supports keep high or low, and exploding dice.  Example: 2d6+1 k1h e",
            handler: function (globalState, obj, json) {
                const Constants = globalState.get("constants");
                let returnMe = "";
                let match = obj.args.join(" ").match(Constants.dieRollRegex);

                if (match?.length > 0) {
                    var options = {
                        numDice: parseInt(match[1] ?? 1),
                        dieFaces: parseInt(match[2] ?? 1),
                        operator: match[3],
                        operand: parseInt(match[4] ?? 0),
                        keepDice: match[5],
                        keepPreference: match[6],
                        doExplode: match[7]
                    }

                    return getDiceResult(options);
                } else {
                    return "Incorrectly formatted command";
                }
            }
        });
        plugin.exports.actions.set("Tilt", {
            name: "Tilt", 
            description: "Spend all your currency and add it to the Tilt Gauge.",
            defaultJSON: `{followOnAction: "{key: "", name: "", json: ""}"}`,
            handler: function (globalState, obj, json) {
                const key = obj.target + stateKey;
                let tiltValue = parseInt(App.chatBot.chatCommandManager.getCommandState(key + "tilt")) ?? 0;
                let tiltThreshold = App.chatBot.chatCommandManager.getCommandState(key + "tiltThreshold") ?? getRandomTiltThreshold();
                let chatterCount = App.chatBot.chatCommandManager.getCommandState(key + "chatterCount") ?? 5;

                FileRepository.log("prtilt userId " + obj.context.userId);
                let wallet = App.getWallet(obj.context.userId, obj.target);
                const currencyType = "rpg";
                const currency = wallet.getCurrency(currencyType);

                if (currency && currency.value > 0) {
                    const currencyValue = currency.value;
                    currency.value = 0;
                    FileRepository.log("prtilt currency " + currencyType + " " + currencyValue);

                    const newValue = tiltValue + currencyValue;
                    App.chatBot.chatCommandManager.setCommandState(key + "tilt", newValue);

                    if (checkTilt(tiltThreshold, chatterCount, newValue)) {
                        FileRepository.log("tilt triggered");

                        json.followOnActions?.forEach((x) => {
                           App.chatBot.chatCommandManager.doAction(obj, x);
                        });

                        setTimeout(function () {
                            App.chatBot.chatCommandManager.setCommandState(key + "tilt", 0);
                            App.chatBot.chatCommandManager.setCommandState(key + "tiltThreshold", getRandomTiltThreshold());
                        }, 2000);
                    }

                    return "@" + obj.context.username + ", Your " + currencyValue + " points have been added to the Tilt";
                } else {
                    return "@" + obj.context.username + " not enough currency";
                }
            }
        });

        function getDiceResult(options) {
            var returnMe = "";

            function rollDice(count, faces, explode, dice = []) {
                for (let i = 0; i < count; i++) {
                    var pips = Math.ceil(Math.random() * faces);

                    dice.push(pips);
                }

                if (explode) {
                    var newCount = dice.reduce((a, c, i) => {
                        if (c === faces) {
                            a++;
                            return a;
                        }
                    }, 0);

                    if (newCount > 0) {
                        dice = rollDice(newCount, faces, explode, dice);
                    }
                }

                return dice;
            }

            var dice = rollDice(options.numDice, options.dieFaces, options.doExplode);

            if (options.keepPreference === "l") {
                dice.sort((a, b) => a - b);
            } else if (options.keepPreference === "h") {
                dice.sort((a, b) => b - a);
            }

            var keep = options.keepDice ?? options.numDice;
            if (keep > options.numDice) {
                keep = options.numDice;
            }

            dice.length = keep;

            var totalPips = dice.reduce((a, c, i) => {
                a += c;
                return a;
            }, 0);

            if (options.operator === "-") {
                totalPips -= options.operand;
            } else if (options.operator === "+") {
                totalPips += options.operand;
            } else if (options.operator === "*") {
                totalPips *= options.operand;
            } else if (options.operator === "/") {
                totalPips /= options.operand;
            }
            returnMe += dice.join("+");

            if (options.operator) {
                returnMe += options.operator + options.operand;
            }

            if (options.numDice > 1 || options.operator) {
                returnMe += "=" + totalPips;
            }

            if (returnMe.indexOf("-") === 0 ||
                returnMe.indexOf("+") === 0) {
                returnMe = "0" + returnMe;
            }

            return returnMe;
        }


        function getRandomTiltThreshold() {
            let randomValue = 0;

            for (let i = 0; i < tiltDiceQuantity; i++) {
                randomValue = Math.random();
            }

            let tiltThreshold = (randomValue * 0.75) + thresholdMin;
            return tiltThreshold;
        }

        function checkTilt(tiltThreshold, chatterCount, tiltValue) {
            FileRepository.log("checkTilt " +
                "tiltThreshold" + " " + tiltThreshold + " " +
                "chatterCount" + " " + chatterCount + " " +
                "tiltValue" + " " + tiltValue);

            var returnMe = false;
            let tr = tiltRatio(chatterCount, tiltValue);

            if (tr > tiltThreshold) {
                if (tr >= 1) {
                    //do the thing
                    FileRepository.log("checkTilt returns true" );
                    returnMe = true;
                } else {

                    //roll some dice and check against the tiltValue
                    let randomValue = 0;

                    for (let i = 0; i < tiltDiceQuantity; i++) {
                        randomValue = Math.random();
                    }

                    randomValue /= 3;

                    FileRepository.log("checkTilt randomValue "  + randomValue);

                    if (randomValue > tiltThreshold) {
                        FileRepository.log("checkTilt returns true" );
                        returnMe = true;
                    }
                }
            }

            return returnMe;
        }

        function tiltRatio(chatterCount, tiltValue) {
            return tiltValue / chatterCount / averageScenesPerTilt;
        }

        return Promise.resolve();

    }
};

export default plugin;

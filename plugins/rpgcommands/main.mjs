import {
    Constants
}
from "../../src/Constants.mjs";
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
        var FileRepository = globalState.get("filerepository");
        var Constants = globalState.get("constants");

        FileRepository.log("rpgcommands.load");

        // this function will be called by Main.js in the app
        //load whatever dependencies you need in here and do setup

        plugin.commands.set("prroll", {
            description: "Roll the dice.  Supports keep high or low, and exploding dice.  Example: 2d6+1 k1h e",
            handler: function (obj) {
                var returnMe = "";
                var match = obj.args.join(" ").match(Constants.dieRollRegex);

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
        plugin.commands.set("prouch", {
            description: "",
            handler: function (obj) {
                var name = obj.args[0];
                if (!name) {
                    name = getNickname();
                }
                var message = `Ooooh!  That's a lotta damage!  Are you ok, ${name}?`;
                return message;
            }
        });
        plugin.commands.set("prmiss", {
            description: "",
            handler: function (obj) {
                var name = obj.args[0];
                if (!name) {
                    name = getNickname();
                }
                var message = `So close...let's try harder next time, eh ${name}?`;
                return message;
            }
        });
        plugin.commands.set("prcrit", {
            description: "",
            handler: function (obj) {
                var name = obj.args[0];
                if (!name) {
                    name = getNickname();
                }
                var messages = [
                    `${name} strikes with astonishing precision!`, 
                    `Wow, ${name}.....I'm impressed!`, 
                    `Remind me never to get on your bad side, ${name}.`, 
                    `Hey, ${name}, leave some for the rest of us!`, 
`Perhaps you should go to therapy for those anger issues, ${name}.  Seriously.  I'm scared.`,
                ];
                var message = messages[Math.floor(Math.random() * messages.length)];
                return message;
            }
        });
        plugin.commands.set("prbadidea", {
            description: "",
            handler: function (obj) {
                var name = obj.args[0];
                if (!name) {
                    name = getNickname();
                }
                var messages = [
                    `Let me just stop you right there, ${name}.`, 
                    `Let's not and say we didn't, ${name}.`, 
                    `I'm not a fan of that idea, ${name}.`, 
                    `${name}......no.`, 
`Let's try to come up with something better than ${name}'s idea.`
                ];
                var message = messages[Math.floor(Math.random() * messages.length)];
                return message;
            }
        });
        plugin.commands.set("practing", {
            description: "",
            handler: function (obj) {
                var messages = [];
                var name = obj.args[0];

                if (!name) {
                    messages.push(`THIS is acting.`);
                    messages.push(`Oh, God, I'm knee deep in ACTING, here.`);
                    messages.push(`To ACT or not to ACT.  That is the question.`);
                } else {
                    messages.push(`Listen to the vocal talents of ${name}.`);
                    messages.push(`And the Emmy goes to ${name}.`);
                    messages.push(`${name} share the spotlight.`);
                }

                var message = messages[Math.floor(Math.random() * messages.length)];
                return message;
            }
        });
        plugin.commands.set("prfrost", {
            description: "",
            handler: function (obj) {
                var name = obj.args[0];
                if (!name) {
                    name = getNickname();
                }
                var messages = [
                    `I'm not with him.`, 
`Don't worry, he's just....unique.`,
                ];
                var message = messages[Math.floor(Math.random() * messages.length)];
                return message;
            }
        });
        plugin.commands.set("proops", {
            description: "",
            handler: function (obj) {
                var name = obj.args[0];
                if (!name) {
                    name = getNickname();
                }
                var messages = [
                    `I'm sure you meant to do that, ${name}.`, 
                    `How about you let me take care of that next time, ${name}.`, 
`Need a paddle, ${name}?`,
                ];
                var message = messages[Math.floor(Math.random() * messages.length)];
                return message;
            }
        });
        plugin.commands.set("prgoodidea", {
            description: "",
            handler: function (obj) {
                var name = obj.args[0];
                if (!name) {
                    name = getNickname();
                }
                var messages = [
                    `I had that idea a month ago and no one listened to me, ${name}`, 
                    `Wish I had thought of that, ${name}`, 
                    `I could have thought of that too, if I had another minute, ${name}`, 
`That's a great idea, ${name}`
                ];
                var message = messages[Math.floor(Math.random() * messages.length)];
                return message;
            }
        });
        plugin.commands.set("prcritmiss", {
            description: "",
            handler: function (obj) {
                var name = obj.args[0];
                if (!name) {
                    name = getNickname();
                }
                var messages = [
                    `Butterfingers, ${name}.`, 
                    `Did you mean to do that, ${name}?`, 
                    `The bad guys are over there, ${name}.`, 
`Everyone hit the deck! ${name} forgot their glasses again!`
                ];
                var message = messages[Math.floor(Math.random() * messages.length)];
                return message;
            }
        });
        plugin.commands.set("prcheeseit", {
            description: "",
            handler: function (obj) {
                var name = obj.args[0];
                if (!name) {
                    name = getNickname();
                }
                var messages = [
                    `Game over, man!  Let's get outta here!`, 
                    `Run!  Run like very fast wind!`, 
                    `Let's get outta here!`, 
                    `Terribly sorry, my gran is on fire!`, 
`Meep meep zip bang!`,
                ];
                var message = messages[Math.floor(Math.random() * messages.length)];
                return message;
            }
        });
        function getDiceResult(options) {
            console.log("getDiceResult", options);
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

            returnMe += "=" + totalPips;

            if (returnMe.indexOf("-") === 0 ||
                returnMe.indexOf("+") === 0) {
                returnMe = "0" + returnMe;
            }

            return returnMe;
        }

        function getNickname() {
            var list = [
                "Champ",
                "Tiger",
                "Einstein",
                "Pal",
                "Friend",
                "Ol' Chap",
                "Buddy",
            ];

            return list[Math.floor(Math.random() * list.length)];

        }

        return Promise.resolve();

    }
};

export default plugin;

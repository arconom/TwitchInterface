import crypto from "crypto";
import {
    Constants
}
from './Constants.mjs';
import {
    genres
}
from "./genres.mjs";
import {
    instruments
}
from "./instruments.mjs";

export default ChatCommands = new Map();
// this is passed into the handler
/*         {
target: String,
msg: String,
context: Object,
"self": Boolean,
chatBot: Object<ChatBot>
}
 */

ChatCommands.set("prenablecommand", {
    description: "Enable a command by name",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.moderator,
    enabled: true,
    handler: function (obj) {
        if (obj?.args?.length > 0) {
            var command = ChatCommands.get(obj.args);
            command.enabled = true;
            return obj.chatBot.sendMessage(obj.target.substr(1), "Command " + obj.args + " enabled");
        } else {
            return obj.chatBot.sendMessage(obj.target.substr(1), "No such command " + obj.args);
        }
    }
});

ChatCommands.set("prcreatesignup", {
    description: "Create a signup event",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.moderator,
    enabled: true,
    handler: function (obj) {
        if (obj?.args?.length > 0) {
            var message = obj.args[0];
            var timeLimit = obj.args[1];
            var userLimit = obj.args[2];

            var id = obj.chatBot.createCommandState({
                users: new Set(),
                message: message,
                endTime: Date.now() + (timeLimit * 1000),
                userLimit: userLimit
            });

            setTimeout(function () {
                obj.chatBot.sendMessage(obj.target.substr(1), "Signup " + id + " has ended");

                //obj.chatBot.deleteCommandState(id);
            }, timeLimit * 1000);

            return obj.chatBot.sendMessage(obj.target.substr(1), "Created signup.  Just type !signup " + id + " to enter");
        }
    }
});

ChatCommands.set("prdeletesignup", {
    description: "Delete a signup event",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.moderator,
    enabled: true,
    handler: function (obj) {
        if (obj?.args?.length > 0) {
            var id = obj.args[0];
            obj.chatBot.deleteCommandState(id);
            return obj.chatBot.sendMessage(obj.target.substr(1), "Signup data deleted");
        }
    }
});

ChatCommands.set("prsignmeup", {
    description: "Enter a signup event",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.moderator,
    enabled: true,
    handler: function (obj) {
        if (obj?.args?.length > 0) {
            var state = obj.chatBot.getCommandState(obj.args[0]);

            if (state.endTime > Date.now()) {
                state.users.add(obj.context["user-id"]);
                obj.chatBot.setCommandState(obj.args[0], state);

                return obj.chatBot.sendMessage(obj.target.substr(1), obj.context["display-name"] + " you have signed up");
            } else {
                return obj.chatBot.sendMessage(obj.target.substr(1), obj.context["display-name"] + " you are too late to sign up");
            }
        }
    }
});

ChatCommands.set("prdisablecommand", {
    description: "Disable a command",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.moderator,
    enabled: true,
    handler: function (obj) {
        if (obj?.args?.length > 0) {
            var command = ChatCommands.get(obj.args);
            command.enabled = false;
            return obj.chatBot.sendMessage(obj.target.substr(1), "Command " + obj.args + " disabled");
        } else {
            return obj.chatBot.sendMessage(obj.target.substr(1), "No such command " + obj.args);
        }
    }
});

ChatCommands.set("prroll", {
    description: "Roll the dice.  Supports keep high or low, and exploding dice.  Example: 2d6+1 k1h e",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        var returnMe = "";
        var match = obj.args.match(Constants.dieRollRegex);

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
            console.log("prroll channel", obj.target.substr(1));

            return obj.chatBot.sendMessage(obj.target.substr(1), getDiceResult(options));
        } else {
            return Promise.reject("Incorrectly formatted command");
        }
    }
});
ChatCommands.set("prouch", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        if (!obj.args) {
            obj.args = getNickname();
        }
        var message = `Ooooh!  That's a lotta damage!  Are you ok, ${obj.args}?`;
        return obj.chatBot.sendMessage(obj.target.substr(1), message);
    }
});
ChatCommands.set("prmiss", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        if (!obj.args) {
            obj.args = getNickname();
        }
        var message = `So close...let's try harder next time, eh ${obj.args}?`;
        return obj.chatBot.sendMessage(obj.target.substr(1), message);
    }
});
ChatCommands.set("prcrit", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        if (!obj.args) {
            obj.args = getNickname();
        }
        var messages = [
            `${obj.args} strikes with astonishing precision!`, 
            `Wow, ${obj.args}.....I'm impressed!`, 
            `Remind me never to get on your bad side, ${obj.args}.`, 
            `Hey, ${obj.args}, leave some for the rest of us!`, 
`Perhaps you should go to therapy for those anger issues, ${obj.args}.  Seriously.  I'm scared.`,
        ];
        var message = messages[Math.floor(Math.random() * messages.length)];
        return obj.chatBot.sendMessage(obj.target.substr(1), message);
    }
});
ChatCommands.set("prbadidea", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        if (!obj.args) {
            obj.args = getNickname();
        }
        var messages = [
            `Let me just stop you right there, ${obj.args}.`, 
            `Let's not and say we didn't, ${obj.args}.`, 
            `I'm not a fan of that idea, ${obj.args}.`, 
            `${obj.args}......no.`, 
`Let's try to come up with something better than ${obj.args}'s idea.`
        ];
        var message = messages[Math.floor(Math.random() * messages.length)];
        return obj.chatBot.sendMessage(obj.target.substr(1), message);
    }
});
ChatCommands.set("practing", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        var messages = [];

        if (!obj.args) {
            messages.push(`THIS is acting.`);
            messages.push(`Oh, God, I'm knee deep in ACTING, here.`);
            messages.push(`To ACT or not to ACT.  That is the question.`);
        } else {
            messages.push(`Listen to the vocal talents of, ${obj.args}.`);
            messages.push(`And the Emmy goes to ${obj.args}.`);
            messages.push(`${obj.args}, share the spotlight.`);
        }

        var message = messages[Math.floor(Math.random() * messages.length)];
        return obj.chatBot.sendMessage(obj.target.substr(1), message);
    }
});
ChatCommands.set("prfrost", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        if (!obj.args) {
            obj.args = getNickname();
        }
        var messages = [
            `I'm not with him.`, 
`Don't worry, he's just....unique.`,
        ];
        var message = messages[Math.floor(Math.random() * messages.length)];
        return obj.chatBot.sendMessage(obj.target.substr(1), message);
    }
});
ChatCommands.set("proops", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        if (!obj.args) {
            obj.args = getNickname();
        }
        var messages = [
            `I'm sure you meant to do that, ${obj.args}.`, 
            `How about you let me take care of that next time, ${obj.args}.`, 
`Need a paddle, ${obj.args}?`,
        ];
        var message = messages[Math.floor(Math.random() * messages.length)];
        return obj.chatBot.sendMessage(obj.target.substr(1), message);
    }
});
ChatCommands.set("prgoodidea", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        if (!obj.args) {
            obj.args = getNickname();
        }
        var messages = [
            `I had that idea a month ago and no one listened to me, ${obj.args}`, 
            `Wish I had thought of that, ${obj.args}`, 
            `I could have thought of that too, if I had another minute, ${obj.args}`, 
`That's a great idea, ${obj.args}`
        ];
        var message = messages[Math.floor(Math.random() * messages.length)];
        return obj.chatBot.sendMessage(obj.target.substr(1), message);
    }
});
ChatCommands.set("prcritmiss", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        if (!obj.args) {
            obj.args = getNickname();
        }
        var messages = [
            `Oh, no, better check your ${obj.args}?`, 
            `Butterfingers, ${obj.args}.`, 
            `Did you mean to do that, ${obj.args}?`, 
            `The bad guys are over there, ${obj.args}.`, 
`Everyone hit the deck! ${obj.args} forgot their glasses again!`
        ];
        var message = messages[Math.floor(Math.random() * messages.length)];
        return obj.chatBot.sendMessage(obj.target.substr(1), message);
    }
});
ChatCommands.set("prcheeseit", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        if (!obj.args) {
            obj.args = getNickname();
        }
        var messages = [
            `Game over, man!  Let's get outta here!`, 
            `Run!  Run like very fast wind!`, 
            `Let's get outta here!`, 
            `Terribly sorry, my gran is on fire!`, 
`Meep meep zip bang!`,
        ];
        var message = messages[Math.floor(Math.random() * messages.length)];
        return obj.chatBot.sendMessage(obj.target.substr(1), message);
    }
});
ChatCommands.set("prinstrument", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        var index = Math.floor(Math.random() * instruments.length);
        var msg = instruments[index].word + " - " + instruments[index].definition;
        return obj.chatBot.sendMessage(obj.target.substr(1), msg);
    }
});
ChatCommands.set("prgenre", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        var index = Math.floor(Math.random() * genres.length);
        return obj.chatBot.sendMessage(obj.target.substr(1), genres[index]);
    }
});
ChatCommands.set("prcallit", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        var args = obj.args.split(" ");
        var msg = wordGenerator.getCommonAlliteration(args[0], parseInt(args[1]));
        return obj.chatBot.sendMessage(obj.target.substr(1), msg);
    }
});
ChatCommands.set("prallit", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        var args = obj.args.split(" ");
        var msg = wordGenerator.getAlliteration(args[0], parseInt(args[1]));
        return obj.chatBot.sendMessage(obj.target.substr(1), msg);
    }
});
ChatCommands.set("prgbstats", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        return obj.chatBot.sendMessage(obj.target.substr(1), "@" + obj.context.username + "\r\n " + gorkblorf.getStatisticsMessage(obj.context["user-id"]));
    }
});
ChatCommands.set("prdefine", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: function (obj) {
        var def = wordGenerator.getDefinition(obj.args);

        if (def) {
            return obj.chatBot.sendMessage(obj.target.substr(1), (obj.args ?? wordGenerator.lastWord) + def);
        } else {
            return obj.chatBot.sendMessage(obj.target.substr(1), "definition for " + obj.args + " not found");
        }
    }
});
ChatCommands.set("prcword", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: commonWordHandler
});
ChatCommands.set("prcwords", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: commonWordHandler
});
ChatCommands.set("prword", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: wordHandler
});
ChatCommands.set("prwords", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: wordHandler
});
ChatCommands.set("prdef", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: defHandler
});
ChatCommands.set("prdefs", {
    description: "",
    cooldown: 0,
    lastExecution: 0,
    role: Constants.chatRoles.viewer,
    enabled: true,
    handler: defHandler
});
ChatCommands.set("prcwordle", {
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
ChatCommands.set("prwordle", {
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
ChatCommands.set("prguess", {
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
ChatCommands.set("prwordlestatus", {
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


function defHandler(obj) {
    var wordCount = parseInt(obj.args);
    var words = [];

    if (isNaN(wordCount)) {
        FileRepository.log("invalid value for word count");
    } else {
        if (wordCount > 10) {
            wordCount = 10;
        }
        for (let i = 0; i < wordCount; i++) {
            words.push(wordGenerator.getRandomDefinition());
        }

        return obj.chatBot.sendMessages(obj.target.substr(1), words);
    }
}

function commonWordHandler(obj) {
    var wordCount = parseInt(obj.args);
    var words = [];

    if (isNaN(wordCount)) {
        FileRepository.log("invalid value for word count");
    } else {
        if (wordCount > 10) {
            wordCount = 10;
        }

        for (let i = 0; i < wordCount; i++) {
            words.push(wordGenerator.getCommonWord());
        }

        return obj.chatBot.sendMessages(obj.target.substr(1), words);
    }
}

function wordHandler(obj) {
    var wordCount = parseInt(obj.args);
    var words = [];

    if (isNaN(wordCount)) {
        FileRepository.log("invalid value for word count");
    } else {
        if (wordCount > 10) {
            wordCount = 10;
        }

        for (let i = 0; i < wordCount; i++) {
            words.push(wordGenerator.getRandomWord());
        }

        return obj.chatBot.sendMessages(obj.target.substr(1), words);
    }
}

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
    console.log("getDiceResult returning", returnMe);
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

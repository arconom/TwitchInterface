import crypto from "crypto";
import {
    Constants
}
from './Constants.mjs';

export var ChatCommands = new Map();
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
    handler: function (obj) {
        if (obj?.args?.length > 0) {
            var command = ChatCommands.get(obj.args);
            //todo figure out how to persist the command config

            command.enabled = false;
            return obj.chatBot.sendMessage(obj.target.substr(1), "Command " + obj.args + " disabled");
        } else {
            return obj.chatBot.sendMessage(obj.target.substr(1), "No such command " + obj.args);
        }
    }
});

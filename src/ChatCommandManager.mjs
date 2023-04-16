export default class ChatCommandManager {

    //manage a map of commands, each of which can have its own state per channel
    //because we are using a Map for commands,
    //setting the same command name twice will overwrite the first entry
    //this means that if you want a command to do two things,
    //just put those things in one function and then set it

    constructor(wordGenerator, gorkblorf, config, oscManager) {
        var self = this;
        this.wordGenerator = wordGenerator;
        this.gorkblorf = gorkblorf;
        this.config = config;
        this.oscManager = oscManager;
        this.commands = new Map();

        FileRepository.readCommandState().then(function (data) {
            try {
                var arr = JSON.parse(data);
                for (let i = 0; i < arr.length; i++) {
                    self.commandState.set(arr[i][0], arr[i][1]);
                }
            } catch (e) {
                //no state data saved
            }
        });

    }

    setCommand(name, command) {
        //name = String
        //command = Object<Command>
        this.commands.set(name, new Command(command));
    }

    removeCommand(name) {
        this.commands.delete(name);
    }

    createCommandState(state) {
        //state = Object
        var stateId = crypto.randomUUID();
        this.commandState.set(stateId, state);
        FileRepository.saveChatBotState(Array.from(this.commandState.entries()));
        return stateId;
    }

    createChannelCommandState(channel, state) {
        this.commandState.set(channel, state);
        FileRepository.saveChatBotState(Array.from(this.commandState.entries()));
    }

    getCommandState(id) {
        return this.commandState.get(id);
    }

    setCommandState(id, state) {
        var state = this.commandState.set(id, state);
        FileRepository.saveChatBotState(Array.from(this.commandState.entries()));
    }

    deleteCommandState(id) {
        this.commandState.delete(id);
        FileRepository.saveChatBotState(Array.from(this.commandState.entries()));
    }

    processCommand(obj) {

        //obj = {
        // target: String,
        // msg: String,
        // context: Object,
        // "self": boolean,
        // chatBot: Object<ChatBot>
        // }

        var self = this;
        // Remove whitespace from chat message
        const commandName = obj.msg.trim();
        var match = commandName.match(Constants.commandRegex);

        if (match?.index === 0 && match[1]?.length > 0) {
            var commandObject = this.commands.get(match[1]);
            // FileRepository.log("processCommand commands " + Array.from(this.commands.entries()).join("\r\n"));
            // FileRepository.log("processCommand match " + match);
            // FileRepository.log("processCommand command " + JSON.stringify(commandObject));
            // FileRepository.log("processCommand enabled " + commandObject?.enabled);
            // FileRepository.log("processCommand role " + this.hasRole(obj.context, commandObject?.role));

            if (commandObject?.enabled && this.hasRole(obj.context, commandObject?.role)) {

                // FileRepository.log("processCommand checking cooldown");
                if (commandObject.lastExecution + commandObject.cooldown < Date.now()) {
                    // FileRepository.log("processCommand running command");
                    commandObject.lastExecution = Date.now();
                    obj.args = match[2];
                    // console.log("processCommand sending Message");
                    return self.sendMessage(obj.target.substr(1), commandObject.handler(obj));
                } else {
                    // console.log("processCommand debounced", commandObject.lastExecution, commandObject.cooldown);
                    return self.sendMessage(obj.target.substr(1), "Wait for command to cool down in " +
                        (commandObject.lastExecution + commandObject.cooldown - Date.now()) +
                        " ms");
                }
            }
        }
    }

    getCommandDescriptions() {
        return Array.from(this.commands.entries().map(function (x) {
                return x[0] + "\r\n" +
                x[1].description + "\r\n" +
                x[1].cooldown + "\r\n" +
                x[1].lastExecution + "\r\n" +
                x[1].role + "\r\n" +
                x[1].enabled + "\r\n";
            })).join("\r\n");
    }

    hasRole(context, role) {
        //context = Object
        //role = String
        if (role === "" || role === Constants.chatRoles.viewer) {
            return true;
        } else if (role === Constants.chatRoles.subscriber) {
            return context.subscriber;
        } else if (role === Constants.chatRoles.moderator) {
            return context.mod;
        } else if (role === Constants.chatRoles.broadcaster) {
            return context.badges.broadcaster === "1";
        } else {
            return false;
        }
    }

}

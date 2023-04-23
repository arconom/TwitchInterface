import {
    Constants
}
from './Constants.mjs';

export class ChatCommand {
    constructor(data) {
		this.name = data.name ?? "";
        this.description = data.description ?? "";
        this.cooldown = data.cooldown ?? 0;
        this.role = data.role ?? Constants.chatRoles.broadcaster;
        this.enabled = data.enabled ?? false;
        this.handler = data.handler ?? function () {
            throw "command not implemented";
        };

        if (this.cooldown < 0) {
            this.cooldown = 0;
        }

        if (this.cooldown > 1e8) {
            this.cooldown = 1e8;
        }
    }
}

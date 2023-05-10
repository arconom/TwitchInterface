import {ChatRoles} from './ChatRoles.mjs';
import {Constants} from "./Constants.mjs";

export class ChatCommandConfigItem {
    constructor(data) {
            this.key = data.key;

            this.cooldownSeconds = data.cooldownSeconds ?? 0;
            this.role = data.role ?? ChatRoles.get(Constants.chatRoles.broadcaster);
            this.enabled = data.enabled ?? false;

			if(typeof this.role === "string"){
				this.role = parseInt(this.role);
			}

            if (this.cooldownSeconds < 0) {
                this.cooldownSeconds = 0;
            }

            if (this.cooldownSeconds > 1e8) {
                this.cooldownSeconds = 1e8;
            }
    }
}

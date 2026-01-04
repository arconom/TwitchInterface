import {ChatRoles} from './ChatRoles.mjs';
import {Constants} from "./Constants.mjs";

export class ChatCommandConfigItem {
    constructor(data) {
		if(data){
            this.key = data.key ?? "";
            this.description = data.description ?? "";
            this.cooldownSeconds = data.cooldownSeconds ?? 0;
            this.role = data.role ?? ChatRoles.get(Constants.chatRoles.broadcaster);
            this.enabled = data.enabled ?? false;
			this.currencyType = data.currencyType ?? "";
			this.cost = data.cost ?? 0;
            this.actions = data.actions ?? [];
            
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
		else{
            this.key = "";
            this.description = "";
            this.cooldownSeconds = 0;
            this.role = ChatRoles.get(Constants.chatRoles.broadcaster);
            this.enabled = false;
			this.currencyType = "";
			this.cost = 0;
            this.actions = [];
		}
    }
}

export class Secrets {
    constructor(data) {

        if (data) {
            this.secret = data.secret;
            this.clientId = data.clientId;
            this.tmi = data.tmi;
        } else {
            this.secret = "";
            this.clientId = "";
            this.tmi = "";
        }
    }
};

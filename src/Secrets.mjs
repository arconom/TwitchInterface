export class Secrets {
    constructor(data) {

        if (data) {
            this.secret = data.secret;
            this.clientId = data.clientId;
            this.obspassword = data.obspassword;
            this.voicemodClientKey = data.voicemodClientKey;
        } else {
            this.secret = "";
            this.clientId = "";
            this.obspassword = "";
            this.voicemodClientKey = "";
        }
    }
};

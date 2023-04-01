export class Config {
    constructor(data) {
        this.botName = data?.botName ?? "";
        this.broadcasterUsername = data?.broadcasterUsername ?? "";
        this.chatDelay = data?.chatDelay ?? 2000;
        this.chatLogChannelHistory = data?.chatLogChannelHistory ?? 5000; //number of messages stored per channel
        this.listenerPort = data?.listenerPort ?? 3000;
        this.oscClientAddress = data?.oscClientAddress ?? "127.0.0.1";
        this.oscClientPort = data?.oscClientPort ?? 3333;
        this.oscServerAddress = data?.oscServerAddress ?? "127.0.0.1";
        this.oscServerPort = data?.oscServerPort ?? 3334;
        this.preferredBrowser = data?.preferredBrowser ?? "chrome";
        this.redirectUri = data?.redirectUri ?? "http://localhost:";
        this.webServerPort = data?.webServerPort ?? 6969;
    }
};











































































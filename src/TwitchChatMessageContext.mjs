export class TwitchChatMessageContext {

    constructor(data) {
        if (data) {
            this.badgeInfo = data["badge-info"] ?? data['badge-info'] ?? null;
            this.badgeInfoRaw = data["badge-info-raw"] ?? null;
            this.badges = data.badges ?? {};
            this.badgesRaw = data["badges-raw"] ?? '';
            this.clientNonce = data["client-nonce"] ?? '';
            this.color = data.color ?? '';
            this.displayName = data.displayName ?? '';
            this.emotes = data.emotes ?? {};
            this.emotesRaw = data["emotes-raw"] ?? '';
            this.firstMsg = data["first-msg"] ?? false;
            this.flags = data.flags ?? null;
            this.id = data.id ?? '';
            this.messageType = data["message-type"] ?? '';
            this.mod = data.mod ?? false;
            this.returningChatter = data["returning-chatter"] ?? false;
            this.roomId = data["room-id"] ?? '';
            this.subscriber = data.subscriber ?? false;
            this.tmiSentTs = data["tmi-sent-ts"] ?? '';
            this.turbo = data.turbo ?? false;
            this.userId = data["user-id"] ?? '';
            this.userType = data["user-type"] ?? null;
            this.username = data.username ?? '';
        } else {
            this.badgeInfo = null;
            this.badgeInfoRaw = null;
            this.badges = {};
            this.badgesRaw = '';
            this.clientNonce = '';
            this.color = '';
            this.displayName = '';
            this.emotes = {};
            this.emotesRaw = '';
            this.firstMsg = false;
            this.flags = null;
            this.id = '';
            this.messageType = '';
            this.mod = false;
            this.returningChatter = false;
            this.roomId = '';
            this.subscriber = false;
            this.tmiSentTs = '';
            this.turbo = false;
            this.userId = '';
            this.userType = null;
            this.username = '';
		}
    }
}

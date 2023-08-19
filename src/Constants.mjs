export const Constants = {
    eventSubWebSocketUrl: "wss://eventsub-beta.wss.twitch.tv/ws",
    eventSubUrl: `https://api.twitch.tv/helix/eventsub/subscriptions`,
    pubSubWebSocketUrl: "wss://pubsub-edge.twitch.tv",
    // Notification request headers
    twitch_message_id: 'Twitch-Eventsub-Message-Id'.toLowerCase(),
    twitch_message_timestamp: 'Twitch-Eventsub-Message-Timestamp'.toLowerCase(),
    twitch_message_signature: 'Twitch-Eventsub-Message-Signature'.toLowerCase(),
    message_type: 'Twitch-Eventsub-Message-Type'.toLowerCase(),
    session_welcome: "session_welcome",
    // Notification message types
    message_type_verification: 'webhook_callback_verification',
    message_type_notification: 'notification',
    message_type_revocation: 'revocation',

    // Prepend this string to the HMAC that's created from the message
    hmac_prefix: 'sha256=',

    chatRoles: {
        viewer: "viewer",
        subscriber: "subscriber",
        moderator: "moderator",
        broadcaster: "broadcaster"
    },

    //match \code=word
    codeRegex: /\?code=(\w+)/,
    //match !command arg1 arg2
    commandRegex: /!(\w+)\s*(.+)?/,
    //match 6d6+5 k4l e
    dieRollRegex: /(\d+)d(\d+)(\+|-)?(\d+)?\s?(?:k(\d+)(h|l))?\s?(e)?/,

    replacer: function (key, value) {
        if (value instanceof Map) {
            return {
                dataType: 'Map',
                value: Array.from(value.entries()), // or with spread: value: [...value]
            };
        } else {
            return value;
        }
    },

    reviver: function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
                return new Map(value.value);
            }
        }
        return value;
    }

};

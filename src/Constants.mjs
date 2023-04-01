export const Constants = {
    // broadcasterUsername: "crimebastard",
    // oscConfig: {
    // clientConfig: {
    // address: "127.0.0.1",
    // port: 3333
    // },
    // serverConfig: {
    // address: "127.0.0.1",
    // port: 3334
    // }
    // },

    // chatDelay: 2000,
    // preferredBrowser: "chrome",
    // botName: "PopularRhinocerosBot",
    // listenerPort: 3000,
    // redirectUri: "http://localhost:",
    // eventSubWebSocketUrl: "ws://localhost:8080/eventsub",
    eventSubWebSocketUrl: "wss://eventsub-beta.wss.twitch.tv/ws",
    // eventSubWebSocketUrl: "eventsub-beta.wss.twitch.tv/ws",
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

    // chatScopes: {
    // "channel:moderate": "Perform moderation actions in a channel. The user requesting the scope must be a moderator in the channel.",
    // "chat:edit": "Send live stream chat messages.",
    // "chat:read": "View live stream chat messages.",
    // "whispers:read": "View your whisper messages.",
    // "whispers:edit": "Send whisper messages."
    // },

    chatRoles: {
        viewer: "viewer",
        subscriber: "subscriber",
        moderator: "moderator",
        broadcaster: "broadcaster"
    },

    codeRegex: /\?code=(\w+)/,
    commandRegex: /!(\w+)\s*(.+)?/,
    //match 6d6+5 k4l e
    dieRollRegex: /(\d+)d(\d+)(\+|-)?(\d+)?\s?(?:k(\d+)(h|l))?\s?(e)?/
};

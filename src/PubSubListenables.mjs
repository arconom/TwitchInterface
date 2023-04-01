export const PubSubEventNames = {
    bits: "Bits",
    bitsBadgeNotification: "Bits Badge Notification",
    channelPoints: "Channel Points",
    channelSubscriptions: "Channel Subscriptions",
    chatModeratorActions: "Chat Moderator Actions",
    chatAutomodQueue: "Chat Automod Queue",
    chatModerationNotifications: "Chat Moderation Notifications",
    whispers: "Whispers"
};

export const PubSubListenables = (function () {

    var returnMe = new Map();

    returnMe.set(PubSubEventNames.bits, {
        value: "channel-bits-events-v2.${channelId}",
        scope: "bits:read",
        description: "Anyone cheers in a specified channel."
    });
    returnMe.set(PubSubEventNames.bitsBadgeNotification, {
        value: "channel-bits-badge-unlocks.${channelId}",
        scope: "bits:read",
        description: "Message sent when a user earns a new Bits badge in a particular channel, and chooses to share the notification with chat."
    });
    returnMe.set(PubSubEventNames.channelPoints, {
        value: "channel-points-channel-v1.${channelId}",
        scope: "channel:read:redemptions	",
        description: "A custom reward is redeemed in a channel."
    });
    returnMe.set(PubSubEventNames.channelSubscriptions, {
        value: "channel-subscribe-events-v1.${channelId}",
        scope: "channel:read:subscriptions	",
        description: "Anyone subscribes (first month), resubscribes (subsequent months), or gifts a subscription to a channel." +
        "Subgift subscription messages contain recipient information."
    });
    returnMe.set(PubSubEventNames.chatModeratorActions, {
        value: "chat_moderator_actions.${userId}.${channelId}",
        scope: "channel:moderate",
        description: "Supports moderators listening to the topic, as well as users listening to the topic to receive their own events." +
        "Examples of moderator actions are bans, unbans, timeouts, deleting messages, changing chat mode (followers-only, subs-only), changing AutoMod levels, and adding a mod."
    });
    returnMe.set(PubSubEventNames.chatAutomodQueue, {
        value: "automod-queue.${userId}.${channelId}",
        scope: "channel:moderate",
        description: "AutoMod flags a message as potentially inappropriate, and when a moderator takes action on a message."
    });
    returnMe.set(PubSubEventNames.chatModerationNotifications, {
        value: "user-moderation-notifications.${userId}.${channelId}",
        scope: "chat:read",
        description: "A user’s message held by AutoMod has been approved or denied."
    });
    returnMe.set(PubSubEventNames.whispers, {
        value: "whispers.${userId}",
        scope: "whispers:read",
        description: "Anyone whispers the specified user."
    });

    return returnMe;
})


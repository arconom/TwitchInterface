export const SubscriptionTypeNames = {
    channelBan: "channel.ban",
    channelChannel_points_custom_rewardAdd: "channel.channel_points_custom_reward.add",
    channelChannel_points_custom_rewardRemove: "channel.channel_points_custom_reward.remove",
    channelChannel_points_custom_rewardUpdate: "channel.channel_points_custom_reward.update",
    channelChannel_points_custom_reward_redemptionAdd: "channel.channel_points_custom_reward_redemption.add",
    channelChannel_points_custom_reward_redemptionUpdate: "channel.channel_points_custom_reward_redemption.update",
    channelCharity_campaignDonate: "channel.charity_campaign.donate",
    channelCharity_campaignProgress: "channel.charity_campaign.progress",
    channelCharity_campaignStart: "channel.charity_campaign.start",
    channelCharity_campaignStop: "channel.charity_campaign.stop",
    channelCheer: "channel.cheer",
    channelFollow: "channel.follow",
    channelGoalBegin: "channel.goal.begin",
    channelGoalEnd: "channel.goal.end",
    channelGoalProgress: "channel.goal.progress",
    channelHype_trainBegin: "channel.hype_train.begin",
    channelHype_trainEnd: "channel.hype_train.end",
    channelHype_trainProgress: "channel.hype_train.progress",
    channelModeratorAdd: "channel.moderator.add",
    channelModeratorRemove: "channel.moderator.remove",
    channelPollBegin: "channel.poll.begin",
    channelPollEnd: "channel.poll.end",
    channelPollProgress: "channel.poll.progress",
    channelPredictionBegin: "channel.prediction.begin",
    channelPredictionEnd: "channel.prediction.end",
    channelPredictionLock: "channel.prediction.lock",
    channelPredictionProgress: "channel.prediction.progress",
    channelRaid: "channel.raid",
    channelShield_modeBegin: "channel.shield_mode.begin",
    channelShield_modeEnd: "channel.shield_mode.end",
    channelSubscribe: "channel.subscribe",
    channelSubscriptionEnd: "channel.subscription.end",
    channelSubscriptionGift: "channel.subscription.gift",
    channelSubscriptionMessage: "channel.subscription.message",
    channelUnban: "channel.unban",
    channelUpdate: "channel.update",
    dropEntitlementGrant: "drop.entitlement.grant",
    extensionBits_transactionCreate: "extension.bits_transaction.create",
    streamOffline: "stream.offline",
    streamOnline: "stream.online",
    userAuthorizationGrant: "user.authorization.grant",
    userAuthorizationRevoke: "user.authorization.revoke",
    userUpdate: "user.update"
};

export const SubscriptionTypes = new Map();

SubscriptionTypes.set(SubscriptionTypeNames.channelBan, {
    name: "channel.ban",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A viewer is banned from the specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelChannel_points_custom_rewardAdd, {
    name: "channel.channel_points_custom_reward.add",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A custom channel points reward has been created for the specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelChannel_points_custom_rewardRemove, {
    name: "channel.channel_points_custom_reward.remove",
    version: "1",
    "condition": {
        "broadcaster_user_id": "",
        "reward_id": "" // optional to only get notifications for a specific reward
    },
    description: "A custom channel points reward has been removed from the specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelChannel_points_custom_rewardUpdate, {
    name: "channel.channel_points_custom_reward.update",
    version: "1",
	"condition": {
        "broadcaster_user_id": "",
        "reward_id": "9001" // optional to only get notifications for a specific reward
    },
    description: "A custom channel points reward has been updated for the specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelChannel_points_custom_reward_redemptionAdd, {
    name: "channel.channel_points_custom_reward_redemption.add",
    version: "1",
	    "condition": {
        "broadcaster_user_id": "",
        "reward_id": "" // optional; gets notifications for a specific reward
    },
    description: "A viewer has redeemed a custom channel points reward on the specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelChannel_points_custom_reward_redemptionUpdate, {
    name: "channel.channel_points_custom_reward_redemption.update",
    version: "1",
	"condition": {
        "broadcaster_user_id": "",
        "reward_id": "" // optional; gets notifications for a specific reward
    },
    description: "A redemption of a channel points custom reward has been updated for the specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelCharity_campaignDonate, {
    name: "channel.charity_campaign.donate",
    version: "beta",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "Sends an event notification when a user donates to the broadcaster’s charity campaign."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelCharity_campaignProgress, {
    name: "channel.charity_campaign.progress",
    version: "beta",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "Sends an event notification when progress is made towards the campaign’s goal or when the broadcaster changes the fundraising goal."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelCharity_campaignStart, {
    name: "channel.charity_campaign.start",
    version: "beta",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "Sends an event notification when the broadcaster starts a charity campaign."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelCharity_campaignStop, {
    name: "channel.charity_campaign.stop",
    version: "beta",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "Sends an event notification when the broadcaster stops a charity campaign."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelCheer, {
    name: "channel.cheer",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A user cheers on the specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelFollow, {
    name: "channel.follow",
    version: "1",
	"condition": {
        "broadcaster_user_id": "",
		 "moderator_user_id": ""
    },
    description: "A specified channel receives a follow."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelGoalBegin, {
    name: "channel.goal.begin",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "Get notified when a broadcaster begins a goal."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelGoalEnd, {
    name: "channel.goal.end",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "Get notified when a broadcaster ends a goal."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelGoalProgress, {
    name: "channel.goal.progress",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "Get notified when progress (either positive or negative) is made towards a broadcaster’s goal."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelHype_trainBegin, {
    name: "channel.hype_train.begin",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A Hype Train begins on the specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelHype_trainEnd, {
    name: "channel.hype_train.end",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A Hype Train ends on the specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelHype_trainProgress, {
    name: "channel.hype_train.progress",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A Hype Train makes progress on the specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelModeratorAdd, {
    name: "channel.moderator.add",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "Moderator privileges were added to a user on a specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelModeratorRemove, {
    name: "channel.moderator.remove",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "Moderator privileges were removed from a user on a specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelPollBegin, {
    name: "channel.poll.begin",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A poll started on a specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelPollEnd, {
    name: "channel.poll.end",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A poll ended on a specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelPollProgress, {
    name: "channel.poll.progress",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "Users respond to a poll on a specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelPredictionBegin, {
    name: "channel.prediction.begin",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A Prediction started on a specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelPredictionEnd, {
    name: "channel.prediction.end",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A Prediction ended on a specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelPredictionLock, {
    name: "channel.prediction.lock",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A Prediction was locked on a specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelPredictionProgress, {
    name: "channel.prediction.progress",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "Users participated in a Prediction on a specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelRaid, {
    name: "channel.raid",
    version: "1",
	"condition": {
        "from_broadcaster_user_id": "" // could provide to_broadcaster_user_id instead
        ,"to_broadcaster_user_id": "" // could provide from_broadcaster_user_id instead
    },
    description: "A broadcaster raids another broadcaster’s channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelShield_modeBegin, {
    name: "channel.shield_mode.begin",
    version: "beta",
	"condition": {
        "broadcaster_user_id": "",
        "moderator_user_id": ""
    },
    description: "Sends a notification when the broadcaster activates Shield Mode."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelShield_modeEnd, {
    name: "channel.shield_mode.end",
    version: "beta",
	"condition": {
        "broadcaster_user_id": "",
        "moderator_user_id": ""
    },
    description: "Sends a notification when the broadcaster deactivates Shield Mode."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelSubscribe, {
    name: "channel.subscribe",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A notification when a specified channel receives a subscriber. This does not include resubscribes."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelSubscriptionEnd, {
    name: "channel.subscription.end",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A notification when a subscription to the specified channel ends."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelSubscriptionGift, {
    name: "channel.subscription.gift",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A notification when a viewer gives a gift subscription to one or more users in the specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelSubscriptionMessage, {
    name: "channel.subscription.message",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A notification when a user sends a resubscription chat message in a specific channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelUnban, {
    name: "channel.unban",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A viewer is unbanned from the specified channel."
});
SubscriptionTypes.set(SubscriptionTypeNames.channelUpdate, {
    name: "channel.update",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "A broadcaster updates their channel properties e.g., category, title, mature flag, broadcast, or language."
});
SubscriptionTypes.set(SubscriptionTypeNames.dropEntitlementGrant, {
    name: "drop.entitlement.grant",
    version: "1",
	"condition": {
        "organization_id": "",
        "category_id": "", // optional to specify category/game
        "campaign_id": ""  // optional to specify campaign
    },
    description: "An entitlement for a Drop is granted to a user."
});
SubscriptionTypes.set(SubscriptionTypeNames.extensionBits_transactionCreate, {
    name: "extension.bits_transaction.create",
    version: "1",
	"condition": {
        "extension_client_id": ""
    },
    description: "A Bits transaction occurred for a specified Twitch Extension."
});
SubscriptionTypes.set(SubscriptionTypeNames.streamOffline, {
    name: "stream.offline",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "The specified broadcaster stops a stream."
});
SubscriptionTypes.set(SubscriptionTypeNames.streamOnline, {
    name: "stream.online",
    version: "1",
	"condition": {
        "broadcaster_user_id": ""
    },
    description: "The specified broadcaster starts a stream."
});
SubscriptionTypes.set(SubscriptionTypeNames.userAuthorizationGrant, {
    name: "user.authorization.grant",
    version: "1",
	"condition": {
        "client_id": ""
    },
    description: "A user’s authorization has been granted to your client id."
});
SubscriptionTypes.set(SubscriptionTypeNames.userAuthorizationRevoke, {
    name: "user.authorization.revoke",
    version: "1",
	"condition": {
        "client_id": ""
    },
    description: "A user’s authorization has been revoked for your client id."
});
SubscriptionTypes.set(SubscriptionTypeNames.userUpdate, {
    name: "user.update",
    version: "1",
	"condition": {
        "user_id": ""
    },
    description: "A user has updated their account."
});

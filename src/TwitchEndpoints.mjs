export const TwitchEndpoints = new Map();

TwitchEndpoints.set(
    "getUserInfo", {
    name: "Get User Info",
    args: {
        "login": ""
    }
});



TwitchEndpoints.set(
    "sendWhisper", {
    name: "Send Whisper",
    args: {"from_user_id": "", 
		"to_user_id": "",
		"message": ""
	}
});


TwitchEndpoints.set(
    "getSubscriptions", {
    name: "Get Active Event Subscriptions",
    args: {}
});

TwitchEndpoints.set(
    "createClip", {
    name: "Create Clip",
    args: {
        "broadcaster_id": ""
    }
});

TwitchEndpoints.set(
    "getClips", {
    name: "Get Clips",
    args: {
        "broadcaster_id": "",
        "game_id": "",
        "id": "",
        "started_at": "",
        "ended_at": "",
        "first": "",
        "before": "",
        "after": ""
    }
});

TwitchEndpoints.set(
    "shoutout", {
    name: "Shout Out",
    args: {
        "from_broadcaster_id": "",
        "to_broadcaster_id": "",
        "moderator_id": ""
    }
});

TwitchEndpoints.set(
    "getCurrentTrack", {
    name: "Get Current Track",
    args: {
        "broadcaster_id": ""
    }
});

TwitchEndpoints.set(
    "createStreamMarker", {
    name: "Create Stream Marker",
    args: {
        "user_id": "",
        "description": ""
    }
});

TwitchEndpoints.set(
    "getPlaylist", {
    name: "Get Playlist",
    args: {
        "id": ""
    }
});

TwitchEndpoints.set(
    "createPoll", {
    name: "Create Poll",
    args: {
        "broadcaster_id": "",
        "title": "",
        "choices": "",
        "duration": "",
        "channel_points_voting_enabled": "",
        "channel_points_per_vote": ""
    }
});

TwitchEndpoints.set(
    "getPolls", {
    name: "Get Polls",
    args: {
        "broadcaster_id": ""
    }
});

TwitchEndpoints.set(
    "getChatters", {
    name: "Get Chatters",
    args: {
        "broadcaster_id": "",
        "moderator_id": ""
    }
});

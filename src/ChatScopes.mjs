export const ChatScopes = new Map();

ChatScopes.set("channel:moderate", "Perform moderation actions in a channel. The user requesting the scope must be a moderator in the channel.");
ChatScopes.set("chat:edit", "Send live stream chat messages.");
ChatScopes.set("chat:read", "View live stream chat messages.");
ChatScopes.set("whispers:read", "View your whisper messages.");
ChatScopes.set("whispers:edit", "Send whisper messages.");

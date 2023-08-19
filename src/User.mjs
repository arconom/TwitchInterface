
export default class User {

    constructor(data) {
        if (data) {
            this.id = data["user_id"] ?? data["id"] ?? "";
            this.login = data["user_login"] ?? data["login"] ?? "";
            this.username = data["user_name"] ?? data["display_name"] ?? "";

            this.type = data["type"] ?? "",
            this.broadcasterType = data["broadcaster_type"] ??  "",
            this.description = data["description"] ??  "",
            this.profileImageUrl = data["profile_image_url"] ??  "",
            this.offlineImageUrl = data["offline_image_url"] ??  "",
            this.viewCount = data["view_count"] ??  0,
            this.createdAt = data["created_at"] ??  "1970-01-01T00:00:00Z"

        } else {
            this.id = "";
            this.login = "";
            this.username = "";
            this.type = "",
            this.broadcasterType = "",
            this.description = "",
            this.profileImageUrl = "",
            this.offlineImageUrl = "",
            this.viewCount = 0,
            this.createdAt = "1970-01-01T00:00:00Z"
        }
    }
}

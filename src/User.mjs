
export default class User {

    constructor(data) {
        if (data) {
            this.userId = data["user_id"] ?? "";
            this.userLogin = data["user_login"] ?? "";
            this.username = data["user_name"] ?? "";
        } else {
            this.userId = "";
            this.userLogin = "";
            this.username = "";
        }
    }
}

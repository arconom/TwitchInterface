export default class EventSubscription {
    constructor(data) {
		console.log("EventSubscription", data);
        if (data) {
            this.key = data?.key ?? "";
            this.name = data?.name ?? "";
            this.version = data?.version ??  "";
            this.condition = data?.condition ?? {};
            this.description = data?.description ?? "";
            this.enabled = data?.enabled ?? true;
            this.actions = data?.actions ?? [];
        } else {
            this.key = "";
            this.name = "";
            this.version = "";
            this.condition = {};
            this.description = "";
            this.enabled = true;
            this.actions = [];
        }
    }
}

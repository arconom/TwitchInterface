export default class MessageTrigger{
    constructor(data) {
        var self = this;

		self.id = data?.id ?? -1;
        self.regex = data?.regex ?? /.+/g;
        self.actions = data?.action ?? [];
		self.enabled = false;
    }
}

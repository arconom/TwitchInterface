export default class RepeatingMessage {
    constructor(data) {
        var self = this;

        self.channel = data?.channel ?? "";
        self.message = data?.message ?? "";
        self.intervalSeconds = data?.intervalSeconds ?? 600;
        self.iterations = data?.iterations ?? 0;
        self.maxIterations = data?.maxIterations ?? 1;
		self.enabled = false;
    }
}

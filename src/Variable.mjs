export default class Variable {
    constructor(data) {
        var self = this;

        if (data) {
            self.name = data?.name ?? "";
            self.value = data?.value ?? "";
        } else {
            self.name = "";
            self.value = "";
        }
    }

}

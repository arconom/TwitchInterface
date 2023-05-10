import {
    Constants
}
from './Constants.mjs';

export class ChatCommand {
    constructor(data) {
        this.description = data.description ?? "";
        this.handler = data.handler ?? function () {
            throw "command not implemented";
        };
    }
}

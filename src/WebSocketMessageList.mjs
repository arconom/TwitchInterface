import WebSocketMessage from "./WebSocketMessage.mjs";

export default class WebSocketMessageList {

    constructor(list) {
        this.list = list ?? [];
    }

    clear() {
        this.list.clear();
    }

    add(message) {
        this.list.push(new WebSocketMessage(message));
    }

    latest() {
        this.list
        .reduce(function (accumulator, currentValue, currentIndex, array) {
            if (currentValue?.metadata?.message_timestamp > accumulator?.metadata?.message_timestamp) {
                accumulator = current;
            }
            return accumulator;
        }, null);
    }

    exists(id) {
        this.list.forEach(function (x) {
            if (x?.metadata?.message_id === id) {
                return true;
            }
        });

        return false;
    }
}

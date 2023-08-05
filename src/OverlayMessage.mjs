export default class OverlayMessage {

    constructor(data) {
        this.text = data.text ?? "";
        this.type = data.type ?? "";
        this.images = data.images ?? "";
        this.sounds = data.sounds ?? "";
    }

}

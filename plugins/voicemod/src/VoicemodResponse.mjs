export default class VoicemodResponse {
    constructor() {
        this.actionType = "getMemes",
        this.appVersion = "2.41.0.0",
        this.actionID = "",
        this.actionId = "",
        this.actionObject = {
            "listOfMemes": [{
                    "FileName": "4f64e0b5-6187-4c48-8975-946224e142a4",
                    "fileName": "4f64e0b5-6187-4c48-8975-946224e142a4",
                    "Profile": "Prankster",
                    "profile": "Prankster",
                    "Name": "Alert",
                    "name": "Alert",
                    "Type": "PlayRestart",
                    "type": "PlayRestart",
                    "IsCore": true,
                    "isCore": true
                },
                //.... more sounds here
            ]
        },
        this.context = null
    }
}

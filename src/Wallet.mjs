import HandlerMap from "./HandlerMap.mjs";
import {
    TwitchChatMessageContext
}
from './TwitchChatMessageContext.mjs';
import {
    Constants
}
from './Constants.mjs';
import Currency from './Currency.mjs';
import {
    FileRepository
}
from "./FileRepository.mjs";

export default class Wallet extends HandlerMap {

    constructor(data) {
        super();
        let self = this;

        if (data) {
            self.currencies = new Map();
			data?.currencies?.foreach(function(x){
				self.currencies.set(x.name, new Currency(x));
			});

            self.channel = data.channel ?? "";
            self.userId = data.userId ?? 0;
            self.username = data.username ?? "";
        } else {
            self.currencies = new Map();
            self.channel = "";
            self.userId = 0;
            self.username = "";
        }
    }

    addCurrency(/*currency*/ value) {
        let self = this;
        FileRepository.log("addCurrency " + JSON.stringify(value));

        if (self.currencies.has(value.name)) {
            let currency = self.currencies.get(value.name);
            currency.add(value.value);
            // self.currencies.set(value.name, currency);
        } else {
            self.currencies.set(value.name, value);
        }

        this.ExecuteHandlers("onCurrencyChanged", {
            target: self.channel,
            msg: "",
            context: new TwitchChatMessageContext(null),
            "self": false,
            chatBot: null,
            args: null
        });
    }

    subtractCurrency(/*currency*/ value) {
        var self = this;
        FileRepository.log("subtractCurrency " + JSON.stringify(value));

        if (self.currencies.has(value.name)) {
            var currency = self.currencies.get(value.name);
            currency.subtract(value.value);
            // self.currencies.set(value.name, currency);
        }

        this.ExecuteHandlers("onCurrencyChanged", {
            target: self.channel,
            msg: "",
            context: new TwitchChatMessageContext(null),
            "self": false,
            chatBot: null,
            args: null
        });
    }


    hasCurrency(/*currency*/ value) {
        var self = this;

        if (self.currencies.has(value.name)) {
            var currency = self.currencies.get(value.name);
            return currency.value >= value.value;
            // self.currencies.set(value.name, currency);
        }

		return false;
    }

    getCurrency(/*string */ type) {
        var self = this;
        FileRepository.log("getCurrency " + type);
        if (self.currencies.has(type)) {
            FileRepository.log("getCurrency " + JSON.stringify(self.currencies.get(type)));
            return self.currencies.get(type);
        } else {
            FileRepository.log("getCurrency didn't find key " + type);
            return new Currency({
                name: type,
                value: 0
            })
        }
    }

    setCurrency(/*string */ type, /*currency*/ value) {
        var self = this;
        self.currencies.set(type, value);

        this.ExecuteHandlers("onCurrencyChanged", {
            target: self.channel,
            msg: "",
            context: new TwitchChatMessageContext(null),
            "self": false,
            chatBot: null,
            args: null
        });
    }

    removeCurrency(/*string */ type) {
        var self = this;
        self.currencies.delete(type);

        this.ExecuteHandlers("onCurrencyChanged", {
            target: self.channel,
            msg: "",
            context: new TwitchChatMessageContext(null),
            "self": false,
            chatBot: null,
            args: null
        });
    }

}

(function () {
    test();
})();

function test() {
    let wallet = new Wallet();
    let currency = new Currency({
        name: "rpg",
        value: 3,
        min: 0,
        max: 10
    });
    let subCurrency = new Currency({
        name: "rpg",
        value: 2,
        min: 0,
        max: 10
    });

    wallet.addCurrency(currency);

    if (wallet.getCurrency("rpg").value !== 3) {
        throw "wallet.getCurrency not work";
    }


    wallet.subtractCurrency(subCurrency);

    if (wallet.getCurrency("rpg").value !== 1) {
        throw "wallet.subtractCurrency not work. expected value 1; actual value " + wallet.getCurrency("rpg").value;
    }

    wallet.subtractCurrency(subCurrency);

    if (wallet.getCurrency("rpg").value !== 0) {
        throw "wallet.subtractCurrency2 not work";
    }
}
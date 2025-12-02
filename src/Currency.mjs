
export default class Currency {
    constructor(data) {
        var self = this;

        if (data) {
            self.name = data?.name ?? "";
            self.value = data?.value ?? data.min ?? 0;
            self.min = data?.min ?? 0;
            self.max = data?.max ?? 0;
        } else {
            self.name = "";
            self.value = 0;
            self.min = 0;
            self.max = 0;
        }
    }

    set(value) {
        var self = this;
        self.value = value;
        self.constrainValue();
    }

    add(value) {
        var self = this;
        self.value += value;
        self.constrainValue();
    }

    subtract(value) {
        var self = this;
        self.value -= value;
        self.constrainValue();
    }

    multiply(value) {
        var self = this;
        self.value *= value;
		self.value = Math.floor(self.value);
        self.constrainValue();
    }

    divide(value) {
        var self = this;
        self.value /= value;
		self.value = Math.floor(self.value);
        self.constrainValue();
    }

    constrainValue() {
        var self = this;
        if (self.value > self.max) {
            self.value = self.max;
        }
        if (self.value < self.min) {
            self.value = self.min;
        }
    }
}

(function(){
	test();
})()

function test(){
	let currency = new Currency();
	
	currency.name = "test";
	currency.min = 0;
	currency.max = 10;
	currency.value = 3;
	
	currency.add(1);
	
	if(currency.value !== 4){
		throw "currency.add not work";
	}

	currency.subtract(1);
	
	if(currency.value !== 3){
		throw "currency.subtract not work";
	}

	currency.divide(2);
	
	if(currency.value !== 1){
		throw "currency.divide not work";
	}

	currency.multiply(2);
	
	if(currency.value !== 2){
		throw "currency.multiply not work";
	}

	currency.add(100);
	
	if(currency.value !== 10){
		throw "currency.max not work";
	}

	currency.subtract(100);
	
	if(currency.value !== 0){
		throw "currency.min not work";
	}
}
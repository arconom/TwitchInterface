import {FileRepository} from "./FileRepository.mjs";

export default class HandlerMap {

    constructor() {
        this.handlers = new Map();
		
		this.AddHandler("error", function(err){
			FileRepository.log("HandlerMap.error", err.error);
		});
		
		this.AddHandler("close", function(err){
			FileRepository.log("HandlerMap.close", err.reason);
		});
		
    }

    RemoveHandler(key, id) {
        if (this.handlers.has(key)) {
            var arr = this.handlers.get(key);
            var index = null;

            for (let i = 0; i < arr.length; i++) {
                if (arr[i].id === id) {
                    arr.splice(i, 1);
                }
            }

            this.handlers.set(key, arr);
        }
    }

    AddHandler(key, callback, isPersistent = false) {
        var pushMe = {
            id: Date.now() + Math.floor(Math.random() * 999),
            isPersistent: isPersistent,
            value: callback
        };

        if (this.handlers.has(key)) {
            var arr = this.handlers.get(key);
            arr.push(pushMe);
            this.handlers.set(key, arr);
        } else {
            this.handlers.set(key, [pushMe]);
        }

        return pushMe.id;
    }

    ExecuteHandlers(key, args) {
        // FileRepository.log( "ExecuteHandlers", key);
        var self = this;
        var promises = [];
        var arr = self.handlers.get(key);

        if (arr && arr.length > 0) {
            arr.forEach(function (x) {
                if (typeof x === "function") {
                    promises.push(new Promise(function (resolve, reject) {
                            x(args);
                        }));
                } else if (x?.value && typeof x?.value === "function") {
                    promises.push(new Promise(function (resolve, reject) {
                            x.value(args);
                        }));
                } else {
                    FileRepository.log( "HandlerMap.ExecuteHandlers invalid handler", x);
                }
            });

            self.handlers.set(key, arr.filter(x => x.isPersistent));
            return Promise.all(promises);
        }
        return Promise.resolve();

    }
}

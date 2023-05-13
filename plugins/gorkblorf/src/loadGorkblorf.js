import Gorkblorf from "./Gorkblorf.mjs";
import {
    Worker,
    isMainThread,
    parentPort,
    workerData
}
from 'node:worker_threads';


var keys = workerData.chatLog.keys();
var gorkblorf = new Gorkblorf({});


for (const key of keys) {
    var messages = workerData.chatLog.get(key);
    messages.forEach(function (x) {
        gorkblorf.read(x.msg, x.context["user-id"]);
    });
}

workerData.gorkblorf = gorkblorf;

parentPort.postMessage(workerData);
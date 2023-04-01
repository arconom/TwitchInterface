export function UInt8ToString(dv) {
    FileRepository.log(dv.reduce(function (a, c, i, arr) {
            return a + String.fromCharCode(c);
        }, ""));
}

export function Nonce(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function querystringToMap(querystring) {
    var returnMe = new Map();

    if (!querystring || querystring.length < 1) {
        return returnMe;
    }

    var regex = /(\w+)=(.+)/;

    querystring
    .split("&")
    .forEach(x => {
        var addMe = x.split("=");
        returnMe.set(addMe[0], addMe[1]);
    });

    return returnMe;
}

export function querystringToObject(querystring) {
    var returnMe = {};

    if (!querystring || querystring.length < 1) {
        return returnMe;
    }

    var regex = /(\w+)=(.+)/;

    querystring
    .split("&")
    .forEach(x => {
        var addMe = x.split("=");
        returnMe[addMe[0]] = addMe[1];
    });

    return returnMe;
}

export function ObjectToQuerystring(obj) {

    var returnMe = "?";

    Object.keys(obj).forEach(function (x, i) {
        if (i > 0) {
            returnMe += "&";
        }

        returnMe += x + "=" + obj[x];
    });

	return returnMe;
}

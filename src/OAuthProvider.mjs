import HandlerMap from "./HandlerMap.mjs";
import http from "http";
import {
    Nonce
}
from "./Utility.mjs";
import {ApiScopes} from "./ApiScopes.mjs";
import {
    Secrets
}
from "./Secrets.mjs";
import {
    Constants
}
from "./Constants.mjs";
import open from 'open';
import {FileRepository} from "./FileRepository.mjs";

export default class OAuthProvider extends HandlerMap {

    constructor(redirectUri, port, secretsConfig, preferredBrowser, scopes) {
        super();
		var secrets = new Secrets(secretsConfig);
		this.port = port;
        this.oAuthToken;
        this.token = {};
        this.secret = secrets.secret;
        this.clientId = secrets.clientId;
        this.redirectUri = redirectUri + port;
        this.scope = scopes.join(" ");
        FileRepository.log( "OAuthProvider.scope " + this.scope);
		
        this.server;
        this.inProgress = false;
        this.setupListener();
        this.accessTokenDebouncer = 0;
		this.preferredBrowser = preferredBrowser;
    }

    readJson(data) {
        return data.json();
    }

    getState() {
        return Math.floor(Math.random() * 999999999);
        // return Nonce(15);
    }

    setupListener() {
        var self = this;
        // FileRepository.log( "OAuthProvider.setupListener");
        self.server = http.createServer(function (req, res) {
            FileRepository.log( "OAuthProvider response received");
            onRequest(req, res);
        });
        self.server.listen(self.port);

        function onRequest(req, res) {
            if (req.url) {
                var match = req.url.match(Constants.codeRegex);
                if (match?.length > 0) {
                    FileRepository.log( "setupListener code", match[1]);
                    self.oAuthToken = match[1];
                    self.getAccessToken(function (x) {
                        self.ExecuteHandlers("authorize", self);
                        self.inProgress = false;
                    });
                } else {
                    FileRepository.log( "no code found in response url", req.url);
                }
            } else {
                FileRepository.log( "no url found in response", req, res);
            }

            res.write('Response');
            res.end();
        }
    }

    getAuthorizationHeader() {
        FileRepository.log( "OAuthProvider.getAuthorizationHeader");
        if (this.token && this.token.token_type) {
            return this.token.token_type[0].toUpperCase() +
            this.token.token_type.substr(1) + " " +
            this.token.access_token;
        } else {
            FileRepository.log( "no auth token");
        }
    }

    validateAccess(callback) {
        FileRepository.log( "OAuthProvider.validateAccess");
        var self = this;
        if (self?.token?.access_token?.length === undefined || self?.token?.access_token?.length === 0) {
            FileRepository.log( "no token found, getting one");
            return self.getAccessToken(callback);
        } else {
            FileRepository.log( "we have a token, moving on");
            return callback(self);
        }
    }

    authorizeImplicit() {
		var self = this;
        this.state = this.getState();
        var url = "https://id.twitch.tv/oauth2/authorize?" +
            "client_id=" + encodeURIComponent(this.clientId) +
            "&force_verify=" + encodeURIComponent(this.forceVerify) +
            "&redirect_uri=" + encodeURIComponent(this.redirectUri) +
            "&response_type=token" +
            "&scope=" + encodeURIComponent(this.scope) +
            "&state=" + encodeURIComponent(this.state);

        return open(url, {
            app: {
                name: self.preferredBrowser
            }
        });
    }

    authorize(callback) {
        FileRepository.log( "OAuthProvider.authorize");
        var self = this;
        this.AddHandler("authorize", callback, false);

        if (this.inProgress) {
            return Promise.resolve();
        }

        this.state = this.getState();

        var url = "https://id.twitch.tv/oauth2/authorize?" +
            "client_id=" + encodeURIComponent(this.clientId) +
            "&force_verify=" + encodeURIComponent(this.forceVerify) +
            "&redirect_uri=" + encodeURIComponent(this.redirectUri) +
            "&response_type=code" +
            "&scope=" + encodeURIComponent(this.scope) +
            "&state=" + encodeURIComponent(this.state);

        var requestOptions = {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        this.inProgress = true;
        FileRepository.log("authorize opening " + url);
        return open(url, {
            app: {
                name: self.preferredBrowser
            }
        });
    }

    getAccessToken(callback) {
        FileRepository.log( "OAuthProvider.getAccessToken");
        var self = this;

        if (Date.now() < self.accessTokenDebouncer) {
            FileRepository.log( "OAuthProvider.getAccessToken debounced");
            return Promise.resolve();
        }

        this.AddHandler("token", callback, false);
        var url = `https://id.twitch.tv/oauth2/token`;

        return self.validateToken(function () {
            FileRepository.log( "getAccessToken after validateToken");
            var data = {
                client_id: self.clientId,
                client_secret: self.secret,
                code: self.oAuthToken,
                redirect_uri: self.redirectUri,
                // grant_type: "client_credentials"
                grant_type: "authorization_code"
            };

            //we are refreshing
            if (self.token?.refresh_token?.length > 0) {
                // FileRepository.log( "refresh token exists");
                data.grant_type = "refresh_token";
                data.refresh_token = self.token.refresh_token;
            } else {
                // FileRepository.log( "refresh token omitted");
            }

            var requestOptions = {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify(data) // body data type must match "Content-Type" header
            };

            self.accessTokenDebouncer = Date.now() + 5000;

            // FileRepository.log( "OAuthProvider.getAccessToken request", url, requestOptions);
            return fetch(url, requestOptions)
            .then(self.readJson)
            .then(function (data) {
                if (data.access_token) {
                    FileRepository.log( "getAccessToken result", data);
                    self.token = data;
                    return self.ExecuteHandlers("token", self);
                } else {
                    FileRepository.log( "OAuthProvider.getAccessToken failed to get token", data);
					return Promise.resolve();
                }
            })
            .catch(function (e) {
                FileRepository.log( "getAccessToken exception", e);
                self.server.close();
            });

            /*             // example object
            // {
            // "access_token": "rfx2uswqe8l4g1mkagrvg5tv0ks3",
            // "expires_in": 14124,
            // "refresh_token": "5b93chm6hdve3mycz05zfzatkfdenfspp1h1ar2xxdalen01",
            // "scope": [
            // "channel:moderate",
            // "chat:edit",
            // "chat:read"
            // ],
            // "token_type": "bearer"
            // }
             */
        });
    }

    validateToken(callback) {
        var self = this;
        FileRepository.log( "OAuthProvider.validateToken");
        //if we don't have a code already
        if (!self.oAuthToken || self.oAuthToken.length === 0) {
            FileRepository.log( "validateToken getting new token");
            return self.authorize(callback);
        } else {
            FileRepository.log( "validateToken already has token");
            return callback(self);
            // return Promise.resolve();
        }
    }

}

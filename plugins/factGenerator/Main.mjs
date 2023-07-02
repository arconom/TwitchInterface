
var plugin = {
    name: "fact generator",

    //commands is a map of keys and functions that take an object as a parameter and return a string
    // {
    // target: string,
    // msg: string,
    // context: Object<TwitchChatMessageContext>,
    // "self": bool,
    // chatBot: Object<ChatBot>
    // }
    dependencies: [],
    commands: new Map(),
    load: function (globalState) {
        var FileRepository = globalState.get("filerepository");
        FileRepository.log("fact generator.load");
        const stateKey = "factGenerator"

            // this function will be called by Main.js in the app
            //load whatever dependencies you need in here and do setup

            var Constants = globalState.get("constants");

        plugin.commands.set("prfact", {
            description: "Get a random fact",
            handler: function (obj) {

                console.log("prfact handler");

                var wordGenerator = globalState.get("wordgenerator").wordGenerator;
                var key = obj.target + stateKey;
                var index = Math.floor(Math.random() * 161);

                try {
                    // return fetch("https://www.randomfactgenerator.com/_api/cloud-data/v1/wix-data/collections/query", {
                    // "headers": {
                    // "accept": "application/json, text/plain, /",
                    // "content-type": "application/json",
                    // "x-wix-brand": "wix",
                    // "x-wix-client-artifact-id": "wix-thunderbolt"
                    // },
                    // "referrerPolicy": "strict-origin-when-cross-origin",
                    // "body": "{\"collectionName\":\"Trivia\",\"dataQuery\":{\"filter\":{},\"paging\":{\"offset\":" + index + ",\"limit\":1},\"fields\":[]},\"options\":{},\"includeReferencedItems\":[],\"segment\":\"LIVE\",\"appId\":\"471f5ee1-90b1-4602-bbc9-e462d64100a4\"}",
                    // "method": "POST",
                    // "mode": "cors",
                    // "credentials": "include"
                    // }).then(function (result) {
                    // return result.json();
                    // }).then(function (result2) {
                    // console.log("prfact handler returning", result2);
                    // return result2.items[0].title;
                    // });


                    var ccToken = "";
                    var mediaAuthToken = "";
                    var svSession = "";
                    var visitorId = "";

                    fetch("https://www.randomfactgenerator.com/_api/v2/dynamicmodel", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "en-US,en;q=0.9",
                            "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\", \"Vivaldi\";v=\"6.0\"",
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-platform": "\"Windows\"",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin"
                        },
                        "referrer": "https://www.randomfactgenerator.com/",
                        "referrerPolicy": "strict-origin-when-cross-origin",
                        "body": null,
                        "method": "GET",
                        "mode": "cors",
                        "credentials": "include"
                    }).then(function (result) {
                        return result.json();
                    }).then(function (result) {
                        console.log(result);

                        ccToken = result.ccToken;
                        mediaAuthToken = result.mediaAuthToken;
                        svSession = result.svSession;
                        visitorId = result.visitorId;

                    });

                    /* 					var exampleData = {
                    "hs": 1659952323,
                    "visitorId": "a6c0d755-1abc-46c2-906c-077587fb57ca",
                    "svSession": "ad6922fb5fb266a4a46069edbfeadb93ca80f12014f4ee365e03a31bfc83a666c574dade885e0ee086434fd00884847a1e60994d53964e647acf431e4f798bcd3c24a7853beeff0340cad393464370a9b528040cfbafd5bfcfd8bfce9185bede31f9cb159cc0103b738abb718f291ca5a68b8b8049a0b1d882b99d3dafdb6ed70694d9dbb5a4159e67db2002f826b0e4",
                    "ctToken": "Sk92bjRDLTFpeVF4QTFUeWw0dktEMVdQWTdJWnBsUWZMYW9FS1FiV1BjSXx7InVzZXJBZ2VudCI6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8xMTIuMC4wLjAgU2FmYXJpLzUzNy4zNiIsInZhbGlkVGhyb3VnaCI6MTY4ODY2NzM1NDg4M30",
                    "mediaAuthToken": "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcHA6MTEyNjU1MzUxNDEyMDM1MiIsInN1YiI6InNpdGU6MzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwiYXVkIjoidXJuOnNlcnZpY2U6ZmlsZS51cGxvYWQiLCJleHAiOjE2ODgxNDg5NTQsImlhdCI6MTY4ODA2MjU1NCwianRpIjoieUhVbXZLZURpb1hDZ1dya2JhcUdtZyIsImFkZGVkQnkiOiJhbm9ueW1vdXM6YTZjMGQ3NTUtMWFiYy00NmMyLTkwNmMtMDc3NTg3ZmI1N2NhIn0.Krg3QhWERqkFNjmXsgn8TOJnzAA4uqU-tDQy85zeK3Y",
                    "apps": {
                    "8725b255-2aa2-4a53-b76d-7d3c363aaeea": {
                    "instance": "GUXLcB_InFezJgdJc90CvSCqGSgcLZRZbU7frhJqqLk.eyJpbnN0YW5jZUlkIjoiYmEwNzE1Y2EtZDE4Ni00OWI3LTk1ZTAtNzUwYjY4MGNkN2Y5IiwiYXBwRGVmSWQiOiI4NzI1YjI1NS0yYWEyLTRhNTMtYjc2ZC03ZDNjMzYzYWFlZWEiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiI4YzA5MGY0ZC1hY2U3LTA2YWYtMWMyZS01YWU1Zjk3YzFlOTkiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 21
                    },
                    "139ef4fa-c108-8f9a-c7be-d5f492a2c939": {
                    "instance": "uxYPYOkr6O1PzlWnX4t-oHdtRDiicjK6VUJQ6HpKikI.eyJpbnN0YW5jZUlkIjoiMGM3MGMyNjgtMjVjMi00YmM5LWFhOTItZTUzOWI5ZTc2ZTVjIiwiYXBwRGVmSWQiOiIxMzllZjRmYS1jMTA4LThmOWEtYzdiZS1kNWY0OTJhMmM5MzkiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiIzYTdlZDhlZi01OGEzLTA0ZDEtMjM1Yy1jYWQ3Mjg5N2E3M2MiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 22
                    },
                    "14271d6f-ba62-d045-549b-ab972ae1f70e": {
                    "instance": "5pbGnbmPOn4BUVc8WCqq9NciQhxGAK2fXffJN2ETwFo.eyJpbnN0YW5jZUlkIjoiMDVmYTA2ZGEtYWNhMy00YzRmLTlkOGQtZWU2ZWZhYzc2NTFkIiwiYXBwRGVmSWQiOiIxNDI3MWQ2Zi1iYTYyLWQwNDUtNTQ5Yi1hYjk3MmFlMWY3MGUiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsIm9yaWdpbkluc3RhbmNlSWQiOiJiZTlmOGI3Yy1iMjVkLTQzODMtOTA1OC1iZDE2MzIxMjJhYmIiLCJhaWQiOiJhNmMwZDc1NS0xYWJjLTQ2YzItOTA2Yy0wNzc1ODdmYjU3Y2EiLCJiaVRva2VuIjoiMzNmNDFjNWQtZDFjMi0wMzU3LTE0NDMtYzE4MDZiYjdhYzdkIiwic2l0ZU93bmVySWQiOiJiOGYwMGRhZi0zZjk4LTRmZDEtODUxMy04NzVlNzQ5YTA2MmQifQ",
                    "intId": 24
                    },
                    "141fbfae-511e-6817-c9f0-48993a7547d1": {
                    "instance": "jpHRfIKQoNS4G7IHhnNUqm9_vLtT7nN-l9PUNrPk_9U.eyJpbnN0YW5jZUlkIjoiYTM0NDlkZjItYTBmYi00YTZlLThjMjQtN2JjOTljMTk4NGVmIiwiYXBwRGVmSWQiOiIxNDFmYmZhZS01MTFlLTY4MTctYzlmMC00ODk5M2E3NTQ3ZDEiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiI5NTRhODc3NS1kZDlhLTA1NzYtMDVlYS01NDI3MGQ2OTRkOGYiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 28
                    },
                    "12d5833e-f061-7cc8-5122-e1d404f6c8ae": {
                    "instance": "YJHlZSdrL20VHI1LEM5BmasslSx3Xed97US6XNmch_A.eyJpbnN0YW5jZUlkIjoiOTRjMzdlOTUtZWEwZi00NjA5LTg4ZTMtNjdhMTFkZTQwNDA2IiwiYXBwRGVmSWQiOiIxMmQ1ODMzZS1mMDYxLTdjYzgtNTEyMi1lMWQ0MDRmNmM4YWUiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiJhMmNkNjQxMi05NzZlLTA5MTEtMDEyZC00ODRmOGM5NGNkNjYiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 44
                    },
                    "d70b68e2-8d77-4e0c-9c00-c292d6e0025e": {
                    "instance": "2liza1QA0m6XSpJ4AMUFwtIDPwROK4z6b85TjaSz804.eyJpbnN0YW5jZUlkIjoiOGJmZTAwYWUtNzg3Zi00YmI5LThmNmEtZTI1M2M3ZmM3NDgxIiwiYXBwRGVmSWQiOiJkNzBiNjhlMi04ZDc3LTRlMGMtOWMwMC1jMjkyZDZlMDAyNWUiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiJiZGYwMWEyOS0wNTFlLTA0YTEtMDZhNC1jZGJkNTY4Y2JkZTEiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 34
                    },
                    "13aa9735-aa50-4bdb-877c-0bb46804bd71": {
                    "instance": "sDZexKpxjV5mLaP6QWU5Rt-6KLg5it8zB2OuCj8TxnQ.eyJpbnN0YW5jZUlkIjoiNGJiYTgxYTctOTM3NC00NTk3LTk1NmMtYTg3ZDQ1N2VlY2Y5IiwiYXBwRGVmSWQiOiIxM2FhOTczNS1hYTUwLTRiZGItODc3Yy0wYmI0NjgwNGJkNzEiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiI3ZGI0OWIyMC1lZTE1LTBhOGYtMWNhMi04NzkzZDQwZTI1OTkiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 33
                    },
                    "146c0d71-352e-4464-9a03-2e868aabe7b9": {
                    "instance": "MHU6pjrJqCy-yTbCyzj5TsXndvNq2bwIBadf0xUZ9T4.eyJpbnN0YW5jZUlkIjoiZmIzMDNiNDQtZWJjNS00ZDdkLTkwZTktNmZlYjc2YjUxYmUzIiwiYXBwRGVmSWQiOiIxNDZjMGQ3MS0zNTJlLTQ0NjQtOWEwMy0yZTg2OGFhYmU3YjkiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiJjZDNlMjFjMy05NmE0LTAyNjUtMTkyNy00MDA1ZTdjNWQyODMiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 37
                    },
                    "307ba931-689c-4b55-bb1d-6a382bad9222": {
                    "instance": "QLNRl2NfhWqpeRWB_yBGKOglgnWhNH3HJ3KCJxMB1e4.eyJpbnN0YW5jZUlkIjoiMjJiN2NkY2QtMGExNC00N2ZlLWJlYWUtMDM2OWFlN2ZjM2U0IiwiYXBwRGVmSWQiOiIzMDdiYTkzMS02ODljLTRiNTUtYmIxZC02YTM4MmJhZDkyMjIiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiIxNGI5ZDc0YS03Nzc1LTA4ZTYtMzc2MC0yYzg3M2YwZjBhODQiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 38
                    },
                    "4b10fcce-732d-4be3-9d46-801d271acda9": {
                    "instance": "PyS6cC6fKARu3YvFA_H4hwCksIqnSzCsaOX38umwBtQ.eyJpbnN0YW5jZUlkIjoiMjM5ZDE5ZGYtYTMzMC00ZmQwLTk0YmQtMTg5M2Y4MWY1NjI4IiwiYXBwRGVmSWQiOiI0YjEwZmNjZS03MzJkLTRiZTMtOWQ0Ni04MDFkMjcxYWNkYTkiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiIxNTkzMDM1OC1kZTUxLTAwYzgtMWQ3My0zNzdkNjk2ZjlmNDgiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 40
                    },
                    "14b89688-9b25-5214-d1cb-a3fb9683618b": {
                    "instance": "8W894rb67hAv9il5gOMPTvh71uIoPjixauOZX5VL4NY.eyJpbnN0YW5jZUlkIjoiMjBlZDlkY2EtNzI0MS00Yjg2LWIzOTEtNmVlMzI3ZTA4OTk3IiwiYXBwRGVmSWQiOiIxNGI4OTY4OC05YjI1LTUyMTQtZDFjYi1hM2ZiOTY4MzYxOGIiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiIxNmUzODc0ZC0wZjIwLTA0OWUtM2E1Zi00MTBkYjY5MDQwZjciLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 35
                    },
                    "ea2821fc-7d97-40a9-9f75-772f29178430": {
                    "instance": "6T3UygmCvR0hzQZtxPQ4CB7AlpkjK52LQ_CNiCI3ADw.eyJpbnN0YW5jZUlkIjoiNWEwYTcwMGItM2UwYi00YjQyLTkzYWEtNjE1YWRmYTFmNWYzIiwiYXBwRGVmSWQiOiJlYTI4MjFmYy03ZDk3LTQwYTktOWY3NS03NzJmMjkxNzg0MzAiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiI2YzA0NmE4Yy00MzZhLTA0NWEtMWE2NC00ZWI0NGVkMTNjOTMiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 41
                    },
                    "a322993b-2c74-426f-bbb8-444db73d0d1b": {
                    "instance": "Fhrm6anV9LLjF3Y14AJ6Wg9kKZ2Nl-bt77WaQM-4cOg.eyJpbnN0YW5jZUlkIjoiOWM5NDJhZGEtN2IzYy00ZmI4LTljY2YtOTgxMGQ5ZThiNDg4IiwiYXBwRGVmSWQiOiJhMzIyOTkzYi0yYzc0LTQyNmYtYmJiOC00NDRkYjczZDBkMWIiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiJhYTlhMzA1ZC0wNjVkLTAwYTAtMTUwMS1iN2ZlNDg5ODdkZTgiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 29
                    },
                    "55cd9036-36bb-480b-8ddc-afda3cb2eb8d": {
                    "instance": "8_LC4Y0WR90tdrwsgS6OR0Pso_kTaJXWcWAc7XMDPbc.eyJpbnN0YW5jZUlkIjoiMmJmYWZjMjItMWZkZC00Mjg2LTlhNmEtNWFkNzU1YzdmYjM0IiwiYXBwRGVmSWQiOiI1NWNkOTAzNi0zNmJiLTQ4MGItOGRkYy1hZmRhM2NiMmViOGQiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiIxZGY0ZTZhNS02MmJjLTBkOWUtMTNhNC03NTM5YzRiNzMyNTQiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 19
                    },
                    "9bead16f-1c73-4cda-b6c4-28cff46988db": {
                    "instance": "r5q9-EnwHpB8e_sQ7hvqxaemiHKAD-MWPncZ-nJsJKg.eyJpbnN0YW5jZUlkIjoiOGFhZjA2MTktOTdjMi00YWQ1LTkyZWUtZTQwN2JmY2ExYmE1IiwiYXBwRGVmSWQiOiI5YmVhZDE2Zi0xYzczLTRjZGEtYjZjNC0yOGNmZjQ2OTg4ZGIiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiJiY2ExMWM5ZS1lYWEzLTA1Y2QtMWIyMC1jYmU5MmViYWQyYzUiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 31
                    },
                    "1480c568-5cbd-9392-5604-1148f5faffa0": {
                    "instance": "nyDdxDen8-zf9-N1oBGV7-lgigs_IRHkt0BQRyq-2Ik.eyJpbnN0YW5jZUlkIjoiZDdmMWMzMDEtOWI1Zi00Y2MwLTg3NDMtNDhlZTFjZmY3OGE5IiwiYXBwRGVmSWQiOiIxNDgwYzU2OC01Y2JkLTkzOTItNTYwNC0xMTQ4ZjVmYWZmYTAiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiJlMWZmZDk4Ni1lNjNlLTAzZDgtMGU4ZC02NzAwOGQ4ZmIxYzkiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 32
                    },
                    "13ee94c1-b635-8505-3391-97919052c16f": {
                    "instance": "2p6ZA02HqAeWvzz7_ZynGFOqkUPa1Ry0wUOEQsLbXug.eyJpbnN0YW5jZUlkIjoiZTI2MWZmYzctM2UyNy00ZWRmLTk2OWItMjBjMmVhOWRjNjA2IiwiYXBwRGVmSWQiOiIxM2VlOTRjMS1iNjM1LTg1MDUtMzM5MS05NzkxOTA1MmMxNmYiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiJkNDZmZTU0MC00MzQ2LTAxYzctMWY1NS0wZjJjN2JlZDBmNjYiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 20
                    },
                    "22bef345-3c5b-4c18-b782-74d4085112ff": {
                    "instance": "1iP-swdz9Vj9Lkz5qhN1evSbeoHdxSmkz_SYbOa1sfs.eyJpbnN0YW5jZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwiYXBwRGVmSWQiOiIyMmJlZjM0NS0zYzViLTRjMTgtYjc4Mi03NGQ0MDg1MTEyZmYiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsInNpdGVPd25lcklkIjoiYjhmMDBkYWYtM2Y5OC00ZmQxLTg1MTMtODc1ZTc0OWEwNjJkIn0",
                    "intId": -666
                    },
                    "94bc563b-675f-41ad-a2a6-5494f211c47b": {
                    "instance": "Hsma3cdq0aY4zPxsCkHIpBvKUKfxMuXZQQ6ebur4GIU.eyJpbnN0YW5jZUlkIjoiM2JkNGZjMzUtN2U0Yi00NzRkLThiOTEtZTczNWIwZTE3YjE3IiwiYXBwRGVmSWQiOiI5NGJjNTYzYi02NzVmLTQxYWQtYTJhNi01NDk0ZjIxMWM0N2IiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiIwZGRhZTZiMi0wMzJhLTA4NTUtMDI1Zi1jOGRiMjE5MWIyNzciLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 39
                    },
                    "e4b5f1bc-c77a-4319-a60d-a46acb17f6fc": {
                    "instance": "grhBMZ9RA6LYsM64DQI_fbgFzpHqtJ7S1DpGFbWOXCk.eyJpbnN0YW5jZUlkIjoiZjUyNzMzMzAtYThhZi00ZjNlLThhMWUtODdhNDliZGYxNzhlIiwiYXBwRGVmSWQiOiJlNGI1ZjFiYy1jNzdhLTQzMTktYTYwZC1hNDZhY2IxN2Y2ZmMiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiJjMzI5MjliNy1kNWNlLTAwMjYtMDNkMC1hODRhMGFhZmRlZWUiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 45
                    },
                    "14bca956-e09f-f4d6-14d7-466cb3f09103": {
                    "instance": "VmXO5cngczD2Jfm3icUKy5npcVWVhJz6aWvssme8pW8.eyJpbnN0YW5jZUlkIjoiNTYwZWYwZmMtMTI1MC00ZDNlLThjNjMtYWM1NmRkZjE0YTExIiwiYXBwRGVmSWQiOiIxNGJjYTk1Ni1lMDlmLWY0ZDYtMTRkNy00NjZjYjNmMDkxMDMiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiI2MDAwZWE3Yi02ZjMxLTAyMjYtMDVhZC04M2I4NGM4MTgzNzEiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 26
                    },
                    "35aec784-bbec-4e6e-abcb-d3d724af52cf": {
                    "instance": "U151jl1O-QSbOaVburAmqEi5puyDCiXvQ2sF79NGEW8.eyJpbnN0YW5jZUlkIjoiNGQzNzA2MGQtNjVjMC00MTNhLTgwYzMtY2M1YjBhODg3NjY2IiwiYXBwRGVmSWQiOiIzNWFlYzc4NC1iYmVjLTRlNmUtYWJjYi1kM2Q3MjRhZjUyY2YiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiI3YjM5MWM4YS0xOGExLTBlMjItMDkwZC1lM2I1OWJmOGJmMDYiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 18
                    },
                    "14ce1214-b278-a7e4-1373-00cebd1bef7c": {
                    "instance": "6TZbfgkDWO95-caq1h3NesvvnSJl74eieRfsM3U15Ts.eyJpbnN0YW5jZUlkIjoiZTQ2YmQ2MDMtODczNC00YmZmLThjMmUtNWJlMTkyNjZlNGRjIiwiYXBwRGVmSWQiOiIxNGNlMTIxNC1iMjc4LWE3ZTQtMTM3My0wMGNlYmQxYmVmN2MiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiJkMjY1Y2M4NC1mYTU1LTA0ZTctMDVlMC03NDBmMDMxNjJkYmMiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 1867
                    },
                    "14bcded7-0066-7c35-14d7-466cb3f09103": {
                    "instance": "6rtDQl3C0JCbbZJxt4XlIh62k-ZzpX_apGmTmpSW7Dw.eyJpbnN0YW5jZUlkIjoiOTdiMmQ2YzgtYmQ2Yy00ZjY2LWEzMWItOGI2Yzk3NjA5Mjc2IiwiYXBwRGVmSWQiOiIxNGJjZGVkNy0wMDY2LTdjMzUtMTRkNy00NjZjYjNmMDkxMDMiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsIm9yaWdpbkluc3RhbmNlSWQiOiI4NGEyNDI3My0xNzYyLTQ3MWYtODJlNy1lNDZlMDg0ODRjNWQiLCJhaWQiOiJhNmMwZDc1NS0xYWJjLTQ2YzItOTA2Yy0wNzc1ODdmYjU3Y2EiLCJiaVRva2VuIjoiYTFiY2NjNGYtYzAwZC0wMDdlLTJhZDUtYTQ4MjA2MTA1YjE2Iiwic2l0ZU93bmVySWQiOiJiOGYwMGRhZi0zZjk4LTRmZDEtODUxMy04NzVlNzQ5YTA2MmQifQ",
                    "intId": 23
                    },
                    "675bbcef-18d8-41f5-800e-131ec9e08762": {
                    "instance": "wixcode-pub.3b202dbc72cc8a0bb2cbcaa8c57d141161ea0847.eyJpbnN0YW5jZUlkIjoiZmY1YzEzZTAtOWJiNS00MGUxLWEyYjktZjRkOTFhOTg5MzQ4IiwiaHRtbFNpdGVJZCI6ImQ5ZTA2ODgyLWI4OWYtNGZhZS1iNjhlLWQ1NTRiYWYxNTVmOCIsInVpZCI6bnVsbCwicGVybWlzc2lvbnMiOm51bGwsImlzVGVtcGxhdGUiOmZhbHNlLCJzaWduRGF0ZSI6MTY4ODA2MjU1NDg4MywiYWlkIjoiYTZjMGQ3NTUtMWFiYy00NmMyLTkwNmMtMDc3NTg3ZmI1N2NhIiwiYXBwRGVmSWQiOiJDbG91ZFNpdGVFeHRlbnNpb24iLCJpc0FkbWluIjpmYWxzZSwibWV0YVNpdGVJZCI6IjM2MGUxYTg3LTdkNjEtNGYxOC04OWNlLTJmZWU5MTcwYzk2MCIsImNhY2hlIjpudWxsLCJleHBpcmF0aW9uRGF0ZSI6bnVsbCwicHJlbWl1bUFzc2V0cyI6IlNob3dXaXhXaGlsZUxvYWRpbmcsQWRzRnJlZSxIYXNEb21haW4iLCJ0ZW5hbnQiOm51bGwsInNpdGVPd25lcklkIjoiYjhmMDBkYWYtM2Y5OC00ZmQxLTg1MTMtODc1ZTc0OWEwNjJkIiwiaW5zdGFuY2VUeXBlIjoicHViIiwic2l0ZU1lbWJlcklkIjpudWxsLCJwZXJtaXNzaW9uU2NvcGUiOm51bGx9",
                    "intId": 2266
                    },
                    "135c3d92-0fea-1f9d-2ba5-2a1dfb04297e": {
                    "instance": "kp3bZ0yZnYLbjTrZcVimjT9y35IoDMHCRnnpVRPzpTg.eyJpbnN0YW5jZUlkIjoiMjEwN2E5Y2MtMDBhZS00MzYzLWI0MWEtODJiNTdjZGM1Y2U4IiwiYXBwRGVmSWQiOiIxMzVjM2Q5Mi0wZmVhLTFmOWQtMmJhNS0yYTFkZmIwNDI5N2UiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiIxNzA5YjM0Yi03ZGNmLTBjN2ItM2RkNC1hZDViZWRhYzk1ODgiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 36
                    },
                    "150ae7ee-c74a-eecd-d3d7-2112895b988a": {
                    "instance": "fxPaCUR0Qe7VqUH1X0e0REAdpdmkPq2M-KEw9Y_Wa8A.eyJpbnN0YW5jZUlkIjoiYzFmODhlNjctMDM3MC00MzEzLWExNmMtZTUzMjE5YTJiOWY4IiwiYXBwRGVmSWQiOiIxNTBhZTdlZS1jNzRhLWVlY2QtZDNkNy0yMTEyODk1Yjk4OGEiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiJmN2Y2OTRlMC03ZTExLTBjMGItMjhhMi1jYWRjODhkMjcwOTgiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 27
                    },
                    "f123e8f1-4350-4c9b-b269-04adfadda977": {
                    "instance": "B8g4e31D_oDfmHz_8Rjzwo8QNmyn7mIQmtJ91WaATuQ.eyJpbnN0YW5jZUlkIjoiZjMyMTU5MDktOTI0NC00NTA2LWI1MzgtNjYzNjFmMTA0NzY5IiwiYXBwRGVmSWQiOiJmMTIzZThmMS00MzUwLTRjOWItYjI2OS0wNGFkZmFkZGE5NzciLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiJjNTJmNDM4ZS1lZjI1LTBhMWUtM2NmNi00OWQ4OGU2MDhlMDkiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 30
                    },
                    "8ea9df15-9ff6-4acf-bbb8-8d3a69ae5841": {
                    "instance": "8EbAAeX2Nz0uapu2B-Lxj68rfn_cFLbUwmwrZcyD588.eyJpbnN0YW5jZUlkIjoiNGU3MzI4ZGEtZGRjYy00OThjLWE3ZTItMDI0MTc4NjA5MmVjIiwiYXBwRGVmSWQiOiI4ZWE5ZGYxNS05ZmY2LTRhY2YtYmJiOC04ZDNhNjlhZTU4NDEiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiI3ODdkMzI1ZC1hMGFkLTA2OTQtMmUyYy0yZGFmZTkxMDViOGMiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 16
                    },
                    "8d8ba777-9a97-4f63-88da-3d21f7914863": {
                    "instance": "mn6jzt0gct0vUexYGShmiO4QSuXNefWev4eZX1tYSNA.eyJpbnN0YW5jZUlkIjoiZmJjYjNmYTAtOGYxMy00YWUzLWE2ZjEtMDk1NTNmNGNhZjZmIiwiYXBwRGVmSWQiOiI4ZDhiYTc3Ny05YTk3LTRmNjMtODhkYS0zZDIxZjc5MTQ4NjMiLCJtZXRhU2l0ZUlkIjoiMzYwZTFhODctN2Q2MS00ZjE4LTg5Y2UtMmZlZTkxNzBjOTYwIiwic2lnbkRhdGUiOiIyMDIzLTA2LTI5VDE4OjE1OjU0Ljg4M1oiLCJkZW1vTW9kZSI6ZmFsc2UsImFpZCI6ImE2YzBkNzU1LTFhYmMtNDZjMi05MDZjLTA3NzU4N2ZiNTdjYSIsImJpVG9rZW4iOiJjZGM1MjUyNy1mMjcyLTA1ZmItMmYzZi0yNmJiYWUzYzY2MGYiLCJzaXRlT3duZXJJZCI6ImI4ZjAwZGFmLTNmOTgtNGZkMS04NTEzLTg3NWU3NDlhMDYyZCJ9",
                    "intId": 42
                    }
                    }
                    };
                     */

                    return fetch("https://www.randomfactgenerator.com/_api/cloud-data/v1/wix-data/collections/query", {
                        "headers": {
                            "accept": "application/json, text/plain, */*",
                             "authorization": "wixcode-pub.3b202dbc72cc8a0bb2cbcaa8c57d141161ea0847.eyJpbnN0YW5jZUlkIjoiZmY1YzEzZTAtOWJiNS00MGUxLWEyYjktZjRkOTFhOTg5MzQ4IiwiaHRtbFNpdGVJZCI6ImQ5ZTA2ODgyLWI4OWYtNGZhZS1iNjhlLWQ1NTRiYWYxNTVmOCIsInVpZCI6bnVsbCwicGVybWlzc2lvbnMiOm51bGwsImlzVGVtcGxhdGUiOmZhbHNlLCJzaWduRGF0ZSI6MTY4ODA2MjU1NDg4MywiYWlkIjoiYTZjMGQ3NTUtMWFiYy00NmMyLTkwNmMtMDc3NTg3ZmI1N2NhIiwiYXBwRGVmSWQiOiJDbG91ZFNpdGVFeHRlbnNpb24iLCJpc0FkbWluIjpmYWxzZSwibWV0YVNpdGVJZCI6IjM2MGUxYTg3LTdkNjEtNGYxOC04OWNlLTJmZWU5MTcwYzk2MCIsImNhY2hlIjpudWxsLCJleHBpcmF0aW9uRGF0ZSI6bnVsbCwicHJlbWl1bUFzc2V0cyI6IlNob3dXaXhXaGlsZUxvYWRpbmcsQWRzRnJlZSxIYXNEb21haW4iLCJ0ZW5hbnQiOm51bGwsInNpdGVPd25lcklkIjoiYjhmMDBkYWYtM2Y5OC00ZmQxLTg1MTMtODc1ZTc0OWEwNjJkIiwiaW5zdGFuY2VUeXBlIjoicHViIiwic2l0ZU1lbWJlcklkIjpudWxsLCJwZXJtaXNzaW9uU2NvcGUiOm51bGx9",
                             "commonconfig": "%7B%22brand%22%3A%22wix%22%2C%22BSI%22%3A%2204025a89-aab3-4b55-aa78-43e3bbf467bd%7C1%22%7D",
                            "content-type": "application/json",
                            "x-wix-brand": "wix",
                            "x-wix-client-artifact-id": "wix-thunderbolt"
                        },
                        "referrer": "https://www.randomfactgenerator.com/_partials/wix-thunderbolt/dist/clientWorker.26b3386c.bundle.min.js",
                        "referrerPolicy": "strict-origin-when-cross-origin",
                        "body": "{\"collectionName\":\"Trivia\",\"dataQuery\":{\"filter\":{},\"paging\":{\"offset\":"+index+",\"limit\":1},\"fields\":[]},\"options\":{},\"includeReferencedItems\":[],\"segment\":\"LIVE\",\"appId\":\"471f5ee1-90b1-4602-bbc9-e462d64100a4\"}",
                        "method": "POST",
                        "mode": "cors",
                        "credentials": "include"
                    }).then(function (result) {
                        return result.json();
                    }).then(function (result2) {
                        console.log("prfact handler returning", result2);

                        if (result2.items) {
                            console.log(result2.items[0].title);
                            return result2.items[0].title;
                        } else {
                            return result2.message;
                        }
                    });

                    /*                     fetch("https://www.randomfactgenerator.com/_api/cloud-data/v1/wix-data/collections/query", {
                    "headers": {
                    "accept": "application/json, text/plain, /",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/json",
                    },
                    "body": "{\"collectionName\":\"Trivia\",\"dataQuery\":{\"filter\":{},\"paging\":{\"offset\":160,\"limit\":1},\"fields\":[]},\"options\":{},\"includeReferencedItems\":[],\"segment\":\"LIVE\",\"appId\":\"471f5ee1-90b1-4602-bbc9-e462d64100a4\"}",
                    "method": "POST",
                    // });

                    // fetch("https://www.randomfactgenerator.com/_api/cloud-data/v1/wix-data/collections/query", {
                    // "headers": {
                    // "accept": "application/json, text/plain, /",
                    // "content-type": "application/json",
                    // "x-wix-brand": "wix",
                    // "x-wix-client-artifact-id": "wix-thunderbolt"
                    // },
                    // "referrerPolicy": "strict-origin-when-cross-origin",
                    // "body": "{\"collectionName\":\"Trivia\",\"dataQuery\":{\"filter\":{},\"paging\":{\"offset\":160,\"limit\":1},\"fields\":[]},\"options\":{},\"includeReferencedItems\":[],\"segment\":\"LIVE\",\"appId\":\"471f5ee1-90b1-4602-bbc9-e462d64100a4\"}",
                    // "method": "POST",
                    // "mode": "cors",
                    // "credentials": "include"
                    }).then(function (result) {
                    return result.json();
                    }).then(function (result2) {
                    console.log("prfact handler returning", result2);

                    if (result2.items) {
                    console.log(result2.items[0].title);
                    return result2.items[0].title;
                    } else {
                    return result2.message;
                    }
                    });
                     */
                } catch (e) {
                    FileRepository.log(new Date(Date.now()).toISOString() + " \r\n " + "fact generator encountered an error" + " \r\n " + e);
                }
            }
        });

        return Promise.resolve();
    }
};

export default plugin;

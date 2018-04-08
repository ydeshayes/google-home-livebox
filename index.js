const http = require('http');
const express = require('express');
const basicAuth = require('express-basic-auth');
const querystring = require('querystring');
const ExpressBrute = require('express-brute');

const PORT = 5001;
const LOGIN = "your_login";
const PASSWORD = "your_password";
const LIVEBOX_IP = "your_livebox_ip";

const KEYS = {
  "0": "512",
  "1": "513",
  "2": "514",
  "3": "515",
  "4": "516",
  "5": "517",
  "6": "518",
  "7": "519",
  "8": "520",
  "9": "521",
  "ok": "352",
  "onoff": "116",
  "VOLplus": "115",
  "VOLmoins": "114",
  "playpause": "164"
};

const SEQ = {
  "onoff": [{ key: KEYS['onoff'], mode: 0}],
  "VOLplus": [{ key: KEYS['VOLplus'], mode: 0}],
  "VOLmoins": [{ key: KEYS['VOLmoins'], mode: 0}],
  "playpause": [{ key: KEYS['playpause'], mode: 0}],
  "ok": [{ key: KEYS['ok'], mode: 0}]
}

// Generation of the channels sequences
for(let i=0; i<=100; i++) {
  const stringNum = i.toString();

  SEQ[i] = stringNum.split("").map(s => ({ key: KEYS[s], mode: 0}));
}

var app = express();
var store = new ExpressBrute.MemoryStore();
var bruteforce = new ExpressBrute(store);

app.use(basicAuth({
  users: { [LOGIN]: PASSWORD },
  challenge: false,
  unauthorizedResponse: function(req) {
    console.log("Bad password call");
  }
}));

app.get('/tv', bruteforce.prevent, function (req, res) {
  const sequence = SEQ[req.query.name];

  if(!sequence) {
    res.write(JSON.stringify({ ok: 0 }));
    return res.end();
  }

  sequence.forEach(element => {
    http.get(`http://${LIVEBOX_IP}/remoteControl/cmd?operation=01&key=${element.key}&mode=${element.mode}`, () => {
    });
  });

  res.write(JSON.stringify({ ok: 1 }));
  return res.end();
});

app.listen(PORT);

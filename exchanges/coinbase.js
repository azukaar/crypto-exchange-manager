const fetch = require('isomorphic-fetch');
const crypto = require('crypto');

const VERSION_DATE = '2017-06-17';
let lastNonce = 0;

module.exports = class {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  getPairs() {
    return Promise.resolve([
      'BTC_USD',
      'ETH_USD',
      'LTC_USD',
      'BTC_EUR',
      'ETH_EUR',
      'LTC_EUR',
    ]);
  }
  
  tick(pair) {
    const currencyPair = pair.replace('_', '-');
    let spot;
    let buy;
    let sell;

    return fetch(`https://api.coinbase.com/v2/prices/${currencyPair}/spot`, { headers: {'CB-VERSION': VERSION_DATE}})
      .then((res) => {
        return res.json();
      })
      .then((spotRes) => {
        if (spotRes.errors) {
          error = spotRes.errors.id;
        }
        spot = spotRes.data;
        return fetch(`https://api.coinbase.com/v2/prices/${currencyPair}/buy`, { headers: {'CB-VERSION': VERSION_DATE}});
      })
      .then((res) => {
        return res.json();
      })
      .then((buyRes) => {
        buy = buyRes.data;
        return fetch(`https://api.coinbase.com/v2/prices/${currencyPair}/sell`, { headers: {'CB-VERSION': VERSION_DATE}});
      })
      .then((res) => {
        return res.json();
      })
      .then((sellRes) => {
        sell = sellRes.data;
        return {
          last: spot.amount,
          ask: buy.amount,
          bid: sell.amount,
          low: spot.amount,
          high: spot.amount,
          vol: '0',
          timestamp: ''+(new Date()).getTime(),
          exchange: 'coinbase',
          pair: pair,

          rawData: { spot, buy, sell },
        };
      })
      .catch((err) => {
        return 'invalid currency pair';
      });
  }

  getWallet() {
    return this.authReq('GET', '/user');
  }

  authReq(method, uri, body = {}) {
    if(this.apiKey) {
      let host = "https://coinbase.com/api/v1";
      let nonce = Date.parse(new Date());
      if (lastNonce === 0) lastNonce = nonce - 1;
      if (lastNonce >= nonce) nonce = lastNonce + 2;
      lastNonce = nonce;

      let opts = {
          method: method,
          uri:    host + uri,
          headers: {
              "User-Agent": "node-coinbase-api",
              "ACCESS_NONCE": nonce
          }
      };

      opts["headers"]["ACCESS_KEY"] = this.apiKey.key;

      if (body) {
          opts.headers["Content-Type"] = "application/json";
          opts["body"] = JSON.stringify(body);
      }


      let hmac = crypto.createHmac("sha256", this.apiKey.secret);
      let signature = nonce + opts.uri + (body ? JSON.stringify(body) : "");

      opts["headers"]["ACCESS_SIGNATURE"] = hmac.update(signature).digest("hex");

      return fetch(opts.uri, opts)
        .then(res => {
          console.log(res)
          return res.json()
        })
    }
  }
}
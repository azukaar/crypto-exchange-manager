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
    return this.authReq('GET', 'accounts')
      .then(result => {
        result = result.map(r => {
          r.wallet = r.balance.amount;
          delete r.balance;
          delete r.resource_path;
          delete r.resource;
          delete r.primary;
          delete r.native_balance;
          delete r.created_at;
          return r;
        });
        return result;
      })
  }

  getBook() {
    return this.getWallet().then(tab => Promise.all(tab.map(r => {
      return this.authReq('GET', `accounts/${r.id}/transactions`);
    }))).then(result => {
      const finalResult = [];
      
      result.map(account => {
        account.map(r => {
          finalResult.push({
            value:  r.amount.amount,
            completed:  r.completed,
            currency:  r.amount.currency,
            timestamp:  r.updated_at
          });
        })
      });

      return finalResult;
    });
  }

  authReq(method, uri, body) {
    if(this.apiKey) {
      let host = "https://api.coinbase.com/v2/";
      let nonce = Math.floor(Date.now() / 1000);;

      let opts = {
          method: method,
          uri:    host + uri,
          headers: {
              "CB-ACCESS-TIMESTAMP": nonce,
              'CB-VERSION': '2016-02-18'
          }
      };

      opts["headers"]["CB-ACCESS-KEY"] = this.apiKey.key;

      let bodyStr = body ? JSON.stringify(body) : '';

      if (body) {
          opts.headers["Content-Type"] = "application/json";
          opts["body"] = bodyStr;
      }


      let hmac = crypto.createHmac("sha256", this.apiKey.secret);
      let signature = nonce + opts.method + '/v2/' + uri + bodyStr;

      opts["headers"]["CB-ACCESS-SIGN"] = hmac.update(signature).digest("hex");

      return fetch(opts.uri, opts)
        .then(res => {
          return res.json(); 
        }).then( (r) => {
          return r.data;
        })
    }
  }
}
const fetch = require('isomorphic-fetch');
const crypto = require('crypto');

module.exports = class {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  getPairs() {
    return fetch('https://api.bitfinex.com/v1/symbols')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        return res.map((currencyPair) => {
          let pair = currencyPair.toUpperCase();
          return pair.slice(0, -3) + '_' + pair.substr(pair.length - 3)
        })
      })
      .catch((err) => {
        console.error('Error fetching bitfinex pairs:', err);
      });
  }
  
  tick(pair) {
    const currencyPair = pair.replace('_', '');
    return fetch(`https://api.bitfinex.com/v1/pubticker/${currencyPair}`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        const { ask, bid, last_price, low, high, volume, timestamp, message } = res;

        return {
          last: last_price,
          ask,
          bid,
          low,
          high,
          vol: volume,
          timestamp,
          exchange: 'bitfinex',
          pair,
          rawData: res,
        };
      })
      .catch((err) => {
        return 'invalid currency pair';
      });
  }

  getWallet() {
    return this.authReq('v2/auth/r/wallets')
      .then(res => {
        return res.map(p => ({
          currency: p[1],
          wallet: p[2]
        }))
      });
  }

  getExternalMovement(currency) {
    return this.authReq('v2/auth/r/movements/'+currency+'/hist')
      .then(res => {
        return res.map(c => ({
          currency: c[1],
          value: c[12],
          completed: c[9] === 'COMPLETED',
          issued: ''+(c[5] / 1000)
        }));
      })
  }

  authReq(path, body = {}) {
    if(this.apiKey) {
      const apiPath = path;
      const nonce = Date.now().toString()
      let signature = `/api/${apiPath}${nonce}${JSON.stringify(body)}`

      signature = crypto
        .createHmac('sha384', this.apiKey.secret)
        .update(signature)
        .digest('hex')

      
      const headers = new Headers({
        'bfx-nonce': nonce,
        'bfx-apikey': this.apiKey.key,
        'bfx-signature': signature,
        'Content-Type': 'application/json'
      });

      const request = { method: 'POST',
                        headers,
                        body: JSON.stringify(body)
                      };

      return fetch(`https://api.bitfinex.com/${apiPath}`, request)
        .then(res => {
          return res.json()
        })
    }
  }
}
const fetch = require('isomorphic-fetch');
const crypto = require('crypto');
const {convertToUSDIfPossible} = require('../utils');

const wait = (...args) => new Promise((resolve, reject) => {
  setTimeout( () => resolve(...args), 1000)
});

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
    return wait()
      .then(() => this.authReq('v2/auth/r/wallets'))
      .then(res => {
          return res.map(p => ({
            currency: p[1],
            wallet: p[2]
          }))
      });
  }

  getBook() {
    let finalResult = [];
    let finalResultConverted = [];
    return this.getWallet().then(tab => Promise.all(tab.map(r => {
      return wait()
        .then(() => {
          return this.authReq('v2/auth/r/movements/'+r.currency+'/hist')
        })
        .then(res => {
          return res.map(c => {
            return ({
              currency: c[1],
              value: c[12],
              completed: c[9] === 'COMPLETED',
              timestamp: ''+(c[5] / 1000)
            });
          });
        })
        .then((res) => {
            return Promise.all(res.map(r => {
                const oldR = Object.assign({}, r);
                return convertToUSDIfPossible(r).then(newR => {
                  oldR.nativeCurrency = newR.currency;
                  oldR.nativeValue = newR.value;
                  finalResultConverted.push(oldR);
                })
            }))
        })
    })))
    .then(() => {
      return finalResultConverted;
    });
  }

  authReq(path, body = {}, retry = 0) {
    if(this.apiKey) {
      const apiPath = path;
      const nonce = ''+((new Date()).getTime() * 1000 + 2000)
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
        .then(res => {
          if(res[0] === 'error') {
            console.error('Error while retrieving BitFinex result. retrying...')
            if(retry < 3)
              return wait().then(() => this.authReq(path, body, retry + 1))
            else {
              console.error('Error while retrieving BitFinex result. To many retry. Abort.')
              return [];
            }
          } 
          else {
            return res;
          }
        })
    }
  }
}
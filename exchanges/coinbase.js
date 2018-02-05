const fetch = require('isomorphic-fetch');

const VERSION_DATE = '2017-06-17';

module.exports = class {
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
}
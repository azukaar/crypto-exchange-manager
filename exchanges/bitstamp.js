const fetch = require('isomorphic-fetch');

module.exports = class {
  getPairs() {
    return Promise.resolve([
      "BTC_USD",
      "BTC_EUR",
      "EUR_USD",
      "XRP_USD",
      "XRP_EUR",
      "XRP_BTC",
      "LTC_USD",
      "LTC_EUR",
      "LTC_BTC",
    ]);
  }
  
  tick(pair) {
    const currencyPair = pair.replace('_', '').toLowerCase();
    return fetch(`https://www.bitstamp.net/api/v2/ticker/${currencyPair}`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        const { bid, ask, last, low, high, volume, timestamp } = res;
        return {
          last,
          ask,
          bid,
          low,
          high,
          vol: volume,
          timestamp,
          exchange: 'bitstamp',
          pair,
          rawData: res,
        };
      })
      .catch((err) => {
        return 'invalid currency pair';
      });
  }
}

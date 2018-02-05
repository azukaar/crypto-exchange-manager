const fetch = require('isomorphic-fetch');

module.exports = class {
  getPairs() {
    return Promise.resolve([
      "BTC_USD",
      "BTC_EUR",
      "BTC_GBP",
      "BTC_CNY",
      "ETH_USD",
      "ETH_EUR",
      "ETH_GBP",
      "ETH_CNY",
    ]);
  }
  
  tick(pair) {
    const currencyPair = pair.replace('_', '');
    return fetch(`https://apiv2.bitcoinaverage.com/indices/global/ticker/${currencyPair}`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        const { bid, ask, last, low, high, timestamp } = res;
        return {
          last: last.toString(),
          ask: ask.toString(),
          bid: bid.toString(),
          low: low.toString(),
          high: high.toString(),
          vol: '0',
          timestamp: ''+timestamp,
          exchange: 'bitcoinaverage',
          pair,
          rawData: res,
        };
      })
      .catch((err) => {
        return 'invalid currency pair';
      });
  }
}

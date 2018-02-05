const fetch = require('isomorphic-fetch');

module.exports = class {
  getPairs() {
    return Promise.resolve([
      'BTC_USD',
      'LTC_USD',
      'ETH_USD',
    ]);
  }
  
  tick(pair) {
    pair = pair.toLowerCase();
    return fetch(`https://www.okcoin.com/api/v1/ticker.do?symbol=${pair}`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (pair !== 'btc_usd' && pair !== 'ltc_usd' && pair !== 'eth_usd') {
          return 'invalid currency pair';
        }
        const { date, ticker } = res;
        const { sell, buy, last, low, high, vol } = ticker;
        return {
          last,
          ask: buy,
          bid: sell,
          low,
          high,
          vol,
          timestamp: date,
          exchange: 'okcoin',
          pair: pair.toUpperCase(),
          rawData: res,
        };
      })
      .catch(err => console.error('bittrex api error:', err));
  }
}

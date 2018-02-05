const fetch = require('isomorphic-fetch');

module.exports = class {
  getPairs() {
    return fetch('https://api.binance.com/api/v3/ticker/price')
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      return res.map((currencyPair) => {
        let pair = currencyPair.symbol.toUpperCase();
        return pair.slice(0, -3) + '_' + pair.substr(pair.length - 3)
      })
    })
    .catch((err) => {
      console.error('Error fetching binance pairs:', err);
    });
  }

  tick(pair) {
  const currencyPair = pair.replace('_', '');
  return fetch(`https://api.binance.com/api/v1/ticker/24hr?symbol=${currencyPair}`)
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      const { askPrice, bidPrice, lastPrice, lowPrice, highPrice, volume, timestamp, message } = res;

      return {
        last: lastPrice,
        ask: askPrice,
        bid: bidPrice,
        low: lowPrice,
        high: highPrice,
        vol: volume,
        timestamp: ''+(new Date()).getTime(),
        exchange: 'binance',
        pair,
        rawData: res,
      };
    })
    .catch((err) => {
      return 'invalid currency pair';
    });
  }
}

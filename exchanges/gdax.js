const fetch = require('isomorphic-fetch');

module.exports = class {
  getPairs() {
    return fetch('https://api.gdax.com/products/')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        return res.map((product) => (
          product.id.replace('-', '_')
        ))
      })
      .catch((err) => {
        console.error('Error fetching gdax pairs:', err);
      });
  }
  
  tick(pair) {
    const currencyPair = pair.replace('_', '-');

    return fetch(`https://api.gdax.com/products/${currencyPair}/ticker`)
    .then((res) => {
      return res.json();
    })
    .then( tickerResponse => {
      return fetch(`https://api.gdax.com/products/${currencyPair}/stats`)
      .then((res) => {
        return res.json();
      })
      .then( statsResponse => {
        const raw = Object.assign({}, tickerResponse, statsResponse)
        const { price, size, bid, ask, time, high, low, volume } = raw
        const timestamp = ''+(new Date()).getTime();

        return {
          last: price,
          ask,
          bid,
          low,
          high,
          vol: volume,
          timestamp,
          exchange: 'gdax',
          pair,
          rawData: raw,
        }
      })
    })
    .catch((err) => {
      return 'invalid currency pair';
    });
  }
}

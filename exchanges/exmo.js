const fetch = require('isomorphic-fetch');

module.exports = class {
  getPairs() {
    return fetch('https://api.exmo.com/v1/ticker/')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        return Object.keys(res)
      })
      .catch((err) => {
        console.error('Error fetching exmo pairs:', err);
      });
  }
  
  tick(pair) {
    return fetch('https://api.exmo.com/v1/ticker/')    
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        const data = res[pair];
        if (!data) {
          return 'invalid currency pair';
        }
        const { last_trade, low, high, vol, updated, buy_price, sell_price } = data;

        return {
          ask: buy_price,
          bid: sell_price,
          last: last_trade,
          low,
          high,
          vol,
          timestamp: ''+updated,
          exchange: 'exmo',
          pair,
          rawData: data,
        };
      })
      .catch(err => console.error('exmo api error:', err));
  }
}

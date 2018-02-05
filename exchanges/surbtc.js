const fetch = require('isomorphic-fetch');

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

module.exports = class {
  getPairs() {
    return fetch('https://www.surbtc.com/api/v2/markets', { headers })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        return res.markets.map((item) => {
          return `${item.base_currency}_${item.quote_currency}`;
        })
      })
      .catch((err) => {
        console.error('Error fetching surbtc pairs:', err);
      });
  }
  
  tick(pair) {
    const currencyPair = pair.replace(/_/, '-').toLowerCase();
    return fetch(`https://www.surbtc.com/api/v2/markets/${currencyPair}/ticker`, { headers })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        const data = res.ticker;
        return {
          last: data.last_price[0].toString(),
          ask: data.min_ask[0].toString(),
          bid: data.max_bid[0].toString(),
          low: data.last_price[0].toString(),
          high: data.last_price[0].toString(),
          vol: data.volume[0].toString(),
          timestamp: ''+(new Date()).getTime(),
          exchange: 'surbtc',
          pair,
          rawData: data,
        };
      })
      .catch(err => console.error('surbtc api error:', err));
  }
}

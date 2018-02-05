const fetch = require('isomorphic-fetch');

module.exports = class {
  getPairs() {
    return fetch('https://bleutrade.com/api/v2/public/getmarkets')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        return res.result.map((market) => {
          return `${market.MarketName}`
        })
      })
      .catch((err) => {
        console.error('Error fetching bleutrade pairs:', err);
      });
  }
  
  tick(pair) {
    return fetch(`https://bleutrade.com/api/v2/public/getmarketsummary?market=${pair}`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.success === 'false') {
          throw 'invalid currency pair';
        }

        const { MarketName, High, Low, Last, Volume, Bid, Ask } = res.result[0];

        return {
          last: Last,
          ask: Ask,
          bid: Bid,
          low: Low,
          high: High,
          vol: Volume,
          timestamp: ''+(new Date()).getTime(),
          exchange: 'bleutrade',
          pair: MarketName,
          rawData: res.result[0]
        };
      })
      .catch((err) => {
        return err;
      });
  }
}

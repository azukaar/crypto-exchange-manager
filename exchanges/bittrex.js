const fetch = require('isomorphic-fetch');

module.exports = class {
  getPairs() {
    return fetch('https://bittrex.com/api/v1.1/public/getmarkets')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        return res.result.map((market) => {
          const { MarketCurrency, BaseCurrency } = market;
          return `${MarketCurrency}_${BaseCurrency}`
        })
      })
      .catch((err) => {
        console.error('Error fetching bittrex pairs:', err);
      });
  }
  
  tick(pair) {
    let currencyPair = pair.replace(/^(.+)_(.+)$/,'$2-$1');

    return fetch(`https://bittrex.com/api/v1.1/public/getmarketsummary?market=${currencyPair}`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.message === 'INVALID_MARKET') {
          return 'invalid currency pair';
        }
        const { Last, Ask, Bid, Volume, High, Low } = res.result[0];
        return {
          last: Last.toString(),
          ask: Ask.toString(),
          bid: Bid.toString(),
          low: Low.toString(),
          high: High.toString(),
          vol: Volume.toString(),
          timestamp: ''+(new Date()).getTime(),
          exchange: 'bittrex',
          pair,
          rawData: res.result[0],
        };
      })
      .catch(err => console.error('bittrex api error:', err));
  }
}

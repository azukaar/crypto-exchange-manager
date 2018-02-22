const fetch = require('isomorphic-fetch');

module.exports = class {
  getPairs() {
    return fetch('https://poloniex.com/public?command=returnTicker')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        return Object.keys(res).map((pair) => {
          const [first, second] = pair.split('_');
          return `${second}_${first}`;
        })
      })
      .catch((err) => {
        console.error('Error fetching poloniex pairs:', err);
      });
  }

  tickAtTimestamp(pair, timestamp) {
    const pairArr = pair.split('_');
    const asset1 = pairArr[1] === 'USD' ? 'USDT' : pairArr[1];
    const asset2 = pairArr[0] === 'USD' ? 'USDT' : pairArr[0];
    const formattedPair = asset1 + '_' + asset2;

    return fetch('https://poloniex.com/public?command=returnChartData&currencyPair='+formattedPair+'&start='+timestamp+'&end='+(timestamp+14401)+'&period=14400')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        return res;
      })
    .catch(err => console.error('poloniex error:', err));
  }
  
  tick(pair) {
    const pairArr = pair.split('_');
    const asset1 = pairArr[1] === 'USD' ? 'USDT' : pairArr[1];
    const asset2 = pairArr[0] === 'USD' ? 'USDT' : pairArr[0];

    const formattedPair = asset1 + '_' + asset2;
    return fetch('https://poloniex.com/public?command=returnTicker')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (!res[formattedPair]) {
          return 'invalid currency pair';
        }
        const { last, lowestAsk, highestBid, percentChange, baseVolume, high24hr, low24hr } = res[formattedPair];
        return {
          last,
          ask: lowestAsk,
          bid: highestBid,
          low: low24hr,
          high: high24hr,
          vol: baseVolume,
          timestamp: ''+(new Date()).getTime(),
          exchange: 'poloniex',
          pair,
          rawData: res[formattedPair],
        };
      })
    .catch(err => console.error('poloniex error:', err));
  }
}

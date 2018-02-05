const fetch = require('isomorphic-fetch');
const assetAlts = {
  'XBT': 'BTC',
  'XBT.d': 'BTC.d',
}
const format = (asset) => {
  return assetAlts[asset] || asset;
}
const trimXAndZ = (asset) => {
  let trimmedAsset = asset;
  if (trimmedAsset.length > 3) {
    trimmedAsset = trimmedAsset[0] === 'X' ? trimmedAsset.substr(1) : trimmedAsset;
    const lastChar = trimmedAsset[trimmedAsset.length - 1];
    trimmedAsset = lastChar === 'Z' || lastChar === 'X' ? trimmedAsset.substr(0, trimmedAsset.length-1) : trimmedAsset;
  }
  return format(trimmedAsset);
}


module.exports = class {
  getPairs() {
    return fetch('https://api.kraken.com/0/public/AssetPairs')
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        const pairArr = Object.keys(res.result);
        return pairArr.map((pair) => {
          const first = pair.slice(0, -3);
          const second = pair.includes('.')
            ? pair.substr(pair.length - 5)
            : pair.substr(pair.length - 3);

          return trimXAndZ(first) + '_' + format(second);
        }).filter((pair) => (
          !pair.includes('.')
        ));
      })
      .catch((err) => {
        console.error('Error fetching kraken pairs:', err);
      });
  }
  
  tick(pair) {
    const assetAlts = {
      'BTC': 'XBT',
      'BTC.d': 'XBT.d',
    }
    const [first, second] = pair.split('_');
    const currencyPair = `${(assetAlts[first] || first)}${(assetAlts[second] || second)}`;

    return fetch(`https://api.kraken.com/0/public/Ticker?pair=${currencyPair}`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.error && res.error[0] === 'EQuery:Unknown asset pair') {
          return 'invalid currency pair';
        }
        const data = res.result;
        const { a, b, c, v, l, h } = data[Object.keys(data)[0]];
        return {
          ask: a[0],
          bid: b[0],
          last: c[0],
          vol: v[1],
          low: l[1],
          high: h[1],
          timestamp: ''+(new Date()).getTime(),
          exchange: 'kraken',
          pair,
          rawData: data,
        };
      })
      .catch(err => console.error('kraken api error:', err));
  }
}

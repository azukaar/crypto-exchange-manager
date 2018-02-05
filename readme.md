[![CircleCI](https://circleci.com/gh/azukaar/crypto-manager.svg?style=svg)](https://circleci.com/gh/azukaar/crypto-manager)

# crypto-manager

Client for multiple exchanges, supporting tickers informations, as well as additional features as I implement them. 

If you only need tickers (different currencies' values) you can use https://github.com/donbobvanbirt/coin-ticker which is dedicated to ticks information. crypto-manager was first a rewrite of this package so give the original module some love ;)

## Install

```bash
$ npm install crypto-manager
```

## Usage
**Require:**
```js
const cryptoManager = require('crypto-manager'); // return an array of available exchanges
```

**Get available asset pairs by exchange:**

Use the (always implemented) getPairs() method

```js
const cryptoManager = require('crypto-manager');
const polynex = cryptoManager['polynex'];

polynex.getPairs()
  .then((pairs) => {
    console.log(pairs);
  })
// =>
// [
//   'BCN_BTC',
//   'BELA_BTC',
//   ...
// ]
```

**Get Ticker Data:**

Use the (always implemented) tick() method

```js
const cryptoManager = require('crypto-manager');
const polynex = cryptoManager['polynex'];

polynex.tick('BCN_BTC')
  .then((tick) => {
    console.log(tick); // {...}
  })
```

Will return an object containing the following values (all values are string) :

```js
{
  last: // the last traded price
  ask:  // current ask
  bid: // current bid
  low: // 24 hour low
  high: // 24 hour high
  vol: // 24 hour volume
  timestamp: // precise time
  exchange: // the current exchange, i.e. 'bitfinex'
  pair: // the asset pair, i.e. 'BTC_USD'
  rawData: // the original, unformatted object received from the exchange api. Differs by exchange.
}
```

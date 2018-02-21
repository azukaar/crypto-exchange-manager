[![CircleCI](https://circleci.com/gh/azukaar/crypto-exchange-manager.svg?style=svg)](https://circleci.com/gh/azukaar/crypto-exchange-manager)

# crypto-exchange-manager

[![NPM](https://nodei.co/npm/crypto-exchange-manager.png)](https://npmjs.org/package/crypto-exchange-manager)

Client for multiple exchanges, supporting tickers informations, as well as additio features as I implement them. 

If you only need tickers (different currencies' values) you can use https://github.com/donbobvanbirt/coin-ticker which is dedicated to ticks information. crypto-manager was first a rewrite of this package so give the original module some love ;)

## Install

```bash
$ npm install crypto-exchange-manager
```

## Usage
**Require:**
```js
const cryptoManager = require('crypto-exchange-manager'); // return an array of available exchanges
```

**Get available asset pairs by exchange:**

Use the (always implemented) getPairs() method

```js
const cryptoManager = require('crypto-exchange-manager');
const polynex = new cryptoManager['polynex']();

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
const cryptoManager = require('crypto-exchange-manager');
const polynex = new cryptoManager['polynex']();

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

**Authenticate user**

```
Currently supported : 
  - bifinex
  - coinbase  
```

```js
const cryptoManager = require('crypto-exchange-manager');
const bifinex = new cryptoManager['bifinex']({
  key: '123',
  secret: '123'
});
```

**get wallet**

```
Currently supported : 
  - bifinex
  - coinbase
```

```js
const cryptoManager = require('crypto-exchange-manager');
const bifinex = new cryptoManager['bifinex']({
  key: '123',
  secret: '123'
});

bifinex.getWallet().then(result => {
  console.log(result);
})
```

Will return an array of currencies with their value in the wallet.

```
[
  {currency: 'ETH', wallet: '1.8'}
]
```

**get wallet**

```
Currently supported : 
  - bifinex
```

```js
const cryptoManager = require('crypto-exchange-manager');
const bifinex = new cryptoManager['bifinex']({
  key: '123',
  secret: '123'
});

bifinex.getBook().then(result => {
  console.log(result);
})
```

Will return an array of movement in / out of the account of the user for a specific currency.

```
[
  {currency: 'ETH', value: '1.8', completed: true, timestamp: '154787488'}
]
```
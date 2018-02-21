const cryptoManager = require('../index.js');

const apiKeys = {
    'exchange' : { key : 'key', secret : 'secret'}
};


test('Should return array of all available exchanges', () => {
  expect(cryptoManager).toHaveProperty('binance');
});

for (const Exchange in cryptoManager) {
  test(Exchange+' Should return the wallet of the user if available', () => {
      const exchange = new cryptoManager[Exchange](apiKeys[Exchange]);
      if(apiKeys[Exchange] && apiKeys[Exchange].key && exchange.getWallet) {
        return exchange.getWallet().then(result => {
          expect(Array.isArray(result)).toBe(true);
        });
      }
  });
}

for (const Exchange in cryptoManager) {
  test(Exchange+' Should return the book of the user if available', () => {
      const exchange = new cryptoManager[Exchange](apiKeys[Exchange]);
      if(apiKeys[Exchange] && apiKeys[Exchange].key && exchange.getBook) {
        return exchange.getBook().then(result => {
            expect(Array.isArray(result)).toBe(true);
        });
      }
  });
}

const cryptoManager = require('../index.js');
const cachedPair = [];

test('Should return array of all available exchanges', () => {
  expect(cryptoManager).toHaveProperty('bittrex');
});

for (const Exchange in cryptoManager) {
  test(Exchange+' Should return array of all available pairs', () => {
      const exchange = new cryptoManager[Exchange]();
      return exchange.getPairs().then(result => {
        cachedPair[Exchange] = result[0];
        expect(result.length).toBeGreaterThan(0);
      });
  });
}

for (const Exchange in cryptoManager) {
  test(Exchange+' Should allow ticking a pair', () => {
      const exchange = new cryptoManager[Exchange]();
      return exchange.tick(cachedPair[Exchange]).then(result => {
        expect(result).toEqual(expect.objectContaining({
          last: expect.any(String),
          ask: expect.any(String),
          bid: expect.any(String),
          low: expect.any(String),
          high: expect.any(String),
          vol: expect.any(String),
          timestamp: expect.any(String),
          exchange: expect.any(String),
          pair: expect.any(String),
          rawData: expect.anything(),
        }));
      });
  });
}
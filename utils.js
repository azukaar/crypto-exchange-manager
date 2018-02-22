module.exports ={
    convertToUSDIfPossible(value) {
        if(['ETH', 'BTC'].indexOf(value.currency) > -1) {
            const Poloniex = require('./exchanges/poloniex');
            const poloniex = new Poloniex();
            if(value.timestamp) {
                return poloniex.tickAtTimestamp(value.currency+'_USD', parseInt(value.timestamp)).then(tick => {
                    value.value = value.value * tick[0].high;
                    value.currency = 'USD';
                    return value
                });
            }
            else {
                const Bitfinex = require('./exchanges/bitfinex');
                const bitfinex = new Bitfinex();
                return bitfinex.tick(value.currency+'_USD').then( tick => {
                    value.value = value.value * tick.last;
                    value.currency = 'USD';
                    return value;
                });
            }
        }
        else return value;
    }
}
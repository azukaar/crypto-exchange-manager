const Poloniex = require('./exchanges/poloniex');
const poloniex = new Poloniex();

module.exports ={
    convertToUSDIfPossible(value) {
        if(['ETH', 'LTC', 'BTC'].indexOf(value.currency) > -1) {
            if(value.timestamp) {
                return poloniex.tickAtTimestamp(value.currency+'_USD', parseInt(value.timestamp)).then(tick => {
                    value.value = value.value * tick[0].high;
                    value.currency = 'USD';
                    return value;
                });
            }
            else {
                return poloniex.tick(value.currency+'_USD').then( tick => {
                    value.value = value.value * tick.last;
                    value.currency = 'USD';
                    return value;
                });
            }
        }
        else return value;
    }
}
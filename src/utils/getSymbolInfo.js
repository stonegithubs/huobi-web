/**
 * 获取价格 小数位
 * @param {string}
 * @param {Object} symbol 
 */
const getSymbolInfo = function (symbol) {
    if(!symbol) {
        throw Error(`param error`);
    }
    let _symbols = [];
    if (localStorage.symbols !== undefined) {
        _symbols = JSON.parse(localStorage.symbols);
    }
    let info = {
        'price-precision': 4,
        'amount-precision': 4,
    };
    _symbols.some((item) => {
        // base-currency:"yee"
        // price-precision:8
        // quote-currency:"eth"
        if (
            symbol.startsWith(item['base-currency']) 
            && symbol.endsWith(item['quote-currency'])
        ) {
            info['price-precision'] = item['price-precision'];
            info['amount-precision'] = item['amount-precision'];
            info['base-currency'] = item['base-currency'];
            info['quote-currency'] = item['quote-currency'];
            return true;
        }
        return false;
    });
    return info;
}
module.exports = getSymbolInfo;
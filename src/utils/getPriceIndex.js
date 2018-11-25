

/**
 * 获取btc eth对usdt的系数
 * @param {string} symbol
 * @return {number}
 */
const getPriceIndex = function (symbol) {
    // btc eth交易对转美元
    let _temp = {
        usdt: 0.97,
        btc: appConfig.prices.btc,
        eth: appConfig.prices.eth,
        husd: 1,
    }
    let _price;
    for (let key in _temp) {
        if (symbol.endsWith(key)) {
            _price = _temp[key];
            break;
        }
    }
    return _price;
}

export default getPriceIndex;
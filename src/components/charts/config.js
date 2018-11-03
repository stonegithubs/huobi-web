

let colorMap = {
    'bids_max_1': '#006633',
    'asks_max_1': '#990000',
    'buy_1': '#03C087',
    'sell_1': '#EF5555',
};
let tradeColor = [colorMap.buy_1, colorMap.sell_1];

const usdtFormatter = function formatter(val) {
    return  `${(val / 10000)}万usdt (${parseInt(val / appConfig.prices.btc)}฿)`;
}
export {
    color,
    tradeColor,
    colorMap,
    usdtFormatter
};
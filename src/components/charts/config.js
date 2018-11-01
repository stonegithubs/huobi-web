
let tradeColor = ['#03C087', '#EF5555'];

let color = ['#006633', '#990000', tradeColor[0], tradeColor[1], '#3399FF',]

const usdtFormatter = function formatter(val) {
    return  `${(val / 10000)}万usdt (${parseInt(val / appConfig.price.eth)}฿)`;
}
export {
    color,
    tradeColor,
    usdtFormatter
};
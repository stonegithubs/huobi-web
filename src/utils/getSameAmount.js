
// 价格精度
let pricePrecision = 0;
let config = {
  pricePrecision: 0,
  sortBy: 'sumMoneny',
}
/**
 * 
 * @param {Object} newConfig 
 */
export function setConfig (newConfig) {
  Object.assign(config, newConfig);
}
/**
 * 合并相同的价格统计次数并排序
 * @param {Array<Array<number>>} data
 */
const getSameAmount = function (data, {
  minSumPrice = 100,
  minPrice = 500,
  type = '',
} = {}) {
  // data = data.slice(0, 400)
  let countTemp = {};
  for (let i = 0; i < data.length; i++) {
    let count = data[i][1];

    if (countTemp[count] === undefined) {
      countTemp[count] = {};
      countTemp[count].count = 1;
      countTemp[count].prices = [data[i][0]];
      continue;
    }
    countTemp[count].count += 1;
    countTemp[count].prices.push(data[i][0]);
  }
  let arr = [];
  for (let key in countTemp) {
    let prices = countTemp[key].prices;
    let price = 0;
    if (prices.length === 1) {
      price = countTemp[key].prices[0];
    } else {
      price = prices.reduce((accumulator, item) => accumulator + item) / prices.length;
    }
    // 同数量出现 的次数
    let count = countTemp[key].count;
    // 总量 = 次数 * 单个挂单量
    let sum = count * key;
    // 总价
    let sumPrice = sum * price;

    if ((count > 1 && sumPrice > minSumPrice) || (key * price > minPrice)) {
      let data = {
        'count': count,
        'amount': Number(key).toFixed(2),
        sumCount: sum.toFixed(2),
        sumMoneny: sumPrice.toFixed(1),
        price: price.toFixed(config.pricePrecision),
        prices: countTemp[key].prices,
      }
      arr.push(data);
    }
  }
  if (type === 'asks' && config.sortBy === 'price') {
    return arr.sort(function (a, b) {
      return a[config.sortBy] - b[config.sortBy]
    });
  }
  return arr.sort(function (a, b) {
    return b[config.sortBy] - a[config.sortBy]
  });
}
getSameAmount.setConfig = setConfig;
export default getSameAmount;

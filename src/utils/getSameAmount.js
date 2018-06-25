
/**
 * 合并相同的价格统计次数并排序
 * @param {Array<Array<number>>} data
 */
const getSameAmount = function (data, {
  minSumPrice = 100,
  minPrice = 500,
} = {}) {
  // data = data.slice(0, 400)
  let countTemp = {};
  for (let i = 0; i < data.length; i++) {
    let count = data[i][1];

    if (countTemp[count] === undefined) {
      countTemp[count] = {};
      countTemp[count].count = 1;
      countTemp[count].price = data[i][0];
      continue;
    }
    countTemp[count].count += 1;
  }
  let arr = [];
  for (let key in countTemp) {
    let price = countTemp[key].price;
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
      }
      if (count === 1) {
        data.price = countTemp[key].price
      }
      arr.push(data);
    }
    // if ((count > 1 && sumPrice > 100) || (key * price > 2000)) {
    //   let data = {
    //     'count': count,
    //     'amount': Number(key).toFixed(2),
    //     sumCount: sum.toFixed(2),
    //     sumMoneny: (sumPrice | 0),
    //   }
    //   if (count === 1) {
    //     data.price = countTemp[key].price
    //   }
    //   arr.push(data);
    // }
  }
  return arr.sort(function (a, b) {
    return b.sumMoneny - a.sumMoneny
  });
}

export default getSameAmount;

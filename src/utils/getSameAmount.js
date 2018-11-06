
const getSymbolInfo = require('./getSymbolInfo');

let config = {
	sortBy: 'sumMoneny',
	// 有多单时， 总和超过最小价，低于则不显示
	minSumPrice: 200,
	// 1单时， 总和超过最小价，低于则不显示
	minPrice: 1000,
}
/**
 * 
 * @param {Object} newConfig 
 */
export function setConfig(newConfig) {
	Object.assign(config, newConfig);
}
/**
 * 合并相同的价格统计次数并排序
 * @param {Array<Array<number>>} data
 */
const getSameAmount = function (data, {
	type = '',
	symbol = '',
	sortBy = config.sortBy
} = {}) {
	// data = data.slice(0, 400)
	let countTemp = {};
	// 拿价格，量的小数位
	let symbolInfo = getSymbolInfo(symbol);
	let amountPrecision = symbolInfo['amount-precision'];
	let pricePrecision = symbolInfo['price-precision'];
	// 统计重复次数
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
		// 多个重复则取个平均数
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
		let sumDollar = sumPrice;

		// 转换成美元价格
		if (symbol.endsWith('btc')) {
			sumDollar = sumPrice * appConfig.prices.btc;
		} else if (symbol.endsWith('eth')) {
			sumDollar = sumPrice * appConfig.prices.eth;
		}
		if ((count > 1 && sumDollar > config.minSumPrice) || (sumDollar > config.minPrice)) {
			let data = {
				'count': count,
				'amount': Number(key).toFixed(amountPrecision), // 量
				sumCount: sum.toFixed(amountPrecision),
				sumMoneny: sumPrice.toFixed(2),
				sumDollar: sumDollar.toFixed(2),
				price: price.toFixed(pricePrecision),
				prices: countTemp[key].prices,
			}
			arr.push(data);
		}
	}
	if (type === 'asks' && sortBy === 'price') {
		return arr.sort(function (a, b) {
			return a[sortBy] - b[sortBy]
		});
	}
	return arr.sort(function (a, b) {
		return b[sortBy] - a[sortBy]
	});
}
getSameAmount.setConfig = setConfig;
export default getSameAmount;

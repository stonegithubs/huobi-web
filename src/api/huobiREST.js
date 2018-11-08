import Qs from 'qs';
import http, { post, get } from './http';
import appConfig from '../config';

/**
 * 
 * @param {string} symbol 交易对
 * @param {string} period 1min, 5min, 15min, 30min, 60min, 1day, 1mon, 1week, 1year
 * @param {?integer} size 获取数量
 * @return {Promise}
 */
export function getKLine(symbol, period, size) {
  const url = appConfig.hosts.api + '/api/huobi/v1/get_kline?' + Qs.stringify({
    symbol,
    period,
    size,
  });
  return get(url);
}
/**
 * 获取深度
 * @param {string} symbol 交易对
 * @param {type} step0, step1, step2, step3, step4, step5（合并深度0-5）；step0时，不合并深度
 * @return {Promise}
 */
export function getDepth (symbol, type) {
  const url = appConfig.hosts.api + '/api/huobi/v1/market/depth?' + Qs.stringify({
    symbol,
    type,
    AccessKeyId: '2f0f54a2-8e5d9137-982b01e1-5789d'
  });
  return get(url).then((data) => data.data);;
}
/**
 * 获取聚合行情(Ticker)
 * @param {string} symbol 交易对
 * @return {Promise}
 */
export function getDetailMerged (symbol) {
  const url = appConfig.hosts.api_huobi + '/market/detail/merged?' + Qs.stringify({
    symbol,
  });
  return get(url);
}

/**
 * 获取symbols
 * @return {Promise}
 */
export async function getSymbols () {
  const url =  appConfig.hosts.api_huobi + '/v1/common/symbols';
  if (localStorage.symbols !== undefined) {
    return JSON.parse(localStorage.symbols);
  }
  return get(url).then(data => {
    // 做缓存
    localStorage.symbols = JSON.stringify(data.data);
    return data.data;
  });
}

/**
 * 
 * @param {string} symbol 
 * @param {string} quoteCurrency
 */
export const getSymbolInfo = async function (symbol, quoteCurrency) {
  let precisionData = await getSymbols();
  let pricePrecision = 0;
  let amountPrecision = 0;
  precisionData.some((item) => {
      // base-currency:"yee"
      // price-precision:8
      // quote-currency:"eth"
      if (item['base-currency'] === symbol && item['quote-currency'] === quoteCurrency) {
          pricePrecision = item['price-precision'];
          amountPrecision = item['amount-precision'];
          return true;
      }
      return false;
  });
  return {
    pricePrecision,
    amountPrecision
  }
}
/**
 * 买币
 * @interface {
 *  symbol: string,
 *  amount: string,
 *  price?: string,
 *  type: string,
 *  action: 'buy' || 'sell';
 * }
 * @return {Promise}
 */
export function limit (params) {
  const url = appConfig.hosts.api + '/api/huobi/v1/limit';
  return post(url, params);
}
/**
 * 取消订单
 * @interface {
 *  orderId: string,
 * }
 * @return {Promise}
 */
export function cancelOrder (orderId) {
  const url = appConfig.hosts.api + '/api/huobi/v1/cancelOrder';
  return post(url, {orderId});
}
/**
 * 未成交的订单
 * @interface {
 *  symbol: string,
 *  side?: string, // “buy”或者“sell”
 *  size?: int, // default == 20
 * }
 * @return {Promise}
 */
export function getOpenOrders (params) {
  const url = appConfig.hosts.api + '/api/huobi/v1/openOrders?' + Qs.stringify(params);;
  return get(url);
}


/**
 * 查余额
 * @return {Promise}
 */
export function getBalance () {
  const url = appConfig.hosts.api + '/api/huobi/v1/get_balance';
  return get(url).then((data) => data.data);
}

/**
 * 查订单
 * @interface {
 *  orderId: string,
 * }
 * @return {Promise}
 */
export function getOrder (orderId) {
  const url = appConfig.hosts.api + '/api/huobi/v1/get_order?orderId=' + orderId;
  return get(url);
}
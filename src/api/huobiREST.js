import Qs from 'qs';
import http from './http';
import config from '../config';

/**
 * 
 * @param {string} symbol 交易对
 * @param {string} period 1min, 5min, 15min, 30min, 60min, 1day, 1mon, 1week, 1year
 * @param {?integer} size 获取数量
 * @return {Object}
 */
export async function getKLine(symbol, period, size) {
  const url = '/market/history/kline?' + Qs.stringify({
    symbol,
    period,
    size,
  });
  try {
    const result = await http.get(
      url,
    );
    if (result.status === 200) {
      return result.data;
    }
    const err = {
      tip: 'error',
      response: result,
      data: {},
      url,
    };
    throw err;
  } catch (err) {
    throw err;
  }
}
/**
 * 获取深度
 * @param {string} symbol 交易对
 * @param {type} step0, step1, step2, step3, step4, step5（合并深度0-5）；step0时，不合并深度
 * @return {Array}
 */
export async function getDepth (symbol, type) {
  const url = '/market/depth?' + Qs.stringify({
    symbol,
    type,
  });;
  try {
    const result = await http.get(
      url,
    );
    if (result.status === 200 && result.data.status === 'ok') {
      return result.data;
    }
    const err = {
      tip: 'error',
      response: result,
      data: {},
      url,
    };
    throw err;
  } catch (err) {
    throw err;
  }
}
/**
 * 获取聚合行情(Ticker)
 * @param {string} symbol 交易对
 * @return {Object}
 */
export async function getDetailMerged (symbol) {
  const url = '/market/detail/merged?' + Qs.stringify({
    symbol,
  });
  try {
    const result = await http.get(
      url,
    );
    if (result.status === 200) {
      return result.data;
    }
    const err = {
      tip: 'error',
      response: result,
      data: {},
      url,
    };
    throw err;
  } catch (err) {
    throw err;
  }
}

/**
 * 获取symbols
 * @return {Array}
 */
export async function getSymbols () {
  const url = '/v1/common/symbols';
  if (localStorage.symbols !== undefined) {
    return JSON.parse(localStorage.symbols);
  }
  try {
    const result = await http.get(
      url,
    );
    if (result.status === 200 && result.data.status === 'ok') {
      // 做缓存
      localStorage.symbols = JSON.stringify(result.data.data);
      return result.data.data;
    }
    const err = {
      tip: 'error',
      response: result,
      data: {},
      url,
    };
    throw err;
  } catch (err) {
    throw err;
  }
}

/**
 * 买币
 * @interface {
 *  symbol: string,
 *  amount: string,
 *  price?: string,
 *  type: string,
 * }
 * @return {Array}
 */
export async function buyLimit (params) {
  const url = config.API_HOST + '/api/v1/buy_limit';
  try {
    const result = await http.post(
      url,
      params
    );
    if (result.status === 200 && result.data.status === 'ok') {
      return result.data;
    }
    const err = {
      tip: 'error',
      response: result,
      data: {},
      url,
    };
    throw err;
  } catch (err) {
    throw err;
  }
}
import Qs from 'qs';
import http, { post, get } from './http';
import appConfig from '../config';


/**
 * 获取压力位(单位以量体现)
 * @param {string} symbol 交易对
 * @return {Promise}
 */
export function getAmountChartData(symbol) {
    const url = appConfig.hosts.api + '/api/chart/amount?' + Qs.stringify({
        symbol,
    });
    return get(url);
}

/**
 * 获取压力位(单位以量体现)
 * @param {string} symbol 交易对
 * @return {Promise}
 */
export function getTradeData(symbol) {
    const url = appConfig.hosts.api + '/api/chart/trade?' + Qs.stringify({
        symbol,
    });
    return get(url);
}
/**
 * 获取压力位(单位以量体现)
 * @param {string} symbol 交易对
 * @return {Promise}
 */
export function getWatchSymbols(symbol) {
    const url = appConfig.hosts.api + '/api/chart/watchSymbols';
    return get(url);
}
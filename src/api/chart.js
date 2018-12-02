import Qs from 'qs';
import http, { POST, GET } from './http';
import appConfig from '../config';


/**
 * 获取压力位(单位以量体现)
 * @param {string} symbol 交易对
 * @return {Promise}
 */
export function getAmountChartData(symbol, {
    period = '',
}) {
    const url = appConfig.hosts.api + '/api/chart/amount?' + Qs.stringify({
        symbol,
        period,
    });
    return GET(url);
}
/**
 * 获取symbols特征
 * @param {string} symbol 交易对
 * @return {Promise}
 */
export function getCharacteristic(symbol) {
    const url = appConfig.hosts.api + '/api/chart/characteristic?' + Qs.stringify({
        symbol,
    });
    return GET(url);
}
/**
 * 获取压力位(单位以量体现)
 * @param {string} symbol 交易对
 * @param {string} period
 * @return {Promise}
 */
export function getTradeData(symbol, {
    period = '2min',
}) {
    const url = appConfig.hosts.api + '/api/chart/trade?' + Qs.stringify({
        symbol,
        period,
    });
    return GET(url);
}
/**
 * 获取压力位(单位以量体现)
 * @param {string} symbol 交易对
 * @return {Promise}
 */
export function getWatchSymbols(symbol) {
    const url = appConfig.hosts.api + '/api/chart/watchSymbols';
    return GET(url);
}
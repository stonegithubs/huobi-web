import Qs from 'qs';
import http from './http';
import appConfig from '../config';


/**
 * 获取压力位(单位以量体现)
 * @param {string} symbol 交易对
 * @return {Promise}
 */
export async function getAmountChartData(symbol) {
    const url = appConfig.hosts.api + '/api/chart/amount?' + Qs.stringify({
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
 * 获取压力位(单位以量体现)
 * @param {string} symbol 交易对
 * @return {Promise}
 */
export async function getTradeData(symbol) {
    const url = appConfig.hosts.api + '/api/chart/trade?' + Qs.stringify({
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

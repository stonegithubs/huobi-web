import Qs from 'qs';
import http from './http';
import config from '../config';


/**
 * 获取压力位(单位以量体现)
 * @param {string} symbol 交易对
 * @return {Promise}
 */
export async function getAmountChartData(symbol) {
    const url = config.API_HOST + '/api/chart/amount?' + Qs.stringify({
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
    const url = config.API_HOST + '/api/chart/trade?' + Qs.stringify({
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

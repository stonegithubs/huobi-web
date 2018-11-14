import Qs from 'qs';
import { POST, GET } from './http';
import appConfig from '../config';


/**
 * 获取Symbols
 * @return {Promise}
 */
export function getDiffSymbols(symbol) {
    const url = appConfig.hosts.api + '/api/diff/diffSymbols?' + Qs.stringify({
        symbol,
    });;
    return GET(url);
}


/**
 * 获取Symbols
 * @param {string} symbol 交易对
 * @return {Promise}
 */
export function getCharacteristic(symbol) {
    const url = appConfig.hosts.api + '/api/diff/characteristic?' + Qs.stringify({
        symbol,
    }); ;
    return GET(url);
}
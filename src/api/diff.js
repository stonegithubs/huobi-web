import Qs from 'qs';
import { post, get } from './http';
import appConfig from '../config';


/**
 * 获取Symbols
 * @return {Promise}
 */
export function getDiffSymbols(symbol) {
    const url = appConfig.hosts.api + '/api/diff/diffSymbols';
    return get(url);
}


/**
 * 获取Symbols
 * @param {string} symbol 交易对
 * @return {Promise}
 */
export function getCharacteristic(symbol) {
    const url = appConfig.hosts.api + '/api/diff/characteristic';
    return get(url);
}
/*
 * @Author: hubo
 * @Date: 2018-03-06 19:42:29
 * @Last Modified by: jiangli169
 * @Last Modified time: 2018-06-07 16:20:39
 */

import axios from 'axios';
import Qs from 'qs';
import appConfig from '../config';

const http = axios.create({
  baseURL: appConfig.hosts.api, // appConfig.hosts.api_huobi,
  timeout: 30000,
  headers: {  
    'Content-Type': 'application/json',
  },
  transformRequest: [function (data, headers) {
    if (headers['Content-Type'] === 'application/x-www-form-urlencoded' && Object.prototype.toString(data) === '[object Object]') {
      return Qs.stringify(data);
    }
    return data;
  }],
});

export default http;


/**
 * 
 * @param {string} path 
 * @param {Object} params 
 */
export const POST = async function (url, params) {
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

/**
 * 
 * @param {string} path 
 * @param {Object} params 
 */
export const GET = async function (url, params) {
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
      data: result.data || {},
      url,
    };
    throw err;
  } catch (err) {
    throw err;
  }
}
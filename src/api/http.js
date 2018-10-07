/*
 * @Author: hubo
 * @Date: 2018-03-06 19:42:29
 * @Last Modified by: jiangli169
 * @Last Modified time: 2018-06-07 16:20:39
 */

import axios from 'axios';
import Qs from 'qs';
import config from '../config';

const http = axios.create({
  baseURL: config.URL_HUOBI,
  timeout: 30000,
  headers: {  
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  transformRequest: [function (data, headers) {
    if (headers['Content-Type'] === 'application/x-www-form-urlencoded' && Object.prototype.toString(data) === '[object Object]') {
      return Qs.stringify(data);
    }
    return data;
  }],
});

export default http;


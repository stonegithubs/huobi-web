
const localhost = 'http://127.0.0.1:3000';
const originhost = 'http://182.61.43.233:3000';
/* 是否移动端 */
const isMobile = !!/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);

const isDev = process.env.NODE_ENV === 'development';

const appConfig = {
  hosts: {
    api: isDev ? localhost : originhost,
    api_huobi: 'https://api.huobi.br.com',
    huobi_ws: isDev ? '127.0.0.1:3000' : '182.61.43.233:3000',
  },
  isMobile,
  isDev,
  // 默认对udst
  prices: {
    btc: 6500,
    etch: 200,
  }
}
window.appConfig = appConfig;
export default appConfig;

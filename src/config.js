
let localhost = 'http://127.0.0.1:3000';
let originhost = 'http://182.61.43.233:3000';
/* 是否移动端 */
var isMobile = !!/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
const appConfig = {
  API_HOST: originhost,
  wsHost: '182.61.43.233:3000',
  API_HUOBI_HOST: 'https://api.huobi.br.com',
  isMobile,
  // 默认对udst
  price: {
    btc: 6500,
    etch: 200,
  }
}
window.appConfig = appConfig;
export default appConfig;

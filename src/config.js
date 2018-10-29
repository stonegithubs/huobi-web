
let localhost = 'http://localhost:3000';
let originhost = 'http://182.61.43.233:3000';
/* 是否移动端 */
var isMobile = !!/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
export default {
  API_HOST: originhost,
  wsHost: '182.61.43.233:3000',
  API_HUOBI_HOST: 'https://api.huobi.br.com',
  isMobile,
}

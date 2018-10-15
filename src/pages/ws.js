import throttle from 'lodash.throttle';
import diff from 'deep-diff';
import config from '@/config';
import store from '@/store';
import db from '@/plugins/dexie';
// utils
import getSameAmount from '@/utils/getSameAmount';
import trade from '@/utils/trade';
import getPriceIndex from '@/utils/getPriceIndex';

let ws = null;
let pre_ping = 0;
let ping = 0;

export const wsconfig = {
    symbol: '',
}
wsconfig.set = function (data) {
    Object.assign(config, data);
}
const openWs = function (params) {
    ws = new WebSocket(`ws://${config.wsHost}/huobi`);
    ws.onmessage = onmessage;
    ws.onclose = onclose;
    ws.onerror = onerror;
}
openWs();
/**
 * @return {Promise}
 */
const closeWs = function () {
    console.log('closeWs');
    return new Promise(function (resolve, reject) {
        if (!(ws !== null && ws.readyState === WebSocket.OPEN)) {
            reject({});
            return;
        }
        ws.onclose = function () {
            resolve();
        }
        ws.close();
    });
};

function onmessage(ev) {
    let data = JSON.parse(ev.data);
    let ping = Date.now();
    if (data.type === "WS_HUOBI") {
        if (data.tick && data.symbol === config.symbol) {
            let bidsFirst = data.tick.bids[0];
            let bidsList = getSameAmount(data.tick.bids, {
                type: 'bids'
            });
            let aksFirst = data.tick.asks[0];
            let asksList = getSameAmount(data.tick.asks, {
                type: 'asks'
            });
            store.commit('UPTATE_DEPTH', {
                tick: data.tick,
                asksList: asksList,
                bidsList: bidsList,
                bidsFirst: bidsFirst,
                aksFirst: aksFirst,
                responseSymbol: data.symbol
            });
            // 只记录大饼的某些特征
            // if (data.symbol === 'btcusdt' || data.symbol === 'paibtc') {
            //     writeSomething({
            //         asksList,
            //         bidsList,
            //         tick_bids: JSON.parse(JSON.stringify(data.tick.bids)),
            //         tick_asks: JSON.parse(JSON.stringify(data.tick.asks)),
            //         symbol: data.symbol
            //     });
            // }
        } else if (data.kline && data.symbol === config.symbol) {
            store.commit('updateHuobiState', {
                stateKey: 'lastKline',
                data: data.kline,
            });
        } else if (data.trade && data.symbol === config.symbol) {
            // console.log(data.trade)
            store.commit('updateHuobiState', {
                stateKey: 'trade',
                data: data.trade,
            });
        }
    }

    if (data.status) {

        store.commit('updateHuobiState', {
            stateKey: 'WS_HUOBI_STATUS',
            data: {
                type: data.type,
                status: data.status,
                msg: data.msg,
            },
        });
    }
}

function onclose() {
    console.log('ws.close');
    // 关闭 websocket
    store.commit('updateHuobiState', {
        stateKey: 'WS_SERVER_STATUS',
        data: {
            status: 'error',
            msg: 'close',
        },
    });
}
function onerror(err) {
    console.error(err);
    store.commit('updateHuobiState', {
        stateKey: 'WS_SERVER_STATUS',
        data: {
            status: 'error',
            msg: err,
        },
    });
}
// 心跳监测


// setInterval(function () {
//     if (ping === pre_ping) {
//         closeWs().then(() => {
//             openWs()
//         }).catch(console);
//     } else {
//         pre_ping = ping;
//     }
// }, 1000 * 60 * 10);

export const wsSend = function (data) {
    ws.send(JSON.stringify(data));
}


let postDepth = throttle(function (body) {
    fetch(config.API_HOST + '/api/v1/depth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: body,
    })
}, 10000, {trailing: false, leading: true});
/**
 * 
 * 记录depth到indexedDB和数据库
 */
async function writeSomething({
    asksList,
    bidsList,
    tick_bids,
    tick_asks,
    symbol
}) {
    let bids =  tick_bids.splice(0, 2);
    let asks = tick_asks.splice(0, 2);
    let action = ''; // 移除行为类型
    let quoteCurrency = '';
    let price = getPriceIndex(symbol);

    // 对比是否一样，一样就不push了
    let last = await db.HUOBI_DEPTH.toCollection().last();
    bids.forEach((item) => {
        item[2] = (item[1] * item[0] * price) | 0;
        if (item[2] > 50000) {
            action = 'buy'
        }
    });
    asks.forEach((item) => {
        item[2] = (item[1] * item[0] * price) | 0;
        if (item[2] > 50000) {
            action = 'sell'
        }
    });
    let same = false;
    if (last !== undefined && diff({bids: last.tick.bids, asks: last.tick.asks}, {bids, asks,}) !== undefined) {
        same = true;
    }
    if (action !== '' && !same && symbol === 'btcusdt') {
        db.HUOBI_DEPTH.put({
            action,
            symbol: symbol,
            time: Date.now(),
            timeUTC: new Date(),
            tick: {
                bids,
                asks,
            },
            asksList: asksList.slice(0, 10),
            bidsList: bidsList.slice(0, 10),
        }).then(id => {
        }).catch (err => {
            alert ("Error: " + (err.stack || err));
        });
    }
    postDepth(JSON.stringify({
        symbol: symbol,
        time: Date.now(),
        tick: {
            bids,
            asks,
        },
        asksList: asksList.slice(0, 10),
        bidsList: bidsList.slice(0, 10),
    }));
}
export default ws;

import config from '@/config';
import store from '@/store';

// utils
import getSameAmount from '@/utils/getSameAmount';
import getPriceIndex from '@/utils/getPriceIndex';

let ws = null;
let pre_ping = 0;
let ping = 0;

export const wsconfig = {
    symbol: 'btcusdt',
}
wsconfig.set = function (data) {
    Object.assign(config, data);
}
export const openWs = function (params) {
    ws = new WebSocket(`ws://${appConfig.hosts.huobi_ws}/huobi`);
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
    let msg = JSON.parse(ev.data);
    let ping = Date.now();
    if (msg.form === "WS_HUOBI") {
        if (msg.type === 'depth' && msg.symbol === wsconfig.symbol) {
            let data = msg.data;
            let bidsFirst = data.bids1;
            let bidsList = data.bidsList;
            let aksFirst = data.aks1;
            let asksList = data.asksList;
            store.commit('UPTATE_DEPTH', {
                asksList: asksList,
                bidsList: bidsList,
                bidsFirst: bidsFirst,
                aksFirst: aksFirst,
                responseSymbol: msg.symbol,
                tick: data.tick,
            });
        } else if (msg.kline && msg.symbol === wsconfig.symbol) {
            store.commit('updateHuobiState', {
                stateKey: 'lastKline',
                data: msg.kline,
            });
        } else if (msg.trade && msg.symbol === wsconfig.symbol) {
            // console.log(data.trade)
            store.commit('updateHuobiState', {
                stateKey: 'trade',
                data: msg.trade,
            });
        }
    }

    if (msg.status) {

        store.commit('updateHuobiState', {
            stateKey: 'WS_HUOBI_STATUS',
            data: {
                type: msg.type,
                status: msg.status,
                msg: msg.msg,
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


export default ws;
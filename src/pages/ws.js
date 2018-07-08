import throttle from 'lodash.throttle';
import diff from 'deep-diff';
import config from '@/config';
import store from '@/store';
import db from '@/plugins/dexie';
// utils
import getSameAmount from '@/utils/getSameAmount';
export const wsconfig = {
    symbol: '',
}
wsconfig.set = function (data) {
    Object.assign(config, data);
}

const ws = new WebSocket(`ws://${config.wsHost}/huobi`);
ws.onmessage = (ev) => {
    let data = JSON.parse(ev.data);
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
                asksList: asksList,
                bidsList: bidsList,
                bidsFirst: bidsFirst,
                aksFirst: aksFirst,
                responseSymbol: data.symbol
            });
            // 只记录大饼的某些特征
            if (data.symbol === 'btcusdt') {
                writeSomething({
                    asksList,
                    bidsList,
                    tick_bids: data.tick.bids,
                    tick_asks: data.tick.asks,
                    symbol: data.symbol
                });
            }
        } else if (data.kline && data.symbol === config.symbol) {
            store.commit('updateHuobiState', {
                stateKey: 'lastKline',
                data: data.kline,
            });
        } else if (data.trade) {
        }
    }

    if (data.status) {
        console.log(data)
        store.commit('updateHuobiState', {
            stateKey: 'WS_HUOBI_STATUS',
            data: {
                type: data.type,
                status: data.status,
                msg: data.msg,
            },
        });
    }
};

ws.onclose = () => {
    // 关闭 websocket
    // store.commit('updateHuobiState', {
    //     stateKey: 'WS_HUOBI_STATUS',
    //     data: {
    //         status: 'error',
    //         msg: 'close',
    //     },
    // });
};
ws.onerror = (err) => {
    
    store.commit('updateHuobiState', {
        stateKey: 'WS_SERVER_STATUS',
        data: {
            status: 'error',
            msg: err,
        },
    });
};

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
}, 20000, {trailing: false, leading: true});
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
    
    // 对比是否一样，一样就不push了
    let last = await db.HUOBI_DEPTH.toCollection().last();
    bids.forEach((item) => {
        if (item[1] > 10) {
        action = 'buy'
        }
    });
    asks.forEach((item) => {
        if (item[1] > 10) {
        action = 'sell'
        }
    });

    if (action !== '' && diff({bids: last.tick.bids, asks: last.tick.asks}, {bids, asks,}) !== undefined) {
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
        asksList: asksList.slice(0, 10),
        bidsList: bidsList.slice(0, 10),
    }));
}
export default ws;
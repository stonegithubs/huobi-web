import * as types from '../mutation-types';

const state = {
    /* 挂单原始数据 */
    tick: {
        asks: [],
        bids: []
    },
    /* 成交 */
    trade: {},
    /* 买卖深度 */
    asksList: [],
    bidsList: [],

    /* 买卖第一条 */
    aksFirst: [],
    bidsFirst: [],
    /* 交易对 */
    responseSymbol: '',
    /* symbols最新的一根k线，为了取最新的价格 */
    lastKline: {},
    WS_HUOBI_STATUS: {},
    WS_SERVER_STATUS: {},
}

// getters
const getters = {
    useWSAble (state) {
        return state.WS_HUOBI_STATUS.status === 'ok' && state.WS_SERVER_STATUS.status === 'ok';
    },
}

const actions = {
}

const mutations = {
    /**
     * 为了防止mutations 过多，所以，直接赋值操作(无需处理的数据)用此方法，缺点是无法追溯到行为
     * @param {object} state 默认回传的
     * @param {object} payload  interface: {stateKey: String, data: any} stateKey为必须字段
     * @example this.$store.commit('updateHuobiState', {stateKey: 'carImg', data: any})
     */
    updateHuobiState (state, payload) {
        var has = false;
        let path = 'store > huobi > state';
        if ( typeof payload.stateKey !== 'string' || payload.stateKey.trim() === '') {
            throw Error(`stateKey must be a String inclusion in the  ${path}`);
        }
        for (let key in state) {
            if (key === payload.stateKey) {
                has = true;
                break;
            }
        }
        if (!has) {
            throw Error(`${payload.stateKey}不存在${path}中`);
        } 
        state[payload.stateKey] = payload.data;
    },
    [types.UPTATE_DEPTH](state, payload) {
        state.tick = payload.tick;
        state.asksList = payload.asksList;
        state.bidsList = payload.bidsList;
        state.aksFirst = payload.aksFirst;
        state.bidsFirst = payload.bidsFirst;
        state.responseSymbol = payload.responseSymbol;
    },
}

export default {
    state,
    getters,
    actions,
    mutations
}
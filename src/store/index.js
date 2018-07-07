import Vue from 'vue'
import Vuex from 'vuex'

import huobi from './modules/huobi'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    modules: {
        huobi,
    },
    strict: debug
})
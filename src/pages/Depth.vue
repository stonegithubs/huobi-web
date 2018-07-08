<template>
  <div>
    <div>
      <el-input
        style="width: 100px;"
        placeholder="请输入内容"
        v-model="symbol"
        size="small"
        clearable>
      </el-input>
      对
      <el-select v-model="symbol2" placeholder="请选择" size="small">
        <el-option value="usdt">usdt</el-option>
        <el-option value="btc">btc</el-option>
        <el-option value="eth">eth</el-option>
      </el-select>
      <el-button
        type="primary"
        :loading="subscribeLoading"
        @click="subscribeDepth"
        :disabled="subscribeDisable"
        size="small"
      >查挂单
      </el-button>
      <el-select v-model="sortByValue" @change="sortBy" placeholder="请选择" size="small">
        <el-option value="sumMoneny">按sumMoneny排序</el-option>
        <el-option value="price">按price排序</el-option>
      </el-select>
      <div>
        <span>当前价{{lastKline.close}}</span>
      </div>
      <div class="tickList" ref="tickList">
        <div class="flex-row " >
          <div class="flex-1">
            <span>买单({{bidsList.length}})</span>
            <span>买1:{{bidsFirst}}</span>
            <Table :data="bidsList" :quoteCurrency="quoteCurrency"></Table>
          </div>
          <div class="flex-1">
            <span>卖单({{asksList.length}})</span>
            <span>卖1:{{aksFirst}}</span>
            <Table :data="asksList" :quoteCurrency="quoteCurrency"></Table>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>

import { mapState, mapGetters } from 'vuex';
// utils
import getSameAmount from '@/utils/getSameAmount';
// components
import Table from '@/components/Table';
// api
import {getSymbols, getKLine} from '@/api/huobiREST';
import ws, {wsconfig, wsSend} from './ws';


export default {
    name: "Depth",
    components: {
        Table,
    },
    data() {
        return {
            /* 交易对 */
            quoteCurrency: 'usdt',
            symbol: 'btc',
            symbol2: 'usdt',
            symbols: '', // symbol + symbol2
            sortByValue: 'sumMoneny',
            subscribeLoading: false,
            subscribeDisable: true,
        };
    },
    computed:{
            ...mapState({
                status: state => state.huobi.WS_HUOBI_STATUS,
                bidsFirst: state => state.huobi.bidsFirst,
                bidsList: state => state.huobi.bidsList,
                aksFirst: state => state.huobi.aksFirst,
                asksList: state => state.huobi.asksList,
                lastKline: state => state.huobi.lastKline,
                responseSymbol: state => state.huobi.responseSymbol,
            }),
            ...mapGetters([
                'useWSAble'
            ])
    },
    watch: {
        bidsList(bidsList) {
            this.subscribeLoading = !(bidsList.length > 0);
        },
        status(status) {
            this.$notify({
                title: 'WS状态',
                message: `msg: ${JSON.stringify(status.msg)}`,
                duration: 3000
            });
            
        },
        useWSAble(useWSAble){
            this.subscribeDisable = !useWSAble;
        }
    },
    created() {
        ws.onopen = () => {
            this.$notify({
                title: 'WS状态',
                message: `msg: ws_server open`,
                duration: 3000
            });
            wsSend({
                type: `ws-huobi`,
                value: 'open'
            });
            this.$store.commit('updateHuobiState', {
                stateKey: 'WS_SERVER_STATUS',
                data: {
                    status: 'ok',
                    msg: 'open',
                },
            });
        }
    },
    mounted() {
        this.$refs.tickList.style.maxHeight = window.innerHeight - 50 + 'px';
        this.subscribeDisable = !this.useWSAble;
    },
    beforeDestroy() {
        
    },
    methods: {
        subscribeDepth: async function () {
            this.subscribeLoading = true;
            // 没打开就先打开
            if (this.status.msg.indexOf('open') === -1) {
                wsSend({
                    type: `ws-huobi`,
                    value: 'open',
                });
                return;
            }
            let value = this.symbol + this.symbol2;
            this.symbols = value;
            
            // 单位为美元
            window.ethPrice = 0;
            window.btcPrice = 0;
            this.quoteCurrency = '$';

            let precisionData = await getSymbols();
            let pricePrecision = 0;
            let amountPrecision = 0;
            precisionData.some((item) => {
                // base-currency:"yee"
                // price-precision:8
                // quote-currency:"eth"
                if (item['base-currency'] === this.symbol && item['quote-currency'] === this.symbol2) {
                pricePrecision = item['price-precision'];
                amountPrecision = item['amount-precision'];
                return true;
                }
                return false;
            });
            
            if (this.symbol2 === 'eth') {
                let res = await getKLine('ethusdt', '1min', 1);
                window.ethPrice = res.data[0].close;
                this.quoteCurrency = 'ETH';
            } else if (this.symbol2 === 'btc') {
                let res = await getKLine('btcusdt', '1min', 1);
                window.btcPrice = res.data[0].close;
                this.quoteCurrency = 'BTC';
            }
            // 设置精度
            getSameAmount.setConfig({
                pricePrecision,
                amountPrecision,
                quoteCurrency: this.symbol2
            });

            wsconfig.set({
                symbol: this.symbols,
            });
            console.log(this.symbols)
            // 开始订阅
            wsSend({
                type: `ws-huobi`,
                value: 'subscribeDepth',
                symbol: `${this.symbols}`
            });
            wsSend({
                type: `ws-huobi`,
                value: 'subscribeKline',
                symbol: `${this.symbols}`
            });
        },
        sortBy() {
            getSameAmount.setConfig({sortBy: this.sortByValue});
        },

    }
};
</script>

<style>
.tickList {
  padding: 0px 0;
  overflow: auto;
  align-content:flex-start;
  align-items: flex-start;
}
.tickList .flex-1{
  align-self: start;
}

</style>

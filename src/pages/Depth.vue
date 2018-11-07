<template>
  <div class="depth-page">

    <el-row :gutter="10">
      <el-col :xs="12" :sm="3" :md="3" :lg="3" :xl="1">
        <el-input
          style="width: 100%;"
          placeholder="请输入内容"
          v-model="symbol"
          size="small"
          clearable
          :disabled="true"
        >
        </el-input>
      </el-col>
      <el-col :xs="12" :sm="3" :md="3" :lg="3" :xl="1">
        <el-select v-model="symbol2" placeholder="请选择" size="small" :disabled="true">
          <el-option value="usdt">usdt</el-option>
          <el-option value="btc">btc</el-option>
          <el-option value="eth">eth</el-option>
        </el-select>
      </el-col>
      <el-col :xs="12" :sm="3" :md="8" :lg="3" :xl="1">
        <el-button
          type="primary"
          :loading="subscribeLoading"
          @click="subscribeDepth"
          :disabled="subscribeDisable"
          size="small"
        >查挂单
        </el-button>
      </el-col>
      <el-col :xs="12" :sm="3" :md="3" :lg="3" :xl="1">
        <el-select v-model="sortByValue" @change="sortBy" placeholder="请选择" size="small" :disabled="true">
          <el-option value="sumMoneny">按sumMoneny排序</el-option>
          <el-option value="price">按price排序</el-option>
        </el-select>
      </el-col>
    </el-row>
    <div>
        <span>当前价{{lastKline.close}}</span>
    </div>
    <div class="depth-table-wap" v-if="!isMobile"> 
      <el-row>
        <el-col :span="12">
            <span>买单({{bidsList.length}})</span>
            <span>买1:{{bidsFirst}}</span>
            <DepthTable :data="bidsList" :quoteCurrency="quoteCurrency"></DepthTable>
        </el-col>
        <el-col :span="12">
          <span>卖单({{asksList.length}})</span>
          <span>卖1:{{aksFirst}}</span>
          <DepthTable :data="asksList" :quoteCurrency="quoteCurrency"></DepthTable>
        </el-col>
      </el-row>
    </div>

    <el-tabs v-model="tabVal" type="card" @tab-click="handleClick" v-if="isMobile">
      <el-tab-pane label="买挂单" name="bids">
          <span>买单({{bidsList.length}})</span>
          <span>买1:{{bidsFirst}}</span>
          <DepthTable :data="bidsList" :quoteCurrency="quoteCurrency"></DepthTable>
      </el-tab-pane>
      <el-tab-pane label="卖挂单" name="asks">
        <span>卖单({{asksList.length}})</span>
            <span>卖1:{{aksFirst}}</span>
          <DepthTable :data="asksList" :quoteCurrency="quoteCurrency"></DepthTable>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
// utils
import getSameAmount from "@/utils/getSameAmount";
// components
import DepthTable from "@/components/DepthTable";
// api
import { getSymbols, getKLine } from "@/api/huobiREST";
import ws, { wsconfig, wsSend } from "./ws";

export default {
  name: "Depth",
  components: {
    DepthTable
  },
  data() {
    return {
      /* 交易对 */
      quoteCurrency: "usdt",
      symbol: "btc",
      symbol2: "usdt",
      symbols: "", // symbol + symbol2
      sortByValue: "sumMoneny",
      subscribeLoading: false,
      subscribeDisable: false,
      tabVal: 'bids',
      isMobile: appConfig.isMobile,
    };
  },
  computed: {
    ...mapState({
      status: state => state.huobi.WS_HUOBI_STATUS,
      bidsFirst: state => state.huobi.bidsFirst,
      bidsList: state => state.huobi.bidsList,
      aksFirst: state => state.huobi.aksFirst,
      asksList: state => state.huobi.asksList,
      lastKline: state => state.huobi.lastKline,
      responseSymbol: state => state.huobi.responseSymbol
    }),
    ...mapGetters(["useWSAble"])
  },
  watch: {
    bidsList(bidsList) {
      // this.subscribeLoading = !(bidsList.length > 0);
    },
    status(status) {
      this.$notify({
        title: "WS状态",
        message: `msg: ${JSON.stringify(status.msg)}`,
        duration: 3000
      });
    },
    useWSAble(useWSAble) {
      // this.subscribeDisable = !useWSAble;
    }
  },
  created() {
    ws.onopen = () => {
      this.$notify({
        title: "WS状态",
        message: `msg: ws_server open`,
        duration: 3000
      });
      this.$store.commit("updateHuobiState", {
        stateKey: "WS_SERVER_STATUS",
        data: {
          status: "ok",
          msg: "open"
        }
      });
    };
  },
  mounted() {
    // this.subscribeDisable = !this.useWSAble;
    console.log(1);
  },
  beforeDestroy() {},
  methods: {
    reset() {
      wsSend({
        type: `ws-huobi`,
        value: "reset"
      });
    },
    handleClick() {},
    subscribeDepth: async function() {
      this.subscribeLoading = true;
      // 没打开就先打开
      // if (this.status.msg && this.status.msg.indexOf('open') === -1) {
      //     wsSend({
      //         type: `ws-huobi`,
      //         value: 'open',
      //     });
      //     return;
      // }
      let value = this.symbol + this.symbol2;
      this.symbols = value;

      this.quoteCurrency = "$";

      if (this.symbol2 === "eth") {
        this.quoteCurrency = "ETH";
      } else if (this.symbol2 === "btc") {
        this.quoteCurrency = "BTC";
      }

      wsconfig.set({
        symbol: this.symbols
      });
      // 开始订阅
      // wsSend({
      //     type: `ws-huobi`,
      //     value: 'subscribeDepth',
      //     symbol: `${this.symbols}`
      // });
      // wsSend({
      //     type: `ws-huobi`,
      //     value: 'subscribeKline',
      //     symbol: `${this.symbols}`
      // });
      // wsSend({
      //     type: `ws-huobi`,
      //     value: 'subscribeTrade',
      //     symbol: `${this.symbols}`
      // });
      this.$store.commit("UPTATE_DEPTH", {
        tick: {
          asks: [],
          bids: []
        },
        asksList: [],
        bidsList: [],
        bidsFirst: [],
        aksFirst: [],
        responseSymbol: ""
      });
      this.subscribeLoading = false;
    },
    sortBy() {}
  }
};
</script>

<style lang="scss">
.depth-table-wap{
  min-width: 1100px;
}
.depth-page{
  width: 100%;
  .depth-table{
    position: relative;
    width: 50%;
  }
}
.tickList {
  padding: 0px 0;
  overflow: auto;
  align-content: flex-start;
  align-items: flex-start;
}
.tickList .flex-1 {
  align-self: start;
}
</style>

<template>
  <div>
    <div>
      <p>{{status}}</p>
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
        @click="subscribe"
        size="small"
      >查挂单
      </el-button>
      <el-select v-model="sortByValue" @change="sortBy" placeholder="请选择" size="small">
        <el-option value="sumMoneny">按sumMoneny排序</el-option>
        <el-option value="price">按price排序</el-option>
      </el-select>
      <el-button type="primary" @click="showLineChart2 = true" size="small">
        showLineChart2
      </el-button>
      <el-button type="primary"  @click="showLineChart = true" size="small">
        showLineChart
      </el-button>
      <div>
        <span>当前价{{lastKLine.close}}</span>
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
    <el-dialog
        title="全部价格"
        :visible.sync="showLineChart"
        width="90%"
        >
        <div>
          <LineChart
            :asksList="asksList"
            :bidsList="bidsList"
            :aksFirst="aksFirst"
            :bidsFirst="bidsFirst"
            :symbol="symbol + symbol2"
          ></LineChart>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="showLineChart = false" size="small">取 消</el-button>
            <el-button type="primary" @click="showLineChart = false" size="small">确 定</el-button>
        </span>
    </el-dialog>

    <el-dialog
        title="压力"
        :visible.sync="showLineChart2"
        width="90%"
        >
        <div>
          <LineChart2
            :lastKLine="lastKLine"
            :asksList="asksList"
            :bidsList="bidsList"
            :aksFirst="aksFirst"
            :bidsFirst="bidsFirst"
            :symbol="symbol + symbol2"
          >

          </LineChart2>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="showLineChart2 = false" size="small">取 消</el-button>
            <el-button type="primary" @click="showLineChart2 = false" size="small">确 定</el-button>
        </span>
    </el-dialog>
    
  </div>
</template>

<script>
import throttle from 'lodash.throttle';
import diff from 'deep-diff';
// utils
import getSameAmount from '@/utils/getSameAmount';
// components
import Table from '@/components/Table';
import {LineChart, LineChart2} from '@/components/charts';
import config from '@/config';
// pulgins
import db from '@/plugins/dexie';
// api
import {getSymbols, getKLine} from '@/api/huobiREST';
// 有多单时， 总和超过最小价，低于则不显示
let minSumPrice = 500;
// 1单时， 总和超过最小价，低于则不显示
let minPrice = 2000;

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

export default {
  name: "Depth",
  components: {
    Table,
    LineChart,
    LineChart2
  },
  data() {
    return {
      aksFirst: [],
      asksList: [], // 卖单
      bidsList: [], // 买单
      bidsFirst: [],
      lastKLine: {},
      quoteCurrency: 'usdt',
      showLineChart: false,
      showLineChart2: false,
      symbol: 'btc',
      symbol2: 'usdt',
      status: 'ws未连接',
      sortByValue: 'sumMoneny',
      subscribeLoading: true,
    };
  },
  mounted() {
    this.$refs.tickList.style.maxHeight = window.innerHeight - 50 + 'px';
    this.ws = new WebSocket(`ws://${config.wsHost}/huobi`);
    this.status = 'ws未连接';
    this.ws.onopen = () => {
      // Web Socket 已连接上，使用 send() 方法发送数据
      // this.ws.send(JSON.stringify({
      //   "type": `ws-huobi`,
      //   "value": 'open',
      // }));
      this.status = 'ws-server已连接';
      this.subscribeLoading = false;
    };
    this.ws.onclose = () => {
      // 关闭 websocket
      this.status = 'ws-server连接已关闭...';
    };
    this.ws.onerror = (err) => {
      // 关闭 websocket
      this.status = err;
    };
    this.ws.onmessage = (ev) => {
      var data = JSON.parse(ev.data);
      
      if (data.type === 'WS_HUOBI' && data.tick) {
        this.bidsFirst = data.tick.bids[0],
        this.bidsList = getSameAmount(data.tick.bids, {
          minSumPrice,
          minPrice,
          type: 'bids'
        });
        this.aksFirst = data.tick.asks[0],
        this.asksList = getSameAmount(data.tick.asks, {
          minSumPrice,
          minPrice,
          type: 'asks'
        });
        // 只记录大饼的某些特征
        if (data.symbol === 'btcusdt' && data.tick.bids) {
          this.writeSomething(data.tick.bids, data.tick.bids);
        }
        
      }
      if (data.type === 'WS_HUOBI' && data.kline) {
        this.lastKLine = data.kline;
      }
      if (data.status) {
        this.status = 'WS_HUOBI:' + data.msg;
        this.subscribeLoading = false;
      }
    };

    
  },
  beforeDestroy() {
    this.ws.send(JSON.stringify({
      type: `ws-huobi`,
      value: 'close',
    }));
    this.ws.close();
  },
  methods: {
    subscribe: async function () {
      let value = this.symbol + this.symbol2;
      // 单位为美元
      window.ethPrice = 0;
      window.btcPrice = 0;
      this.quoteCurrency = '$';

      // 有多单时， 总和超过最小价，低于则不显示
      let minSumPrice = 200;
      // 1单时， 总和超过最小价，低于则不显示
      let minPrice = 1000;

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
      
      // 开始订阅
      this.ws.send(JSON.stringify({
        type: `ws-huobi`,
        value: 'subscribe',
        symbols: `${value}`
      }));

      this.subscribeLoading = true;
    },
    sortBy() {
      getSameAmount.setConfig({sortBy: this.sortByValue});
    },
    writeSomething: async function (tick_bids, tick_asks) {
      let symbol = this.symbol + this.symbol2;
      let bids =  tick_bids.splice(0, 2);
      let asks = tick_asks.splice(0, 2);
      let action = ''; // 移除行为类型
      
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
          asksList: this.asksList.slice(0, 10),
          bidsList: this.bidsList.slice(0, 10),
        }).then(id => {
            console.log('asks:', asks, 'bids:', bids);
        }).catch (err => {
            alert ("Error: " + (err.stack || err));
        });
      }
      postDepth(JSON.stringify({
        symbol: symbol,
        time: Date.now(),
        asksList: this.asksList.slice(0, 10),
        bidsList: this.bidsList.slice(0, 10),
      }));
    }
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

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
      </el-select>
      <el-button type="primary" :loading="subscribeLoading" @click="subscribe" size="small">查挂单</el-button>
      <span>
        <button @click="test">测试</button>
        <button @click="createTable">创建table</button>
        <button @click="delTable">删除db</button>
        <button @click="showLineChart = true">showLineChart</button>
        <button @click="showLineChart2 = true">showLineChart2</button>
      </span>
      <div>
        <span>当前价{{lastKLine.close}}</span>
      </div>
      <div class="tickList" ref="tickList">
        <div class="flex-row " >
          <div class="flex-1">
            <span>买单({{bidsList.length}})</span>
            <span>买1:{{bidsFirst}}</span>
            <Table :data="bidsList"></Table>
          </div>
          <div class="flex-1">
            <span>卖单({{asksList.length}})</span>
            <span>卖1:{{aksFirst}}</span>
            <Table :data="asksList"></Table>
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
import getSameAmount, {setPricePrecision} from '@/utils/getSameAmount';
import Table from '@/components/Table';
import {LineChart, LineChart2} from '@/components/charts';
import config from '@/config';
import db from '@/pulgins/dexie';
// 有多单时， 总和超过最小价，低于则不显示
let minSumPrice = 500;
// 1单时， 总和超过最小价，低于则不显示
let minPrice = 2000;

let postDepth = throttle(function (body) {
    fetch(config.host + '/api/v1/depth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: body,
    })
}, 10000, {trailing: false, leading: true});

export default {
  name: "Home",
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
      showLineChart: false,
      showLineChart2: false,
      symbol: 'btc',
      symbol2: 'usdt',
      status: 'ws未连接',
      subscribeLoading: true,
    };
  },
  created() {
    if (localStorage.precision === undefined) {
      // 查精度
      fetch(config.URL_HUOBI + '/v1/common/symbols').then((res) => {
        return res.json();
      }).then((res) => {
        if (res.data) {
          localStorage.precision = JSON.stringify(res.data);
        }
      })
    }
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
          minPrice
        });
        this.aksFirst = data.tick.asks[0],
        this.asksList = getSameAmount(data.tick.asks, {
          minSumPrice,
          minPrice
        });
        let symbol = this.symbol + this.symbol2;
        // 只记录大饼的
        if (symbol === 'btcusdt') {
          if (this.bidsFirst[1] > 10 || this.aksFirst[1] > 10) {
            db.HUOBI_DEPTH.put({
              action: this.bidsFirst[1] > 50 ? 'buy' : 'sell',
              symbol: symbol,
              time: Date.now(),
              timeUTC: new Date(),
              aksFirst: this.aksFirst[1],
              bidsFirst: this.bidsFirst[1],
              asksList: this.asksList.slice(0, 10),
              bidsList: this.bidsList.slice(0, 10),
            }).then(id => {
                console.log(id)
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
    subscribe() {
      let value = this.symbol + this.symbol2;
      let precision = JSON.parse(localStorage.precision);
      switch(this.symbol2) {
        case 'btc':
          // 有多单时， 总和超过最小价，低于则不显示
          minSumPrice = 0.5;
          // 1单时， 总和超过最小价，低于则不显示
          minPrice = 0.4;
          break;
        case 'usdt': 
          // 有多单时， 总和超过最小价，低于则不显示
          minSumPrice = 100;
          // 1单时， 总和超过最小价，低于则不显示
          minPrice = 1000;
      }
      precision.some((item) => {
        // base-currency:"yee"
        // price-precision:8
        // quote-currency:"eth"
        if (item['base-currency'] === this.symbol && item['quote-currency'] === this.symbol2) {
          setPricePrecision(item['price-precision']);
          return true;
        }
        return false;
      })
      ;
      this.subscribeLoading = true;
      this.ws.send(JSON.stringify({
        type: `ws-huobi`,
        value: 'subscribe',
        symbols: `${value}`
      }));
    },
    test() {
      let value = this.symbol + this.symbol2;
      fetch(config.host + '/api/v1/showTables').then((res) => {
        console.log(res)
      });
    },
    createTable() {
      fetch(config.host + '/api/v1/createTable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          tableName: 'HUOBI_DEPTH'
        })
      }).then(res => {
        console.log(res)
      })
    },
    delTable() {
      fetch(config.host + '/api/v1/delTable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          tableName: 'HUOBI_DEPTH'
        })
      })
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

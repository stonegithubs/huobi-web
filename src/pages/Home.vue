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
      <button @click="test">测试</button>
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
  </div>
</template>

<script>

import getSameAmount, {setPricePrecision} from '@/utils/getSameAmount';
import Table from '@/components/Table';
import config from '@/config';
// 有多单时， 总和超过最小价，低于则不显示
let minSumPrice = 500;
// 1单时， 总和超过最小价，低于则不显示
let minPrice = 2000;

export default {
  name: "Home",
  components: {
    Table,
  },
  data() {
    return {
      aksFirst: [],
      asksList: [], // 卖单
      bidsList: [], // 买单
      bidsFirst: [],
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
      
      if (data.tick) {
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
        console.log(config.host + '/api/v1/depth')
        fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          url: config.host + '/api/v1/depth',
          body: JSON.stringify({
            symbol: symbol,
            time: new Date(),
            ...this.asksList
          })
        })
      }
      if (data.type === 'WS_HUOBI') {
        console.log(data.value)
        this.status = 'WS_HUOBI:' + data.value;
        switch(data.value) {
          case 'error':
          this.status = 'WS_HUOBI:' + data.error;
          break;
          case 'ok':
          break;
        }
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
      fetch(config.host + '/api/v1/a').then((res) => {
        console.log(res)
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

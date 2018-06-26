<template>
  <div>
    <div>
      <p>{{status}}</p>
      <input type="text" ref="symbol" value="btc">
      对
      <select name="" ref="symbol2" value="usdt">
        <option value="usdt">usdt</option>
        <option value="btc">btc</option>
      </select>
      <button @click="subscribe">
          查挂单
      </button>
      <div class="tickList" ref="tickList">
        <div class="flex-row " >
          <div class="flex-1">
            <span>买单({{bidsList.length}})</span>
            <span>买1:{{bidsFirst}}</span>
            <ul>
              <li
                v-for="(item, index) in bidsList"
                :key="index"
              >
                <span>
                  {{item}}
                </span>
              </li>
            </ul>
          </div>
          <div class="flex-1">
            <span>卖单({{asksList.length}})</span>
            <span>卖1:{{aksFirst}}</span>
            <ul>
              <li
                v-for="(item, index) in asksList"
                :key="index"
              >
                <span>
                  {{item}}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>

import getSameAmount from '@/utils/getSameAmount';
// 有多单时， 总和超过最小价，低于则不显示
let minSumPrice = 500;
// 1单时， 总和超过最小价，低于则不显示
let minPrice = 2000;

export default {
  name: "Home",
  data() {
    return {
      status: 'ws未连接',
      bidsList: [], // 买单
      asksList: [], // 卖单
      bidsFirst: [],
      aksFirst: [],
    };
  },
  mounted() {
    this.$refs.tickList.style.maxHeight = window.innerHeight - 50 + 'px';
    this.ws = new WebSocket("ws://localhost:3000/huobi");
    this.status = 'ws未连接';
    this.ws.onopen = () => {
      // Web Socket 已连接上，使用 send() 方法发送数据
      this.ws.send(JSON.stringify({
        "type": `ws-huobi`,
        "value": 'open',
      }));
      this.status = 'ws-server已连接';
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
      }

      switch(data.type) {
        case 'WS_HUOBI':
        this.status = 'WS_HUOBI:' + data.value;
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
      let value = this.$refs.symbol.value + this.$refs.symbol2.value;

      switch(this.$refs.symbol2.value) {
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
          minPrice = 2000;
      }
      if (this.$refs.symbol2.value === 'btc') {
       
      }
      this.ws.send(JSON.stringify({
        type: `ws-huobi`,
        value: 'subscribe',
        symbols: `${value}`
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
</style>

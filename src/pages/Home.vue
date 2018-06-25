<template>
  <div>
    <div>
      <p>{{status}}</p>
      <input type="text" ref="symbol" value="iost">
      对
      <input type="text" ref="symbol2" value="usdt">
      <button @click="subscribe">
          查挂单
      </button>
      <div class="flex-row">
        <div class="flex-1">
          买单({{bidsList.length}})
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
          卖单({{asksList.length}})
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
</template>

<script>

import getSameAmount from '@/utils/getSameAmount';
export default {
  name: "Home",
  data() {
    return {
      status: 'ws未连接',
      bidsList: [], // 买单
      asksList: [], // 卖单
    };
  },
  mounted() {
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
      console.log(ev.data)
      var data = JSON.parse(ev.data);
      if (data.tick) {
        this.bidsList = getSameAmount(data.tick.bids);
        this.asksList = getSameAmount(data.tick.asks);
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
</style>

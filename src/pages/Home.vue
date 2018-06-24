<template>
  <div>
    <div>
      <input type="text" ref="symbol" value="iostusdt">
      <button @click="subscribe">
          查挂单
      </button>
      <div class="flex-row">
        <div class="flex-1">
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
      bidsList: [],
      asksList: [],
    };
  },
  mounted() {
    this.ws = new WebSocket("ws://localhost:3000/huobi");
    this.ws.onopen = () => {
      // Web Socket 已连接上，使用 send() 方法发送数据
      this.ws.send(JSON.stringify({
        "key": `huobi`,
        "value": 'open',
      }));
    };

    this.ws.onmessage = (ev) => {
      console.log(ev.data)
      var data = JSON.parse(ev.data);
      if (data.tick) {
        this.bidsList = getSameAmount(data.tick.bids);
        this.asksList = getSameAmount(data.tick.asks);
      }
      
    };

    this.ws.onclose = function() {
      // 关闭 websocket
      console.log("连接已关闭...");
    };
    this.ws.onerror = function(err) {
      // 关闭 websocket
      console.log(err);
    };
  },
  beforeDestroy() {
    this.ws.send(JSON.stringify({
      "key": `huobi`,
      "value": 'close',
    }));
  },
  methods: {
    subscribe() {
      let value = this.$refs.symbol.value;
      this.ws.send(JSON.stringify({
        "key": `huobi`,
        "symbols": `${value}`
      }));
    }
  }
};
</script>

<style>
</style>

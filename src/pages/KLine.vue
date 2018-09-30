<template>
  <div>
    <div class="flex-row">
      <p>{{data}}</p>
      <button @click="act">激活</button>
      <button @click="doIt">do</button>
    </div>
  </div>
</template>

<script>
import config from '@/config';
import { getKLine } from '@/api/huobiREST';

import IntervalTask from '@/utils/IntervalTask';
export default {
  name: "Kline",
  components: {

  },
  data() {
    return {
      list: [],
      data: null,
    };
  },
  created() {
  },
  mounted() {
    // getKLine('btcusdt', '1day', 100).then((res) => {
    //     console.log(res)
    // })

    this.timer = new IntervalTask({disTime: 2000});
    
  },
  beforeDestroy() {

  },
  methods: {
    act() {
      this.timer.activate();
    },
    doIt() {
      setInterval(() => {
        this.timer.do(() => {
          this.data = Math.random();
        });
      }, 1000);
    }
  }
};
</script>

<style>


</style>

<template>
  <div>

  </div>
</template>

<script>
import config from '@/config';
import { getKLine } from '@/api/huobiREST';
export default {
  name: "Kline",
  components: {

  },
  data() {
    return {
      list: []
    };
  },
  created() {
  },
  mounted() {
    getKLine('btcusdt', '1day', 100).then((res) => {
        console.log(res)
    })
    console.log()
  },
  beforeDestroy() {

  },
  methods: {
  }
};
</script>

<style>


</style>

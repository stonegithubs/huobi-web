<template>
  <div>
    <div class="text-center">
      <h3>资金流入流出</h3>
    </div>
    <div v-loading="loading" class="charts-container">
      <component
          v-bind:is="currentComponent"
          @onloaded="onloaded"
      ></component>
    </div>
  </div>
 
</template>

<script>
import TradeBarChart from "./TradeBarChart";
import TradeBarChart_M from "./TradeBarChart.m";
export default {
  name: "TradeBarChartWrap",
  components: {
   TradeBarChart,
   TradeBarChart_M
  },
  data() {
    return {
      loading: true
    };
  },
  computed: {
    currentComponent() {
      return appConfig.isMobile ? 'TradeBarChart_M' : "TradeBarChart";
    }
  },
  methods: {
    onloaded() {
      this.loading = false;
    }
  }
};
</script>



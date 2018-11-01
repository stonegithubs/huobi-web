<template>
  <div>
    <div class="text-center">
      <h3>挂单资金</h3>
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
import DepthLineChart from "./DepthLineChart";
import DepthLineChart_M from "./DepthLineChart.m";
export default {
  name: "DepthLineChartWrap",
  components: {
    DepthLineChart,
    DepthLineChart_M
  },
  data() {
    return {
      loading: true
    };
  },
  computed: {
    currentComponent() {
      return appConfig.isMobile ? 'DepthLineChart_M' : "DepthLineChart";
    }
  },
  methods: {
    onloaded() {
      this.loading = false;
    }
  }
};
</script>



<template>
  <div>
    <div class="text-center">
      <h3>挂单资金</h3>
    </div>
    <div v-loading="loading" class="charts-container">
      <el-button type="text" :loading="loading" @click="changePeriod('')" size="small">时</el-button>
      <el-button type="text" :loading="loading" @click="changePeriod('1day')" size="small">1day</el-button>
      <component
        v-bind:is="currentComponent"
        :data="data"
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
    };
  },
  props: {
    loading: Boolean,
    data: {
      type: Array,
      default () {
        return [];
      }
    },
  },
  computed: {
    currentComponent() {
      return appConfig.isMobile ? "DepthLineChart_M" : "DepthLineChart";
    }
  },
  methods: {
    changePeriod(val) {
      this.$emit("onPeriodChange", 'depth', val);
    }
  }
};
</script>



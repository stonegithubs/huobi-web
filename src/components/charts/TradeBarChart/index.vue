<template>
  <div>
    <div class="text-center">
      <h3>资金流入流出</h3>
    </div>
    <div v-loading="loading" class="charts-container">
      <div>
        <el-button
          type="text"
          :loading="loading"
          @click="changePeriod('2min')"
          size="small"
        >2min
        </el-button>
        <el-button
          type="text"
          :loading="loading"
          @click="changePeriod('1day')"
          size="small"
          
        >1day
        </el-button>
      </div>
      <component
          v-bind:is="currentComponent"
          :data="data"
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
    };
  },
  props: {
    loading: true,
    data: {
      type: Array,
      default () {
        return [];
      }
    },
  },
  computed: {
    currentComponent() {
      return appConfig.isMobile ? 'TradeBarChart_M' : "TradeBarChart";
    }
  },
  methods: {
    changePeriod(val) {
      this.$emit("onPeriodChange", 'trade', val);
    }
  }
};
</script>



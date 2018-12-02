<template>
  <div class="chart-page">
    <div class="ctrl">
      <el-select v-model="selectedSymbol" placeholder="请选择" size="small">
        <el-option v-for="symbol in symbols" :value="symbol" :key="symbol">{{symbol}}</el-option>
      </el-select>
    </div>
    <el-card class="chart-wrap">
      <DepthLineChart
        :data="depthData"
        :loading="depthLoading"
        @onPeriodChange="changePeriod"
      ></DepthLineChart>
    </el-card>

    <el-card class="chart-wrap">
      <TradeBarChart
        :data="tradeData"
        :loading="tradeLoading"
        @onPeriodChange="changePeriod"
      ></TradeBarChart>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import config from "@/config";
import { getWatchSymbols, getAmountChartData, getTradeData } from "@/api/chart";

import { DepthLineChart, TradeBarChart } from "@/components/charts";
export default {
  name: "Charts",
  components: {
    DepthLineChart,
    TradeBarChart
  },
  data() {
    return {
      symbols: [],
      selectedSymbol: "",
      depthData: [],
      tradeData: [],
      depthLoading: true,
      tradeLoading: true
    };
  },
  computed: {},
  mounted() {
    this.getWatchSymbols().then(() => {
      this.getDepthData();
      this.getTradeData();
    });
  },
  beforeDestroy() {},
  methods: {
    changePeriod(type, val) {
      switch (type) {
        case "depth":
          this.getDepthData(val);
          break;
        case "trade":
          this.getTradeData(val);
          break;
      }
    },
    /**
     * @return {Promise}
     */
    getWatchSymbols() {
      return getWatchSymbols().then(res => {
        this.symbols = res.data;
        this.selectedSymbol = this.symbols[0];
      });
    },
    getDepthData(period = '') {
      this.depthLoading = true;
      getAmountChartData(this.selectedSymbol, { period, })
        .then(res => {
          this.depthData = res.data;
        })
        .finally(() => {
          this.depthLoading = false;
        });
    },
    getTradeData(period = '2min') {
      this.tradeLoading = true;
      getTradeData(this.selectedSymbol, { period, })
        .then(res => {
          this.tradeData = res.data;
        })
        .finally(() => {
          this.tradeLoading = false;
        });
    }
  }
};
</script>

<style lang="scss">
.chart-page {
  .chart-wrap {
    margin-bottom: 10px;
  }
  .ctrl {
    margin-bottom: 10px;
  }
}
</style>

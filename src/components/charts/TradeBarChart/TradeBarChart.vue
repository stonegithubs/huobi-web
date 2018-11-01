

<template>
  <div class="trade-chart">
    <div class="text-center">
      <h3>资金流入流出</h3>
    </div>
    <div v-loading="loading" ref="container" class="charts-container">
    </div>
    <div ref="slider" class="chart-slider"> </div>
    <TradePieChart :data="data"></TradePieChart> 
  </div>
</template>

<script>
import moment from "moment";
import throttle from "lodash.throttle";

import CONFIG from "@/config";
import { getTradeData } from "@/api/chart";
import {
  fetchAntv,
  createDataSet,
  createSilder,
} from "../antv";
import { tradeColor, usdtFormatter } from "../config";
import TradePieChart from "./TradePieChart";

export default {
  name: "TradeBarChart",
  components: {
    TradePieChart
  },
  data() {
    return {
      loading: true,
      data: []
    };
  },
  props: {},
  mounted() {
    fetchAntv()
      .then(res => {
        const { dataSet, dataView, chart } = initChart(
          res.G2.Chart,
          [],
          this.$refs.container
        );
        this.dataSet = dataSet;
        this.dataView = dataView;
        this.chart = chart;
        this.slider = createSilder(dataSet, dataView, this.$refs.slider);
      })
      .then(() => {
        this.getData();
      });
  },
  methods: {
    getData() {
      getTradeData("btcusdt")
        .then(res => {
          let data = this.data = res.data;
          if (!this.chart) {
            return;
          }
          let startTime = data[parseInt(data.length / 1.5)].time;
          let endTime = data[data.length - 1].time;

          // 更新chart数据
          this.dataSet.setState("sourceData", data);
          this.dataView.source(this.dataSet.state.sourceData);
          // 更新slider数据
          this.slider.start = startTime;
          this.slider.end = endTime;
          this.slider.changeData(this.dataView.rows);
          // 拖动slider
          this.dataSet.setState("start", startTime);
          this.dataSet.setState("end", endTime);
        })
        .finally(() => {
          this.loading = false;
          // setTimeout(() => {
          //   this.getData();
          // }, 60 * 1000);
        });
    }
  }
};

/**
 * @param {Chart}
 * @param {Object[]}
 * @param {HTMLElement}
 */
function initChart(Chart, data, container) {
  const { dataSet, dataView } = createDataSet({
    dataSetConfig: {
      state: {
        sourceData: data,
        start: Date.now() - 1000 * 60 * 60 * 24,
        end: Date.now()
      }
    },
    transformConfig: [
      {
        type: "fold",
        fields: ["buy", "sell"],
        key: "type",
        value: "value",
        retains: ["time"]
      }
    ]
  });
  const chart = new Chart({
    container: container,
    height: 500,
    forceFit: true,
    padding: CONFIG.isMobile ? [10, 10, 20, 40] : [50, 50, 80, 120]
  });

  chart.source(dataView, {
    time: {
      type: "time",
      nice: false,
      mask: "M/DD H:mm:ss",
      tickCount: 12
      // tickInterval: 2 * 60 * 1000 // 对于 linear 类型的数据，可以设置 tickInterval 参数来设定每个刻度之间的间距，time 类型的单位为微秒
    }
  });
  chart.axis("value", {
    label: {
      formatter: usdtFormatter
    }
  });
  chart.tooltip({
    crosshairs: {
      type: "line"
    }
  });

  chart
    .intervalStack()
    .position("time*value")
    .color("type", tradeColor);
  chart.legend({
    position: "top-right",
    offsetY: CONFIG.isMobile ? 0 : -20
  });

  chart.render();

  return {
    chart,
    dataSet,
    dataView
  };
}
</script>

<style>
@import "../chart.css";
.trade-chart {
  position: relative;
}
</style>

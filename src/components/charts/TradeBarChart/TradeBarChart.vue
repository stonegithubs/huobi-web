

<template>
  <div class="trade-chart">
    <div ref="container">
    </div>
    <div ref="slider" class="chart-slider"> </div>
    <TradePieChart :data="data"></TradePieChart> 
  </div>
</template>

<script>
import CONFIG from "@/config";
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
    };
  },
  props: {
    data: Array,
  },
  watch: {
    data() {
      this.render();
    }
  },
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
      }).then(() => {
        this.render();
      });
  },
  methods: {
    render() {
      let data = this.data;
      if (!this.chart || data.length === 0) {
        return;
      }
      let startTime = new Date(data[parseInt(data.length / 1.5)].time).getTime();
      let endTime = new Date(data[data.length - 1].time).getTime();

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

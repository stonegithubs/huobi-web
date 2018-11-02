

<template>
  <div>
    <div ref="container">
    </div>
    <div ref="slider" class="chart-slider"> </div>
  </div>
</template>

<script>
import { getAmountChartData } from "@/api/chart";
import CONFIG from "@/config";
import {
  fetchAntv,
  createDataSet,
  createSilder,
} from "../antv";
import { colorMap, usdtFormatter } from "../config";

export default {
  name: "DepthLineChart",
  components: {},
  data() {
    return {
    };
  },
  props: {
    data: Array
  },
  mounted() {
    fetchAntv()
      .then(res => {
        const { dataSet, dataView, chart } = initChart(res.Chart, [], this.$refs.container);

        this.dataSet = dataSet;
        this.dataView = dataView;
        this.chart = chart;
        this.slider = createSilder(
          dataSet,
          dataView,
          this.$refs.slider
        );
      })
      .then(() => {
        this.getData();
      });
  },
  methods: {
    getData() {
      getAmountChartData("btcusdt")
        .then(res => {
          let data = res.data;
          if (!this.chart) {
            return;
          }
          let startTime = data[parseInt(data.length / 3)].time;
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
          console.log(this.slider)
        })
        .finally(() => {
          this.$emit('onloaded');
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
        fields: ["bids_max_1", "asks_max_1", "buy_1", "sell_1"],
        key: "type",
        value: "value",
        retains: ["time", "price"]
      },
    ]
  });

  const chart = new Chart({
    container: container,
    height: 500,
    forceFit: true,
    padding: CONFIG.isMobile ? [50, 10, 50, 40] : [50, 50, 80, 120]
  });

  chart.source(dataView, {
    time: {
      type: "time",
      nice: false,
      mask: "M/DD H:mm:ss",
      tickCount: 12
      // tickInterval: 30 * 60 * 1000 // 对于 linear 类型的数据，可以设置 tickInterval 参数来设定每个刻度之间的间距，time 类型的单位为微秒
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
    .line({
      sortable: false
    })
    .position('time*value')
    .color('type', function(val) {
      return colorMap[val];
    });

  chart.legend({
    position: "top-right"
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
</style>

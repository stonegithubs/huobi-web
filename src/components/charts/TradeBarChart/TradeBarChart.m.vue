

<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
import { getTradeData } from "@/api/chart";
import CONFIG from "@/config";
import { fetchAntv, createDataSet, createSilder } from "../antv";
import { tradeColor, usdtFormatter } from "../config";

export default {
  name: "TradeBarChart_M",
  data() {
    return {
    };
  },
  props: {
    symbol: String,
  },
  watch: {
    symbol(symbol) {
      this.getData(symbol);
    }
  },
  mounted() {
    fetchAntv()
      .then(res => {
        const { dataSet, dataView, chart } = initChart(
          res.Chart,
          [],
          this.$refs.canvas
        );
        this.dataSet = dataSet;
        this.dataView = dataView;
        this.chart = chart;
      })
      .then(() => {
        this.getData(this.symbol);
      });
  },
  methods: {
    getData(symbol) {
      this.$emit("onloadstart");
      getTradeData(symbol)
        .then(res => {
           let data = res.data;
            if (!this.chart || data.length === 0) {
              return;
            }
            // 更新chart数据
            this.dataSet.setState("sourceData", data);
            this.dataView.source(this.dataSet.state.sourceData);
            this.chart.changeData(this.dataView.rows);
        })
        .finally(() => {
          this.$emit("onloaded");
        });
    }
  }
};

/**
 * @param {Chart}
 * @param {Object[]}
 * @param {HTMLElement}
 */
function initChart(Chart, data, canvas) {
  const { dataSet, dataView } = createDataSet({
    dataSetConfig: {
      state: {
        sourceData: data,
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
    el: canvas,
    pixelRatio: window.devicePixelRatio,
    padding: [14, "auto", "auto"],
    height: 400,
    width: canvas.parentNode.clientWidth,
  });

  chart.source(dataView, {
    time: {
      type: "timeCat",
      nice: false,
      range: [0, 1],
      mask: "M/DD H:mm:ss",
      tickCount: 5,
    }
  });
  chart.axis("value", {
    label: function formatter(val) {
      return { text: usdtFormatter(val) };
    }
  });
  chart.tooltip(false);
  chart.legend(false); // 不使用默认图例
  chart
    .interval()
    .position("time*value")
    .color("type", tradeColor)
    .adjust('stack');


      // 定义进度条
  chart.scrollBar({
    mode: "x",
    xStyle: {
      offsetY: -5
    }
  });
  chart.render();
  chart.interaction("pinch", {
    minScale: 0,
    maxScale: 6,
    onProcess: (ev) => {
      console.log(ev) 
    }
  }).interaction("pan");
  // console.log(chart._interactions.pinch._doZoom)

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

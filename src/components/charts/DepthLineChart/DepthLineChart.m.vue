

<template>
  <canvas ref="canvas"></canvas>
</template>

<script>
import { getAmountChartData } from "@/api/chart";
import CONFIG from "@/config";
import {
  fetchAntv,
  createDataSet,
  createSilder,
} from "../antv";
import { color, colorMap, usdtFormatter } from "../config";

export default {
  name: "DepthLineChart",
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
        
        const { dataSet, dataView, chart } = initChart(res.Chart, [], this.$refs.canvas);
        this.dataSet = dataSet;
        this.dataView = dataView;
        this.chart = chart;
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
          // 更新chart数据
          this.dataSet.setState("sourceData", data);
          this.dataView.source(this.dataSet.state.sourceData);
          this.chart.changeData(this.dataView.rows)
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
        fields: ["bids_max_1", "asks_max_1", "buy_1", "sell_1"],
        key: "type",
        value: "value",
        retains: ["time", "price"]
      },
    ]
  });

  const chart = new Chart({
    el: canvas,
    pixelRatio: window.devicePixelRatio,
    padding: [14, 'auto', 'auto'],
    // height: '500',
    animate: false // 关闭动画
  });
  console.log(dataView)
  chart.source(dataView.rows, {
    time: {
      type: "timeCat",
      nice: false,
      
      mask: "M/DD H:mm:ss",
      tickCount: 12
      // tickInterval: 30 * 60 * 1000 // 对于 linear 类型的数据，可以设置 tickInterval 参数来设定每个刻度之间的间距，time 类型的单位为微秒
    },
    type: {
      values: ["bids_max_1", "asks_max_1", "buy_1", "sell_1"]
    }
  });
  chart.axis("value", {
    label: function formatter(val) {
    return  {text: usdtFormatter(val)}
}
  });
  // chart.legend(false); // 不使用默认图例
  chart.tooltip(false); // 初始状态关闭 tooltip
  // chart.legend({
  //   position: "top-right"
  // });

  chart.line({
    sortable: false
  }).position('time*value').color('type', function(val) {
    return colorMap[val];
  }).animate({
    appear: {
      duration: 500
    },
    update: {
      animation: 'lineUpdate',
      duration: 500
    }
  });
  
  chart.render();
  chart.interaction('pinch').interaction('pan');
  // 定义进度条
  chart.scrollBar({
    mode: 'x',
    xStyle: {
      offsetY: -5
    }
  });
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

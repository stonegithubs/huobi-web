

<template>
  <div class="trade-pai-chart">
    <div  ref="container">
    </div>
  </div>
</template>

<script>
import moment from "moment";
import throttle from "lodash.throttle";

import { getTradeData } from "@/api/chart";

import { fetchAntv, createDataSet } from "../antv";
import { tradeColor } from "../config";

export default {
  name: "LineCharts",

  data() {
    return {};
  },
  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  watch: {
    data(data) {
      if (this.chart) {
        this.renderChart(data);
      }
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
      })
      .then(() => {
        this.renderChart(this.data);
      });
  },
  methods: {
    renderChart(data) {
      if (this.chart) {
        this.dataSet.setState("sourceData", data);
        this.dataView.source(this.dataSet.state.sourceData);
        return;
      }
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
        sourceData: data
      }
    },
    transformConfig: [
      {
        type: "aggregate",
        fields: ["buy", "sell"],
        operations: ["sum", "sum"],
        as: ["流入", "流出"]
      },
      {
        type: "fold",
        fields: ["流入", "流出"], // 展开字段集
        key: "type", // key字段
        value: "sum" // value字段
      },
      {
        type: "percent",
        field: "sum", // 统计销量
        dimension: "type", // 每年的占比
        as: "percent"
      }
    ]
  });
  const chart = new Chart({
    container: container,
    height: 220,
    width: 220,
    forceFit: true
  });

  chart.source(dataView, {
    sum: {
      formatter(val) {
        return parseInt(val / 10000) + "万";
      }
    }
  });

  chart.coord("theta");
  chart.tooltip({
    showTitle: false
  });

  chart
    .intervalStack()
    .position("percent")
    .color("type", tradeColor)
    .label("sum", {
      offset: -30,
      // autoRotate: false,
      textStyle: {
        rotate: 0,
        textAlign: "center",
        shadowBlur: 2,
        shadowColor: "rgba(0, 0, 0, .45)"
      }
    })
    .tooltip("type*sum", function(type, sum) {
      sum = parseInt(sum / 10000) + "万$";
      return {
        name: type,
        value: sum
      };
    })
    .style({
      lineWidth: 1,
      stroke: "#fff"
    });
  chart.legend(false);
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
<style scoped>
.trade-pai-chart {
  position: absolute;
  right: 14px;
  top: 40px;
  width: 220px;
  height: 220px;
}
</style>


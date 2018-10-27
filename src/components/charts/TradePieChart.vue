

<template>
  <div class="trade-pai-chart">
    <div  ref="container">
    </div>
  </div>
</template>

<script>
import moment from "moment";
import throttle from "lodash.throttle";
import G2 from "@antv/g2";
import DataSet from "@antv/data-set";
import Slider from "@antv/g2-plugin-slider";
import { tradeColor } from "./config";
import { getTradeData } from "@/api/chart";

let preSymbol = "";

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
      this.renderChart(data, 'watch');
    }
  },
  mounted() {
    this.renderChart(this.data);
  },
  methods: {
    renderChart(data) {
      if (this.chart) {
        this.dataSet.setState('sourceData', data)
        this.dataView.source(this.dataSet.state.sourceData)
        return;
      }
      // this.chart.changeData(res.data);
      this.dataView = transformData(data, this);
      this.chart = initChart(this.$refs.container, this);
    },
  }
};

/**
 * @param {Array<Object>}
 * @param {Vue.Component}
 * @return {DateView}
 */
function transformData(data, vm) {
  if (!vm.dataSet) {
    vm.dataSet = new DataSet({
      state: {
        sourceData: data
      },
    });
  }
  if (!vm.dataView) {
    vm.dataView = vm.dataSet.createView({
      watchingStates: ['sourceData']
    });
  }
 
  vm.dataView.source(vm.dataSet.state.sourceData).transform({
    type: 'aggregate',
    fields: ['buy', 'sell'],
    operations: ['sum', 'sum'],
    as: ['流入', '流出'],
  });
  vm.dataView.transform({
    type: 'fold',
    fields: ['流入', '流出'], // 展开字段集
    key: 'type', // key字段
    value: 'sum' // value字段
  });
  vm.dataView.transform({
    type: 'percent',
    field: 'sum', // 统计销量
    dimension: 'type', // 每年的占比
    as: 'percent'
  });
  return vm.dataView;
}
/**
 * @param {Element}
 * @param {Vue.Component}
 */
function initChart(container, vm) {
  var chart = new G2.Chart({
    container: container,
    height: 220,
    width: 220,
    forceFit: true
  });

  chart.source(vm.dataView, {
    sum: {
      formatter(val) {
        return parseInt((val / 10000)) + '万'
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
      sum = parseInt((sum / 10000)) + "万$";
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

  return chart;
}
</script>

<style>
@import "./chart.css";
</style>
<style scoped>
.trade-pai-chart{
  position: absolute;
  right: 14px;
  top: 40px;
  width: 220px;
  height: 220px;
}
</style>




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
// import G2 from "@antv/g2";
// import DataSet from "@antv/data-set";
// import Slider from "@antv/g2-plugin-slider";
import fetchAntv from './antv';
import { tradeColor } from "./config";
import { getTradeData } from "@/api/chart";
import TradePieChart from "./TradePieChart";
import CONFIG from '@/config';

let G = null;
let Slider = null;
let DataSet = null;
let preSymbol = "";

export default {
  name: "LineCharts",
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
    fetchAntv().then((res) => {
      G = res.G;
      Slider = res.Slider;
      DataSet = res.DataSet;
    }).then(() => {
      transformData([], this);
      this.chart = initChart(this.$refs.container, this);
      this.getData();
    });
   
  },
  methods: {
    getData() {
      getTradeData("btcusdt")
        .then(res => {
          this.data = res.data;
          if (this.chart) {
            let startTime = new Date(res.data[parseInt(res.data.length / 1.5)].time).getTime();
            let endTime = new Date(res.data[res.data.length - 1].time).getTime();
            this.dataSet.setState("sourceData", res.data);
            this.dataView.source(this.data);

            this.slider.start = startTime;
            this.slider.end = endTime;
            this.slider.changeData(this.dataView.rows);
            this.dataSet.setState("start", startTime);
            this.dataSet.setState("end", endTime );
          }
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
 * @param {Array<Object>}
 * @param {Vue.Component}
 * @return {DateView}
 */
function transformData(data, vm) {
  if (!vm.dataSet) {
    vm.dataSet = new DataSet({
      state: {
        sourceData: data,
        start: Date.now() - (1000 * 60 * 60 * 24),
        end: Date.now(),
      }
    });
  }
  if (!vm.dataView) {
    vm.dataView = vm.dataSet.createView();
  }

  vm.dataView.source(data).transform({
    type: "fold",
    fields: ["buy", "sell"],
    key: "type",
    value: "value",
    retains: ["time"]
  });
  vm.dataView.transform({
    type: "filter",
    callback: function callback(obj) {
      
      var time = new Date(obj.time).getTime(); // !注意：时间格式，建议转换为时间戳进行比较
      return time >= vm.dataSet.state.start && time <= vm.dataSet.state.end;
    }
  });
  return vm.dataView;
}

/**
 * @param {Element}
 * @param {Vue.Component}
 */
function initChart(container, vm) {
  var chart = new G.Chart({
    container: container,
    height: 500,
    forceFit: true,
    padding: CONFIG.isMobile ? [10, 10, 20, 40] : [50, 50, 80, 120],
  });

  chart.source(vm.dataView, {
    time: {
      type: "time",
      nice: false,
      mask: "M/DD H:mm:ss",
      tickCount: 12
      // tickInterval: 2 * 60 * 1000 // 对于 linear 类型的数据，可以设置 tickInterval 参数来设定每个刻度之间的间距，time 类型的单位为微秒
    }
    // price: {
    //   min: 0,
    //   max: 20000
    // }
  });
  chart.axis("value", {
    label: {
      formatter: function formatter(val) {
        return `${val / 10000}万usdt (${parseInt(val / btcPrice)}฿) `;
      }
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
  // chart
  //   .line()
  //   .position("time*price")
  //   .color("type", '#000');
  chart.render();

  // 创建 Slider
  vm.slider = new Slider({
    container: vm.$refs.slider,
    width: "auto",
    height: 26,
    padding: CONFIG.isMobile ? [0, 10, 0, 40] :  [0, 100, 0, 120],
    start: vm.dataSet.state.start, // 和状态量对应
    end: vm.dataSet.state.end,
    xAxis: "time",
    yAxis: "value",
    scales: {
      time: {
        type: "time",
        tickCount: 100,
        mask: "M/DD H:mm:ss"
      }
    },
    data: vm.dataView.origin,
    backgroundChart: {
      type: "interval"
    },
    onChange: function onChange(_ref) {
      var startValue = _ref.startValue,
        endValue = _ref.endValue;

      vm.dataSet.setState("start", startValue);
      vm.dataSet.setState("end", endValue);
    }
  });
  vm.slider.render();
  return chart;
}
</script>

<style>
@import "./chart.css";
.trade-chart {
  position: relative;
}
</style>

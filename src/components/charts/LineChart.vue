

<template>
  <div>
    <div class="text-center">
      <h3>挂单资金</h3>
    </div>
    <div v-loading="loading" ref="container" class="charts-container">
    </div>
    <div ref="slider" class="chart-slider"> </div>
  </div>
</template>

<script>
import moment from "moment";
import throttle from "lodash.throttle";
import G2 from "@antv/g2";
import DataSet from '@antv/data-set';
import Slider from '@antv/g2-plugin-slider';
import { color } from "./config";
import { getAmountChartData } from '@/api/chart';
import config from '@/config';

export default {
  name: "AmoutChart",
  components: {},
  data() {
    return {
      loading: true,
    };
  },
  props: {
    data: Array
  },
  mounted() {
    // this.chart = initChart(this.$refs.container);
    transformData([], this);
    this.chart = initChart(this.$refs.container, this);

    this.getData();
  },
  methods: {
    getData() {
      getAmountChartData('btcusdt').then((res) => {
        if (this.chart) {
          let data = res.data;
          let startTime = new Date(data[parseInt(data.length / 3)].time).getTime();
          let endTime = new Date(data[data.length - 1].time).getTime();
          console.log(startTime)
          this.dataSet.setState('sourceData', data);
          this.dataView.source(this.dataSet.state.sourceData);

          this.slider.start = startTime;
          this.slider.end = endTime;
          this.slider.changeData(this.dataView.rows);
          this.dataSet.setState("start", startTime);
          this.dataSet.setState("end", endTime );
          return;
        }
        
      
      }).finally(() => {
        this.loading = false;
        // setTimeout(() => {
        //   this.getData();
        // }, 30 * 1000);
      })
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
        sourceData: data,
        start: Date.now() - (1000 * 60 * 60 * 24),
        end: Date.now(),
      }
    });
  }
  if (!vm.dataView) {
    vm.dataView = vm.dataSet.createView();
  }

  vm.dataView.source(vm.dataSet.state.sourceData).transform({
    type: 'fold',
    fields: ['bids_max_1', 'asks_max_1', 'buy_1', 'sell_1'],
    key: 'type',
    value: 'value',
    retains: ['time', 'price'],
  });
  vm.dataView.transform({
    type: 'filter',
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
  var chart = new G2.Chart({
    container: container,
    height: 500,
    forceFit: true,
    padding: config.isMobile ? [50, 10, 50, 40] : [50, 50, 80, 120],
  });

  chart.source(vm.dataView, {
    'time': {
      type: 'time',
      nice: false,
      mask: "M/DD H:mm:ss",
      tickCount: 12,
      // tickInterval: 30 * 60 * 1000 // 对于 linear 类型的数据，可以设置 tickInterval 参数来设定每个刻度之间的间距，time 类型的单位为微秒
    },
    // price: {
    //   min: 0,
    //   max: 20000
    // }
  });
  chart.axis('value', {
    label: {
      formatter: function formatter(val) {
        return  `${(val / 10000)}万usdt (${parseInt(val / btcPrice)}฿) `;
      }
    }
  });
  chart.tooltip({
    crosshairs: {
      type: "line"
    }
  });

  chart
    .line()
    .position("time*value")
    .color("type", color);
  chart.legend({
    position: 'top-right'
  });
  chart.render();
  // 创建 Slider
  vm.slider = new Slider({
    container: vm.$refs.slider,
    width: 'auto',
    height: 26,
    padding: config.isMobile ? [0, 10, 0, 50] : [0, 100, 0, 120],
    start: vm.dataSet.state.start, // 和状态量对应
    end: vm.dataSet.state.end,
    xAxis: 'time',
    yAxis: 'value',
    scales: {
      time: {
        type: 'time',
        tickCount: 100,
        mask: 'M/DD H:mm:ss'
      }
    },
    data: vm.dataView,
    backgroundChart: {
      type: 'line'
    },
    onChange: function onChange(_ref) {
      var startValue = _ref.startValue,
        endValue = _ref.endValue;
      vm.dataSet.setState('start', startValue);
      vm.dataSet.setState('end', endValue);
    }
  });
  vm.slider.render();
  return chart;
}

</script>

<style>
@import './chart.css';
</style>

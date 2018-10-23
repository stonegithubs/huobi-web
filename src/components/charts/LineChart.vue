

<template>
  <div>
    <div  ref="container" class="echarts-container">
    </div>
  </div>
</template>

<script>
import moment from "moment";
import throttle from "lodash.throttle";
import { color } from "./config";
import G2 from "@antv/g2";
import { getAmountChartData } from '@/api/chart';
console.log(G2)
export default {
  name: "AmoutChart",
  components: {},
  data() {
    return {};
  },
  props: {
    data: Array
  },
  mounted() {
    // this.chart = initChart(this.$refs.container);
    this.getData();
  },
  methods: {
    getData() {
      getAmountChartData('btcusdt').then((res) => {
        // this.chart.changeData(res.data);
        this.chart = initChart(this.$refs.container, res.data);
        // chart.render();
      })
    }
  }
};

function initChart(container, data) {
  var ds = new DataSet({
    state: {
      start: new Date(data[data.length / 2].time).getTime(),
      end: Date.now(),
    }
  });
  var dv = ds.createView('origin').source(data);

  dv.transform({
    type: 'filter',
    callback: function callback(obj) {
      var time = new Date(obj.time).getTime(); // !注意：时间格式，建议转换为时间戳进行比较
      return time >= ds.state.start && time <= ds.state.end;
    }
  });
  var chart = new G2.Chart({
    container: container,
    height: 500,
    forceFit: true
  });
  // var scale = {
  //   time: {
  //     type: 'time',
  //     tickCount: 8,
  //     mask: 'm/dd hh:MM:SS'
  //   },
  //   amount: {
  //     alias: 'bu'
  //   },
  //   rain: {
  //     alias: '降雨量(mm)'
  //   }
  // };
  chart.source(dv, {
    'time': {
      type: 'time',
      nice: false,
      mask: "M/DD h:mm:ss",
      tickInterval: 30 * 60 * 1000 // 对于 linear 类型的数据，可以设置 tickInterval 参数来设定每个刻度之间的间距，time 类型的单位为微秒
    },
    // value: {
    //   tickInterval: 10
    // }
  });
  chart.tooltip({
    crosshairs: {
      type: "line"
    }
  });
  chart.axis("amount", {
    label: {
      formatter: function formatter(val) {
        return val + "$";
      }
    }
  });
  chart
    .line()
    .position("time*amount")
    .color("type");
  chart.render();

  // 创建 Slider
  var slider = new Slider({
    container: containerp,
    width: 'auto',
    height: 26,
    start: ds.state.start, // 和状态量对应
    end: ds.state.end,
    xAxis: 'time',
    yAxis: 'flow',
    scales: {
      time: {
        type: 'time',
        tickCount: 10,
        mask: 'M/DD H:mm:ss'
      }
    },
    data: dv,
    backgroundChart: {
      type: 'line'
    },
    onChange: function onChange(_ref) {
      var startValue = _ref.startValue,
        endValue = _ref.endValue;

      ds.setState('start', startValue);
      ds.setState('end', endValue);
    }
  });
  slider.render();
  return chart;
}
</script>

<style>
.echarts-container{
  position: relative;
}
</style>

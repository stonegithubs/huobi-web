

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

export default {
  name: "LineCharts",
  components: {},
  data() {
    return {};
  },
  props: {
    data: Array
  },
  watch: {
    asksList: throttle(
      function(asksList) {
        this.push();
      },
      5000,
      { trailing: false, leading: true }
    )
  },
  mounted() {
    this.chart = initChart(this.$refs.container);
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

  const chart = new G2.Chart({
    container: container,
    width: container.clientWidth,
    height: 500,
    forceFit: true
  });

  chart.source(data, {
    'time': {
      type: 'time',
      nice: false,
      mask: "MM/DD h:mm:ss",
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
  return chart;
}
</script>

<style>
.echarts-container{
  position: relative;
}
</style>

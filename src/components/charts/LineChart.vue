

<template>
  <div>
    <div ref="container" class="echarts-container">
    </div>
  </div>
</template>

<script>
import moment from "moment";
import throttle from 'lodash.throttle';

import { color } from './config';

const echarts = require("echarts");

let preSymbol = '';
let option = {
  color,
  title: {
    text: "量的博弈",
    subtext: "",
    x: "left",
    align: "right"
  },
  grid: {
    bottom: 80
  },

  tooltip: {
    trigger: "axis",
    axisPointer: {
        type: 'cross',
        animation: false,
        label: {
            backgroundColor: '#505765'
        }
    }
  },
  legend: {
    data: ["买(amount)", "卖(amount)", "买一(amount)", "卖一(amount)"],
    x: "center"
  },
  dataZoom: [
    {
      show: true,
      realtime: true,
      start: 50,
      end: 100
    },
    {
      type: "inside",
      realtime: true,
      start: 50,
      end: 100
    }
  ],
  xAxis: [
    {
      type: "category",
      boundaryGap: false,
      axisLine: { onZero: false },
      data: []
    }
  ],
  yAxis: [
    {
      name: "买(amount)",
      type: "value",
      max: 1000
    },
    {
      name: "卖(amount)",
      nameLocation: "start",
      max: 1000,
      type: "value",
      inverse: true
    }
  ],
  series: [
    {
      name: "买(amount)",
      type: "line",
      animation: false,
      areaStyle: {
        normal: {}
      },
      lineStyle: {
        normal: {
          width: 1
        }
      },
      markArea: {
        silent: true,
        data: [
          [
            {
              xAxis: "2009/9/12\n7:00"
            },
            {
              xAxis: "2009/9/22\n7:00"
            }
          ]
        ]
      },
      data: []
    },
    {
      name: "卖(amount)",
      type: "line",
      yAxisIndex: 1,
      animation: false,
      areaStyle: {
        normal: {}
      },
      lineStyle: {
        normal: {
          width: 1
        }
      },
      markArea: {
        silent: true,
        data: [
          [
            {
              xAxis: "2009/9/10\n7:00"
            },
            {
              xAxis: "2009/9/20\n7:00"
            }
          ]
        ]
      },
      data: []
    },
    {
        name: '买一(amount)',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        data: []
    },
    {
        name: '卖一(amount)',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        data: []
    }
  ]
};
export default {
  name: "LineCharts",
  components: {},
  data() {
    return {
    };
  },
  props: {
    asksList: Array,
    bidsList: Array,
    aksFirst: Array,
    bidsFirst: Array,
    symbol: String,
  },
  watch: {
      asksList:throttle(function(asksList) {
          this.push();
      }, 5000, {trailing: false, leading: true})
  },
  mounted() {
    // 基于准备好的dom，初始化echarts实例
    this.chart = echarts.init(this.$refs.container);
    // 绘制图表
    this.chart.setOption(option);
  },
  methods: {
      push() {
          if (option.dataZoom) {
            delete option.dataZoom;
            delete option.title;
            delete option.grid;
            delete option.toolbox;
            delete option.tooltip;
            delete option.legend;
            
          }
          if (option.xAxis[0].data.length > 3000) {
              option.xAxis[0].data.shift();
              option.series[0].data.shift();
              option.series[1].data.shift();
              option.series[2].data.shift();
              option.series[3].data.shift();
          }
          let maxAmount = this.bidsList[0].amount > this.asksList[0].amount
                            ? this.bidsList[0].amount
                            : this.asksList[0].amount;
          if (preSymbol !== this.symbol) {
            option.yAxis[0].min = (maxAmount * 0.3) | 0;
            option.yAxis[0].max = (maxAmount * 6 | 0);
            option.yAxis[1].min = (maxAmount * 0.3) | 0;
            option.yAxis[1].max = (maxAmount * 6) | 0;

            option.xAxis[0].data = [];
            option.series[0].data = [];
            option.series[1].data = [];
            option.series[2].data = [];
            option.series[3].data = [];
            preSymbol = this.symbol;
          }
          option.xAxis[0].data.push(moment().format("YYYY/MM/DD h:mm:ss"));
          option.series[0].data.push({
              value: this.bidsList[0].amount,
              ...this.bidsList[0]
          });
          option.series[1].data.push({
              value: this.asksList[0].amount,
              ...this.asksList[0]
          });
          option.series[2].data.push({
              value: this.bidsFirst[1],
              price: this.bidsFirst[0]
          });
          option.series[3].data.push({
              value: this.aksFirst[1],
              price: this.aksFirst[0]
          });
          this.chart.setOption(option);
      }
  }
};
</script>

<style>
</style>

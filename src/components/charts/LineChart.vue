

<template>
  <div>
    <canvas ref="canvas" width="1000px" height="500px"></canvas>
  </div>
</template>

<script>
import moment from "moment";
const echarts = require("echarts");
let option = {
  title: {
    text: "关系图",
    subtext: "",
    x: "center",
    align: "right"
  },
  grid: {
    bottom: 80
  },
  toolbox: {
    feature: {
      dataZoom: {
        yAxisIndex: "none"
      },
      restore: {},
      saveAsImage: {}
    }
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
      animation: false,
      label: {
        backgroundColor: "#505765"
      }
    }
  },
  legend: {
    data: ["买", "卖", "买一", "卖一"],
    x: "left"
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
      name: "买",
      type: "value",
      max: 1000
    },
    {
      name: "卖",
      nameLocation: "start",
      max: 1000,
      type: "value",
      inverse: true
    }
  ],
  series: [
    {
      name: "买",
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
      name: "卖",
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
        name: '买一',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        data: []
    },
    {
        name: '卖一',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        data: []
    }
  ]
};
export default {
  name: "charts",
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
      asksList(asksList) {
          this.push(this.bidsList, this.asksList);
      },
  },
  mounted() {
    // 基于准备好的dom，初始化echarts实例
    this.chart = echarts.init(this.$refs.canvas);
    // 绘制图表
    this.chart.setOption(option);
  },
  methods: {
      push(seriesData, seriesData2) {
          if (option.dataZoom) {
            delete option.dataZoom;
            delete option.title;
            delete option.grid;
            delete option.toolbox;
            delete option.tooltip;
            delete option.legend;
            
          }
          if (option.xAxis[0].data.length > 2000) {
              option.xAxis[0].data.shift();
              option.series[0].data.shift();
              option.series[1].data.shift();
              option.series[2].data.shift();
              option.series[3].data.shift();
          }
          option.yAxis[0].min = (this.bidsList[0].amount * 0.4) | 0;
          option.yAxis[0].max = (this.bidsList[0].amount * 6 | 0);
          option.yAxis[1].min = (this.asksList[0].amount * 0.4) | 0;
          option.yAxis[1].max = (this.asksList[0].amount * 6) | 0;
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

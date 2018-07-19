

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
    text: "金额流动",
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
    data: ["买入金额($)", "卖出金额($)"],
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
  yAxis: {
      splitArea: {show: false}
  },
  series: [
    {
        name: '买入金额',
        type: 'bar',
        stack: 'one',
        showSymbol: false,
        hoverAnimation: false,
        data: []
    },
    {
        name: '卖出金额',
        type: 'bar',
        stack: 'one',
        showSymbol: false,
        hoverAnimation: false,
        data: []
    }
  ]
};
export default {
    name: "BineCharts",
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
                if (!this.bidsList.length && !this.asksList.length) {
                    return;
                }
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
                }
                if (preSymbol !== this.symbol) {
                    option.xAxis[0].data = [];
                    option.series[0].data = [];
                    option.series[1].data = [];
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

                this.chart.setOption(option);
            }
    }
};
</script>

<style>
</style>

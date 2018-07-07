

<template>
  <div >
      <div class="echarts-container" ref="container">

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
        text: '买一卖一(price)',
        subtext: ''
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            animation: false,
            label: {
                backgroundColor: '#505765'
            }
        }
    },
    legend: {
        data:['多方压力位','空方压力位', '买一' ,'卖一', '当前价格']
    },

    dataZoom: [
        {
            show: true,
            realtime: true,
            yAxisIndex: 0,
            start: 74,
            end: 90
        },
        {
            show: true,
            realtime: true,
            xAxisIndex: 0,
            start: 40,
            end: 100
        },
    ],
    xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLine: {onZero: false},
        data: []
    },
    yAxis: {
        type: 'value',
        axisLabel: {
            formatter: '{value} $'
        },
        min: 4000,
    },
    series: [
        {
            name:'多方压力位',
            type:'line',
            data:[],
        },
        {
            name:'空方压力位',
            type:'line',
            data:[],
        }, {
            name:'买一',
            type:'line',
            data:[]
        }, {
            name:'卖一',
            type:'line',
            data:[]
        }, {
            name:'当前价格',
            type:'line',
            data:[]
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
    lastKline: Object,
    symbol: String,
  },
  watch: {
      lastKline: throttle(function (lastKline) {
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
            delete option.title;
            delete option.tooltip;
            delete option.legend;
            delete option.toolbox;
            delete option.dataZoom;
          }
          if (option.xAxis.data.length > 3000) {
              option.xAxis.data.shift();
              option.series[0].data.shift();
              option.series[1].data.shift();
              option.series[2].data.shift();
              option.series[3].data.shift();
              option.series[4].data.shift();
          }
          let btcPrice = 1;
          if (this.symbol.substr(-3) === "btc") {
                btcPrice = 6626;
            }
          if (preSymbol !== this.symbol) {
            let lastClose = this.lastKline.close * btcPrice;
            option.yAxis.max = (lastClose + (lastClose * 0.2)).toFixed(2);
            option.yAxis.min = (lastClose - (lastClose * 0.2)).toFixed(2);
            option.xAxis.data = [];
            option.series[0].data = [];
            option.series[1].data = [];
            option.series[2].data = [];
            option.series[3].data = [];
            option.series[4].data = [];
            preSymbol = this.symbol;
          }
          
          option.xAxis.data.push(moment().format("YYYY/MM/DD h:mm:ss"));
          option.series[0].data.push({
              value: this.bidsList[0].price * btcPrice,
              name: 'price',
              ...this.bidsList[0]
          });
          option.series[1].data.push({
              value: this.asksList[0].price * btcPrice,
              name: 'price',
              ...this.asksList[0]
          });
          option.series[2].data.push({
              count: this.bidsFirst[1],
              name: 'price',
              value: this.bidsFirst[0] * btcPrice
          });
          option.series[3].data.push({
              count: this.aksFirst[1],
              name: 'price',
              value: this.aksFirst[0] * btcPrice
          });
          option.series[4].data.push({
              value: this.lastKline.close * btcPrice,
              name: 'price',
          });
          this.chart.setOption(option);
      }
  }
};
</script>

<style>
</style>

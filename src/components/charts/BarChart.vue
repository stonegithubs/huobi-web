

<template>
  <div>
    <div ref="container" class="echarts-container">
    </div>
  </div>
</template>

<script>
import moment from "moment";
import throttle from 'lodash.throttle';
import getPriceIndex from '@/utils/getPriceIndex';
import { color } from './config';

const echarts = require("echarts");

let preSymbol = '';

let option = {
  color,
  title: {
    text: "金额流动(usdt / k)",
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
    data: ["买入金额($/k)", "卖出金额($/k)"],
    x: "center"
  },
  dataZoom: [
    {
      show: true,
      realtime: true,
      start: 10,
      end: 100
    },
    {
      type: "inside",
      realtime: true,
      start: 10,
      end: 100
    }
  ],
  xAxis: [
    {
      type: "category",
      boundaryGap: true,
      axisLine: { onZero: false },
      data: []
    }
  ],
  yAxis: {
      splitArea: {show: false}
  },
  series: [
    {
        name: '买入金额($/k)',
        type: 'bar',
        stack: 'one',
        showSymbol: false,
        hoverAnimation: false,
        data: []
    },
    {
        name: '卖出金额($/k)',
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
        symbol: String,
        trade: Object,
    },
    watch: {
        trade() {
            this.trade.data.forEach((item) => {
                this.push(item);
            });
        }
    },
    mounted() {
        // 基于准备好的dom，初始化echarts实例
        this.chart = echarts.init(this.$refs.container);
        // 绘制图表
        this.chart.setOption(option);

        delete option.dataZoom;
        delete option.title;
        delete option.grid;
        delete option.toolbox;
        delete option.tooltip;
        delete option.legend;

        this._price = 1;
    },
    methods: {
        /**
         * @interface {
         *  amount: number
         *  direction: "sell" | "buy"
         *  id: number
         *  price: number
         *  ts: Date
         * }
         */
        push(data) {
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
                this._price = getPriceIndex(this.symbol);
            }

            // 时间取15320829   8位作为参考, 大概是1分40s之间的交易会汇总
            let _time = data.ts.toString().substring(0, 8);
            let preIndex = option.xAxis[0].data.length === 0 ? 0 : option.xAxis[0].data.length - 1;
            let preXData = option.xAxis[0].data[preIndex];
            // 时间填充0补齐 -> 15320829 0000000
            let _timeToStringDate = _time.padEnd(13, '0');
            let usdt = (data.price * data.amount * this._price) | 0 ;
            console.log(option)
            if (preXData === undefined || new Date(preXData.ts).getTime() < new Date(Number(_timeToStringDate)).getTime()) {
                option.xAxis[0].data.push({
                    value: moment(Number(_timeToStringDate)).format("YYYY/MM/DD h:mm:ss"),
                    ts: Number(_timeToStringDate)
                });
                option.series[1].data[option.xAxis[0].data.length - 1] = 0;
                option.series[0].data[option.xAxis[0].data.length - 1] = 0;
                // buyt or sell
                if (data.direction === 'buy') {
                    option.series[0].data.push(usdt);
                } else {
                    option.series[1].data.push(usdt);
                }
                
                this.chart.setOption(option);
            } else if (preXData = _time) {
                let lastIndex = option.xAxis[0].data.length - 1;
                console.log(data)
                // 合并交易额
                if (data.direction === 'buy') {
                    option.series[0].data[lastIndex] += usdt;
                } else {
                    option.series[1].data[lastIndex] += usdt;
                }
                this.chart.setOption(option);
            }
            
        }
    }
};
</script>

<style>
</style>

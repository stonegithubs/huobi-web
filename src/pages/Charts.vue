<template>
  <div class="chart-page">
      <el-card class="chart-wrap">
           <LineChart
                :asksList="asksList"
                :bidsList="bidsList"
                :aksFirst="aksFirst"
                :bidsFirst="bidsFirst"
                :symbol="responseSymbol"
            ></LineChart>
      </el-card>
       <!-- <el-card class="chart-wrap">
         <LineChart2
            :lastKline="lastKline"
            :asksList="asksList"
            :bidsList="bidsList"
            :aksFirst="aksFirst"
            :bidsFirst="bidsFirst"
            :symbol="responseSymbol"
          >
          </LineChart2>
      </el-card> -->

      <el-card class="chart-wrap">
          <TradeBarChart
            :trade="trade"
            :symbol="responseSymbol"
          >

          </TradeBarChart>
      </el-card>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import config from '@/config';
import {LineChart, LineChart2, TradeBarChart} from '@/components/charts';
export default {
    name: "Charts",
    components: {
        LineChart,
        LineChart2,
        TradeBarChart
    },
    data() {
        return {
        };
    },
    computed:{
        ...mapState({
            bidsFirst: state => state.huobi.bidsFirst,
            bidsList: state => state.huobi.bidsList,
            aksFirst: state => state.huobi.aksFirst,
            asksList: state => state.huobi.asksList,
            lastKline: state => state.huobi.lastKline,
            responseSymbol: state => state.huobi.responseSymbol,
            trade: state => state.huobi.trade,
        }),
    },

    created() {
    },
    mounted() {

    },
    beforeDestroy() {

    },
    methods: {

    }
};
</script>

<style lang="scss">
.chart-page{
    .chart-wrap{
        margin-top: 10px;
    }
}
</style>

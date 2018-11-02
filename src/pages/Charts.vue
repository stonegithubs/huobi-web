<template>
  <div class="chart-page">
      <el-card class="chart-wrap">
           <DepthLineChart
                :asksList="asksList"
                :bidsList="bidsList"
                :aksFirst="aksFirst"
                :bidsFirst="bidsFirst"
                :symbol="responseSymbol"
            ></DepthLineChart>
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
import {DepthLineChart, TradeBarChart} from '@/components/charts';
export default {
    name: "Charts",
    components: {
        DepthLineChart,
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
        margin-bottom: 10px;
    }
}
</style>

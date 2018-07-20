<template>
  <div class="tab-content">
      <div class="">
          <LineChart
            :asksList="asksList"
            :bidsList="bidsList"
            :aksFirst="aksFirst"
            :bidsFirst="bidsFirst"
            :symbol="responseSymbol"
          ></LineChart>
      </div>
      <div class="">
          <LineChart2
            :lastKline="lastKline"
            :asksList="asksList"
            :bidsList="bidsList"
            :aksFirst="aksFirst"
            :bidsFirst="bidsFirst"
            :symbol="responseSymbol"
          >

          </LineChart2>
      </div>

      <div>
          <BarChart
            :trade="trade"
            :symbol="responseSymbol"
          >

          </BarChart>
      </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import config from '@/config';
import {LineChart, LineChart2, BarChart} from '@/components/charts';
export default {
    name: "Charts",
    components: {
        LineChart,
        LineChart2,
        BarChart
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
        this.$el.style.maxHeight = window.innerHeight - 50 + 'px';
    },
    beforeDestroy() {

    },
    methods: {

    }
};
</script>

<style>
.echarts-container{
    min-width: 500px;
    width: 90vw;
    height: 600px;
}
</style>

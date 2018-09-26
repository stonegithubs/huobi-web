<template>
    <div>
        <div class="tickList" ref="tickList">
            <div class="flex-row container">
                <div class="flex-1">
                    <DensityTable :data="buyDensityList" :quoteCurrency="quoteCurrency"></DensityTable>
                </div>
                <div class="flex-1">
                    <DensityTable :data="sellDensityList" :quoteCurrency="quoteCurrency"></DensityTable>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import { mapState, mapGetters } from 'vuex';
// utils
import getOrderDensity from '@/utils/getOrderDensity';
// components
import DensityTable from '@/components/table/DensityTable';
// api

export default {
    name: "Density",
    components: {
        DensityTable,
    },
    data() {
        return {
            /* 交易对 */
            buyDensityList: {},
            sellDensityList: {}
        };
    },
    computed:{
        ...mapState({
            tick: state => state.huobi.tick,
            bidsFirst: state => state.huobi.bidsFirst,
            aksFirst: state => state.huobi.aksFirst,
            lastKline: state => state.huobi.lastKline,
            responseSymbol: state => state.huobi.responseSymbol,
        }),
        ...mapGetters([
            'useWSAble'
        ]),
        quoteCurrency() {
            if (!this.responseSymbol) {
                return 'usdt';
            } else if (this.responseSymbol.endsWith('btc')) {
                return 'btc';
            } else if (this.responseSymbol.endsWith('eth')) {
                return 'eth';
            }
        },
    },
    watch: {
        tick(){
            
            let res = getOrderDensity({
                asksList: this.tick.asks ,
                bidsList: this.tick.bids ,
                currentPrice: this.lastKline.close,
                symbol: this.responseSymbol,
            });
            this.buyDensityList = res.buy;
            this.sellDensityList = res.sell;
        }
    },
    created() {
        
    },
    mounted() {
        this.$refs.tickList.style.maxHeight = window.innerHeight - 50 + 'px';
        // this.subscribeDisable = !this.useWSAble;
    },
    beforeDestroy() {
        
    },
    methods: {
       
    }
};
</script>

<style>
.tickList {
  padding: 0px 0;
  overflow: auto;
  align-content:flex-start;
  align-items: flex-start;
}
.tickList .flex-1{
  align-self: start;
}

</style>

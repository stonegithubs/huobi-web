<template>
  <div>
    <div>
      
      <el-button type="primary" :loading="isLoading" @click="start" size="small">开始</el-button>

      <el-select v-model="orderByProperty" placeholder="请选择" size="small">
        <el-option value="tickDis">买一/卖一(总价格)</el-option>
        <el-option value="maxCountDis">买单数(max)/卖单数(max)</el-option>
        <el-option value="lengthDis">buyCount / sellCount</el-option>
      </el-select>
      <el-button type="primary"  @click="orderBy" size="small">排序</el-button>
    </div>
    <div ref="tickList" style="overflow: auto;">
      <table>
          <thead>
              <tr>
                  <th>
                  Symbols
                  </th>
                  <th>
                  买一/卖一(价格)
                  </th>
                  <th>
                  买单数(max)/卖单数(max)
                  </th>
                  <th>
                  buyCount / sellCount
                  </th>
              </tr>
          </thead>
          <tbody>
          <tr
              v-for="(item, index) in list"
              :key="index"
          >
              <td>{{item.symbol}}</td>
              <td>{{item.tickDis}}</td>
              <td>{{item.maxCountDis}}</td>
              <td>{{item.lengthDis}}</td>
          </tr>
          </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import config from '@/config';
import { getDepth, getSymbols } from '@/api/huobiREST';
// utils
import getSameAmount from '@/utils/getSameAmount';

export default {
  name: "Difference",
  components: {

  },
  data() {
    return {
      list: [],
      isLoading: false,
      orderByProperty: 'tickDis'
    };
  },
  created() {
  },
  mounted() {
    this.$refs.tickList.style.maxHeight = window.innerHeight - 50 + 'px';
  },
  beforeDestroy() {

  },
  methods: {
    start() {
      this.list.splice(0, this.list.length - 1);
      this.getAllDetail();
    },
    getAllDetail: async function () {
      this.isLoading = true;
      let symbols = await getSymbols();
      let newSymbols = symbols.filter((item) => {
        return (item['quote-currency'] === 'usdt' || item['quote-currency'] === 'btc');
      });
      for(let i = 0; i < newSymbols.length; i++) {
        let item = newSymbols[i];
        let minSumPrice, minPrice;
        let _symbols = item['base-currency'] + item['quote-currency'];
        let res;
        try {
          res = await getDepth(_symbols, 'step0');
        } catch (error) {
          this.isLoading = false;
          throw error;
        }
        
        let bids = res.tick.bids;
        let asks = res.tick.asks;
        // 设置精度
        getSameAmount.setConfig({ pricePrecision: item['price-precision'] });
        switch(item['quote-currency']) {
          case 'btc':
            // 有多单时， 总和超过最小价，低于则不显示
            minSumPrice = 0.15;
            // 1单时， 总和超过最小价，低于则不显示
            minPrice = 0.5;
            break;
          case 'usdt': 
            // 有多单时， 总和超过最小价，低于则不显示
            minSumPrice = 200;
            // 1单时， 总和超过最小价，低于则不显示
            minPrice = 1000;
        }
        let bidsList = getSameAmount(bids, {
          minSumPrice,
          minPrice,
          type: 'bids'
        });
        let asksList = getSameAmount(asks, {
          minSumPrice,
          minPrice,
          type: 'asks'
        });
        let bidsAvg = 1;
        let asksAvg = 1;
        if (!bidsList.length || !asksList.length) {
          continue;
        }
        if (bidsList.length > 1) {
          bidsAvg = (Number(bidsList[0].sumMoneny) + Number(bidsList[1].sumMoneny)) / 2;
        } else if (bidsList.length === 1) {
          bidsAvg =  Number(bidsList[0].sumMoneny);
        }
        if (asksList.length > 1) {
          asksAvg = (Number(asksList[0].sumMoneny) + Number(asksList[1].sumMoneny)) / 2;
        } else if (asksList.length === 1) {
          asksAvg =  Number(asksList[0].sumMoneny);
        }
        let tickDis = bidsAvg / asksAvg;

        let bidsListOrderByCount = bidsList.sort(function (a, b) {
          return b.count - a.count;
        });
        let asksListOrderByCount = asksList.sort(function (a, b) {
          return b.count - a.count;
        });
        this.list.push({
          symbol: _symbols,
          tickDis: tickDis.toFixed(3),
          maxCountDis: (bidsListOrderByCount[0].count / asksListOrderByCount[0].count).toFixed(3),
          lengthDis: (bidsList.length / asksList.length).toFixed(3)
        });
      }

      this.isLoading = false;
    },
    orderBy() {
      
      this.list.sort((a, b) => {
        return b[this.orderByProperty] - a[this.orderByProperty];
      });
    }
  }
};
</script>

<style>


</style>

<template>
  <div>
    <div>
      
      <el-button type="primary" :loading="isLoading" @click="start" size="small">开始</el-button>

      <el-select v-model="orderByProperty" placeholder="请选择" size="small">
        <el-option value="tickDis">买一/卖一(总价格)</el-option>
        <el-option value="maxCountDis">买单数(max)/卖单数(max)</el-option>
        <el-option value="lengthDis">buyCount / sellCount</el-option>
        <el-option value="buy1Money">买一总价($)</el-option>
        <el-option value="sell1Money">卖一总价($)</el-option>
      </el-select>
      <el-button type="primary"  @click="orderBy" size="small">排序</el-button>
      <el-button type="danger"  @click="stopSearch" size="small">中断自动查询</el-button>
    </div>
    <div ref="tickList" style="overflow: auto;">
      <div>
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
                    <th>
                    买一总价($/k)
                    </th>
                    <th>
                    卖一总价($/k)
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
                <td>{{(item.buy1Money / 1000).toFixed(2)}}</td>
                <td>{{(item.sell1Money / 1000).toFixed(2)}}</td>
            </tr>
            </tbody>
        </table>
      </div>
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
    this.seachAble = true;
  },
  beforeDestroy() {

  },
  methods: {
    start() {
      this.getAllDetail();
    },
    getAllDetail: async function () {
      // this.list.length = 0;
      const list = this.list.length === 0 ? this.list : [];
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
        let bidsList = getSameAmount(bids, {
          pricePrecision: item['price-precision'],
          amountPrecision: item['amount-precision'],
          quoteCurrency: item['quote-currency'],
          type: 'bids'
        });
        let asksList = getSameAmount(asks, {
          pricePrecision: item['price-precision'],
          amountPrecision: item['amount-precision'],
          quoteCurrency: item['quote-currency'],
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
        // 买一/卖一
        let tickDis = bidsAvg / asksAvg;
        // 买一卖一价格($)
        let buy1Money = bidsList[0].sumDollar;
        let sell1Money = asksList[0].sumDollar;
        let bidsListOrderByCount = bidsList.sort(function (a, b) {
          return b.count - a.count;
        });
        let asksListOrderByCount = asksList.sort(function (a, b) {
          return b.count - a.count;
        });
        list.push({
          symbol: _symbols,
          tickDis: tickDis.toFixed(3),
          maxCountDis: (bidsListOrderByCount[0].count / asksListOrderByCount[0].count).toFixed(3),
          lengthDis: (bidsList.length / asksList.length).toFixed(3),
          buy1Money,
          sell1Money,
        });
      }

      if (list !== this.list) {
        this.list.length = 0;
        this.list = list;
      }
      
      this.isLoading = false;
      this.orderBy();
      if (!this.seachAble) {
        return;
      }
      setTimeout(() => {
        this.start();
      }, 2000);
    },
    orderBy() {
      
      this.list.sort((a, b) => {
        return b[this.orderByProperty] - a[this.orderByProperty];
      });
    },
    stopSearch() {
      this.seachAble = false;
    }
  }
};
</script>

<style>


</style>

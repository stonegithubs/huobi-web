<template>
  <div>
    <div>
      
      <el-button type="primary" :loading="isLoading" @click="start" size="small">开始</el-button>

      <el-select v-model="orderByProperty" placeholder="请选择" size="small">
        <el-option value="bids_max_1">bids_max_1</el-option>
        <el-option value="asks_max_1">asks_max_1</el-option>
         <el-option value="oBidsLen/oAsksLen">oBidsLen/oAsksLen</el-option>
        <el-option value="bidsRobotMaxCount">bidsRobotMaxCount</el-option>
        <el-option value="asksRobotMaxCount">asksRobotMaxCount</el-option>
      </el-select>
      <el-button type="primary"  @click="orderBy" size="small">排序</el-button>
    </div>
    <div class="table-sm" ref="tickList" style="overflow: auto;">
      <div>
        <table>
            <thead>
                <tr>
                    <th>
                    Symbols
                    </th>
                  <!--   <th>
                    buy_1/sell_1
                    </th> -->
                    <th>
                    bids_max_1
                    </th>
                    <th>
                    asks_max_1
                    </th>
                  <!--   <th>
                    bids_max_2/asks_max_2
                    </th> -->
                    <th>
                    oBidsLen / oAsksLen
                    </th>
                    <th>
                    bidsLen / asksLen
                    </th>
                    <th>
                    bidsRobot/asksRobot
                    </th>
                </tr>
            </thead>
            <tbody>
            <tr
                v-for="(item, index) in list"
                :key="index"
            >
                <td>{{item.symbol}}</td>
                <td>{{toBTCAmount(item.bids_max_1)}}฿</td>
                <td>{{toBTCAmount(item.asks_max_1)}}฿</td>
              <!--   <td>{{trans(item.buy_1, item.sell_1)}}</td> -->
                <!-- <td>{{trans(item.bids_max_1, item.asks_max_1)}}</td> -->
                <!-- <td>{{trans(item.bids_max_2, item.asks_max_2)}}</td> -->
                <td>{{trans(item.originBidsLen, item.originAsksLen)}}</td>
                <td>{{trans(item.bidsLen, item.asksLen)}}</td>
                <td>{{trans(item.bidsRobotMaxCount, item.asksRobotMaxCount)}}</td>
            </tr>
            </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import config from '@/config';
import { getDiffSymbols, getCharacteristic } from '@/api/diff';
export default {
  name: "Difference",
  components: {

  },
  data() {
    return {
      list: [],
      isLoading: false,
      orderByProperty: 'bids_max_1'
    };
  },
  created() {
  },
  mounted() {
    this.seachAble = true;
    this.start();
  },
  beforeDestroy() {

  },
  methods: {
    start() {
      this.list = []
      getCharacteristic('all').then(res => {
        let data = res.data;
        for (let symbol in data) {
          let item = data[symbol];
          this.list.push({
            'oBidsLen/oAsksLen': item.originBidsLen / item.originAsksLen,
            ...item
          });
        }
      });
    },
    getDiffSymbols () {
      getDiffSymbols().then((res) => {
        this.symbols = res.data;
      });
    },
    getDiffData(symbol) {
      return getCharacteristic(symbol).then(res => {
        this.list.push(res);
      });
    }, 
    orderBy() {
      
      this.list.sort((a, b) => {
        return b[this.orderByProperty] - a[this.orderByProperty];
      });
    },
    stopSearch() {
      this.seachAble = false;
    },
    trans(b, a) {
      return `${b}/${a} = ${(b / a).toFixed(2)}`;
    },
    toBTCAmount(price) {
      return (price / appConfig.prices.btc).toFixed(3);
    }
  }
};
</script>

<style>


</style>

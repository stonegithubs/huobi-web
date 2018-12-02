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
                <!-- <td>{{trans(item.bids_max_2, item.asks_max_2)}}</td> -->
                <td>{{trans(item.originBidsLen, item.originAsksLen)}}</td>
                <td>{{trans(item.bidsLen, item.asksLen)}}</td>
                <td>{{trans(item.bidsRobotMaxCount, item.asksRobotMaxCount)}}</td>
                <td><el-button type="text"  @click="getHistory(item.symbol)" size="small">查看历史</el-button></td>
            </tr>
            </tbody>
        </table>
      </div>
    </div>

    <el-dialog
        title="图表"
        :visible.sync="dialogVisible"
        width="90%"
        >
        <DepthLineChart
          :data="depthData"
          :loading="depthLoading"
          @onPeriodChange="changePeriod"
        ></DepthLineChart>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false" size="small">取 消</el-button>
            <el-button type="primary" @click="dialogVisible = false" size="small">确 定</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import config from '@/config';
import { getDiffSymbols, getCharacteristic, getCharDepth } from '@/api/diff';
import { DepthLineChart } from "@/components/charts";
export default {
  name: "Difference",
  components: {
    DepthLineChart,
  },
  data() {
    return {
      list: [],
      isLoading: false,
      depthLoading: true,
      depthData: [],
      dialogVisible: false,
      orderByProperty: 'bids_max_1',
      selectedSymbol: '',
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
    changePeriod(type, val) {
      switch (type) {
        case "depth":
          this.getDepthData(val);
          break;
      }
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
    stopSearch() {
      this.seachAble = false;
    },
    trans(b, a) {
      return `${b}/${a} = ${(b / a).toFixed(2)}`;
    },
    toBTCAmount(price) {
      return (price / appConfig.prices.btc).toFixed(3);
    },
    getHistory(symbol) {
      this.dialogVisible = true;
      this.selectedSymbol = symbol;
      this.getDepthData();
    },
    getDepthData(period = '') {
      this.depthLoading = true;
      getCharDepth(this.selectedSymbol, { period, })
        .then(res => {
          this.depthData = res.data;
        })
        .finally(() => {
          this.depthLoading = false;
        });
    }
  }
};
</script>

<style>


</style>

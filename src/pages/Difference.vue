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
import { getDiffSymbols } from '@/api/diff';
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
    this.seachAble = true;
    this.getDiffSymbols();
  },
  beforeDestroy() {

  },
  methods: {
    start() {
    },
    getDiffSymbols () {
      getDiffSymbols().then((res) => {
        this.symbols = res.data;
      });
    },
    getDiffData(symbol) {
      getCharacteristic(symbol).then(res => {
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
    }
  }
};
</script>

<style>


</style>

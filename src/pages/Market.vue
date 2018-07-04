<template>
  <div>
      <el-input
        style="width: 100px;"
        placeholder="symbol"
        v-model="symbol"
        size="small"
        clearable>
      </el-input>
      <el-input
        style="width: 100px;"
        placeholder="amount"
        v-model="amount"
        size="small"
        clearable>
      </el-input>
      <el-input
        style="width: 100px;"
        placeholder="price"
        v-model="price"
        size="small"
        clearable>
      </el-input>
      <el-input
        style="width: 100px;"
        placeholder="amount"
        v-model="symbol"
        size="small"
        clearable>
      </el-input>
      <el-select v-model="type" placeholder="请选择" size="small">
        <el-option value="buy-market">市价买</el-option>
        <el-option value="sell-market">市价卖</el-option>
        <el-option value="buy-limit">限价买</el-option>
        <el-option value="sell-limit">限价卖</el-option>
      </el-select>
      <el-button type="primary" :loading="subscribeLoading" @click="buyLimit" size="small">买</el-button>
  </div>
</template>

<script>
import config from '@/config';
import { buyLimit, getSymbols } from '@/api/huobiREST';
export default {
  name: "Market",
  components: {

  },
  data() {
    return {
      list: [],
      symbol: '',
      amount: '',
      price: '',
      type: 'buy-limit'
    };
  },
  created() {
  },
  mounted() {
    
  },
  beforeDestroy() {

  },
  methods: {
      buyLimit() {
        buyLimit({
            symbol: this.symbol,
            amount: this.amount,
            price: this.price,
            type: this.type,
        }).then((res) => {
            console.log(res)
        })
      }
  }
};
</script>

<style>


</style>

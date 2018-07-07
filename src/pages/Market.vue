<template>
    <div class="market">
        <div>
            <el-input
                style="width: 100px;"
                placeholder="symbol"
                v-model="symbol"
                size="small"
                clearable>
            </el-input>
            <el-select v-model="quoteCurrency" placeholder="请选择" size="small">
                <el-option value="usdt">usdt</el-option>
                <el-option value="btc">btc</el-option>
                <el-option value="eth">eth</el-option>
            </el-select>
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
            <el-select v-model="type" placeholder="请选择" size="small">
                <el-option value="buy-market">市价买</el-option>
                <el-option value="sell-market">市价卖</el-option>
                <el-option value="buy-limit">限价买</el-option>
                <el-option value="sell-limit">限价卖</el-option>
            </el-select>
            <el-button type="primary" :loading="buttonLoading" @click="trade" size="small">下单</el-button>
        </div>

        <div style="margin: 10px;">


            <el-button type="primary" :loading="buttonLoading" @click="getOpenOrders" size="small">查委托</el-button>
            <el-button type="primary" :loading="buttonLoading" @click="autoTrade" size="small">根据Depth自动跟单</el-button>
            <el-button type="primary" :loading="buttonLoading" @click="checkOrder" size="small">检查订单是否合理</el-button>
        </div>
        <div>
            <table>
                <thead>
                    <tr>
                        <th>
                        时间
                        </th>
                        <th>
                        交易对
                        </th>
                        <th>
                        方向
                        </th>
                        <th>
                        价格({{quoteCurrency}})
                        </th>
                        <th>
                        数量 ({{symbol}})
                        </th>
                        <th>
                        委托总额({{quoteCurrency}})
                        </th>
                        <th>
                        已成交
                        </th>
                        <th>
                        未成交
                        </th>
                        <th>
                        操作
                        </th>
                        
                    </tr>
                </thead>
                <tbody>
                <tr
                    v-for="(item, index) in openOrders"
                    :key="index"
                >
                    <td>{{item['created-at']}}</td>
                    <td>{{item.symbol}}</td>
                    <td>{{item.type}}</td>
                    <td>{{item.price}}</td>
                    <td>{{item.amount}}</td>
                    <td>{{Number(item.amount * item.price).toFixed(amountPrecision)}}</td>

                    <td>{{item['field-amount']}}</td>
                    <td>{{item.amount}}</td>
                    <td>
                        <span>{{item.price}}</span>
                        <el-button
                        size="small"
                        @click="cancelOrder(item.id)"
                        >
                            撤单
                        </el-button>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import moment from "moment";
import { mapState, mapGetters } from 'vuex';
import config from "@/config";

import {
    limit,
    getSymbols,
    getOpenOrders,
    cancelOrder,
    getBalance,
    getOrder,
    getKLine,
} from "@/api/huobiREST";
import ws, {wsconfig, wsSend} from './ws';
import { getTracePrice } from './autoTrace';
export default {
  name: "Market",
  components: {},
    data() {
        return {
            list: [],
            symbol: "pai",
            amount: "",
            price: "",
            type: "buy-limit",
            buttonLoading: false,
            openOrders: [],
            quoteCurrency: 'btc',
            amountPrecision: 4,
        };
    },
    computed:{
        ...mapState({
            bidsFirst: state => state.huobi.bidsFirst,
            bidsList: state => state.huobi.bidsList,
            aksFirst: state => state.huobi.aksFirst,
            asksList: state => state.huobi.asksList,
            responseSymbol: state => state.huobi.responseSymbol,
        }),
    },
    created() {},
    mounted() {
        
    },
    beforeDestroy() {},
    methods: {
        trade() {
            this.buttonLoading = true;
            limit({
                symbol: this.symbol + this.quoteCurrency,
                amount: this.amount,
                price: this.price,
                type: this.type,
                action: "buy"
            }).then(res => {
                if (res.status === 'ok' && res.data !== undefined) {
                    this.$notify({
                        title: '下单状态',
                        message: `msg: 下单成功`,
                        duration: 3000
                    });
                } else {
                    this.$notify({
                        title: '下单状态',
                        message: `msg: ${res['err-code']}`,
                        duration: 3000
                    });
                }
                this.getOpenOrders();
            }).finally(() => {
                this.buttonLoading = false;
            });
        },
        autoTrade: async function () {
            this.buttonLoading = true;
            
            let balanceList = await getBalance();

            // 对币余额
            let balance = '';
            // 当前币的余额
            let symbolBalance = '';
            if (balanceList === null) {
                this.buttonLoading = false;
                throw Error('balanceList没有查到');
            }
            balanceList.list.forEach((item) => {
                if (item.currency === this.quoteCurrency && item.type === 'trade') {
                    balance = Number(item.balance);
                }
                if (item.currency === this.symbol && item.type === 'trade') {
                    symbolBalance = Number(item.balance);
                }
            });

            let kline = await getKLine(this.symbol + this.quoteCurrency, '1min', 2);
            if (kline.data === null) {
                this.buttonLoading = false;
                return;
            }
            let lastPrice = kline.data[0].close;
            // 最大购买量
            let canUseAmount = balance / lastPrice;

            let orderType = {
                buyCount: 0,
                sellCount: 0
            };
            await this.getOpenOrders();
            this.openOrders.forEach(item => {
                if (item.type === 'buy-limit') {
                    
                    orderType.buyCount++; 
                } else {
                    orderType.sellCount++; 
                }
            });
            // 拿推荐的价格
            let prices = getTracePrice({
                bidsList: this.bidsList,
                asksList: this.asksList,
                buyCount: 2 - orderType.buyCount,
                sellCount: 2 - orderType.sellCount,
            });
            if (canUseAmount > 400 && orderType.buyCount < 3) {
                await limit({
                    symbol: this.symbol + this.quoteCurrency,
                    amount: 400,
                    price: prices.buyPrice,
                    type: 'buy-limit',
                    action: "buy"
                });
                this.getOpenOrders();
            }
            if (symbolBalance > 400 && orderType.sellCount < 3) {
                await limit({
                    symbol: this.symbol + this.quoteCurrency,
                    amount: 400,
                    price: prices.sellPrice,
                    type: 'sell-limit',
                    action: "sell"
                });
                this.getOpenOrders();
            }
            this.buttonLoading = false;
            setTimeout(() => {
                this.checkOrder();
            }, 20000);
        },
        checkOrder: async function() {
            
            await this.getOpenOrders();
            if (!Array.isArray(this.openOrders) || this.openOrders.length === 0) {
                return;
            }
            let prices = getTracePrice({
                bidsList: this.bidsList,
                asksList: this.asksList,
                buyCount: 1,
                sellCount: 1,
            });
            let maxBuyOrider = null;
            let maxSellOrider = null;
            let openOrders = this.openOrders.sort((a, b) => {
                return Number(b.price) - Number(a.price);
            });
        
            if (Array.isArray(this.openOrders)) {
                this.openOrders.forEach((item, index) => {
                    if (item.type === 'buy-limit' && maxBuyOrider === null) {
                        maxBuyOrider = item; 
                    } else if (item.type === 'sell-limit' && maxSellOrider === null) {
                        maxSellOrider = item;
                    }
                });
            }
            /**
             * 涨跌幅
             * a是预测价格 b是挂单的价格
             */
            function getDis(a, b) {
                return Math.abs(a - Number(b)) / b;
            }
            
            if (maxBuyOrider !== null && getDis(prices.bindsAvg, maxBuyOrider.price) > 0.11) {
                await this.cancelOrder(maxBuyOrider.id);
            }
            
            if (maxSellOrider !== null && getDis(prices.asksAvg, maxSellOrider.price) > 0.11) {
                await this.cancelOrder(maxSellOrider.id);
            }
            
            setTimeout(() => {
                this.autoTrade();
            }, 20000);
        },
        getOpenOrders: async function (params) {
            this.buttonLoading = true;
            let precisionData = await getSymbols();
            let pricePrecision = 0;
            let amountPrecision = 0;
            precisionData.some((item) => {
                // base-currency:"yee"
                // price-precision:8
                // quote-currency:"eth"
                if (item['base-currency'] === 'pai' && item['quote-currency'] === 'btc') {
                pricePrecision = item['price-precision'];
                amountPrecision = item['amount-precision'];
                return true;
                }
                return false;
            });
            return getOpenOrders({
                symbol: this.symbol + this.quoteCurrency,
                side: 'buy',
            }).then(res => {
                if (!Array.isArray(res.data)) {
                    this.openOrders = [];
                    return;
                }
                res.data.forEach(item => {
                    item['created-at'] = moment(item['created-at']).format("YYYY/MM/DD h:mm:ss");
                    item.amount = Number(item.amount).toFixed(amountPrecision);
                    item.price = Number(item.price).toFixed(pricePrecision);
                    item['field-amount'] = Number(item['field-amount']).toFixed(amountPrecision);
                });
                this.openOrders = res.data;
            }).finally(() => {
                this.buttonLoading = false;
            });
        },
        cancelOrder(orderId) {
            this.buttonLoading = true;
            return cancelOrder(orderId).then(res => {
                this.getOpenOrders();
                this.buttonLoading = false;
            });
        }
    }
};
</script>

<style>
.market{
    padding: 10px 20px;
}
.market .el-select--small{
    width: 100px;
}
</style>

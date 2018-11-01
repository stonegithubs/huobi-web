<template>
    <div class="market">
      <!--   <div>
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
            <el-button type="primary" :loading="buttonLoading" @click="timeoutBuy" size="small">定时抢新币</el-button>
        </div>
 -->
      <!--   <div style="margin: 10px;">

            <el-input
                style="width: 100px;"
                placeholder="testPrice"
                v-model="testPrice"
                size="small"
                clearable>
            </el-input>
            <el-input
                style="width: 100px;"
                placeholder="buyCount"
                v-model="buyCount"
                size="small"
                clearable>
            </el-input>
            <el-input
                style="width: 100px;"
                placeholder="sellCount"
                v-model="sellCount"
                size="small"
                clearable>
            </el-input>
            <el-button type="primary" :loading="buttonLoading" @click="getOpenOrders" size="small">查委托</el-button>
            <el-button type="primary" :loading="buttonLoading" @click="autoTrade" size="small">根据Depth自动跟单</el-button>
            <el-button type="primary" :loading="buttonLoading" @click="checkOrder" size="small">检查订单是否合理</el-button>
        </div> -->
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
var random = require('lodash.random');
import config from "@/config";
import timeoutTask from '@/utils/timeoutTask';
import {
    limit,
    getSymbols,
    getSymbolInfo,
    getOpenOrders,
    cancelOrder,
    getBalance,
    getOrder,
    getKLine,
} from "@/api/huobiREST";
import ws, {wsconfig, wsSend} from './ws';
import { getTracePrice } from './autoTrace';

let preSame = false;
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
            testPrice: 10,
            buyCount: 3,
            sellCount: 3,
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
        /**
         * 下单
         */
        trade() {
            this.buttonLoading = true;
            console.log(this.type.search('buy'))
            return limit({
                symbol: this.symbol + this.quoteCurrency,
                amount: this.amount,
                price: this.price,
                type: this.type,
                action: this.type.indexOf('buy') > -1 ? 'buy' : 'sell'
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
        /**
         * 跟单
         */
        autoTrade: async function () {

            if ((this.symbol + this.quoteCurrency) !== this.responseSymbol) {
                return;
            }
            this.buttonLoading = true;
            
            let balanceList = null;
            try {
                balanceList = await getBalance()
            } catch (error) {
                this.autoTrade();
            }
            // 对币余额
            let balance = '';
            // 当前币的余额
            let symbolBalance = '';
            if (balanceList === null) {
                this.buttonLoading = false;
                this.autoTrade();
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
            /* 买卖最多下单数 */

            /* 最大金额 */
            let maxPrice = this.testPrice;
            let amount = this.quoteCurrency === 'usdt' 
                            ?  maxPrice / lastPrice
                            : maxPrice / appConfig.price.btc / lastPrice;
            amount = amount.toFixed(this.amountPrecision);
            // 拿推荐的价格
            let prices = getTracePrice({
                bidsList: this.bidsList,
                asksList: this.asksList,
                buyCount: this.buyCount - orderType.buyCount,
                sellCount: this.sellCount - orderType.sellCount,
            });
            console.log(prices)
            // same
            let pricesCount = {};
            let sameOrider = null;
            if (Array.isArray(this.openOrders)) {
                this.openOrders.forEach((item, index) => {
                    if (pricesCount[item.price] === undefined) {
                        pricesCount[item.price] = 1;
                    } else {
                        sameOrider = item;
                    }
                });
            }

            if (sameOrider !== null) {
                preSame = true;
                let action = sameOrider.type.indexOf('buy') > -1 ? "buy" : 'sell';

                this.buyCount = prices.bak.length;
                this.sellCount = prices.bak.length
                await this.cancelOrder(sameOrider.id);
                await limit({
                        symbol: this.symbol + this.quoteCurrency,
                        amount: sameOrider.amount,
                        price: prices.bak[random(0, prices.bak.length - 1)][action === 'buy' ? 'buyPrice' : 'sellPrice'],
                        type: sameOrider.type,
                        action: action,
                    });
                await this.getOpenOrders();
            }

            try {
                if (canUseAmount > amount && orderType.buyCount < this.buyCount) {
                    await limit({
                        symbol: this.symbol + this.quoteCurrency,
                        amount: amount,
                        price: prices.buyPrice,
                        type: 'buy-limit',
                        action: "buy",
                        preSame: preSame,
                    });
                    await this.getOpenOrders();
                }
                if (symbolBalance > amount && orderType.sellCount < this.sellCount) {
                    await limit({
                        symbol: this.symbol + this.quoteCurrency,
                        amount: amount,
                        price: prices.sellPrice,
                        type: 'sell-limit',
                        action: "sell",
                        preSame: preSame,
                    });
                    await this.getOpenOrders();
                }
            } catch (error) {
                this.autoTrade();
            }
            
            this.buttonLoading = false;
            setTimeout(() => {
                this.checkOrder();
            }, 20000);
        },
        checkOrder: async function() {
            await this.getOpenOrders();
            if (
                !Array.isArray(this.openOrders)
                || this.openOrders.length === 0
                || (this.symbol + this.quoteCurrency) !== this.responseSymbol) {
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
            let minBuyOrider = null;
            let openOrders = this.openOrders.sort((a, b) => {
                return Number(b.price) - Number(a.price);
            });

            let pricesCount = {};
            let sameOrider = null;
            if (Array.isArray(this.openOrders)) {
                this.openOrders.forEach((item, index) => {
                    if (item.type === 'buy-limit') {
                        if (maxBuyOrider === null) {
                               maxBuyOrider = item; 
                        }
                        minBuyOrider = item;
                    } else if (item.type === 'sell-limit' && maxSellOrider === null) {
                        maxSellOrider = item;
                    }
                    if (pricesCount[item.price] === undefined) {
                        pricesCount[item.price] = 1;
                    } else {
                        sameOrider = item;
                    }
                });
            }
            if (sameOrider !== null) {
                preSame = true;
                await this.cancelOrder(sameOrider.id);
            } else {
                preSame = false;
            }
            /**
             * 涨跌幅
             * a是预测价格 b是挂单的价格
             */
            function getDis(a, b) {
                return Math.abs(a - Number(b)) / b;
            }
            
            // 如果价格再下跌，取消订单，提高买入点
            if (maxBuyOrider !== null && getDis(prices.bindsAvg, maxBuyOrider.price) > 0.04) {
                await this.cancelOrder(maxBuyOrider.id);
            }
            // console.log('buy:', prices, getDis(prices.bindsAvg, maxBuyOrider.price))
            // 如果价格再上涨，取消订单，提高买入点
            if (minBuyOrider !== null && maxBuyOrider !== minBuyOrider && getDis(prices.bindsAvg, minBuyOrider.price) > 0.04) {
                await this.cancelOrder(minBuyOrider.id);
            }

            if (maxSellOrider !== null && getDis(prices.asksAvg, maxSellOrider.price) > 0.04) {
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
                if (item['base-currency'] === this.symbol && item['quote-currency'] === this.quoteCurrency) {
                    pricePrecision = item['price-precision'];
                    amountPrecision = item['amount-precision'];
                    this.amountPrecision = amountPrecision;
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
        },
        timeoutBuy: async function () {
            // let {
            //     pricePrecision,
            //     amountPrecision
            // } = await getSymbolInfo(this.symbol, this.quoteCurrency);
            
            // await this.trade();

            timeoutTask('2018-07-25T15:00:00', () => {
                this.trade();
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

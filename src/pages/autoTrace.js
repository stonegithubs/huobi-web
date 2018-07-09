
/* amount:"141940.65"
count:1
price:"0.00018500"
prices:Array[1]
sumCount:"141940.65"
sumDollar:"172469.25"
sumMoneny:"26.26" */
function getTop(arr) {
    return arr.filter(item => Number(item.sumDollar) > 30000);
}


/**
 * 
 * 根据买卖压力推荐价格
 */
export const getTracePrice = function ({
    bidsList,
    asksList,
    buyCount,
    sellCount,
}) {

    let bindsAvg = 0;
    let asksAvg = 0;
    let newBidsList = getTop(bidsList);
    let newAsksList = getTop(asksList);
    if (newBidsList.length <= 1 || newAsksList.length <= 1) {
        alert('不建议刷单');
        return;
    }

    let sum1 = 0;
    let sum2 = 0;
    newBidsList.forEach(item => {
        sum1 += Number(item.price);
    });
    newAsksList.forEach(item => {
        sum2 += Number(item.price);
    });
    bindsAvg = sum1 / newBidsList.length;
    asksAvg = sum2 / newAsksList.length;
    
    newBidsList.sort(function (a, b) {
        return Number(a.price) - Number(b.price);
    });
    newAsksList.sort(function (a, b) {
        return Number(a.price) - Number(b.price);
    });

    let dis = newBidsList.length > 5 ? buyCount: 1;
    let buyIndex = Math.round(newBidsList.length/2) - buyCount;

    dis = newAsksList.length > 5 ? sellCount: 1;
    let sellIndex = Math.round(newAsksList.length/2) - sellCount;
    
    return {
        buyPrice: newBidsList[buyIndex].price,
        sellPrice: newAsksList[sellIndex].price,
        asksAvg,
        bindsAvg,
    }
}
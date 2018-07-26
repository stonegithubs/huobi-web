<template>
  <div>
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="Depth" name="Depth">
        <Depth></Depth>
      </el-tab-pane>
      <el-tab-pane label="Charts" name="Charts">
        <Charts></Charts>
      </el-tab-pane>
      <el-tab-pane label="KLine" name="KLine">
        <KLine></KLine>
      </el-tab-pane>
      <el-tab-pane label="Difference" name="Difference">
        <Difference></Difference>
      </el-tab-pane>
      <el-tab-pane label="Market" name="Market">
        <Market></Market>
      </el-tab-pane>
      <el-tab-pane label="Density" name="Density">
        <Density></Density>
      </el-tab-pane>
      <el-tab-pane label="sql" name="Sql">
        <Sql></Sql>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import {getKLine} from '@/api/huobiREST';
// utils
import getSameAmount from "@/utils/getSameAmount";
import config from "@/config";
import ws, {wsSend} from './ws';

import Depth from "./Depth";
import Sql from "./Sql";
import KLine from "./KLine";
import Difference from "./Difference";
import Market from "./Market";
import Charts from "./Charts";
import Density from "./Density";
export default {
    name: "Home",
    components: {
        Depth,
        Difference,
        Sql,
        KLine,
        Market,
        Charts,
        Density,
    },
    data() {
        return {
            activeName: "Depth",
        };
    },
    created() {
      // 单位为美元
        window.ethPrice = 466;
        window.btcPrice = 8000;
        getKLine('ethusdt', '1min', 2).then(res => {
          window.ethPrice = res.data[1].close;
        });
        getKLine('btcusdt', '1min', 2).then(res => {
          window.btcPrice = res.data[1].close;
        });
    },
    mounted() {
        
    },
    beforeDestroy() {
        this.$notify({
            title: 'WS状态',
            message: `msg: ws_server closed`,
            duration: 3000
        });
        ws.close();
    },
    methods: {
        handleClick(tab, event) {},
    }
};
</script>

<style>
.tab-content{
    overflow: auto;
}
</style>

<template>
  <div>
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="Depth" name="Depth">
        <Depth></Depth>
      </el-tab-pane>
      <el-tab-pane label="Charts" name="Charts">
        <Charts></Charts>
      </el-tab-pane>
      <el-tab-pane label="Difference" name="Difference">
        <Difference></Difference>
      </el-tab-pane>
      <el-tab-pane label="sql" name="Sql">
        <Sql></Sql>
      </el-tab-pane>
      <el-tab-pane label="KLine" name="KLine">
        <KLine></KLine>
      </el-tab-pane>
      <el-tab-pane label="Market" name="Market">
        <Market></Market>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>

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
export default {
    name: "Home",
    components: {
        Depth,
        Difference,
        Sql,
        KLine,
        Market,
        Charts
    },
    data() {
        return {
            activeName: "Depth",
        };
    },
    created() {
        
    },
    mounted() {
        
    },
    beforeDestroy() {
        // wsSend({
        //     type: `ws-huobi`,
        //     value: 'close',
        // });
        this.$notify({
            title: 'WS状态',
            message: `msg: ws_server closed`,
            duration: 3000
        });
        // ws.close();
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

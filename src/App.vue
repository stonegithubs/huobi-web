<template>
  <div id="app">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      router
      @select="handleSelect"
    >
      <el-menu-item index="charts">Charts</el-menu-item>
      <el-menu-item index="depth">Depth</el-menu-item>
      
      <el-menu-item index="difference">Difference</el-menu-item>
      <el-menu-item index="density">Density</el-menu-item>
      <el-menu-item index="trade">Trade</el-menu-item>
     
    </el-menu>
    <div ref="routerPage" class="page-content">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import { getKLine } from "@/api/huobiREST";
// utils
import config from "@/config";
import ws, { wsSend, openWs } from "./pages/ws";
export default {
  name: "App",
  components: {},
  data() {
    return {
      activeIndex: "charts"
    };
  },
  created() {
    this.activeIndex = this.$router.history.current.name.toLowerCase();
    // 单位为美元
    window.ethPrice = 466;
    window.btcPrice = 8000;
  },
  mounted() {
    this.$refs.routerPage.style.maxHeight = window.innerHeight - 60 + "px";
    getKLine("ethusdt", "1min", 2).then(res => {
      window.ethPrice = res.data[1].close;
    });
    getKLine("btcusdt", "1min", 2).then(res => {
      window.btcPrice = res.data[1].close;
    });
    openWs();
  },
  beforeDestroy() {
    this.$notify({
      title: "WS状态",
      message: `msg: ws_server closed`,
      duration: 3000
    });
    ws.close();
  },
  methods: {
    handleClick(tab, event) {},
    handleSelect() {}
  }
};
</script>

<style>

body{
  min-width: 600px;
}
#app {
  height: 100%;
}
#app .el-menu--horizontal{
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}
.page-content{
  padding: 20px;
  overflow: auto;
}
</style>
<style lang="scss">
@import './assets/css/media.scss';
</style>



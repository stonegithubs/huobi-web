<template>
  <div id="app">
    <el-menu
      ref="menu"
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
    let name = this.$router.history.current.name;
    if (name)  {
      this.activeIndex = name;
    } else {
      this.activeIndex = this.activeIndex;
    }
    // 单位为美元
    appConfig.price.eth = 466;
    appConfig.price.btc = 8000;
  },
  mounted() {
    this.resize();
    window.addEventListener('resize', this.resize);

    // 设置最新的价格
    getKLine("ethusdt", "1min", 2).then(res => {
      appConfig.price.eth = res.data[1].close;
    }).catch(() => {
      getKLine("ethusdt", "1min", 2).then(res => {
        appConfig.price.eth = res.data[1].close;
      });
    });
    getKLine("btcusdt", "1min", 2).then(res => {
      appConfig.price.btc = res.data[1].close;
    }).catch(() => {
      getKLine("btcusdt", "1min", 2).then(res => {
          appConfig.price.btc = res.data[1].close;
      });
    });
    openWs();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize);
    this.$notify({
      title: "WS状态",
      message: `msg: ws_server closed`,
      duration: 3000
    });
    ws.close();
  },
  methods: {
    handleClick(tab, event) {},
    handleSelect() {},
    resize() {
      let menuHeight = this.$refs.menu.$el.clientHeight;
      console.log(menuHeight)
      this.$refs.routerPage.style.maxHeight = window.innerHeight - menuHeight + "px";
    }
  }
};
</script>

<style>

/* body{
  min-width: 600px;
} */
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



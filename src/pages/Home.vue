<template>
  <div>
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="Depth" name="Depth">
        <Depth></Depth>
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
import Depth from './Depth';
import Sql from './Sql';
import KLine from './KLine';
import Difference from './Difference';
import Market from './Market';
export default {
  name: "Home",
  components: {
    Depth,
    Difference,
    Sql,
    KLine,
    Market,
  },
  data() {
    return {
      activeName: 'Depth'
    };
  },
  created() {
  },
  mounted() {
  },
  beforeDestroy() {

  },
  methods: {
    handleClick(tab, event) {
    }
  }
};
</script>

<style>


</style>

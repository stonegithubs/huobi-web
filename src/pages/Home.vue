<template>
  <div>
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="Depth" name="Depth">
        <Depth></Depth>
      </el-tab-pane>
      <el-tab-pane label="压力位差距" name="second">压力位差距</el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Depth from './Depth';

export default {
  name: "Home",
  components: {
    Depth,
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
.tickList {
  padding: 0px 0;
  overflow: auto;
  align-content:flex-start;
  align-items: flex-start;
}
.tickList .flex-1{
  align-self: start;
}

</style>

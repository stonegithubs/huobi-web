

<template>
  <div class="chart-container">
    <canvas ref="canvas" width="1000px" height="500px"></canvas>
  </div>
</template>

<script>
const echarts = require('echarts');
export default {
  name: 'charts',
  props: {
      options: Object,
  },
  watch: {
    options(options) {
      this.chart.setOption(options)
    }
  },
  mounted() {
    // 基于准备好的dom，初始化echarts实例
    this.chart = echarts.init(this.$refs.canvas);
    // 绘制图表
    this.chart.setOption(this.options)
  }
}
</script>

<style>
.chart-container{
  position: relative;
  width: 100%;
  height: 500px;
}

</style>

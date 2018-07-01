<template>
  <div>
    <ul>
        <li 
            v-for="(item, index) in list"
            :key="index"
        ></li>
    </ul>
  </div>
</template>

<script>
import config from '@/config';
import Dis from './Dis';

export default {
  name: "Home",
  components: {

  },
  data() {
    return {
      list: []
    };
  },
  created() {
  },
  mounted() {
    console.log()
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

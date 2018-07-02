<template>
  <div>
    <button @click="select">
        查huobi_depth
    </button>
    <button @click="queryTables">queryTables</button>
    <button @click="createTable">创建table</button>
    <button @click="delTable">删除db</button>
    <table>
        <tr>
            <th></th>
        </tr>
    </table>
  </div>
</template>

<script>
import config from '@/config';

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
    createTable() {
      fetch(config.API_HOST + '/api/v1/createTable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          tableName: 'HUOBI_DEPTH'
        })
      }).then(res => {
        console.log(res)
      })
    },
    delTable() {
      fetch(config.API_HOST + '/api/v1/delTable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          tableName: 'HUOBI_DEPTH'
        })
      })
    },
    queryTables() {
      fetch(config.API_HOST + '/api/v1/showTables').then((res) => {
        console.log(res.json())
      });
    },
    select() {
        fetch(config.API_HOST + '/api/v1/select?tableName=HUOBI_DEPTH').then((res) => {
            console.log(res.json())
        });
    },
  }
};
</script>

<style>


</style>

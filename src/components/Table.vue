<template>
  <div>
    <table>
        <thead>
            <tr>
                <th>
                count
                </th>
                <th>
                amount
                </th>
                <th>
                sumCount
                </th>
                <th>
                sumMoneny
                </th>
                <th>
                price
                </th>
            </tr>
        </thead>
        <tbody>
        <tr
            v-for="(item, index) in data"
            :key="index"
        >
            <td>{{item.count}}</td>
            <td>{{item.amount}}</td>
            <td>{{item.sumCount}}</td>
            <td>{{item.sumMoneny}}</td>
            <td>
                <span>{{item.price}}</span>
                <el-popover
                    v-if="item.prices.length > 1" 
                    placement="right"
                    width="400"
                    trigger="click"
                >
                    <ul>
                        <li v-for="p in item.prices" :key="p">{{p}}</li>
                    </ul>
                    <el-button slot="reference" size="small">查看全部</el-button>
                </el-popover>
            </td>
        </tr>
        </tbody>
    </table>

  </div>
</template>

<script>
export default {
  name: "Table",
  data() {
    return {
    };
  },
  props: {
    data: {
        type: Array,
        default () {
            return [];
        }
    }
  },
  mounted() {
  },
  methods: {
  }
};
</script>

<style scoped>

table {
  padding: 10px 20px;
  width:auto;
}
table th{
  text-align: left;
  padding: 1px 6px;
}
table td{
  padding: 1px 6px;
}
</style>

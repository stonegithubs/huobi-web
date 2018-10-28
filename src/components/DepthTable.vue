<template>
  <div>
      <!--
          
    <el-table
        size="mini"
        :data="data"
        style="width: 100%">
        <el-table-column
            prop="count"
            label="count"
            width="70">
        </el-table-column>
        <el-table-column
            prop="amount"
            label="amount"
            width="100">
        </el-table-column>
        <el-table-column
            prop="sumCount"
            label="sumCount"
            width="100"
        >
        </el-table-column>
        <el-table-column
            prop="sumMoneny"
            label="sumMoneny"
            width="120"
        >
        </el-table-column>
        <el-table-column
            prop="price"
            label="price"
            width="90"
        >
        </el-table-column>
        <el-table-column
            label="操作"
            width="100">
            <template slot-scope="scope">
                <el-button
                    size="small"
                    @click="showAllPrices(item.prices)"
                    
                >
                    查看全部
                </el-button>
            </template>
        </el-table-column>
    </el-table>
      -->
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
                sum({{quoteCurrency}})
                </th>
                <th>
                $($/k)
                </th>
                <th>
                price({{quoteCurrency}})
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
            <td>{{(item.sumDollar / 1000).toFixed(3)}}</td>
            <td>
                <span>{{item.price}}</span>
                <el-button
                   size="small"
                   @click="showAllPrices(item.prices)"
                >
                    查看全部
                </el-button>
            </td>
        </tr>
        </tbody>
    </table>
    <el-dialog
        title="全部价格"
        :visible.sync="dialogVisible"
        width="30%"
        >
        <ul class="all-price-list">
            <li v-for="p in itemPrices" :key="p">{{p}}</li>
        </ul>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false" size="small">取 消</el-button>
            <el-button type="primary" @click="dialogVisible = false" size="small">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "DepthTable",
  data() {
    return {
      itemPrices: [],
      dialogVisible: false
    };
  },
  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    },
    quoteCurrency: String
  },
  mounted() {},
  methods: {
    showAllPrices(prices) {
      this.dialogVisible = true;
      this.itemPrices = prices;
    }
  }
};
</script>

<style>
table {
  padding: 10px 20px;
  width: auto;
}
table th {
  text-align: left;
  padding: 1px 6px;
}
table td {
  padding: 1px 6px;
}
.all-price-list {
  max-height: 400px;
  overflow: auto;
}
</style>

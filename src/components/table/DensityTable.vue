<template>
  <div>
    <table>
        <thead>
            <tr>
                <th>
                %
                </th>
                <th>
                price({{quoteCurrency}})
                </th>
                <th>
                count
                </th>
                <th>
                sum({{quoteCurrency}})
                </th>
            </tr>
        </thead>
        <tbody>
        <tr
            v-for="(item, price) in data"
            :key="price"
        >
            <td>{{(price * 100).toFixed(2)}}</td>
            <td>{{item.price.toString().length > 10 ? item.price.toFixed(8) : item.price}}</td>
            <td>{{item.count}}</td>
            <td>{{parseInt(item.sumMoneny)}}</td>
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
        type: Object,
        default () {
            return {};
        }
    },
    quoteCurrency: String,
  },
  mounted() {
  },
  methods: {
  }
};
</script>

<style>

table {
  padding: 10px 20px;
  width:auto;
  margin-top: 10px;
}
table th{
  text-align: left;
  padding: 1px 6px;
}
table td{
  padding: 1px 6px;
}
.all-price-list{
    max-height: 400px;
    overflow: auto;
}
</style>

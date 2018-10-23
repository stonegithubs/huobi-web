import Vue from 'vue'
import Router from 'vue-router'
import Charts from '@/pages/Charts'
import Depth from "@/pages/Depth"
import Difference from "@/pages/Difference"
import Market from "@/pages/Market"
import Density from "@/pages/Density"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/depth',
      name: 'Depth',
      component: Depth
    },
    {
      path: '/charts',
      name: 'Charts',
      component: Charts
    },
  ]
})

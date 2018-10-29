import Vue from 'vue'
import Router from 'vue-router'
import Charts from '@/pages/Charts'
import Depth from "@/pages/Depth"
import Difference from "@/pages/Difference"
import Trade from "@/pages/Trade"
import Density from "@/pages/Density"

Vue.use(Router)

// const Charts = () => import(/* webpackChunkName: "Charts" */ '../pages/Charts.vue')
export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Charts,
      meta: { keepAlive: true }
    },
    {
      path: '/charts',
      name: 'Charts',
      component: Charts,
      meta: { keepAlive: true }
    },
    {
      path: '/depth',
      name: 'Depth',
      component: Depth
    },
    {
      path: '/difference',
      name: 'Difference',
      component: Difference,
      meta: { keepAlive: true }
    },
    {
      path: '/trade',
      name: 'Trade',
      component: Trade,
      meta: { keepAlive: true }
    },
    {
      path: '/density',
      name: 'Density',
      component: Density,
      meta: { keepAlive: true }
    },
  ]
})

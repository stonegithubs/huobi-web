// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import {
  Button,
  Card,
  Dialog,
  Input,
  Loading,
  Select,
  Option,
  Popover,
  Tabs,
  TabPane,
  Menu,
  MenuItem,
  Notification,
} from 'element-ui';
import './assets/css/reset.css'
import './assets/css/common.css'
import './assets/css/media.scss'
Vue.config.productionTip = false

Vue.use(Button)
Vue.use(Card)
Vue.use(Dialog)
Vue.use(Input)
Vue.use(Select)
Vue.use(Option)
Vue.use(Popover)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Menu)
Vue.use(MenuItem)

Vue.use(Loading.directive);

Vue.prototype.$loading = Loading.service;
Vue.prototype.$notify = Notification;
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})


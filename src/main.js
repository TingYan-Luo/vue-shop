import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
// 引入table-tree插件
import tableTree from 'vue-table-with-tree-grid'
// 引入Element UI
import './plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css'
// 引入MessageBOx
// 导入axios
import axios from 'axios'
// 配置token到请求头
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.prototype.$http.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 挂在tableTree
Vue.component('table-tree', tableTree)

// 这里是入口文件
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

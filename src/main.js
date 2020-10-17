import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
// 引入Element UI
import './plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css'
// 导入axios
import axios from 'axios'

Vue.prototype.$http = axios
Vue.prototype.$http.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 这里是入口文件
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

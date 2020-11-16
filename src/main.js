import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
// 引入table-tree插件
import tableTree from 'vue-table-with-tree-grid'
// 引入Element UI
import './plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css'
// 引入lodash
// import _ from 'vue-cli-plugin-lodash'
// 引入MessageBOx
// 导入axios
import axios from 'axios'
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.use(VueQuillEditor)
// 利用axios的拦截器配置token到请求头---设置用户权限
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.prototype.$http.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 挂在tableTree
Vue.component('table-tree', tableTree)

// 创建一个全局的时间格式过滤器
Vue.filter('dateFormat', date => {
  var oldDate = new Date(date)
  var y = oldDate.getFullYear()
  var m = (oldDate.getMonth() + 1 + '').padStart(2, '0')
  var d = (oldDate.getDate() + '').padStart(2, '0')
  var hh = (oldDate.getHours() + '').padStart(2, '0')
  var mm = (oldDate.getMinutes() + '').padStart(2, '0')
  var ss = (oldDate.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
// 这里是入口文件
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

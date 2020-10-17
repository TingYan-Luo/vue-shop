import Vue from 'vue'
// 要使用ElementUI中的组件，需要先导入该组件
import { Button, Form, FormItem, Input, Row, Message } from 'element-ui'

// 再将其全局注册到VUE中
Vue.use(Button)
Vue.use(FormItem)
Vue.use(Form)
Vue.use(Input)
Vue.use(Row)
Vue.prototype.$message = Message

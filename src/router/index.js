import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
// 这里是路由入口文件
Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  }
]

const router = new VueRouter({
  routes
})
  // 为router对象，添加路由守卫
router.beforeEach((to, from, next) => {
  // 如果用户访问的是登陆页面，则放行
  if (to.path === '/login') return next()
  // 从sessionStorage中获取到token
  const token = window.sessionStorage.getItem('token')
  // 如果token不存在，则强制跳转到登陆页面
  if (!token) return next('/login')
  // 如果token存在，代表已登陆，放行
  next()
})
export default router

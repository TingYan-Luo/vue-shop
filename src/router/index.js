import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import Welcome from '../components/welcome.vue'
import Users from '../components/users.vue'
import Roles from '../components/roles.vue'
import Rights from '../components/rights.vue'
import Categories from '../components/shop/categories.vue'
import Params from '../components/shop/params.vue'
// 这里是路由入口文件
Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    redirect: '/welcome',
    component: Home,
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/params',
        component: Params
      }
    ]
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

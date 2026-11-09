import { createRouter, createWebHistory } from 'vue-router'
import Login from '../Login.vue'
import { userStore } from '@/stores/userStore'

// 用户页面
const UserHome = () => import('../user/Home.vue')
const NewsDetail = () => import('../user/NewsDetail.vue')
const Shop = () => import('../user/Shop.vue')
const Cart = () => import('../user/Cart.vue')
const Profile = () => import('../user/Profile.vue')
const Favorites = () => import('../user/Favorites.vue')
const Chat = () => import('../user/Chat.vue')
const Messages = () => import('../user/Messages.vue')

// 管理员页面
const AdminHome = () => import('../admin/Home.vue')
const NewsManage = () => import('../admin/NewsManage.vue')
const GoodsManage = () => import('../admin/GoodsManage.vue')
const OrderManage = () => import('../admin/OrderManage.vue')
const AdminMessage = () => import('../admin/AdminMessage.vue')

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '智慧三农 - 登录', requiresAuth: false }
  },
  {
    path: '/user/home',
    component: UserHome,
    meta: { title: '智慧三农 - 生态咨询', requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/user/newsDetail',
    component: NewsDetail,
    meta: { title: '智慧三农 - 资讯详情', requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/user/shop',
    component: Shop,
    meta: { title: '智慧三农 - 农业商城', requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/user/cart',
    component: Cart,
    meta: { title: '智慧三农 - 购物车', requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/user/profile',
    component: Profile,
    meta: { title: '智慧三农 - 个人中心', requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/user/favorites',
    component: Favorites,
    meta: { title: '智慧三农 - 收藏夹', requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/user/chat',
    component: Chat,
    meta: { title: '智慧三农 - 在线咨询', requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/user/messages',
    component: Messages,
    meta: { title: '智慧三农 - 消息中心', requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/admin/home',
    component: AdminHome,
    meta: { title: '智慧三农 管理后台 - 数据概览', requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/news',
    component: NewsManage,
    meta: { title: '智慧三农 管理后台 - 资讯管理', requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/goods',
    component: GoodsManage,
    meta: { title: '智慧三农 管理后台 - 商品管理', requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/order',
    component: OrderManage,
    meta: { title: '智慧三农 管理后台 - 订单记录', requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/message',
    component: AdminMessage,
    meta: { title: '智慧三农 管理后台 - 客服回复', requiresAuth: true, roles: ['admin'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ============================================================
// 路由守卫
// ============================================================
router.beforeEach((to) => {
  if (to.meta.title) document.title = to.meta.title

  const isLoggedIn = userStore.isLoggedIn()

  // ★ 登录页任何情况下都放行
  if (to.path === '/login') {
    return true
  }

  // 需要登录但未登录 → 跳转到登录页
  if (to.meta.requiresAuth !== false && !isLoggedIn) {
    return '/login'
  }

  // 检查角色权限
  const allowedRoles = to.meta.roles || []
  const userRole = userStore.getRole()

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return userRole === 'admin' ? '/admin/home' : '/user/home'
  }

  return true
})

export default router
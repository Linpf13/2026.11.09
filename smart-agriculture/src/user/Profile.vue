<template>
  <div class="profile-page" @click="closeDropAll">
    <!-- ========== 导航栏固定 ========== -->
    <nav class="navbar navbar-fixed">
      <div class="nav-container">
        <div class="nav-left">
          <div class="logo">智慧三农</div>
          <div class="nav-items">
            <router-link to="/user/home" class="nav-item">生态资讯</router-link>
            <router-link to="/user/shop" class="nav-item">农业商城</router-link>
          </div>
        </div>
        <div class="nav-right">
          <!-- 头像下拉菜单 -->
          <div class="avatar-dropdown" @click.stop>
            <div class="avatar-wrapper" @click="showDrop = !showDrop">
              <div class="avatar-circle">{{ userInitial }}</div>
              <div class="avatar-name">{{ userNickname }}</div>
            </div>
            <div class="dropdown-menu" v-if="showDrop">
              <div class="dropdown-item" @click="goProfile">个人中心</div>
              <div class="dropdown-item" @click="openLogoutModal">退出登录</div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 退出弹窗 -->
    <div class="modal-mask" v-if="showLogout" @click="showLogout = false">
      <div class="modal-dialog" @click.stop>
        <div class="modal-title">退出登录</div>
        <div class="modal-content">确定要退出当前账号吗？</div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showLogout = false">取消</button>
          <button class="btn-confirm" @click="confirmLogout">确认退出</button>
        </div>
      </div>
    </div>

    <!-- 个人中心主体 -->
    <main class="main-container">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <div class="user-left">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-info">
            <div class="nickname">{{ userNickname }}</div>
            <div class="desc">普通用户 · 感谢使用智慧三农</div>
          </div>
        </div>
        <div class="user-right">
          <div class="info-item">
            <label>用户ID</label>
            <span>{{ userId }}</span>
          </div>
          <div class="info-item">
            <label>登录账号</label>
            <span>{{ userUsername }}</span>
          </div>
          <!-- ====== 我的收藏（唯一入口，点击跳转收藏夹） ====== -->
          <div class="info-item favorite-stats" @click="goFavorites">
            <label>我的收藏</label>
            <span>{{ favoriteCount }} 篇</span>
          </div>
        </div>
      </div>

      <!-- 我的订单区域 -->
      <div class="order-section">
        <div class="section-header">
          <div class="section-title">我的订单</div>
          <!-- 搜索栏 -->
          <div class="search-bar">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="请输入订单号或商品信息搜索"
              class="search-input"
            />
          </div>
        </div>

        <div class="order-table">
          <table class="data-table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>商品信息</th>
                <th>收货地址</th>
                <th>总价</th>
                <th>下单时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredOrderList" :key="item.orderNo">
                <td>{{ item.orderNo }}</td>
                <td>{{ item.goodsInfo || '暂无商品信息' }}</td>
                <td style="font-size: 13px; color: #666; max-width: 200px;">
                  {{ item.address || '无地址' }}
                </td>
                <td>¥{{ Number(item.totalPrice).toFixed(2) }}</td>
                <td>{{ formatTime(item.createTime) }}</td>
                <td>
                  <span :class="getStatusClass(item.status)">{{ getStatusText(item.status) }}</span>
                </td>
                <td class="action-cell">
                  <button
                    v-if="item.status === 'shipped'"
                    class="btn btn-receive"
                    @click="confirmReceive(item.orderNo)"
                  >确认收货</button>
                </td>
              </tr>
              <tr v-if="filteredOrderList.length === 0">
                <td colspan="7" class="empty">暂无匹配的订单记录</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- 确认收货弹窗 -->
    <div class="modal-mask" v-if="showReceiveModal" @click="showReceiveModal = false">
      <div class="modal-dialog" @click.stop>
        <div class="modal-title">确认收货</div>
        <div class="modal-content">确定已收到商品吗？确认后将无法更改。</div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showReceiveModal = false">取消</button>
          <button class="btn-confirm" @click="confirmReceiveOrder">确认收货</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { userStore } from '@/stores/userStore'

const router = useRouter()

// ========== 用户信息 ==========
const userNickname = computed(() => userStore.getNickname() || '用户')
const userInitial = computed(() => userNickname.value.charAt(0).toUpperCase())
const userId = computed(() => userStore.getUserId() || '')
const userUsername = computed(() => userStore.getUsername() || '')

// ========== 通用 ==========
const showLogout = ref(false)
const showDrop = ref(false)
const showReceiveModal = ref(false)
const currentOrderNo = ref(null)
const orderList = ref([])
const favoriteCount = ref(0)
const searchKeyword = ref('')

// ★ 创建带请求拦截器的 axios 实例（自动添加 X-User-Id）
const request = axios.create({
  baseURL: 'http://localhost:8080'
})

request.interceptors.request.use(config => {
  const userId = userStore.getUserId()
  if (userId) {
    config.headers['X-User-Id'] = userId
  }
  return config
})

// ========== 状态映射 ==========
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待发货',
    'shipped': '已发货',
    'received': '已收货'
  }
  return statusMap[status] || '待发货'
}

const getStatusClass = (status) => {
  const classMap = {
    'pending': 'status-pending',
    'shipped': 'status-shipped',
    'received': 'status-received'
  }
  return classMap[status] || 'status-pending'
}

// ========== 时间格式化 ==========
const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  const pad = (num) => num.toString().padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())
  return `${year}-${month}-${day} ${hour}:${minute}`
}

// ========== 获取订单列表 ==========
const fetchOrderList = async () => {
  try {
    const res = await request.get('/api/order/user/list')
    orderList.value = res.data.data || []
  } catch (err) {
    console.error('获取订单失败', err)
    orderList.value = []
  }
}

// ========== ★ 获取收藏数量（使用带 X-User-Id 的请求） ==========
const fetchFavoriteCount = async () => {
  try {
    const res = await request.get('/api/user/favorites')
    favoriteCount.value = res.data.length || 0
  } catch (err) {
    console.error('获取收藏数量失败', err)
  }
}

// ========== 更新订单状态 ==========
const updateOrderStatus = async (orderNo, status) => {
  try {
    await request.put(`/api/order/${orderNo}/status`, { status })
    await fetchOrderList()
    return true
  } catch (err) {
    console.error('更新状态失败', err)
    return false
  }
}

const confirmReceive = (orderNo) => {
  currentOrderNo.value = orderNo
  showReceiveModal.value = true
}

const confirmReceiveOrder = async () => {
  if (currentOrderNo.value) {
    await updateOrderStatus(currentOrderNo.value, 'received')
    showReceiveModal.value = false
    currentOrderNo.value = null
  }
}

// ========== 跳转到收藏夹页面 ==========
const goFavorites = () => {
  router.push('/user/favorites')
}

// ========== 过滤订单 ==========
const filteredOrderList = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return orderList.value
  return orderList.value.filter(item => {
    const orderNo = (item.orderNo || '').toLowerCase()
    const goodsInfo = (item.goodsInfo || '').toLowerCase()
    return orderNo.includes(keyword) || goodsInfo.includes(keyword)
  })
})

// ========== 导航 ==========
const openLogoutModal = () => {
  showDrop.value = false
  showLogout.value = true
}

const confirmLogout = () => {
  showLogout.value = false
  userStore.logout()
  router.push('/login')
}

const goProfile = () => {
  showDrop.value = false
  router.push('/user/profile')
}

const closeDropAll = () => {
  showDrop.value = false
}

// ========== 生命周期 ==========
onMounted(() => {
  if (!userStore.isLoggedIn()) {
    router.push('/login')
    return
  }
  fetchOrderList()
  fetchFavoriteCount()
})
</script>

<style scoped>
/* ========== 样式与之前保持一致 ========== */
.profile-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.navbar-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: #fff;
  padding: 16px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
}
.nav-left {
  display: flex;
  align-items: center;
  gap: 40px;
}
.logo {
  font-size: 22px;
  font-weight: 700;
  color: #2ecc71;
}
.nav-items {
  display: flex;
  gap: 28px;
}
.nav-item {
  text-decoration: none;
  color: #444;
  font-size: 15px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}
.nav-item:hover {
  background: #e6f7ef;
  color: #2ecc71;
}
.nav-item.active {
  background: #e6f7ef;
  color: #2ecc71;
  font-weight: 500;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-dropdown {
  position: relative;
}
.avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 999px;
  transition: background 0.2s ease;
}
.avatar-wrapper:hover {
  background: #e6f7ef;
}
.avatar-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #2ecc71;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.avatar-name {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}
.dropdown-menu {
  position: absolute;
  top: 110%;
  right: 0;
  width: 150px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  z-index: 999;
}
.dropdown-item {
  padding: 10px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}
.dropdown-item:hover {
  background: #f5f7f9;
  color: #2ecc71;
}

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-dialog {
  width: 340px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.modal-title {
  padding: 24px 24px 0;
  font-size: 19px;
  font-weight: 600;
  color: #222;
  text-align: center;
}
.modal-content {
  padding: 16px 24px 24px;
  font-size: 15px;
  color: #666;
  text-align: center;
  line-height: 1.6;
}
.modal-footer {
  display: flex;
  border-top: 1px solid #f3f4f6;
}
.modal-footer button {
  flex: 1;
  height: 52px;
  border: none;
  outline: none;
  font-size: 16px;
  cursor: pointer;
}
.btn-cancel { background: #f9fafb; color: #555; }
.btn-confirm { background: #2ecc71; color: #fff; font-weight: 500; }

.main-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 32px 32px 32px;
}

.user-card {
  background: #fff;
  border-radius: 16px;
  padding: 30px 35px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.user-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.user-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #2ecc71;
  color: #fff;
  font-size: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nickname {
  font-size: 22px;
  font-weight: 600;
  color: #222;
  margin-bottom: 5px;
}
.desc {
  font-size: 14px;
  color: #777;
}
.user-right {
  display: flex;
  gap: 40px;
  align-items: center;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.info-item label {
  font-size: 13px;
  color: #999;
}
.info-item span {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.favorite-stats {
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 12px;
  background: #fff8f0;
  border: 1px solid #f0e0d0;
  transition: all 0.2s ease;
  min-width: 100px;
  align-items: center;
}
.favorite-stats:hover {
  background: #ffa502;
  border-color: #ffa502;
}
.favorite-stats:hover label {
  color: #fff;
}
.favorite-stats:hover span {
  color: #fff;
}
.favorite-stats label {
  font-size: 13px;
  color: #999;
}
.favorite-stats span {
  font-size: 16px;
  color: #ffa502;
  font-weight: 600;
}

.order-section {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 12px;
}
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #222;
}
.search-bar {
  display: flex;
  align-items: center;
}
.search-input {
  padding: 10px 18px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
  width: 280px;
  transition: all 0.3s ease;
  background: #fafbfc;
}
.search-input:focus {
  border-color: #2ecc71;
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.15);
  background: #fff;
}
.search-input::placeholder {
  color: #bbb;
}

.order-table {
  width: 100%;
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}
.data-table th {
  background: #fafbfc;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  color: #444;
}
.data-table td {
  padding: 18px 16px;
  border-bottom: 1px solid #f1f3f5;
  font-size: 14px;
  vertical-align: middle;
}
.empty {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.status-pending,
.status-shipped,
.status-received {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
}
.status-pending {
  background: #fff7e6;
  color: #ff9800;
}
.status-shipped {
  background: #e6f7ff;
  color: #1890ff;
}
.status-received {
  background: #e6f7ef;
  color: #2ecc71;
}

.action-cell {
  white-space: nowrap;
}
.btn {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 70px;
  text-align: center;
}
.btn-receive {
  background: #e6f7ef;
  color: #2ecc71;
}
.btn-receive:hover {
  background: #2ecc71;
  color: #fff;
}
</style>
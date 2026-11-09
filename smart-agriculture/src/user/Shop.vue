<template>
  <!-- 点击空白关闭下拉菜单 -->
  <div class="shop-page" @click="closeDropAll">
    <!-- ========== 导航栏固定 ========== -->
    <nav class="navbar navbar-fixed">
      <div class="nav-container">
        <div class="nav-left">
          <div class="logo">智慧三农</div>
          <div class="nav-items">
            <router-link to="/user/home" class="nav-item">生态资讯</router-link>
            <router-link to="/user/shop" class="nav-item active">农业商城</router-link>
          </div>
        </div>
        <div class="nav-right">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索种子、化肥、农药..."
            class="search-input"
          />
          
          <div class="cart-wrapper">
            <router-link to="/user/cart" class="cart-icon">🛒</router-link>
            <div class="cart-badge" v-if="cartTotalCount > 0">{{ cartTotalCount }}</div>
          </div>

          <!-- 头像下拉菜单 -->
          <div class="avatar-dropdown" @click.stop>
            <div class="avatar-wrapper" @click="showDrop = !showDrop">
              <!-- ★ 动态头像 -->
              <div class="avatar-circle">{{ userInitial }}</div>
              <!-- ★ 动态昵称 -->
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

    <div class="modal-mask" v-if="showSoldOut" @click="showSoldOut = false">
      <div class="modal-dialog" @click.stop>
        <div class="modal-title">商品提示</div>
        <div class="modal-content">该商品已售罄，暂时无法查看详情~</div>
        <div class="modal-footer">
          <button class="btn-confirm" @click="showSoldOut = false">我知道了</button>
        </div>
      </div>
    </div>

    <div class="toast" v-show="showToast">
      {{ toastText }}
    </div>

    <main class="shop-container">
      <div class="category-tabs">
        <button
          class="tab"
          :class="{ active: currentCategory === 'all' }"
          @click="currentCategory = 'all'"
        >
          全部商品
        </button>
        <button
          class="tab"
          :class="{ active: currentCategory === 'fertilizer' }"
          @click="currentCategory = 'fertilizer'"
        >
          农药化肥
        </button>
        <button
          class="tab"
          :class="{ active: currentCategory === 'seed' }"
          @click="currentCategory = 'seed'"
        >
          优质种苗
        </button>
        <button
          class="tab"
          :class="{ active: currentCategory === 'machine' }"
          @click="currentCategory = 'machine'"
        >
          农机具
        </button>
        <button
          class="tab"
          :class="{ active: currentCategory === 'grain' }"
          @click="currentCategory = 'grain'"
        >
          五谷杂粮
        </button>
        <div class="sort">
          <span>排序：</span>
          <span
            class="sort-item"
            :class="{ active: currentSort === 'default' }"
            @click="currentSort = 'default'"
          >综合</span>
          <span
            class="sort-item"
            :class="{ active: currentSort === 'price' }"
            @click="currentSort = 'price'"
          >价格</span>
          <span
            class="sort-item"
            :class="{ active: currentSort === 'sales' }"
            @click="currentSort = 'sales'"
          >销量</span>
        </div>
      </div>

      <div class="goods-grid">
        <div
          v-for="item in filteredGoods"
          :key="item.id"
          class="goods-card"
          :class="{ 'sold-out': item.soldOut }"
        >
          <div class="goods-tag hot" v-if="item.tag === '热销'">热销</div>
          <div class="goods-tag new" v-if="item.tag === '上新'">上新</div>
          <div class="goods-tag sold" v-if="item.soldOut">已售罄</div>

          <div
            class="goods-badge"
            v-if="getItemCount(item.id) > 0"
          >
            {{ getItemCount(item.id) }}
          </div>

          <div class="goods-img">
            <img :src="item.img" :alt="item.title" />
          </div>
          <div class="goods-title">{{ item.title }}</div>

          <div class="goods-desc" v-if="item.desc">{{ item.desc }}</div>

          <div class="goods-price">
            <span class="price">¥{{ item.price.toFixed(2) }}</span>
            <span class="old-price" v-if="item.oldPrice">¥{{ item.oldPrice.toFixed(2) }}</span>
          </div>
          <div class="goods-stock">
            库存:{{ item.stock > 999 ? '999+' : item.stock }} | 销量:{{ item.sales > 999 ? (item.sales/1000).toFixed(1)+'k' : item.sales }}
          </div>

          <div
            class="card-click-area"
            @click="if(item.soldOut){ showSoldOut = true; }"
          ></div>

          <button
            class="add-cart"
            @click.stop="handleAddCart(item)"
            :class="{ disabled: item.soldOut }"
          >
            {{ item.soldOut ? '×' : '+' }}
          </button>
        </div>
      </div>
    </main>

    <!-- ========== 浮动图标（客服 + 信息）SVG 风格 ========== -->
    <div class="float-actions">
      <!-- 客服图标 -->
      <div class="float-item" @click="goChat">
        <svg class="float-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="float-label">客服</span>
      </div>
      <!-- 信息图标 -->
      <div class="float-item" @click="goMessages">
        <svg class="float-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <polyline points="22 6 12 13 2 6"/>
        </svg>
        <span class="float-label">消息</span>
        <span v-if="unreadCount > 0" class="float-badge">{{ unreadCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { userStore } from '@/stores/userStore'

const router = useRouter()

// ========== 用户信息 ==========
const userNickname = computed(() => userStore.getNickname() || '用户')
const userInitial = computed(() => userNickname.value.charAt(0).toUpperCase())

// ========== 用户相关 ==========
const showLogout = ref(false)
const showSoldOut = ref(false)
const showDrop = ref(false)
const showToast = ref(false)
const toastText = ref('')

// ========== ★ 确认退出 ==========
const confirmLogout = () => {
  showLogout.value = false
  userStore.logout()
  router.push('/login')
}

const openLogoutModal = () => {
  showDrop.value = false
  showLogout.value = true
}

// ========== 消息相关 ==========
const unreadCount = ref(0)
let countTimer = null

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

// 获取未读消息数量
const fetchUnreadCount = async () => {
  try {
    const res = await request.get('/api/message/unread/count')
    unreadCount.value = res.data.count || 0
  } catch (err) {
    console.error('获取未读数量失败', err)
  }
}

// ========== 跳转方法 ==========
const goChat = () => {
  router.push('/user/chat')
}

const goMessages = () => {
  router.push('/user/messages')
}

// ========== 通用方法 ==========
const goProfile = () => {
  showDrop.value = false
  router.push('/user/profile')
}

const closeDropAll = () => {
  showDrop.value = false
}

// ========== 商品相关 ==========
const currentCategory = ref('all')
const currentSort = ref('default')
const goodsList = ref([])
const searchKeyword = ref('')

// ★ 购物车总数（从后端获取）
const cartTotalCount = ref(0)

// ★ 获取购物车总数
const fetchCartTotal = async () => {
  try {
    const res = await request.get('/api/cart')
    cartTotalCount.value = res.data.reduce((sum, item) => sum + item.quantity, 0)
  } catch (err) {
    console.error('获取购物车总数失败', err)
    cartTotalCount.value = 0
  }
}

// ★ 获取商品列表中某个商品的数量（用于角标）
const getItemCount = (id) => {
  // 由于列表中每个商品只显示一次，这里的角标功能需要从已加载的购物车数据中获取
  // 目前简化处理：不再显示单个商品的角标，改为只显示购物车总角标
  // 如果确实需要，可以再维护一个购物车商品映射
  return 0
}

// ★ 加入购物车（调用后端接口）
const handleAddCart = async (item) => {
  if (item.soldOut) return
  try {
    await request.post('/api/cart/add', {
      goodsId: item.id,
      quantity: 1
    })
    toastText.value = `已添加「${item.title}」到购物车`
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 1500)
    // 更新购物车总数
    await fetchCartTotal()
  } catch (err) {
    console.error('加入购物车失败', err)
  }
}

onMounted(async () => {
  // 检查登录状态
  if (!userStore.isLoggedIn()) {
    router.push('/login')
    return
  }

  // 获取商品列表
  try {
    const res = await axios.get('http://localhost:8080/api/goods')
    goodsList.value = res.data.map(item => ({
      id: item.id,
      title: item.name,
      desc: item.desc || '暂无商品描述',
      price: Number(item.price),
      oldPrice: item.oldPrice ? Number(item.oldPrice) : null,
      img: item.cover,
      stock: item.stock,
      sales: item.sales || 0,
      tag: item.tag,
      category: item.category,
      soldOut: (item.status !== 1) || (item.stock <= 0)
    }))
  } catch (err) {
    console.error('获取商品失败', err)
  }
  
  // ★ 获取购物车总数
  await fetchCartTotal()
  
  // 获取未读消息数量
  await fetchUnreadCount()
  // 每10秒轮询一次
  countTimer = setInterval(fetchUnreadCount, 10000)
})

onUnmounted(() => {
  clearInterval(countTimer)
})

const filteredGoods = computed(() => {
  let list = [...goodsList.value]

  // 1. 搜索筛选
  if (searchKeyword.value.trim()) {
    const key = searchKeyword.value.toLowerCase()
    list = list.filter(item =>
      item.title.toLowerCase().includes(key)
    )
  }

  // 2. 分类映射 + 正确筛选
  const categoryMap = {
    fertilizer: '农药化肥',
    seed: '优质种苗',
    machine: '农机具',
    grain: '五谷杂粮'
  }
  if (currentCategory.value !== 'all') {
    const realCate = categoryMap[currentCategory.value]
    list = list.filter(i => i.category === realCate)
  }

  // 3. 排序
  if (currentSort.value === 'price') list.sort((a, b) => a.price - b.price)
  if (currentSort.value === 'sales') list.sort((a, b) => b.sales - a.sales)

  return list
})
</script>

<style scoped>
/* 样式完全保持不变 */
.shop-page {
  min-height: 100vh;
  background-color: #f5f7f9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* ========== 导航栏固定定位 ========== */
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
  font-size: 30px;
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
  gap: 20px;
}
.search-input {
  width: 280px;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
}
.search-input:focus {
  border-color: #2ecc71;
}

.cart-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.cart-wrapper:hover {
  background: #e6f7ef;
}
.cart-icon {
  font-size: 20px;
  color: #333;
  text-decoration: none;
  transition: color 0.2s ease;
}
.cart-wrapper:hover .cart-icon {
  color: #2ecc71;
}
.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff4d4f;
  color: #fff;
  font-size: 12px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 头像样式 */
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

/* 下拉菜单样式 */
.avatar-dropdown {
  position: relative;
}
.dropdown-menu {
  position: absolute;
  top: 110%;
  right: 0;
  width: 150px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
  animation: modalShow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
@keyframes modalShow {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
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
  transition: background 0.2s;
}
.btn-cancel {
  background: #f9fafb;
  color: #555;
}
.btn-cancel:hover {
  background: #f3f4f6;
}
.btn-confirm {
  background: #2ecc71;
  color: #fff;
  font-weight: 500;
}
.btn-confirm:hover {
  background: #27ae60;
}

/* ========== 主内容区域 ========== */
.shop-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 32px 32px 32px;
}

.category-tabs {
  background: #fff;
  padding: 16px 20px;
  border-radius: 16px;
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  align-items: center;
}
.tab {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tab.active {
  background: #2ecc71;
  color: #fff;
}
.sort {
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-items: center;
}
.sort-item {
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.sort-item:hover {
  background: #e6f7ef;
  color: #2ecc71;
}
.sort-item.active {
  background: #2ecc71;
  color: #fff;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
}
.goods-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}
.goods-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(46, 204, 113, 0.15);
}
.goods-card.sold-out {
  opacity: 0.6;
}
.card-click-area {
  position: absolute;
  inset: 0;
  z-index: 1;
}
.goods-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 6px;
  z-index: 2;
}
.goods-tag.hot {
  background: #ff4d4f;
  color: #fff;
}
.goods-tag.new {
  background: #2ecc71;
  color: #fff;
}
.goods-tag.sold {
  background: #d9d9d9;
  color: #666;
}

.goods-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 22px;
  height: 22px;
  background: #ff4d4f;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.goods-img {
  width: 100%;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
}
.goods-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.goods-title {
  font-size: 15px;
  color: #333;
  margin-top: 16px;
  font-weight: 500;
}
.goods-desc {
  font-size: 13px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
}
.goods-price {
  margin-top: 8px;
  font-size: 18px;
  color: #ff4d4f;
  font-weight: bold;
}
.goods-stock {
  margin-top: 4px;
  font-size: 13px;
  color: #888;
}
.add-cart {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2ecc71;
  color: #fff;
  border: none;
  font-size: 18px;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s ease;
}
.add-cart:hover:not(.disabled) {
  background: #27ae60;
  transform: scale(1.1);
}
.add-cart.disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.toast {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(46, 204, 113, 0.9);
  color: #fff;
  padding: 12px 24px;
  border-radius: 12px;
  z-index: 9999;
}

/* ========== 浮动图标 ========== */
.float-actions {
  position: fixed;
  right: 28px;
  bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 998;
}

.float-item {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.float-item:hover {
  transform: scale(1.08);
  box-shadow: 0 8px 28px rgba(46, 204, 113, 0.25);
}

/* ========== 浮动图标 SVG ========== */
.float-svg {
  width: 26px;
  height: 26px;
  color: #555;
  transition: color 0.3s ease;
}

.float-item:hover .float-svg {
  color: #2ecc71;
}

.float-label {
  font-size: 10px;
  color: #666;
  margin-top: 1px;
}

.float-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #f56c6c;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border: 2px solid #fff;
}

/* ========== 响应式 ========== */
@media (max-width: 1024px) {
  .goods-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .search-input {
    width: 180px;
  }
}

@media (max-width: 768px) {
  .goods-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .search-input {
    width: 120px;
    font-size: 13px;
    padding: 8px 12px;
  }
  .nav-container {
    padding: 0 16px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .nav-left {
    gap: 16px;
  }
  .nav-items {
    gap: 12px;
  }
  .nav-item {
    font-size: 13px;
    padding: 6px 10px;
  }
  .nav-right {
    gap: 10px;
    flex-wrap: wrap;
  }
  .shop-container {
    padding: 80px 16px 16px 16px;
  }
  .category-tabs {
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 16px;
  }
  .tab {
    padding: 6px 14px;
    font-size: 13px;
  }
  .sort {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }
  .goods-img {
    height: 150px;
  }
  .float-actions {
    right: 16px;
    bottom: 16px;
  }
  .float-item {
    width: 48px;
    height: 48px;
  }
  .float-svg {
    width: 22px;
    height: 22px;
  }
  .float-label {
    font-size: 9px;
  }
  .float-badge {
    font-size: 10px;
    min-width: 18px;
    height: 18px;
  }
  .avatar-name {
    display: none;
  }
}

@media (max-width: 480px) {
  .goods-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .goods-card {
    padding: 12px;
  }
  .goods-img {
    height: 120px;
  }
  .goods-title {
    font-size: 13px;
    margin-top: 10px;
  }
  .goods-price {
    font-size: 15px;
  }
  .add-cart {
    width: 24px;
    height: 24px;
    font-size: 14px;
    bottom: 12px;
    right: 12px;
  }
  .search-input {
    width: 100px;
    font-size: 12px;
    padding: 6px 10px;
  }
  .nav-item {
    font-size: 12px;
    padding: 4px 8px;
  }
  .logo {
    font-size: 18px;
  }
}
</style>
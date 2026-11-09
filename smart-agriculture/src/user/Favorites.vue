<template>
  <div class="favorites-page">
    <!-- 导航栏 -->
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

    <!-- 主内容 -->
    <main class="main-container">
      <!-- ====== 页面头部（含返回按钮） ====== -->
      <div class="favorites-header">
        <div class="header-left">
          <button class="btn-back" @click="goBack">
            <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            返回
          </button>
          <h2 class="page-title">我的收藏</h2>
        </div>
        <span class="favorite-total">共 {{ favoriteList.length }} 篇</span>
      </div>

      <!-- 收藏列表 -->
      <div class="favorites-grid" v-if="favoriteList.length > 0">
        <div v-for="item in favoriteList" :key="item.id" class="favorite-card">
          <!-- 点击图片跳转详情 -->
          <div class="card-image" @click="goDetail(item.id)">
            <img :src="item.cover" alt="封面" />
          </div>
          <div class="card-body">
            <!-- 点击标题跳转详情 -->
            <div class="card-title" @click="goDetail(item.id)">
              {{ item.title }}
            </div>
            <div class="card-meta">
              <span class="card-date">{{ item.date }}</span>
              <button class="btn-unfavorite" @click="removeFavorite(item.id)">取消收藏</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-favorites" v-else>
        
        <p>还没有收藏的资讯</p>
        <router-link to="/user/home" class="go-browse">去浏览资讯</router-link>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { userStore } from '@/stores/userStore'

const router = useRouter()
const showLogout = ref(false)
const showDrop = ref(false)
const favoriteList = ref([])

// ========== 用户信息 ==========
const userNickname = computed(() => userStore.getNickname() || '用户')
const userInitial = computed(() => userNickname.value.charAt(0).toUpperCase())

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

// ========== 获取收藏列表 ==========
const fetchFavorites = async () => {
  try {
    const res = await request.get('/api/user/favorites')
    favoriteList.value = res.data || []
  } catch (err) {
    console.error('获取收藏列表失败', err)
  }
}

// ========== 取消收藏 ==========
const removeFavorite = async (newsId) => {
  try {
    await request.delete(`/api/news/${newsId}/favorite`)
    favoriteList.value = favoriteList.value.filter(item => item.id !== newsId)
  } catch (err) {
    console.error('取消收藏失败', err)
  }
}

// ========== 跳转资讯详情页 ==========
const goDetail = (id) => {
  router.push({ path: '/user/newsDetail', query: { id } })
}

// ========== 返回个人中心 ==========
const goBack = () => {
  router.push('/user/profile')
}

// ========== 跳转个人中心 ==========
const goProfile = () => {
  showDrop.value = false
  router.push('/user/profile')
}

// ========== 打开退出登录弹窗 ==========
const openLogoutModal = () => {
  showDrop.value = false
  showLogout.value = true
}

// ========== 确认退出 ==========
const confirmLogout = () => {
  showLogout.value = false
  userStore.logout()
  router.push('/login')
}

// ========== 生命周期 ==========
onMounted(() => {
  if (!userStore.isLoggedIn()) {
    router.push('/login')
    return
  }
  fetchFavorites()
})
</script>

<style scoped>
/* ========== 样式完全保持不变 ========== */
.favorites-page {
  min-height: 100vh;
  background-color: #f8f9fa;
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
.nav-item.router-link-active {
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

/* ========== 主内容 ========== */
.main-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 32px 32px 32px;
}

/* ========== 页面头部 ========== */
.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 10px;
  color: #555;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
}

.btn-back:hover {
  background: #e6f7ef;
  border-color: #2ecc71;
  color: #2ecc71;
  transform: translateX(-2px);
}

.btn-back:active {
  transform: scale(0.96);
}

.back-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.25s ease;
}

.btn-back:hover .back-icon {
  transform: translateX(-2px);
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.favorite-total {
  font-size: 15px;
  color: #999;
  background: #f5f7f9;
  padding: 6px 16px;
  border-radius: 20px;
}

/* ========== 收藏卡片网格 ========== */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.favorite-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.favorite-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.10);
}

.card-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
  cursor: pointer;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.card-image:hover img {
  transform: scale(1.05);
}

.card-body {
  padding: 16px 20px 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #222;
  line-height: 1.5;
  margin-bottom: 12px;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
  transition: color 0.2s ease;
}

.card-title:hover {
  color: #2ecc71;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-date {
  font-size: 13px;
  color: #bbb;
}

.btn-unfavorite {
  padding: 5px 16px;
  background: #fef0f0;
  color: #f56c6c;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.btn-unfavorite:hover {
  background: #f56c6c;
  color: #fff;
}

.empty-favorites {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-favorites p {
  font-size: 18px;
  color: #999;
  margin-bottom: 20px;
}

.go-browse {
  display: inline-block;
  padding: 12px 32px;
  background: #2ecc71;
  color: #fff;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s ease;
}

.go-browse:hover {
  background: #27ae60;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .main-container {
    padding: 80px 16px 16px 16px;
  }

  .favorites-header {
    flex-wrap: wrap;
    gap: 12px;
  }

  .header-left {
    gap: 10px;
  }

  .btn-back {
    padding: 6px 12px;
    font-size: 13px;
  }

  .back-icon {
    width: 16px;
    height: 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .card-image {
    height: 150px;
  }
}

@media (max-width: 480px) {
  .favorites-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .card-image {
    height: 120px;
  }

  .card-body {
    padding: 12px 14px 14px;
  }

  .card-title {
    font-size: 14px;
  }

  .btn-unfavorite {
    font-size: 12px;
    padding: 4px 12px;
  }

  .btn-back {
    padding: 4px 10px;
    font-size: 12px;
  }

  .back-icon {
    width: 14px;
    height: 14px;
  }

  .page-title {
    font-size: 18px;
  }
}
</style>
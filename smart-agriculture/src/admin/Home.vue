<template>
  <div class="admin-layout">
    <!-- ====== 导航栏固定定位（与其他页面一致） ====== -->
    <nav class="navbar navbar-fixed">
      <div class="nav-container">
        <div class="nav-left">
          <div class="logo">智慧三农 · 管理后台</div>
        </div>

        <div class="nav-right">
          <div class="avatar-wrapper" @click="showLogout = true">
            <div class="avatar-circle">管</div>
            <div class="avatar-name">管理员</div>
          </div>
        </div>
      </div>
    </nav>

    <!-- ====== 主体布局（与其他页面完全一致） ====== -->
    <div class="admin-body">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <div class="sidebar-menu">
          <div class="menu-item active">数据概览</div>
          <div class="menu-item" @click="goTo('/admin/news')">资讯管理</div>
          <div class="menu-item" @click="goTo('/admin/goods')">商品管理</div>
          <div class="menu-item" @click="goTo('/admin/order')">订单记录</div>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="main-container">
        <!-- ====== 页面标题（与其他页面一致） ====== -->
        <div class="page-toolbar">
          <h2 class="page-title">数据概览</h2>
        </div>

        <div class="stat-grid">
          <div 
            class="stat-card" 
            :class="{ active: activeChart === 'visit' }"
            @click="switchChart('visit')"
          >
            <div class="card-label">系统页面浏览量</div>
            <div class="card-value">13,682</div>
            <div class="card-tip">今日增加 1,240 浏览量</div>
          </div>
          <div 
            class="stat-card" 
            :class="{ active: activeChart === 'user' }"
            @click="switchChart('user')"
          >
            <div class="card-label">用户注册数</div>
            <div class="card-value">342</div>
            <div class="card-tip">本月新增 46 人</div>
          </div>
          <div 
            class="stat-card" 
            :class="{ active: activeChart === 'orderNum' }"
            @click="switchChart('orderNum')"
          >
            <div class="card-label">订单数量</div>
            <div class="card-value">53</div>
            <div class="card-tip">今日新增 8 单</div>
          </div>
          <div 
            class="stat-card" 
            :class="{ active: activeChart === 'amount' }"
            @click="switchChart('amount')"
          >
            <div class="card-label">交易额</div>
            <div class="card-value">¥14,692</div>
            <div class="card-tip">今日增加 ¥2,180</div>
          </div>
        </div>

        <div class="chart-container">
          <div class="chart-header">
            <h3 class="chart-title">{{ chartTitle }}</h3>
            <div class="chart-tabs">
              <button class="chart-tab" :class="{ active: currentPeriod === 'week' }" @click="currentPeriod = 'week'">近7天</button>
              <button class="chart-tab" :class="{ active: currentPeriod === 'month' }" @click="currentPeriod = 'month'">近30天</button>
              <button class="chart-tab" :class="{ active: currentPeriod === 'year' }" @click="currentPeriod = 'year'">近1年</button>
            </div>
          </div>
          <div class="chart-box">
            <div class="chart-line" :class="`line-${activeChart}`"></div>
            <div class="x-labels">
              <span v-for="(item, idx) in xLabelList" :key="idx">{{ item }}</span>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 退出弹窗 -->
    <div class="modal-mask" v-if="showLogout" @click="showLogout = false">
      <div class="modal-dialog modal-logout" @click.stop>
        <div class="modal-title">退出登录</div>
        <div class="modal-content">确定要退出当前账号吗？</div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showLogout = false">取消</button>
          <button class="btn-confirm" @click="logout">确认退出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const activeModule = ref('home')
const activeChart = ref('visit')
const currentPeriod = ref('month')
const showLogout = ref(false)

const goTo = (path) => router.push(path)
const logout = () => router.push('/login')
const goHome = () => { activeChart.value = 'visit' }
const switchChart = (chart) => { activeChart.value = chart }

const crumbText = computed(() => {
  const map = {
    visit: '系统页面浏览量',
    user: '用户注册数',
    orderNum: '订单数量',
    amount: '交易额'
  }
  return map[activeChart.value] || ''
})

const chartTitle = computed(() => {
  const map = {
    visit: '系统页面浏览量趋势',
    user: '用户注册数趋势',
    orderNum: '订单数量趋势',
    amount: '交易额趋势'
  }
  return map[activeChart.value]
})

const xLabelList = computed(() => {
  if (currentPeriod.value === 'week') return ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7']
  if (currentPeriod.value === 'month') return ['1日', '5日', '10日', '15日', '20日', '25日', '30日']
  return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
})
</script>

<style scoped>
/* ===== 整体布局 ===== */
.admin-layout {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* ===== 导航栏固定（与其他页面完全一致） ===== */
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
}
.logo {
  font-size: 30px;
  font-weight: 700;
  color: #2ecc71;
}
.nav-right {
  display: flex;
  justify-content: flex-end;
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

/* ===== 主体布局（与其他页面完全一致） ===== */
.admin-body {
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 32px 32px 32px;
  display: flex;
  gap: 32px;
}

/* ===== 侧边栏（与其他页面完全一致） ===== */
.sidebar {
  width: 220px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  padding: 28px 0;
}
.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.menu-item {
  padding: 16px 24px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  border-radius: 12px;
  margin: 0 16px;
  transition: all 0.2s ease;
}
.menu-item:hover {
  background: #f5f7f9;
  transform: translateX(4px);
}
.menu-item.active {
  background: #e6f7ef;
  color: #2ecc71;
  font-weight: 600;
}

/* ===== 主内容区（与其他页面一致） ===== */
.main-container {
  flex: 1;
}

/* ===== 页面标题（与其他页面完全一致） ===== */
.page-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
}

/* ===== 统计卡片 ===== */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 28px;
  margin-bottom: 36px;
}
.stat-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}
.stat-card.active {
  border: 2px solid #2ecc71;
}
.card-label {
  font-size: 15px;
  color: #666;
  margin-bottom: 12px;
}
.card-value {
  font-size: 36px;
  font-weight: 700;
  color: #2ecc71;
  margin-bottom: 12px;
}
.card-tip {
  font-size: 14px;
  color: #666;
}

/* ===== 图表容器 ===== */
.chart-container {
  background: #fff;
  border-radius: 20px;
  padding: 36px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}
.chart-title {
  font-size: 22px;
  font-weight: 600;
  color: #1a1a1a;
}
.chart-tabs {
  display: flex;
  gap: 12px;
}
.chart-tab {
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  background: #f3f4f6;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.chart-tab:hover {
  background: #e6f7ef;
  color: #2ecc71;
}
.chart-tab.active {
  background: #2ecc71;
  color: #fff;
}

.chart-box {
  width: 100%;
  height: 280px;
  position: relative;
}
.chart-line {
  position: absolute;
  bottom: 32px;
  left: 0;
  width: 100%;
  height: 200px;
}
.line-visit {
  background: linear-gradient(to top, rgba(46, 204, 113, 0.3), transparent);
  clip-path: polygon(0% 70%,14% 50%,28% 60%,42% 40%,56% 45%,70% 35%,84% 38%,100% 30%,100% 100%,0 100%);
}
.line-user {
  background: linear-gradient(to top, rgba(52, 152, 219, 0.3), transparent);
  clip-path: polygon(0% 75%,14% 65%,28% 70%,42% 60%,56% 55%,70% 50%,84% 45%,100% 40%,100% 100%,0 100%);
}
.line-orderNum {
  background: linear-gradient(to top, rgba(255, 77, 79, 0.3), transparent);
  clip-path: polygon(0% 65%,14% 45%,28% 55%,42% 35%,56% 40%,70% 30%,84% 33%,100% 25%,100% 100%,0 100%);
}
.line-amount {
  background: linear-gradient(to top, rgba(241, 196, 15, 0.3), transparent);
  clip-path: polygon(0% 80%,14% 70%,28% 75%,42% 65%,56% 60%,70% 55%,84% 50%,100% 45%,100% 100%,0 100%);
}
.x-labels {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #888;
}

/* ===== 退出弹窗 ===== */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.modal-logout {
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
.btn-cancel {
  background: #f9fafb;
  color: #555;
}
.btn-confirm {
  background: #2ecc71;
  color: #fff;
  font-weight: 500;
}
</style>
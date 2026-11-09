<template>
  <div class="home-page" @click="closeDropAll">
    <!-- 导航栏 fixed 固定定位 -->
    <nav class="navbar navbar-fixed">
      <div class="nav-container">
        <div class="nav-left">
          <div class="logo">智慧三农</div>
          <div class="nav-items">
            <a href="#" class="nav-item active">生态资讯</a>
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
              <!-- 已移除"切换账号" -->
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

    <main class="main-container">
      <!-- 轮播图 -->
      <div class="hero-section">
        <div class="hero-banner">
          <div class="carousel-wrapper">
            <div
              class="carousel-slide"
              v-for="(item, idx) in bannerData"
              :key="idx"
              :style="{ left: `${idx * 100 - currentIndex * 100}%` }"
            >
              <img :src="item.img" class="banner-img" />
              <div class="banner-text">{{ item.text }}</div>
            </div>
          </div>
        </div>

        <!-- 今日农情看板 -->
        <div class="hero-stats">
          <div
            class="stats-card"
            :class="{ 'stats-card-zoomed': isHovering }"
            @mouseenter="isHovering = true"
            @mouseleave="isHovering = false"
          >
            <div class="stats-header">
              <span>📊 今日农情看板</span>
              <span class="city-badge">{{ currentCity }}</span>
            </div>
            <div class="time-row">
              <div class="time-display">{{ currentTime }}</div>
            </div>
            <div class="stats-row">
              <div class="stat-item">
                <div class="stat-label">🌡️ 温度</div>
                <div class="stat-value">{{ weatherData.temp }}℃</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">💧 湿度</div>
                <div class="stat-value">{{ weatherData.humidity }}%</div>
              </div>
            </div>
            <div class="stats-row">
              <div class="stat-item">
                <div class="stat-label">🌥️ 天气</div>
                <div class="stat-value">{{ weatherData.weather }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">🌬️ 风力</div>
                <div class="stat-value">{{ weatherData.wind }}</div>
              </div>
            </div>
            <button class="stats-btn refresh-btn" @click="refreshWeather">刷新</button>
          </div>
        </div>
      </div>

      <!-- 资讯列表 -->
      <section class="news-section">
        <div class="section-title">最新农业动态</div>
        <div class="news-grid">
          <router-link
            :to="`/user/newsDetail?id=${item.id}`"
            class="news-card"
            v-for="item in newsList"
            :key="item.id"
          >
            <div class="news-img">
              <img :src="item.cover" alt="新闻图片" />
            </div>
            <div class="news-content">
              <div class="news-title">{{ item.title }}</div>
              <div class="news-date">{{ item.date }}</div>
            </div>
          </router-link>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-col">
          <div class="footer-title">智慧三农</div>
          <div class="footer-desc">致力于服务乡村振兴，提供最专业的农业信息、技术与电商服务</div>
        </div>
        <div class="footer-col">
          <div class="footer-title">平台服务</div>
          <div class="footer-link">生态资讯</div>
          <div class="footer-link">农业商城</div>
          <div class="footer-link">数据中心</div>
        </div>
        <div class="footer-col">
          <div class="footer-title">关于我们</div>
          <div class="footer-link">寻求报导</div>
          <div class="footer-link">加入我们</div>
          <div class="footer-link">商务合作</div>
        </div>
        <div class="footer-col">
          <div class="footer-title">联系方式</div>
          <div class="footer-link">客服电话：400-888-999</div>
          <div class="footer-link">邮箱：service@zhinongsanong.com</div>
        </div>
      </div>
      <div class="footer-copyright">© 2025 智慧三农平台 版权所有</div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { bannerData } from '@/assets/data/bannerData'
import axios from 'axios'
import { userStore } from '@/stores/userStore'

const router = useRouter()
const showLogout = ref(false)
const showDrop = ref(false)
const isHovering = ref(false)

// 从 userStore 获取用户信息
const userNickname = computed(() => {
  return userStore.getNickname() || '用户'
})
const userInitial = computed(() => {
  return userNickname.value.charAt(0).toUpperCase()
})

// 确认退出
const confirmLogout = () => {
  showLogout.value = false
  userStore.logout()
  router.push('/login')
}

const closeDropAll = () => { showDrop.value = false }
const openLogoutModal = () => {
  showDrop.value = false
  showLogout.value = true
}
const goProfile = () => {
  showDrop.value = false
  router.push('/user/profile')
}

// ========== 轮播图 ==========
const currentIndex = ref(0)
let carouselTimer = null
const startAutoPlay = () => {
  carouselTimer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % bannerData.length
  }, 3000)
}
const stopAutoPlay = () => clearInterval(carouselTimer)

// ========== 今日农情看板 ==========
const weatherData = ref({
  temp: '--',
  humidity: '--',
  weather: '--',
  wind: '--'
})
const currentCity = ref('漳州')
const isWeatherLoaded = ref(false)

// ========== 实时时间 ==========
const currentTime = ref('')
let timeTimer = null

const updateCurrentTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const AMAP_KEY = 'bbdec4225355063f28d8a3544e95c337'

const getLocationCity = async () => {
  try {
    const res = await axios.get(
      `https://restapi.amap.com/v3/ip?key=${AMAP_KEY}&type=4`
    )

    if (res.data.status === '1' && res.data.city) {
      let cityName = res.data.city

      if (Array.isArray(cityName)) {
        if (cityName.length > 0 && typeof cityName[0] === 'string') {
          cityName = cityName[0]
        } else {
          currentCity.value = '漳州'
          return '漳州'
        }
      }

      if (typeof cityName !== 'string') {
        currentCity.value = '漳州'
        return '漳州'
      }

      if (cityName.endsWith('市')) {
        cityName = cityName.slice(0, -1)
      }

      currentCity.value = cityName || '漳州'
      return currentCity.value
    } else {
      currentCity.value = '漳州'
      return '漳州'
    }
  } catch (err) {
    currentCity.value = '漳州'
    return '漳州'
  }
}

const fetchWeatherByCity = async (city) => {
  try {
    const res = await axios.get(
      `https://restapi.amap.com/v3/weather/weatherInfo?city=${encodeURIComponent(city)}&key=${AMAP_KEY}`
    )

    if (res.data.status === '1' && res.data.lives && res.data.lives.length > 0) {
      const live = res.data.lives[0]
      weatherData.value.temp = live.temperature || '--'
      weatherData.value.humidity = live.humidity || '--'
      weatherData.value.weather = live.weather || '--'

      const windDir = live.winddirection || ''
      const windPower = live.windpower || ''
      weatherData.value.wind = windDir + (windPower ? ' ' + windPower + '级' : '')

      isWeatherLoaded.value = true

      if (live.city && typeof live.city === 'string') {
        let cityName = live.city
        if (cityName.endsWith('市')) {
          cityName = cityName.slice(0, -1)
        }
        currentCity.value = cityName
      }
    }
  } catch (err) {
    console.error('获取天气失败:', err)
  }
}

const fetchWeather = async () => {
  const city = await getLocationCity()
  await fetchWeatherByCity(city)
}

const refreshWeather = () => {
  fetchWeather()
}

let dataTimer = null
const updateWeatherData = () => {
  if (isWeatherLoaded.value) return

  const tempChange = (Math.random() - 0.5) * 2
  let newTemp = parseFloat(weatherData.value.temp) + tempChange
  if (isNaN(newTemp)) newTemp = 22
  if (newTemp > 35) newTemp = 35
  if (newTemp < 15) newTemp = 15
  weatherData.value.temp = Math.round(newTemp * 10) / 10

  const humidityChange = (Math.random() - 0.5) * 8
  let newHumidity = parseFloat(weatherData.value.humidity) + humidityChange
  if (isNaN(newHumidity)) newHumidity = 65
  if (newHumidity > 90) newHumidity = 90
  if (newHumidity < 30) newHumidity = 30
  weatherData.value.humidity = Math.round(newHumidity)

  const weatherList = ['晴', '多云', '阴', '小雨']
  weatherData.value.weather = weatherList[Math.floor(Math.random() * weatherList.length)]

  const windDirs = ['东风', '南风', '西风', '北风', '东南风', '东北风', '西南风', '西北风']
  const windPowers = ['1', '2', '3', '4', '5']
  weatherData.value.wind = windDirs[Math.floor(Math.random() * windDirs.length)] + ' ' + windPowers[Math.floor(Math.random() * windPowers.length)] + '级'
}

// ========== 资讯列表 ==========
const newsList = ref([])
const request = axios.create({
  baseURL: 'http://localhost:8080'
})

// ========== 生命周期 ==========
onMounted(async () => {
  // 检查是否登录，未登录跳转
  if (!userStore.isLoggedIn()) {
    router.push('/login')
    return
  }

  startAutoPlay()
  updateCurrentTime()
  timeTimer = setInterval(updateCurrentTime, 1000)

  await fetchWeather()

  dataTimer = setInterval(() => {
    updateWeatherData()
    if (Math.floor(Date.now() / 30000) % 2 === 0) {
      fetchWeather()
    }
  }, 10000)

  try {
    const res = await request.get('/api/news')
    newsList.value = res.data
  } catch (err) {
    console.error('获取资讯失败', err)
  }
})

onUnmounted(() => {
  stopAutoPlay()
  clearInterval(dataTimer)
  clearInterval(timeTimer)
})
</script>

<style scoped>
/* ========== 全局 ========== */
.home-page {
  min-height: 100vh;
  background-color: #f5f7f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ========== 导航栏固定 ========== */
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

/* ========== 头像 ========== */
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

/* ========== 下拉菜单 ========== */
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  z-index: 999;
}

.dropdown-item {
  padding: 10px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dropdown-item:hover {
  background: #f5f7f9;
  color: #2ecc71;
}

/* ========== 模态弹窗 ========== */
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
  transition: all 0.2s ease;
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

/* ========== 主内容 ========== */
.main-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 32px 32px 32px;
}

/* ========== Hero 区域 ========== */
.hero-section {
  display: flex;
  gap: 28px;
  margin-bottom: 36px;
  height: 320px;
}

/* ========== 轮播图 ========== */
.hero-banner {
  flex: 3;
  height: 320px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-slide {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  transition: left 0.5s ease;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-text {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: #fff;
  padding: 24px 20px;
  font-size: 18px;
  font-weight: 500;
  z-index: 10;
}

/* ========== 今日农情看板 ========== */
.hero-stats {
  flex: 1;
  height: 320px;
  box-sizing: border-box;
}

.stats-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease;
  transform-origin: center center;
  cursor: default;
}

.stats-card-zoomed {
  transform: scale(1.06);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
  z-index: 10;
  position: relative;
}

/* ========== 标题行 ========== */
.stats-header {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.city-badge {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: #2ecc71;
  padding: 2px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

/* ========== 时间行（标题下方） ========== */
.time-row {
  text-align: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.time-display {
  font-size: 15px;
  color: #555;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* ========== 数据行 ========== */
.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #888;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #2ecc71;
  transition: color 0.3s ease;
}

/* ========== 刷新按钮 ========== */
.refresh-btn {
  width: 100%;
  padding: 8px 0;
  background: #2ecc71;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
  margin-top: 2px;
}

.refresh-btn:hover {
  background: #27ae60;
  transform: scale(1.02);
}

/* ========== 资讯列表 ========== */
.news-section {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 28px;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.news-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.news-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.news-img img {
  width: 90px;
  height: 90px;
  border-radius: 10px;
  object-fit: cover;
}

.news-title {
  font-size: 15px;
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
}

.news-date {
  font-size: 13px;
  color: #999;
}

/* ========== 页脚 ========== */
.footer {
  background: #fff;
  margin-top: 40px;
  padding: 40px 0 24px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.04);
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  gap: 32px;
}

.footer-col {
  flex: 1;
}

.footer-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 20px;
}

.footer-desc {
  font-size: 14px;
  color: #777;
  line-height: 1.7;
}

.footer-link {
  font-size: 14px;
  color: #777;
  margin-bottom: 10px;
  cursor: default;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #2ecc71;
}

.footer-copyright {
  text-align: center;
  font-size: 13px;
  color: #999;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .nav-items {
    gap: 12px;
  }

  .nav-item {
    font-size: 13px;
    padding: 6px 10px;
  }

  .main-container {
    padding: 80px 16px 16px 16px;
  }

  .hero-section {
    flex-direction: column;
    height: auto;
  }

  .hero-banner {
    height: 200px;
  }

  .hero-stats {
    height: auto;
  }

  .stats-card {
    padding: 20px;
  }

  .city-badge {
    font-size: 12px;
    padding: 2px 10px;
  }

  .time-display {
    font-size: 13px;
  }

  .news-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .footer-container {
    flex-direction: column;
    gap: 24px;
  }

  .stats-card-zoomed {
    transform: scale(1.02);
  }
}
</style>
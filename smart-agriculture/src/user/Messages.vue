<template>
  <div class="messages-page">
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
              <div class="avatar-circle">林</div>
              <div class="avatar-name">林培芳</div>
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
          <button class="btn-confirm" @click="logout">确认退出</button>
        </div>
      </div>
    </div>

    <!-- 主内容 -->
    <main class="main-container">
      <div class="messages-wrapper">
        <div class="messages-header">
          <button class="btn-back" @click="goBack">← 返回</button>
          <div class="messages-title">📋 消息中心</div>
          <div style="width: 60px;"></div>
        </div>

        <div class="messages-list">
          <div v-if="messageList.length === 0" class="empty-messages">
            <div class="empty-icon">📭</div>
            <p>暂无消息</p>
          </div>
          <div
            v-for="item in messageList"
            :key="item.id"
            class="message-card"
            :class="{ 'message-card-admin': item.isFromAdmin === 1 }"
          >
            <div class="message-card-header">
              <span class="message-sender">
                {{ item.isFromAdmin === 1 ? '🤖 客服回复' : '👤 我' }}
              </span>
              <span class="message-card-time">{{ formatTime(item.createdAt) }}</span>
            </div>
            <div class="message-card-content">{{ item.content }}</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const showLogout = ref(false)
const showDrop = ref(false)
const messageList = ref([])

const request = axios.create({
  baseURL: 'http://localhost:8080'
})

// 获取消息列表并标记已读
const fetchMessages = async () => {
  try {
    const res = await request.get('/api/message/list')
    messageList.value = res.data || []
    // 标记所有未读消息为已读
    await request.put('/api/message/read/all')
  } catch (err) {
    console.error('获取消息失败', err)
  }
}

// 时间格式化
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const goBack = () => {
  router.push('/user/shop')
}

const openLogoutModal = () => {
  showDrop.value = false
  showLogout.value = true
}
const goProfile = () => {
  showDrop.value = false
  router.push('/user/profile')
}
const logout = () => {
  showLogout.value = false
  router.push('/login')
}

onMounted(fetchMessages)
</script>

<style scoped>
.messages-page {
  min-height: 100vh;
  background-color: #f5f7f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
.nav-left { display: flex; align-items: center; gap: 40px; }
.logo { font-size: 30px; font-weight: 700; color: #2ecc71; }
.nav-items { display: flex; gap: 28px; }
.nav-item {
  text-decoration: none;
  color: #444;
  font-size: 15px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}
.nav-item:hover { background: #e6f7ef; color: #2ecc71; }
.nav-item.router-link-active { background: #e6f7ef; color: #2ecc71; font-weight: 500; }

.avatar-dropdown { position: relative; }
.avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 999px;
  transition: background 0.2s ease;
}
.avatar-wrapper:hover { background: #e6f7ef; }
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
.avatar-name { font-size: 15px; color: #333; font-weight: 500; }
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
.dropdown-item:hover { background: #f5f7f9; color: #2ecc71; }

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
.modal-title { padding: 24px 24px 0; font-size: 19px; font-weight: 600; color: #222; text-align: center; }
.modal-content { padding: 16px 24px 24px; font-size: 15px; color: #666; text-align: center; line-height: 1.6; }
.modal-footer { display: flex; border-top: 1px solid #f3f4f6; }
.modal-footer button { flex: 1; height: 52px; border: none; outline: none; font-size: 16px; cursor: pointer; }
.btn-cancel { background: #f9fafb; color: #555; border-radius: 0 0 0 20px; }
.btn-confirm { background: #2ecc71; color: #fff; font-weight: 500; border-radius: 0 0 20px 0; }

.main-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 32px 32px 32px;
}

.messages-wrapper {
  max-width: 700px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  min-height: 400px;
}

.messages-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafbfc;
}
.btn-back {
  background: none;
  border: none;
  color: #2ecc71;
  font-size: 15px;
  cursor: pointer;
  padding: 4px 8px;
}
.btn-back:hover { color: #27ae60; }
.messages-title {
  font-size: 17px;
  font-weight: 600;
  color: #222;
}

.messages-list {
  padding: 20px 24px;
  max-height: 500px;
  overflow-y: auto;
}

.empty-messages {
  text-align: center;
  color: #bbb;
  padding: 60px 0;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-messages p { font-size: 15px; }

.message-card {
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 12px;
  background: #f9fafb;
  border-left: 4px solid #ddd;
  transition: all 0.2s ease;
}
.message-card-admin {
  border-left-color: #2ecc71;
  background: #f0faf4;
}
.message-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.message-sender {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
.message-card-admin .message-sender { color: #2ecc71; }
.message-card-time { font-size: 12px; color: #bbb; }
.message-card-content { font-size: 15px; color: #444; line-height: 1.6; word-break: break-all; }

@media (max-width: 768px) {
  .main-container { padding: 80px 12px 16px 12px; }
  .messages-wrapper { border-radius: 12px; min-height: 350px; }
  .messages-header { padding: 12px 16px; }
  .messages-list { padding: 14px 16px; }
}
</style>
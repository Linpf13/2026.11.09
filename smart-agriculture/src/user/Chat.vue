<template>
  <div class="chat-page" @click="closeDropAll">
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
      <div class="chat-wrapper">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <button class="btn-back" @click="goBack">
            <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            返回
          </button>
          <div class="chat-title">在线咨询</div>
          <div class="chat-status" :class="{ online: isOnline }">
            {{ isOnline ? '客服在线' : '客服离线' }}
          </div>
        </div>

        <!-- 聊天消息区域 -->
        <div class="chat-messages" ref="messagesContainer">
          <!-- 欢迎消息 -->
          <div v-if="currentStep === 'welcome'" class="message-item system-message">
            <div class="system-bubble">
              <div class="system-icon">🤖</div>
              <div class="system-text">您好！我是智慧三农智能客服助手</div>
              <div class="system-sub">请选择您要咨询的类型：</div>
              <div class="choice-cards">
                <div class="choice-card" @click="selectType('product')">
                  <div class="choice-icon">🌾</div>
                  <div class="choice-label">商品咨询</div>
                  <div class="choice-desc">了解商品详细信息</div>
                </div>
                <div class="choice-card" @click="selectType('order')">
                  <div class="choice-icon">📋</div>
                  <div class="choice-label">订单咨询</div>
                  <div class="choice-desc">查询订单状态/售后</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 商品搜索提示 -->
          <div v-if="currentStep === 'product_input'" class="message-item system-message">
            <div class="system-bubble">
              <div class="system-text">好的，请输入您想咨询的商品名称</div>
              <div class="system-hint">例如：泸天化复合肥</div>
            </div>
          </div>

          <!-- 商品列表 -->
          <div v-if="currentStep === 'product_list' && productList.length > 0" class="message-item system-message">
            <div class="system-bubble">
              <div class="system-text">找到以下商品，请选择您要咨询的：</div>
              <div class="product-list">
                <div v-for="item in productList" :key="item.id" class="product-item" @click="selectProduct(item.id)">
                  <img :src="item.cover" class="product-cover" />
                  <div class="product-info">
                    <div class="product-name">{{ item.name }}</div>
                    <div class="product-price">¥{{ item.price }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 问题选择 -->
          <div v-if="currentStep === 'question_select'" class="message-item system-message">
            <div class="system-bubble">
              <div class="system-text">
                您已选择：<strong>{{ selectedProductName }}</strong>
              </div>
              <div class="system-sub">请选择您想了解的问题：</div>
              <div class="question-cards">
                <div v-for="q in questionList" :key="q.type" class="question-card" @click="answerQuestion(q.type)">
                  {{ q.label }}
                </div>
              </div>
            </div>
          </div>

          <!-- 用户消息 -->
          <div v-for="msg in chatMessages" :key="msg.id" class="message-item" :class="msg.isUser ? 'user-message' : 'system-message'">
            <div class="message-bubble" :class="msg.isUser ? 'user-bubble' : 'system-bubble'">
              <div v-if="!msg.isUser" class="system-icon">🤖</div>
              <div class="message-text" v-html="msg.content"></div>
              <div class="message-time">{{ msg.time }}</div>
            </div>
          </div>

          <!-- 转人工提示 -->
          <div v-if="showManualTip" class="message-item system-message">
            <div class="system-bubble">
              <div class="system-text">👤 已为您转接人工客服，请稍候...</div>
              <div class="system-hint" style="color: #999; font-size: 13px;">客服将在3分钟内响应</div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <input
            v-model="userInput"
            type="text"
            placeholder="输入您的问题，AI 智能客服为您解答..."
            @keyup.enter="sendMessage"
            class="chat-input"
            :disabled="isProcessing"
          />
          <button
            class="btn-send"
            @click="sendMessage"
            :disabled="isProcessing || !userInput.trim()"
          >
            {{ isProcessing ? '思考中...' : '发送' }}
          </button>
        </div>

        <!-- 转人工按钮 -->
        <div class="manual-btn-wrapper">
          <button class="btn-manual" @click="transferToManual">
            👤 转人工客服
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { userStore } from '@/stores/userStore'

const router = useRouter()

// ========== 用户信息 ==========
const userNickname = computed(() => userStore.getNickname() || '用户')
const userInitial = computed(() => userNickname.value.charAt(0).toUpperCase())

// ========== 通用 ==========
const showLogout = ref(false)
const showDrop = ref(false)
const messagesContainer = ref(null)

// ========== 客服状态 ==========
const isOnline = ref(true)

// ========== 会话状态 ==========
const currentStep = ref('welcome')
const chatMessages = ref([])
const selectedProductName = ref('')
const productList = ref([])
const questionList = ref([])
const showManualTip = ref(false)

// ========== AI 对话 ==========
const userInput = ref('')
const isProcessing = ref(false)

// ★ 创建带请求拦截器的 axios 实例
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

// ========== 添加消息 ==========
const addMessage = (content, isUser = false) => {
  const now = new Date()
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  chatMessages.value.push({
    id: Date.now() + Math.random(),
    content: content,
    isUser: isUser,
    time: time
  })
  scrollToBottom()
}

// ========== 滚动到底部 ==========
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// ========== 发送消息（AI 对话） ==========
const sendMessage = async () => {
  const message = userInput.value.trim()
  if (!message || isProcessing.value) return

  addMessage(message, true)
  userInput.value = ''
  isProcessing.value = true

  try {
    const res = await request.post('/api/chat/ai/chat', { message })
    if (res.data.success) {
      addMessage(res.data.reply, false)
      if (res.data.needManual) {
        showManualTip.value = true
        currentStep.value = 'manual'
      }
    } else {
      addMessage('AI 服务暂时不可用，请稍后重试', false)
    }
  } catch (err) {
    console.error('AI 对话失败', err)
    addMessage('网络异常，请稍后重试', false)
  } finally {
    isProcessing.value = false
  }
}

// ========== 选择咨询类型 ==========
const selectType = async (type) => {
  try {
    const res = await request.post('/api/chat/select-type', { type })
    if (res.data.success) {
      currentStep.value = res.data.step
      const typeLabel = type === 'product' ? '商品咨询' : '订单咨询'
      addMessage(`我选择了「${typeLabel}」`, true)
      
      if (type === 'product') {
        addMessage('请输入您想咨询的商品名称', false)
      } else {
        if (res.data.orders && res.data.orders.length > 0) {
          let orderHtml = '请选择您要咨询的订单：<br/>'
          res.data.orders.forEach(o => {
            orderHtml += `• 订单 ${o.orderNo} - ¥${o.totalPrice} (${o.status})<br/>`
          })
          addMessage(orderHtml, false)
        } else {
          addMessage('您暂无历史订单，请返回商城购买商品', false)
          currentStep.value = 'welcome'
        }
      }
    }
  } catch (err) {
    console.error('选择类型失败', err)
  }
}

// ========== 搜索商品 ==========
const searchProduct = async () => {
  // 这个方法现在由 AI 对话替代，保留空方法防止报错
}

// ========== 选择商品 ==========
const selectProduct = async (productId) => {
  try {
    const res = await request.post('/api/chat/select-product', { productId })
    if (res.data.success) {
      currentStep.value = 'question_select'
      selectedProductName.value = res.data.productName
      questionList.value = res.data.questions || []
      addMessage(`选择了：${selectedProductName.value}`, true)
      addMessage('请选择您想了解的问题：', false)
    }
  } catch (err) {
    console.error('选择商品失败', err)
  }
}

// ========== 回答问题 ==========
const answerQuestion = async (questionType) => {
  const qLabel = questionList.value.find(q => q.type === questionType)?.label || questionType
  addMessage(`选择了「${qLabel}」`, true)

  try {
    const res = await request.post('/api/chat/answer-question', { questionType })
    if (res.data.success) {
      if (res.data.needManual) {
        showManualTip.value = true
        currentStep.value = 'manual'
        addMessage('已为您转接人工客服，请稍候...', false)
        addMessage('客服将在3分钟内响应', false)
      } else {
        addMessage(res.data.answer, false)
        setTimeout(() => {
          resetToWelcome()
        }, 2000)
      }
    }
  } catch (err) {
    console.error('回答问题失败', err)
    addMessage('系统繁忙，请稍后重试', false)
  }
}

// ========== 转人工 ==========
const transferToManual = () => {
  if (currentStep.value === 'manual') {
    addMessage('已在人工排队中，请耐心等待', true)
    return
  }
  showManualTip.value = true
  currentStep.value = 'manual'
  addMessage('已为您转接人工客服，请稍候...', false)
  addMessage('客服将在3分钟内响应', false)
}

// ========== 重置到欢迎页 ==========
const resetToWelcome = async () => {
  try {
    await request.post('/api/chat/reset')
  } catch (err) {
    console.error('重置会话失败', err)
  }
  currentStep.value = 'welcome'
  productList.value = []
  selectedProductName.value = ''
  questionList.value = []
  showManualTip.value = false
  addMessage('您好！我是智慧三农智能客服助手', false)
  addMessage('请选择您要咨询的类型：', false)
}

// ========== 导航 ==========
const goBack = () => {
  router.push('/user/shop')
}

const goProfile = () => {
  showDrop.value = false
  router.push('/user/profile')
}

const closeDropAll = () => {
  showDrop.value = false
}

const openLogoutModal = () => {
  showDrop.value = false
  showLogout.value = true
}

const confirmLogout = () => {
  showLogout.value = false
  userStore.logout()
  router.push('/login')
}

// ========== 生命周期 ==========
onMounted(async () => {
  if (!userStore.isLoggedIn()) {
    router.push('/login')
    return
  }
  addMessage('您好！我是智慧三农智能客服助手', false)
  addMessage('请选择您要咨询的类型：', false)
})
</script>

<style scoped>
/* ========== 样式完全保持不变 ========== */
.chat-page {
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

.main-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 32px 32px 32px;
}

.chat-wrapper {
  max-width: 700px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 550px;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafbfc;
  flex-shrink: 0;
}
.btn-back {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #555;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  font-weight: 500;
}
.btn-back:hover { color: #2ecc71; }
.back-icon {
  width: 18px;
  height: 18px;
}
.chat-title {
  flex: 1;
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: #222;
}
.chat-status {
  font-size: 13px;
  padding: 4px 14px;
  border-radius: 20px;
  background: #f0f0f0;
  color: #999;
}
.chat-status.online {
  background: #e6f7ef;
  color: #2ecc71;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background: #f9fafb;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
}
.message-item.user-message {
  justify-content: flex-end;
}
.message-item.system-message {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 14px;
  word-wrap: break-word;
}
.user-bubble {
  background: #2ecc71;
  color: #fff;
  border-radius: 14px 14px 4px 14px;
}
.system-bubble {
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 14px 14px 14px 4px;
  padding: 16px 20px;
  max-width: 85%;
}
.system-icon {
  font-size: 20px;
  margin-bottom: 6px;
}
.system-text {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
}
.system-sub {
  font-size: 14px;
  color: #666;
  margin-top: 6px;
}
.system-hint {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}
.message-text {
  font-size: 15px;
  line-height: 1.6;
}
.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}
.user-bubble .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.choice-cards {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
.choice-card {
  flex: 1;
  padding: 16px;
  border: 2px solid #e8eaed;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
}
.choice-card:hover {
  border-color: #2ecc71;
  background: #f0faf4;
  transform: translateY(-2px);
}
.choice-icon {
  font-size: 28px;
  margin-bottom: 6px;
}
.choice-label {
  font-size: 15px;
  font-weight: 600;
  color: #222;
}
.choice-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.product-list {
  margin-top: 10px;
}
.product-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.product-item:hover {
  border-color: #2ecc71;
  background: #f0faf4;
}
.product-cover {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
}
.product-info {
  flex: 1;
}
.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}
.product-price {
  font-size: 13px;
  color: #ff4d4f;
}

.question-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.question-card {
  padding: 8px 16px;
  background: #f5f7f9;
  border: 1px solid #e8eaed;
  border-radius: 20px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
}
.question-card:hover {
  background: #2ecc71;
  color: #fff;
  border-color: #2ecc71;
}

.chat-input-area {
  display: flex;
  padding: 12px 20px;
  gap: 10px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
  flex-shrink: 0;
}
.chat-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  outline: none;
  font-size: 15px;
  transition: all 0.2s ease;
}
.chat-input:focus {
  border-color: #2ecc71;
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.15);
}
.btn-send {
  padding: 10px 24px;
  background: #2ecc71;
  color: #fff;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.btn-send:hover {
  background: #27ae60;
}
.btn-send:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.manual-btn-wrapper {
  padding: 8px 20px 14px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}
.btn-manual {
  padding: 8px 24px;
  background: #fff;
  color: #f56c6c;
  border: 1px solid #f56c6c;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}
.btn-manual:hover {
  background: #fef0f0;
}

@media (max-width: 768px) {
  .main-container {
    padding: 80px 12px 16px 12px;
  }
  .chat-wrapper {
    height: 480px;
    border-radius: 12px;
  }
  .choice-cards {
    flex-direction: column;
  }
  .chat-header {
    padding: 10px 14px;
  }
  .chat-messages {
    padding: 14px 16px;
  }
  .system-bubble {
    max-width: 92%;
  }
}
</style>
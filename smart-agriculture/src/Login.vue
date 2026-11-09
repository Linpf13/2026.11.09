<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>智慧三农平台</h1>
        <p>一站式乡村数字化服务平台</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-item">
          <label class="form-label">账号</label>
          <input
            v-model="loginForm.username"
            type="text"
            placeholder="请输入账号"
            class="form-input"
          />
        </div>

        <div class="form-item">
          <label class="form-label">密码</label>
          <input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            class="form-input"
          />
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <div class="login-footer">
        <span class="date">当前日期：{{ currentDate }}</span>
        <div class="links">
          <a href="#" class="link">隐私政策</a>
          <a href="#" class="link">服务协议</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { userStore } from '@/stores/userStore'

const router = useRouter()
const loading = ref(false)
const errorMsg = ref('')

const loginForm = ref({
  username: '',
  password: ''
})

const currentDate = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})

const request = axios.create({
  baseURL: 'http://localhost:8080'
})

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    errorMsg.value = '请输入账号和密码'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const res = await request.post('/api/user/login', loginForm.value)

    if (res.data.success) {
      const user = res.data.data
      userStore.login(user)

      // ★ 强制写入（覆盖）
    localStorage.setItem('nickname', user.nickname || user.username)
    localStorage.setItem('username', user.username)
    localStorage.setItem('userId', user.id)

      // ★ 使用 window.location.href 属性赋值（不是函数调用）
      const target = user.role === 'admin' ? '/admin/home' : '/user/home'
      window.location.href = target  // ✅ 正确写法
    } else {
      errorMsg.value = res.data.message || '登录失败'
    }
  } catch (err) {
    console.error('登录错误:', err)
    errorMsg.value = '网络异常，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #f5f7f9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.login-container {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 20px;
  padding: 48px 40px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.login-container:hover {
  transform: translateY(-2px);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}
.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2d3436;
  margin-bottom: 8px;
}
.login-header p {
  font-size: 15px;
  color: #666;
  line-height: 1.5;
}

.login-form {
  width: 100%;
}
.form-item {
  margin-bottom: 24px;
  width: 100%;
}
.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #444;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.25s ease;
  background-color: #f9fafb;
}
.form-input:focus {
  border-color: #2ecc71;
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.15);
  background-color: #fff;
}

.error-msg {
  padding: 10px 14px;
  background: #fef0f0;
  color: #f56c6c;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
}

.login-btn {
  width: 100%;
  padding: 16px;
  background-color: #2ecc71;
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.2);
}
.login-btn:hover:not(:disabled) {
  background-color: #27ae60;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(46, 204, 113, 0.25);
}
.login-btn:active:not(:disabled) {
  transform: translateY(0);
}
.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #888;
  padding-top: 24px;
  margin-top: 32px;
  border-top: 1px solid #f3f4f6;
}
.links {
  display: flex;
  gap: 24px;
}
.link {
  color: #888;
  text-decoration: none;
  transition: color 0.2s;
}
.link:hover {
  color: #2ecc71;
}
</style>
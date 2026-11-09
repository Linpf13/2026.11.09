import { reactive } from 'vue'

// ============================================================
// 1. 定义用户状态
// ============================================================
const userState = reactive({
  id: null,
  username: '',
  nickname: '',
  avatar: '',
  role: 'user',
  isLoggedIn: false
})

// ============================================================
// 2. 从 localStorage 恢复登录状态
// ============================================================
const storedUser = localStorage.getItem('user')
if (storedUser) {
  try {
    const user = JSON.parse(storedUser)
    userState.id = user.id
    userState.username = user.username
    userState.nickname = user.nickname || user.username
    userState.avatar = user.avatar || ''
    userState.role = user.role || 'user'
    userState.isLoggedIn = true
  } catch (e) {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }
}

// ============================================================
// 3. 导出 userStore
// ============================================================
export const userStore = {
  state: userState,

  // -------- 登录 --------
  login(user) {
    userState.id = user.id
    userState.username = user.username
    userState.nickname = user.nickname || user.username
    userState.avatar = user.avatar || ''
    userState.role = user.role || 'user'
    userState.isLoggedIn = true

    localStorage.setItem('token', 'logged_in')
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('userId', user.id)
    localStorage.setItem('username', user.username)
    localStorage.setItem('nickname', user.nickname || user.username)
    localStorage.setItem('role', user.role || 'user')
  },

  // -------- 退出登录（彻底清除） --------
  logout() {
    userState.id = null
    userState.username = ''
    userState.nickname = ''
    userState.avatar = ''
    userState.role = 'user'
    userState.isLoggedIn = false

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    localStorage.removeItem('nickname')
    localStorage.removeItem('role')
  },

  // -------- 获取用户信息 --------
  getUserId() {
    return userState.id || localStorage.getItem('userId') || null
  },

  getUsername() {
    return userState.username || localStorage.getItem('username') || ''
  },

  getNickname() {
    return userState.nickname || localStorage.getItem('nickname') || ''
  },

  getRole() {
    return userState.role || localStorage.getItem('role') || 'user'
  },

  // -------- 判断状态 --------
  isLoggedIn() {
    return userState.isLoggedIn || !!localStorage.getItem('token')
  },

  isAdmin() {
    return this.getRole() === 'admin'
  }
}
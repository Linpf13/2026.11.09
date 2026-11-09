<template>
  <div class="news-detail-page" @click="closeDropAll">
    <!-- ========== 导航栏固定定位 ========== -->
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

    <!-- 退出登录弹窗 -->
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

    <!-- ========== 删除评论确认弹框（统一风格） ========== -->
    <div class="modal-mask" v-if="showDeleteModal" @click="showDeleteModal = false">
      <div class="modal-dialog" @click.stop>
        <div class="modal-title">删除评论</div>
        <div class="modal-content">确定要删除这条评论吗？删除后无法恢复。</div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteModal = false">取消</button>
          <button class="btn-confirm" @click="confirmDeleteComment">确认删除</button>
        </div>
      </div>
    </div>

    <!-- 主内容 -->
    <main class="main-container">
      <div class="news-detail-wrapper" v-if="news.id">
        <h1 class="news-title">{{ news.title }}</h1>
        <div class="news-meta">
          <span>{{ news.date }}</span>
        </div>

        <div class="news-image">
          <img :src="news.cover" alt="封面" />
        </div>

        <div class="news-content">
          <p class="paragraph">{{ news.content }}</p>
        </div>

        <!-- ========== 正文下方的评论区（含删除按钮） ========== -->
        <div class="comment-section" v-if="showCommentSection">
          <h3 class="comment-title">全部评论（{{ news.commentsCount || 0 }}）</h3>
          <div class="comment-list-display">
            <div v-if="commentList.length === 0" class="empty-comment">暂无评论，来说两句吧~</div>
            <div v-for="item in commentList" :key="item.id" class="comment-item-display">
              <!-- 评论头部：用户名 + 删除按钮 -->
              <div class="comment-header">
                <div class="comment-user">{{ item.username || '用户' }}</div>
                <!-- 仅当评论作者是当前用户（userId === 1）时显示删除按钮 -->
                <button 
                  v-if="item.userId === 1" 
                  class="btn-delete-comment" 
                  @click="openDeleteModal(item.id)"
                >
                  删除
                </button>
              </div>
              <div class="comment-content">{{ item.content }}</div>
              <div class="comment-time">{{ formatTime(item.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ========== 右下角竖排功能按钮 ========== -->
    <div class="action-float-bar">
      <!-- 点赞 -->
      <div class="action-item" @click="toggleLike">
        <div class="action-icon" :class="{ active: news.isLiked }">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <span class="action-count">{{ news.likesCount || 0 }}</span>
      </div>

      <!-- 收藏 -->
      <div class="action-item" @click="toggleFavorite">
        <div class="action-icon" :class="{ active: news.isFavorited }">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </div>
        <span class="action-count">{{ news.favoritesCount || 0 }}</span>
      </div>

      <!-- 评论 -->
      <div class="action-item" @click="openCommentModal">
        <div class="action-icon">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
        </div>
        <span class="action-count">{{ news.commentsCount || 0 }}</span>
      </div>
    </div>

    <!-- ========== 评论弹窗（仅输入框 + 确定 + 关闭） ========== -->
    <div class="modal-mask" v-if="showCommentModal" @click="closeCommentModal">
      <div class="modal-dialog comment-dialog" @click.stop>
        <div class="modal-content" style="padding: 16px 24px 8px 24px;">
          <textarea
            v-model="commentInput"
            class="comment-textarea"
            rows="4"
            placeholder="请输入您的评论"
          ></textarea>
        </div>
        <div class="modal-footer" style="border-top: none; padding: 8px 24px 24px 24px; gap: 12px;">
          <button class="btn-cancel" @click="closeCommentModal" style="flex:1; border-radius: 10px;">关闭</button>
          <button class="btn-confirm" @click="submitComment" style="flex:1; border-radius: 10px;">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const news = ref({})
const showLogout = ref(false)
const showDrop = ref(false)

// 评论相关
const showCommentModal = ref(false)
const commentList = ref([])
const commentInput = ref('')
const showCommentSection = ref(false)

// ========== 删除评论确认弹框 ==========
const showDeleteModal = ref(false)
const deleteTargetId = ref(null)

// 请求锁
const isLiking = ref(false)
const isFavoriting = ref(false)
const isCommenting = ref(false)

// API 请求
const request = axios.create({
  baseURL: 'http://localhost:8080'
})

// 获取详情（含点赞/收藏状态）
const fetchDetail = async () => {
  const id = route.query.id
  if (!id) return
  try {
    const res = await request.get(`/api/news/${id}`)
    news.value = res.data
    // 如果该资讯已有评论，自动显示正文下方的评论区
    if (news.value.commentsCount > 0) {
      showCommentSection.value = true
      await fetchComments()
    }
  } catch (err) {
    console.error('获取详情失败', err)
  }
}

// 获取评论列表
const fetchComments = async () => {
  const id = route.query.id
  if (!id) return
  try {
    const res = await request.get(`/api/news/${id}/comments`)
    commentList.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('获取评论失败', err)
    commentList.value = []
  }
}

// 打开评论弹窗
const openCommentModal = () => {
  commentInput.value = ''
  showCommentModal.value = true
}

// 关闭评论弹窗
const closeCommentModal = () => {
  showCommentModal.value = false
}

// 提交评论
const submitComment = async () => {
  if (isCommenting.value) return
  const content = commentInput.value.trim()
  if (!content) return
  const id = route.query.id
  if (!id) return
  isCommenting.value = true
  try {
    const res = await request.post(`/api/news/${id}/comment`, { content })
    commentList.value = Array.isArray(res.data.comments) ? res.data.comments : []
    news.value.commentsCount = res.data.commentsCount || commentList.value.length
    commentInput.value = ''

    showCommentModal.value = false
    showCommentSection.value = true
  } catch (err) {
    console.error('评论失败', err)
  } finally {
    isCommenting.value = false
  }
}

// ========== 打开删除确认弹框 ==========
const openDeleteModal = (commentId) => {
  deleteTargetId.value = commentId
  showDeleteModal.value = true
}

// ========== 确认删除评论 ==========
const confirmDeleteComment = async () => {
  if (deleteTargetId.value === null) return
  
  try {
    const res = await request.delete(`/api/news/comment/${deleteTargetId.value}`)
    if (res.data.success) {
      // 从列表中移除该评论
      commentList.value = commentList.value.filter(item => item.id !== deleteTargetId.value)
      // 更新评论计数
      news.value.commentsCount = (news.value.commentsCount || 0) - 1
    } else {
      alert(res.data.message || '删除失败')
    }
  } catch (err) {
    console.error('删除评论失败', err)
    alert('删除评论失败，请稍后重试')
  } finally {
    // 关闭弹框并清空目标ID
    showDeleteModal.value = false
    deleteTargetId.value = null
  }
}

// 切换点赞（带锁）
const toggleLike = async () => {
  if (isLiking.value) return
  const id = route.query.id
  if (!id) return
  isLiking.value = true
  try {
    if (news.value.isLiked) {
      await request.delete(`/api/news/${id}/like`)
      news.value.isLiked = false
      news.value.likesCount = Math.max(0, (news.value.likesCount || 0) - 1)
    } else {
      const res = await request.post(`/api/news/${id}/like`)
      news.value.isLiked = true
      news.value.likesCount = res.data.likesCount
    }
  } catch (err) {
    console.error('点赞操作失败', err)
    await fetchDetail()
  } finally {
    isLiking.value = false
  }
}

// 切换收藏（带锁）
const toggleFavorite = async () => {
  if (isFavoriting.value) return
  const id = route.query.id
  if (!id) return
  isFavoriting.value = true
  try {
    if (news.value.isFavorited) {
      await request.delete(`/api/news/${id}/favorite`)
      news.value.isFavorited = false
      news.value.favoritesCount = Math.max(0, (news.value.favoritesCount || 0) - 1)
    } else {
      const res = await request.post(`/api/news/${id}/favorite`)
      news.value.isFavorited = true
      news.value.favoritesCount = res.data.favoritesCount
    }
  } catch (err) {
    console.error('收藏操作失败', err)
    await fetchDetail()
  } finally {
    isFavoriting.value = false
  }
}

// 时间格式化
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// 其他函数
const openLogoutModal = () => {
  showDrop.value = false
  showLogout.value = true
}
const goProfile = () => {
  showDrop.value = false
  router.push('/user/profile')
}
const closeDropAll = () => {
  showDrop.value = false
}
const logout = () => {
  showLogout.value = false
  router.push('/login')
}

onMounted(fetchDetail)
</script>

<style scoped>
.news-detail-page {
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
.nav-item.router-link-active {
  background: #e6f7ef;
  color: #2ecc71;
  font-weight: 500;
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

/* ========== 通用弹框样式 ========== */
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
.btn-cancel {
  background: #f9fafb;
  color: #555;
  border-radius: 0 0 0 20px;
}
.btn-confirm {
  background: #2ecc71;
  color: #fff;
  font-weight: 500;
  border-radius: 0 0 20px 0;
}

/* ========== 主内容区域 ========== */
.main-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 32px 32px 32px;
}

.news-detail-wrapper {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  max-width: 900px;
  margin: 0 auto;
}
.news-title {
  font-size: 28px;
  font-weight: 600;
  color: #222;
  margin-bottom: 16px;
  line-height: 1.4;
}
.news-meta {
  color: #999;
  font-size: 14px;
  margin-bottom: 24px;
}
.news-image {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 32px;
}
.news-image img {
  width: 100%;
  height: auto;
  display: block;
}
.news-content {
  font-size: 16px;
  line-height: 1.9;
  color: #333;
}
.paragraph {
  margin-bottom: 24px;
}

/* ========== 右下角竖排功能按钮 ========== */
.action-float-bar {
  position: fixed;
  right: 40px;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: #fff;
  padding: 12px 10px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  border: 1px solid #f0f0f0;
}
.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 6px 0;
  transition: all 0.2s ease;
  width: 52px;
}
.action-item:hover .action-icon {
  transform: scale(1.1);
}
.action-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #999;
  transition: all 0.25s ease;
}
.action-icon svg {
  transition: all 0.25s ease;
}
.action-icon.active {
  color: #ff4757;
}
.action-icon.active svg {
  transform: scale(1.1);
}
.action-item:nth-child(2) .action-icon.active {
  color: #ffa502;
}
.action-count {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
  font-weight: 500;
}

/* ========== 评论弹窗样式 ========== */
.comment-dialog {
  width: 420px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.comment-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  min-height: 100px;
}
.comment-textarea:focus {
  border-color: #2ecc71;
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.15);
}
.comment-textarea::placeholder {
  color: #bbb;
}
.comment-dialog .modal-footer {
  border-top: none;
  padding: 8px 24px 24px 24px;
  gap: 12px;
}
.comment-dialog .modal-footer button {
  height: 44px;
  border-radius: 10px !important;
  font-size: 15px;
}
.comment-dialog .btn-cancel {
  background: #f5f7f9;
  color: #555;
}
.comment-dialog .btn-cancel:hover {
  background: #eee;
}
.comment-dialog .btn-confirm {
  background: #2ecc71;
  color: #fff;
}
.comment-dialog .btn-confirm:hover {
  background: #27ae60;
}

/* ========== 正文下方评论区样式 ========== */
.comment-section {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #f0f0f0;
}
.comment-title {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin-bottom: 20px;
}
.comment-list-display {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.comment-item-display {
  padding: 14px 16px;
  background: #f9fafb;
  border-radius: 12px;
}
.comment-item-display .comment-user {
  font-weight: 600;
  color: #2ecc71;
  font-size: 14px;
}
.comment-item-display .comment-content {
  font-size: 15px;
  color: #333;
  margin: 6px 0 8px;
  line-height: 1.6;
  word-break: break-all;
}
.comment-item-display .comment-time {
  font-size: 12px;
  color: #bbb;
}
.empty-comment {
  text-align: center;
  color: #bbb;
  padding: 30px 0;
  font-size: 14px;
}

/* ========== 评论头部（用户名 + 删除按钮） ========== */
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-delete-comment {
  padding: 2px 12px;
  background: #fef0f0;
  color: #f56c6c;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.btn-delete-comment:hover {
  background: #f56c6c;
  color: #fff;
}
</style>
<template>
  <div class="admin-layout">
    <!-- 导航栏 -->
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

    <!-- 删除资讯确认弹窗 -->
    <div class="modal-mask" v-if="showDeleteConfirm" @click="showDeleteConfirm = false">
      <div class="modal-dialog" @click.stop>
        <div class="modal-title">删除资讯</div>
        <div class="modal-content">确定要删除该资讯吗？删除后无法恢复。</div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteConfirm = false">取消</button>
          <button class="btn-confirm" @click="confirmDeleteNews">确认删除</button>
        </div>
      </div>
    </div>

    <!-- 删除评论确认弹窗（最高层级） -->
    <div class="modal-mask modal-mask-top" v-if="showDeleteCommentConfirm" @click="showDeleteCommentConfirm = false">
      <div class="modal-dialog" @click.stop>
        <div class="modal-title">删除评论</div>
        <div class="modal-content">确定要删除这条评论吗？删除后无法恢复。</div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteCommentConfirm = false">取消</button>
          <button class="btn-confirm" @click="confirmDeleteComment">确认删除</button>
        </div>
      </div>
    </div>

    <div class="admin-body">
      <aside class="sidebar">
        <div class="sidebar-menu">
          <div class="menu-item" @click="goTo('/admin/home')">数据概览</div>
          <div class="menu-item active">资讯管理</div>
          <div class="menu-item" @click="goTo('/admin/goods')">商品管理</div>
          <div class="menu-item" @click="goTo('/admin/order')">订单记录</div>
        </div>
      </aside>

      <main class="main-container">
        <div class="page-toolbar">
          <h2 class="page-title">资讯管理</h2>
          <button class="btn-primary" @click="openAddModal">+ 发布新资讯</button>
        </div>

        <div class="search-bar">
          <input v-model="searchKey" type="text" placeholder="请输入资讯标题搜索" class="search-input" />
        </div>

        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>资讯封面</th>
                <th>资讯标题</th>
                <th>发布时间</th>
                <th>点赞</th>
                <th>收藏</th>
                <th>评论</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in filteredNews" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td><img :src="item.cover" class="cover-img" alt="资讯图" /></td>
                <td class="title-td">{{ item.title }}</td>
                <td>{{ item.date }}</td>
                <td>{{ item.likesCount || 0 }}</td>
                <td>{{ item.favoritesCount || 0 }}</td>
                <td>
                  <span class="comment-count" @click="viewComments(item)">{{ item.commentsCount || 0 }}</span>
                </td>
                <td>
                  <button class="btn-edit" @click="openEditModal(item)">编辑</button>
                  <button class="btn-delete" @click="openDeleteModal(item)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- 新增/编辑资讯弹窗 -->
    <div class="modal-mask" v-if="showModal" @click="closeModal">
      <div class="modal-dialog modal-form" @click.stop>
        <div class="modal-title">{{ isEdit ? '编辑资讯' : '发布新资讯' }}</div>
        <div class="modal-content">
          <div class="form-item">
            <label class="form-label">资讯封面 <span class="required">*</span></label>
            <div class="input-hover-item">
              <input v-model="formData.cover" type="text" class="form-input" placeholder="请输入图片路径" />
            </div>
          </div>

          <div class="form-item">
            <label class="form-label">资讯标题 <span class="required">*</span></label>
            <div class="input-hover-item">
              <input v-model="formData.title" type="text" class="form-input" />
            </div>
          </div>

          <div class="form-item">
            <label class="form-label">资讯内容 <span class="required">*</span></label>
            <div class="input-hover-item">
              <textarea v-model="formData.content" class="form-textarea" rows="5"></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-confirm" @click="handleSubmit">确认提交</button>
        </div>
      </div>
    </div>

    <!-- 查看评论弹窗 -->
    <div class="modal-mask" v-if="showCommentModal" @click="showCommentModal = false">
      <div class="modal-dialog comment-admin-dialog" @click.stop>
        <div class="modal-title">
          评论详情
          <span class="comment-news-title">「{{ currentCommentNews?.title }}」</span>
        </div>
        <div class="comment-list-admin">
          <div v-if="commentList.length === 0" class="empty-comment">暂无评论</div>
          <div v-for="item in commentList" :key="item.id" class="comment-item-admin">
            <div class="comment-header-admin">
              <span class="comment-user-admin">{{ item.username || '用户' }}</span>
              <span class="comment-time-admin">{{ formatTime(item.createdAt) }}</span>
            </div>
            <div class="comment-content-admin">{{ item.content }}</div>
            <div class="comment-actions-admin">
              <button class="btn-delete-comment-admin" @click="openDeleteCommentModal(item.id)">删除</button>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="border-top: none; padding: 12px 24px 20px;">
          <button class="btn-cancel" @click="showCommentModal = false" style="flex:1; border-radius: 10px;">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const showLogout = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const searchKey = ref('')
const newsList = ref([])

// 删除资讯
const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)

// 删除评论
const showDeleteCommentConfirm = ref(false)
const deleteCommentTargetId = ref(null)

// 评论弹窗
const showCommentModal = ref(false)
const commentList = ref([])
const currentCommentNews = ref(null)

const formData = ref({
  id: '',
  cover: '',
  title: '',
  content: ''
})

const request = axios.create({
  baseURL: 'http://localhost:8080'
})

onMounted(async () => {
  await fetchNewsList()
})

const fetchNewsList = async () => {
  try {
    const res = await request.get('/api/news')
    newsList.value = res.data
  } catch (e) {
    console.error('获取资讯失败', e)
  }
}

const filteredNews = computed(() => {
  const key = searchKey.value.toLowerCase().trim()
  if (!key) return newsList.value
  return newsList.value.filter(item =>
    item.title.toLowerCase().includes(key)
  )
})

// 新增/编辑资讯
const openAddModal = () => {
  isEdit.value = false
  formData.value = { id: '', cover: '', title: '', content: '' }
  showModal.value = true
}

const openEditModal = (item) => {
  isEdit.value = true
  formData.value = { ...item }
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const handleSubmit = () => {
  isEdit.value ? updateNews() : addNews()
}

const addNews = async () => {
  try {
    await request.post('/api/news', formData.value)
    await fetchNewsList()
    closeModal()
  } catch (e) {
    console.error('新增资讯错误', e)
  }
}

const updateNews = async () => {
  try {
    await request.put(`/api/news/${formData.value.id}`, formData.value)
    await fetchNewsList()
    closeModal()
  } catch (e) {
    console.error('编辑资讯错误', e)
  }
}

// 删除资讯
const openDeleteModal = (item) => {
  deleteTarget.value = item
  showDeleteConfirm.value = true
}

const confirmDeleteNews = async () => {
  if (!deleteTarget.value) return
  try {
    await request.delete(`/api/news/${deleteTarget.value.id}`)
    await fetchNewsList()
    showDeleteConfirm.value = false
    deleteTarget.value = null
  } catch (e) {
    console.error('删除资讯错误', e)
  }
}

// 查看评论
const viewComments = async (item) => {
  currentCommentNews.value = item
  try {
    const res = await request.get(`/api/news/${item.id}/comments`)
    commentList.value = res.data || []
    showCommentModal.value = true
  } catch (err) {
    console.error('获取评论失败', err)
  }
}

// 打开删除评论确认弹窗
const openDeleteCommentModal = (commentId) => {
  deleteCommentTargetId.value = commentId
  showDeleteCommentConfirm.value = true
}

const confirmDeleteComment = async () => {
  if (deleteCommentTargetId.value === null) return
  
  try {
    const res = await request.delete(`/api/news/comment/${deleteCommentTargetId.value}`)
    if (res.data.success) {
      commentList.value = commentList.value.filter(item => item.id !== deleteCommentTargetId.value)
      await fetchNewsList()
      if (currentCommentNews.value) {
        const updated = newsList.value.find(n => n.id === currentCommentNews.value.id)
        if (updated) {
          currentCommentNews.value.commentsCount = updated.commentsCount
        }
      }
    } else {
      alert(res.data.message || '删除失败')
    }
  } catch (err) {
    console.error('删除评论失败', err)
    alert('删除评论失败，请稍后重试')
  } finally {
    showDeleteCommentConfirm.value = false
    deleteCommentTargetId.value = null
  }
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const goTo = (path) => router.push(path)
const logout = () => router.push('/login')
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'Segoe UI', sans-serif;
}

/* ========== 导航栏固定（与用户页面一致） ========== */
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
.logo {
  font-size: 30px;
  font-weight: 700;
  color: #2ecc71;
}
.nav-right {
  display: flex;
  align-items: center;
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

/* ========== 主体布局（为固定导航栏预留 100px 顶部空间） ========== */
.admin-body {
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 32px 32px 32px;
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

/* ========== 侧边栏 ========== */
.sidebar {
  width: 220px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  padding: 28px 0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  align-self: stretch;
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

.main-container {
  flex: 1;
  padding-top: 0px;
  min-width: 0;
}

/* ========== 页面头部 ========== */
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
.btn-primary {
  padding: 12px 24px;
  background: #2ecc71;
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.2s ease;
}
.btn-primary:hover {
  background: #27ae60;
}

/* ========== 搜索栏 ========== */
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
}
.search-input {
  flex: 1;
  padding: 14px 18px;
  border: 1px solid #eee;
  border-radius: 12px;
  outline: none;
  font-size: 15px;
}
.search-input:focus {
  border-color: #2ecc71;
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.15);
}

/* ========== 表格 ========== */
.table-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  background: #f9fafb;
  padding: 20px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 15px;
}
.data-table td {
  padding: 20px 16px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 15px;
}
.cover-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}
.title-td {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========== 评论数（可点击） ========== */
.comment-count {
  color: #2ecc71;
  cursor: pointer;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 6px;
  background: #e6f7ef;
  transition: all 0.2s ease;
  display: inline-block;
}
.comment-count:hover {
  background: #2ecc71;
  color: #fff;
}

/* ========== 操作按钮 ========== */
.btn-edit {
  padding: 8px 14px;
  background: #e6f7ef;
  color: #2ecc71;
  border: none;
  border-radius: 8px;
  margin-right: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}
.btn-edit:hover {
  background: #2ecc71;
  color: #fff;
}

.btn-delete {
  padding: 8px 14px;
  background: #fef0f0;
  color: #f56c6c;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}
.btn-delete:hover {
  background: #f56c6c;
  color: #fff;
}

/* ========== 通用弹窗 ========== */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-mask-top {
  z-index: 10010;
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
  border-radius: 0 0 0 20px;
}
.btn-cancel:hover {
  background: #f3f4f6;
}
.btn-confirm {
  background: #2ecc71;
  color: #fff;
  font-weight: 500;
  border-radius: 0 0 20px 0;
}
.btn-confirm:hover {
  background: #27ae60;
}

/* ========== 新增/编辑资讯弹窗 ========== */
.modal-form {
  width: 520px;
}
.modal-form .modal-content {
  text-align: left;
  padding: 24px;
}
.form-item {
  margin-bottom: 20px;
}
.form-label {
  display: block;
  font-size: 15px;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}
.required {
  color: #f56c6c;
}
.form-input,
.form-textarea {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid #eee;
  border-radius: 12px;
  box-sizing: border-box;
  outline: none;
  font-size: 15px;
  transition: all 0.28s ease;
  font-family: inherit;
}
.form-input:focus,
.form-textarea:focus {
  border-color: #2ecc71;
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.15);
}
.form-textarea {
  resize: vertical;
  min-height: 120px;
}
.input-hover-item:hover .form-input,
.input-hover-item:hover .form-textarea {
  transform: scale(1.01);
  border-color: #87e8de;
}

/* ========== 查看评论弹窗 ========== */
.comment-admin-dialog {
  width: 520px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}
.comment-news-title {
  font-size: 14px;
  color: #999;
  font-weight: 400;
  margin-left: 8px;
}
.comment-list-admin {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  max-height: 350px;
}
.comment-item-admin {
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}
.comment-item-admin:last-child {
  border-bottom: none;
}
.comment-header-admin {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.comment-user-admin {
  font-weight: 600;
  color: #2ecc71;
  font-size: 14px;
}
.comment-time-admin {
  font-size: 12px;
  color: #bbb;
}
.comment-content-admin {
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  word-break: break-all;
  margin: 4px 0 8px;
}
.comment-actions-admin {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}
.btn-delete-comment-admin {
  padding: 3px 14px;
  background: #fef0f0;
  color: #f56c6c;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}
.btn-delete-comment-admin:hover {
  background: #f56c6c;
  color: #fff;
}
.empty-comment {
  text-align: center;
  color: #bbb;
  padding: 40px 0;
  font-size: 15px;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .admin-body {
    flex-direction: column;
    padding: 80px 16px 16px 16px;
  }
  .sidebar {
    width: 100%;
    align-self: auto;
  }
  .modal-form {
    width: 92%;
  }
  .comment-admin-dialog {
    width: 92%;
  }
}
</style>
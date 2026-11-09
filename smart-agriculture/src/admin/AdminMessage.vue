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

    <div class="admin-body">
      <aside class="sidebar">
        <div class="sidebar-menu">
          <div class="menu-item" @click="goTo('/admin/home')">数据概览</div>
          <div class="menu-item" @click="goTo('/admin/news')">资讯管理</div>
          <div class="menu-item" @click="goTo('/admin/goods')">商品管理</div>
          <div class="menu-item" @click="goTo('/admin/order')">订单记录</div>
          <div class="menu-item active">客服回复</div>
        </div>
      </aside>

      <main class="main-container">
        <div class="page-header">
          <h2 class="page-title">💬 客服回复</h2>
          <span class="total-count">共 {{ messageList.length }} 条消息</span>
        </div>

        <div class="message-list">
          <div v-if="messageList.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <p>暂无用户消息</p>
          </div>
          <div v-for="item in messageList" :key="item.id" class="message-item-admin">
            <div class="message-info">
              <div class="message-sender-info">
                <span class="sender-tag" :class="item.isFromAdmin === 1 ? 'tag-admin' : 'tag-user'">
                  {{ item.isFromAdmin === 1 ? '🤖 客服' : '👤 用户' }}
                </span>
                <span class="message-time-admin">{{ formatTime(item.createdAt) }}</span>
                <span v-if="item.isFromAdmin === 0 && item.isRead === 0" class="badge-unread">未读</span>
                <span v-else-if="item.isFromAdmin === 0 && item.isRead === 1" class="badge-read">已读</span>
              </div>
              <div class="message-content-admin">{{ item.content }}</div>
            </div>
            <!-- 用户消息显示回复按钮 -->
            <div v-if="item.isFromAdmin === 0" class="message-actions">
              <button class="btn-reply" @click="openReplyModal(item)">回复</button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 回复弹窗 -->
    <div class="modal-mask" v-if="showReplyModal" @click="showReplyModal = false">
      <div class="modal-dialog modal-reply" @click.stop>
        <div class="modal-title">回复用户</div>
        <div class="modal-content" style="text-align: left; padding: 16px 24px;">
          <div class="reply-original">
            <div class="reply-label">用户消息：</div>
            <div class="reply-original-content">{{ replyTarget?.content }}</div>
          </div>
          <div class="form-item">
            <label class="form-label">回复内容 <span class="required">*</span></label>
            <textarea v-model="replyContent" class="form-textarea" rows="4" placeholder="请输入回复内容..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showReplyModal = false">取消</button>
          <button class="btn-confirm" @click="submitReply">确认回复</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const showLogout = ref(false)
const messageList = ref([])
const showReplyModal = ref(false)
const replyTarget = ref(null)
const replyContent = ref('')

const request = axios.create({
  baseURL: 'http://localhost:8080'
})

// 获取所有消息
const fetchMessages = async () => {
  try {
    const res = await request.get('/api/admin/message/list')
    messageList.value = res.data || []
  } catch (err) {
    console.error('获取消息失败', err)
  }
}

// 打开回复弹窗
const openReplyModal = (item) => {
  replyTarget.value = item
  replyContent.value = ''
  showReplyModal.value = true
}

// 提交回复
const submitReply = async () => {
  const content = replyContent.value.trim()
  if (!content) {
    alert('请输入回复内容')
    return
  }
  try {
    await request.post('/api/admin/message/reply', {
      userId: replyTarget.value.userId,
      content: content
    })
    showReplyModal.value = false
    replyTarget.value = null
    replyContent.value = ''
    await fetchMessages()
  } catch (err) {
    console.error('回复失败', err)
    alert('回复失败，请重试')
  }
}

// 时间格式化
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const goTo = (path) => router.push(path)
const logout = () => router.push('/login')

onMounted(fetchMessages)
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: 'Segoe UI', sans-serif;
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
.logo { font-size: 30px; font-weight: 700; color: #2ecc71; }
.nav-right { display: flex; align-items: center; }
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

.admin-body {
  max-width: 1280px;
  margin: 100px auto 32px auto;
  padding: 0 32px;
  display: flex;
  gap: 32px;
}

.sidebar {
  width: 220px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  padding: 28px 0;
  height: fit-content;
}
.sidebar-menu { display: flex; flex-direction: column; gap: 8px; }
.menu-item {
  padding: 16px 24px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  border-radius: 12px;
  margin: 0 16px;
  transition: all 0.2s ease;
}
.menu-item:hover { background: #f5f7f9; transform: translateX(4px); }
.menu-item.active { background: #e6f7ef; color: #2ecc71; font-weight: 600; }

.main-container { flex: 1; padding-top: 8px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}
.page-title { font-size: 26px; font-weight: 700; color: #1a1a1a; }
.total-count { font-size: 14px; color: #999; background: #f5f7f9; padding: 6px 16px; border-radius: 20px; }

.message-list {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  min-height: 300px;
}
.empty-state { text-align: center; padding: 60px 0; color: #bbb; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state p { font-size: 15px; }

.message-item-admin {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;
}
.message-item-admin:hover { background: #fafbfc; }
.message-item-admin:last-child { border-bottom: none; }

.message-info { flex: 1; }
.message-sender-info { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
.sender-tag {
  font-size: 13px;
  font-weight: 500;
  padding: 2px 12px;
  border-radius: 12px;
}
.tag-user { background: #e6f7ef; color: #2ecc71; }
.tag-admin { background: #f0f0f0; color: #666; }
.message-time-admin { font-size: 12px; color: #bbb; }
.badge-unread {
  font-size: 11px;
  background: #f56c6c;
  color: #fff;
  padding: 1px 10px;
  border-radius: 10px;
}
.badge-read {
  font-size: 11px;
  background: #e8e8e8;
  color: #999;
  padding: 1px 10px;
  border-radius: 10px;
}
.message-content-admin { font-size: 15px; color: #333; line-height: 1.6; }

.message-actions { margin-left: 16px; }
.btn-reply {
  padding: 6px 18px;
  background: #2ecc71;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}
.btn-reply:hover { background: #27ae60; }

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
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.modal-reply { width: 480px; }
.modal-title { padding: 24px 24px 0; font-size: 19px; font-weight: 600; color: #222; text-align: center; }
.modal-content { padding: 16px 24px 24px; }
.modal-footer { display: flex; border-top: 1px solid #f3f4f6; }
.modal-footer button { flex: 1; height: 52px; border: none; outline: none; font-size: 16px; cursor: pointer; transition: all 0.2s ease; }
.btn-cancel { background: #f9fafb; color: #555; border-radius: 0 0 0 20px; }
.btn-cancel:hover { background: #f3f4f6; }
.btn-confirm { background: #2ecc71; color: #fff; font-weight: 500; border-radius: 0 0 20px 0; }
.btn-confirm:hover { background: #27ae60; }

.reply-original {
  background: #f9fafb;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.reply-label { font-size: 13px; color: #999; margin-bottom: 4px; }
.reply-original-content { font-size: 15px; color: #333; line-height: 1.6; }

.form-item { margin-bottom: 16px; }
.form-label { display: block; font-size: 15px; margin-bottom: 6px; font-weight: 500; color: #333; }
.required { color: #f56c6c; }
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #eee;
  border-radius: 10px;
  box-sizing: border-box;
  outline: none;
  font-size: 15px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all 0.28s ease;
}
.form-textarea:focus { border-color: #2ecc71; box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.15); }

@media (max-width: 768px) {
  .admin-body { flex-direction: column; padding: 0 16px; }
  .sidebar { width: 100%; }
  .modal-reply { width: 92%; }
}
</style>
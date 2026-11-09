<template>
  <div class="admin-layout">
    <!-- ====== 导航栏改为固定定位 ====== -->
    <nav class="navbar navbar-fixed">
      <div class="nav-container">
        <div class="nav-left">
          <!-- ====== 标题改为：智慧三农 · 管理后台 ====== -->
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

    <div class="admin-body">
      <aside class="sidebar">
        <div class="sidebar-menu">
          <div class="menu-item" @click="goTo('/admin/home')">数据概览</div>
          <div class="menu-item" @click="goTo('/admin/news')">资讯管理</div>
          <div class="menu-item active">商品管理</div>
          <div class="menu-item" @click="goTo('/admin/order')">订单记录</div>
        </div>
      </aside>

      <main class="main-container">
        <div class="page-toolbar">
          <h2 class="page-title">商品管理</h2>
          <button class="btn-primary" @click="openAddModal">+ 发布新商品</button>
        </div>

        <div class="search-bar">
          <input v-model="searchKey" type="text" placeholder="请输入商品名称搜索" class="search-input" />
        </div>

        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>商品图片</th>
                <th>商品名称</th>
                <th>价格</th>
                <th>库存</th>
                <th>销量</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item,index) in filteredGoods" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td><img :src="item.cover" class="cover-img" alt="商品图" /></td>
                <td class="title-td">{{ item.name }}</td>
                <td>¥{{ item.price }}</td>
                <td>{{ item.stock }}</td>
                <td>{{ item.sales || 0 }}</td>
                <td>
                  <span :class="['status-tag', item.status === 1 ? 'tag-on' : 'tag-off']">
                    {{ item.status === 1 ? '在售' : '下架' }}
                  </span>
                </td>
                <td>
                  <button class="btn-edit" @click="openEditModal(item)">编辑</button>
                  <button class="btn-switch" @click="handleSwitch(item)">
                    {{ item.status === 1 ? '下架' : '上架' }}
                  </button>
                  <button class="btn-delete" @click="deleteGoods(item)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div class="modal-mask" v-if="showModal" @click="closeModal">
      <div class="modal-dialog modal-form" @click.stop>
        <div class="modal-title">{{ isEdit ? '编辑商品' : '发布新商品' }}</div>
        <div class="modal-content-scroll">
          <div class="modal-content">

            <!-- 商品名称 -->
            <div class="form-item">
              <label class="form-label">商品名称 <span class="required">*</span></label>
              <div class="input-hover-item">
                <input v-model="formData.name" type="text" class="form-input" placeholder="请输入商品名称" />
              </div>
            </div>

            <!-- 商品分类 -->
            <div class="form-item">
              <label class="form-label">商品分类</label>
              <div class="input-hover-item"
                   @mouseenter="showCat=true"
                   @mouseleave="showCat=false">
                <div class="custom-select">
                  <div class="select-header" @click.stop="showCat = !showCat">
                    {{ getCategoryLabel(formData.category) || '选择分类' }}
                  </div>
                  <div class="select-options" v-show="showCat">
                    <div
                      class="select-option"
                      v-for="item in catOptions"
                      :key="item.value"
                      @click="formData.category=item.value;showCat=false"
                    >{{ item.label }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 商品标签 -->
            <div class="form-item">
              <label class="form-label">商品标签</label>
              <div class="input-hover-item"
                   @mouseenter="showTag=true"
                   @mouseleave="showTag=false">
                <div class="custom-select">
                  <div class="select-header" @click.stop="showTag = !showTag">
                    {{ getTagLabel(formData.tag) || '无标签' }}
                  </div>
                  <div class="select-options" v-show="showTag">
                    <div
                      class="select-option"
                      v-for="item in tagOptions"
                      :key="item.value"
                      @click="formData.tag=item.value;showTag=false"
                    >{{ item.label }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 商品价格 -->
            <div class="form-item">
              <label class="form-label">商品价格 <span class="required">*</span></label>
              <div class="input-hover-item">
                <input v-model="formData.price" type="number" class="form-input no-spinner" placeholder="请输入价格" />
              </div>
            </div>

            <!-- 库存 -->
            <div class="form-item">
              <label class="form-label">库存 <span class="required">*</span></label>
              <div class="input-hover-item">
                <input v-model="formData.stock" type="number" class="form-input no-spinner" placeholder="请输入库存数量" />
              </div>
            </div>

            <!-- 商品描述 -->
            <div class="form-item">
              <label class="form-label">商品描述</label>
              <div class="input-hover-item">
                <textarea v-model="formData.desc" class="form-textarea" rows="4" placeholder="请输入商品描述"></textarea>
              </div>
            </div>

          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-confirm" @click="handleSubmit">确认提交</button>
        </div>
      </div>
    </div>

    <!-- 退出登录弹窗 -->
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const showLogout = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const searchKey = ref('')
const goodsList = ref([])

const showCat = ref(false)
const showTag = ref(false)

// 分类选项：value 为英文标识，label 为中文显示
const catOptions = [
  { label: '农药化肥', value: 'fertilizer' },
  { label: '优质种苗', value: 'seed' },
  { label: '农机具', value: 'machine' },
  { label: '五谷杂粮', value: 'grain' }
]
// 反向映射：中文 -> 英文
const catMap = { fertilizer: '农药化肥', seed: '优质种苗', machine: '农机具', grain: '五谷杂粮' }
// 根据分类值获取中文标签
const getCategoryLabel = (val) => catMap[val] || ''

// 标签选项
const tagOptions = [
  { label: '无标签', value: '' },
  { label: '热销', value: 'hot' },
  { label: '上新', value: 'new' }
]
const tagMap = { '': '无标签', hot: '热销', new: '上新' }
const getTagLabel = (val) => tagMap[val] || '无标签'

// 默认占位图（如果后端没有返回封面图，使用此占位）
const DEFAULT_COVER = 'https://via.placeholder.com/60x60?text=No+Image'

const formData = ref({
  id: '',
  cover: DEFAULT_COVER,
  name: '',
  price: '',
  stock: '',
  desc: '',
  tag: '',
  category: 'fertilizer',
  status: 1,
})

const request = axios.create({ baseURL: 'http://localhost:8080' })

onMounted(async () => {
  try {
    const { data } = await request.get('/api/goods')
    goodsList.value = data
  } catch (e) { console.error('获取商品失败', e) }
})

const filteredGoods = computed(() => {
  const key = searchKey.value.toLowerCase().trim()
  if (!key) return goodsList.value
  return goodsList.value.filter(item =>
    item.name.toLowerCase().includes(key)
  )
})

// 新增商品
const addGoods = async () => {
  // 确保 cover 有值
  if (!formData.value.cover) formData.value.cover = DEFAULT_COVER
  await request.post('/api/goods', formData.value)
  await refreshList()
  closeModal()
}

// 更新商品
const updateGoods = async () => {
  // 确保 cover 有值
  if (!formData.value.cover) formData.value.cover = DEFAULT_COVER
  // 保证 status 是数字
  formData.value.status = Number(formData.value.status) || 1
  await request.put(`/api/goods/${formData.value.id}`, formData.value)
  await refreshList()
  closeModal()
}

const deleteGoods = async (item) => {
  await request.delete(`/api/goods/${item.id}`)
  await refreshList()
}

const handleSwitch = async (item) => {
  try {
    await request.put(`/api/goods/${item.id}/status`)
    await refreshList()
  } catch (e) {
    console.error('切换状态失败', e)
  }
}

const refreshList = async () => {
  const { data } = await request.get('/api/goods')
  goodsList.value = data
}

// 打开新增弹窗
const openAddModal = () => {
  isEdit.value = false
  formData.value = {
    id: '',
    cover: DEFAULT_COVER,
    name: '',
    price: '',
    stock: '',
    desc: '',
    tag: '',
    category: 'fertilizer',
    status: 1,
  }
  showModal.value = true
}

// 打开编辑弹窗
const openEditModal = (item) => {
  isEdit.value = true
  // 复制商品数据，并确保分类和标签的值是英文标识
  const copy = { ...item }
  
  // 如果分类是中文，尝试转成英文
  if (copy.category && typeof copy.category === 'string') {
    // 查找是否匹配中文分类
    const found = catOptions.find(opt => opt.label === copy.category)
    if (found) {
      copy.category = found.value
    } else {
      // 如果已经是英文或未知，保持原样
      // 但如果不在选项中，默认设置为第一个
      if (!catMap[copy.category]) {
        copy.category = 'fertilizer'
      }
    }
  }

  // 如果标签是中文，尝试转成英文
  if (copy.tag && typeof copy.tag === 'string') {
    const found = tagOptions.find(opt => opt.label === copy.tag)
    if (found) {
      copy.tag = found.value
    } else {
      // 如果已经是英文或未知，保持原样
      if (!tagMap[copy.tag]) {
        copy.tag = ''
      }
    }
  }

  // 确保 cover 有值
  if (!copy.cover) copy.cover = DEFAULT_COVER

  formData.value = copy
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  showCat.value = false
  showTag.value = false
}

const handleSubmit = () => {
  // 简单校验必填项
  if (!formData.value.name || !formData.value.price || !formData.value.stock) {
    alert('请填写完整信息（名称、价格、库存为必填）')
    return
  }
  isEdit.value ? updateGoods() : addGoods()
}

const logout = () => router.push('/login')
const goTo = (path) => router.push(path)
</script>

<style scoped>
.admin-layout { min-height: 100vh; background: #f8f9fa; font-family: 'Segoe UI', sans-serif; }

/* ====== 导航栏固定定位（与用户页面一致） ====== */
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

.nav-container { max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 0 32px; }
.nav-left { display: flex; align-items: center; }
.logo { font-size: 30px; font-weight: 700; color: #2ecc71; }
.nav-right { display: flex; justify-content: flex-end; }
.avatar-wrapper { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 6px 10px; border-radius: 999px; transition: background 0.2s ease; }
.avatar-wrapper:hover { background: #e6f7ef; }
.avatar-circle { width: 38px; height: 38px; border-radius: 50%; background: #2ecc71; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.avatar-name { font-size: 15px; color: #333; font-weight: 500; }

/* ====== 主体布局（为固定导航栏预留 100px 顶部空间） ====== */
.admin-body {
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 32px 32px 32px;
  display: flex;
  gap: 32px;
}

.sidebar { width: 220px; background: #fff; border-radius: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); padding: 28px 0; }
.sidebar-menu { display: flex; flex-direction: column; gap: 8px; }
.menu-item { padding: 16px 24px; font-size: 16px; color: #333; cursor: pointer; border-radius: 12px; margin: 0 16px; transition: all 0.2s ease; }
.menu-item:hover { background: #f5f7f9; transform: translateX(4px); }
.menu-item.active { background: #e6f7ef; color: #2ecc71; font-weight: 600; }

.main-container { flex: 1; padding-top: 0; }

.page-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
.page-title { font-size: 28px; font-weight: 700; color: #1a1a1a; }
.btn-primary { padding: 12px 24px; background: #2ecc71; color: #fff; border: none; border-radius: 12px; cursor: pointer; font-size: 15px; transition: all 0.2s ease; }
.btn-primary:hover { background: #27ae60; }

.search-bar { display: flex; gap: 12px; margin-bottom: 28px; }
.search-input { flex: 1; padding: 14px 18px; border: 1px solid #eee; border-radius: 12px; outline: none; font-size: 15px; }

.table-card { background: #fff; border-radius: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #f9fafb; padding: 20px 16px; text-align: left; font-weight: 600; font-size: 15px; }
.data-table td { padding: 20px 16px; border-bottom: 1px solid #f5f5f5; font-size: 15px; }
.cover-img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }
.title-td { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.status-tag { padding: 6px 12px; border-radius: 20px; font-size: 13px; }
.tag-on { background: #e6f7ef; color: #2ecc71; }
.tag-off { background: #fef0f0; color: #f56c6c; }

.btn-edit { padding: 8px 14px; background: #e6f7ef; color: #2ecc71; border: none; border-radius: 8px; margin-right: 8px; cursor: pointer; font-size: 14px; }
.btn-switch { padding: 8px 14px; background: #fff7e6; color: #ff9800; border: none; border-radius: 8px; margin-right: 8px; cursor: pointer; font-size: 14px; }
.btn-delete { padding: 8px 14px; background: #fef0f0; color: #f56c6c; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }

/* 弹窗 */
.modal-mask { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.35); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal-logout { width: 340px; background: #fff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden; }
.modal-form { width: 520px; background: #fff; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden; display: flex; flex-direction: column; }
.modal-title { padding: 28px 24px 0; font-size: 20px; font-weight: 600; color: #222; text-align: center; }
.modal-content-scroll { max-height: 60vh; overflow-y: auto; overflow-x: hidden; padding: 0 24px; }
.modal-content { padding: 24px 0; font-size: 15px; color: #666; text-align: center; }
.modal-footer { display: flex; border-top: 1px solid #f3f4f6; flex-shrink: 0; }
.modal-footer button { flex: 1; height: 56px; border: none; outline: none; font-size: 16px; cursor: pointer; }
.btn-cancel { background: #f9fafb; color: #555; transition: all 0.2s ease; }
.btn-cancel:hover { background: #f3f4f6; }
.btn-confirm { background: #2ecc71; color: #fff; font-weight: 500; transition: all 0.2s ease; }
.btn-confirm:hover { background: #27ae60; }

/* 表单 */
.form-item { margin-bottom: 20px; text-align: left; }
.form-label { display: block; font-size: 15px; margin-bottom: 8px; font-weight: 500; }
.required { color: #f56c6c; }

.form-input,
.select-header {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid #eee;
  border-radius: 12px;
  box-sizing: border-box;
  outline: none;
  font-size: 15px;
  transition: all 0.28s ease;
}

.form-textarea {
  width: 100%;
  padding: 14px 18px;
  border: 1px solid #eee;
  border-radius: 12px;
  box-sizing: border-box;
  outline: none;
  font-size: 15px;
  transition: all 0.28s ease;
  resize: vertical;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
  line-height: 1.6;
}

.input-hover-item:hover .form-input,
.input-hover-item:hover .form-textarea,
.input-hover-item:hover .select-header {
  transform: scale(1.03);
  border-color: #87e8de;
  box-shadow: 0 0 0 3px rgba(135, 232, 222, 0.3);
}

.custom-select { position: relative; width: 100%; }
.select-header {
  display: flex; justify-content: space-between; align-items: center;
  cursor: pointer;
}
.select-header::after {
  content: "▼";
  font-size: 12px;
  color: #aaa;
  transition: transform 0.3s ease;
}
.select-header.open::after {
  transform: rotate(180deg);
}

.select-options {
  position: absolute; top: calc(100% + 4px); left: 0; width: 100%;
  background: #fff; border-radius: 12px; border: 1px solid #eee;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 9999;
  max-height: 200px; overflow-y: auto;
}
.select-option {
  padding: 12px 18px; font-size: 15px; cursor: pointer;
}
.select-option:hover {
  background-color: #e6f7ef;
  color: #2ecc71;
}

.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinner {
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
<template>
  <div class="admin-layout">
    <!-- 导航栏固定定位 -->
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

    <div class="admin-body">
      <aside class="sidebar">
        <div class="sidebar-menu">
          <div class="menu-item" @click="goTo('/admin/home')">数据概览</div>
          <div class="menu-item" @click="goTo('/admin/news')">资讯管理</div>
          <div class="menu-item" @click="goTo('/admin/goods')">商品管理</div>
          <div class="menu-item active">订单记录</div>
        </div>
      </aside>

      <main class="main-container">
        <div class="page-toolbar">
          <h2 class="page-title">订单记录</h2>
        </div>

        <div class="search-bar">
          <input
            v-model="searchKey"
            type="text"
            placeholder="请输入订单号/商品名称搜索"
            class="search-input"
          />
          <div class="custom-select" :class="{ open: isSelectOpen }">
            <div class="select-trigger" @click.stop="toggleSelect">
              <span class="select-value">{{ getSelectedLabel() }}</span>
              <span class="select-arrow">▼</span>
            </div>
            <div class="select-dropdown" v-if="isSelectOpen">
              <div
                v-for="option in statusOptions"
                :key="option.value"
                class="select-option"
                @click="selectOption(option.value)"
              >
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>

        <div class="table-card">
          <table class="data-table">
            <thead>
              <tr>
                <th style="min-width: 280px;">商品信息</th>
                <th class="user-th">下单用户</th>
                <th>总价</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredOrderList"
                :key="item.orderNo"
                @click="showOrderDetail(item)"
                class="order-row"
              >
                <td class="goods-cell">
                  <div class="goods-list">
                    <div
                      v-for="(goods, index) in parseGoodsList(item)"
                      :key="index"
                      class="goods-item"
                    >
                      <div class="goods-image-wrapper">
                        <img
                          v-if="getGoodsImage(goods.name)"
                          :src="getGoodsImage(goods.name)"
                          :alt="goods.name"
                          class="goods-image"
                          @error="handleImageError($event, goods.name)"
                        />
                        <div
                          v-else
                          class="goods-image-placeholder"
                          :style="{ backgroundColor: getColor(index) }"
                        >
                          {{ goods.name.charAt(0).toUpperCase() }}
                        </div>
                      </div>
                      <div class="goods-detail">
                        <div class="goods-name">{{ goods.name }}</div>
                        <div class="goods-meta">
                          <span class="goods-qty">× {{ goods.qty }}</span>
                          <span class="goods-price">¥{{ goods.price.toFixed(2) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td>{{ item.userNickname || item.username }}</td>
                <td>¥{{ Number(item.totalPrice || 0).toFixed(2) }}</td>
                <td class="status-cell">
                  <span :class="getStatusClass(item.status)">{{ getStatusText(item.status) }}</span>
                </td>
                <td class="action-cell" @click.stop>
                  <button
                    v-if="item.status === 'pending'"
                    class="btn btn-ship"
                    @click="confirmShip(item.orderNo)"
                  >发货</button>
                  <button
                    v-if="item.status === 'received'"
                    class="btn btn-finish"
                    disabled
                  >已完成</button>
                  <button class="btn btn-delete" @click="openDeleteModal(item.orderNo)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- 发货弹窗 -->
    <div class="modal-mask" v-if="showShipModal" @click="closeShipModal">
      <div class="modal-dialog" @click.stop>
        <div class="modal-title">确认发货</div>
        <div class="modal-content">确定要将该订单状态改为已发货吗？</div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeShipModal">取消</button>
          <button class="btn-confirm" @click="confirmShipOrder">确认发货</button>
        </div>
      </div>
    </div>

    <!-- 删除弹窗 -->
    <div class="modal-mask" v-if="showDeleteModal" @click="closeDeleteModal">
      <div class="modal-dialog" @click.stop>
        <div class="modal-title">删除订单</div>
        <div class="modal-content">确定要删除该订单记录吗？</div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeDeleteModal">取消</button>
          <button class="btn-confirm" @click="confirmDelete">确认删除</button>
        </div>
      </div>
    </div>

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

    <!-- ★★★ 修改：订单详情弹窗 - 增加“收货时间” ★★★ -->
    <div class="modal-mask" v-if="showDetailModal" @click="showDetailModal = false">
      <div class="modal-dialog modal-detail" @click.stop>
        <div class="modal-title">订单详情</div>
        <div class="detail-content">
          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">订单编号</span>
              <span class="detail-value">{{ selectedOrder?.orderNo || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">下单时间</span>
              <span class="detail-value">{{ formatTime(selectedOrder?.createTime) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">发货时间</span>
              <span class="detail-value">{{ selectedOrder?.sendTime ? formatTime(selectedOrder.sendTime) : '未发货' }}</span>
            </div>
            <!-- ★★★ 新增：收货时间 ★★★ -->
            <div class="detail-row">
              <span class="detail-label">收货时间</span>
              <span class="detail-value">{{ selectedOrder?.receiveTime ? formatTime(selectedOrder.receiveTime) : '未收货' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">收件人</span>
              <span class="detail-value">{{ selectedOrder?.userNickname || selectedOrder?.username || '暂无' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">收货地址</span>
              <span class="detail-value">{{ selectedOrder?.address || '暂无收货地址' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">订单状态</span>
              <span class="detail-value">
                <span :class="getStatusClass(selectedOrder?.status)">{{ getStatusText(selectedOrder?.status) }}</span>
              </span>
            </div>
          </div>

          <div class="detail-divider"></div>
          <div class="detail-goods-title">商品明细</div>
          <div class="detail-goods-list">
            <div
              v-for="(goods, index) in parseGoodsList(selectedOrder)"
              :key="index"
              class="detail-goods-item"
            >
              <div class="detail-goods-image-wrapper">
                <img
                  v-if="getGoodsImage(goods.name)"
                  :src="getGoodsImage(goods.name)"
                  :alt="goods.name"
                  class="detail-goods-image"
                  @error="handleImageError($event, goods.name)"
                />
                <div
                  v-else
                  class="detail-goods-placeholder"
                  :style="{ backgroundColor: getColor(index) }"
                >
                  {{ goods.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="detail-goods-info">
                <div class="detail-goods-name">{{ goods.name }}</div>
                <div class="detail-goods-meta">
                  <span>数量：{{ goods.qty }}</span>
                  <span>单价：¥{{ goods.price.toFixed(2) }}</span>
                  <span class="detail-goods-subtotal">小计：¥{{ (goods.price * goods.qty).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="detail-total">
            合计：<span class="detail-total-amount">¥{{ Number(selectedOrder?.totalPrice || 0).toFixed(2) }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-confirm" @click="showDetailModal = false">我知道了</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showLogout = ref(false)
const searchKey = ref('')
const statusFilter = ref('')
const showDeleteModal = ref(false)
const showShipModal = ref(false)
const showDetailModal = ref(false)
const currentOrderNo = ref(null)
const selectedOrder = ref(null)
const orderList = ref([])
const isSelectOpen = ref(false)
const goodsList = ref([])

// 用户昵称缓存
const userCache = ref({})

// ====== 下拉框 ======
const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待发货' },
  { value: 'shipped', label: '已发货' },
  { value: 'received', label: '已收货' }
]

const getSelectedLabel = () => {
  const selected = statusOptions.find(opt => opt.value === statusFilter.value)
  return selected ? selected.label : '全部状态'
}

const toggleSelect = () => {
  isSelectOpen.value = !isSelectOpen.value
}

const handleClickOutside = (event) => {
  const selectElement = document.querySelector('.custom-select')
  if (selectElement && !selectElement.contains(event.target)) {
    isSelectOpen.value = false
  }
}

const selectOption = (value) => {
  statusFilter.value = value
  isSelectOpen.value = false
}

// ====== 状态映射 ======
const getStatusText = (status) => {
  const statusMap = {
    pending: '待发货',
    shipped: '已发货',
    received: '已收货'
  }
  return statusMap[status] || '待发货'
}

const getStatusClass = (status) => {
  const classMap = {
    pending: 'status-pending',
    shipped: 'status-shipped',
    received: 'status-received'
  }
  return classMap[status] || 'status-pending'
}

const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}`
}

// ====== 颜色方案 ======
const colors = [
  '#FF6B6B', '#FFA94D', '#FCC419', '#69DB7C',
  '#4DABF7', '#9775FA', '#F783AC', '#20C997',
  '#FF922B', '#5C7CFA', '#38D9A9', '#F06595'
]
const getColor = (index) => colors[index % colors.length]

// ====== 商品图片匹配 ======
const goodsImageMap = ref({})

const buildGoodsImageMap = (goodsData) => {
  const map = {}
  for (const item of goodsData) {
    if (item.name && item.cover) {
      const raw = item.name.trim()
      map[raw] = item.cover
      const normalized = raw.replace(/\s+/g, '').replace(/[（）()]/g, '').toLowerCase()
      map[normalized] = item.cover
    }
  }
  return map
}

const getGoodsImage = (goodsName) => {
  if (!goodsName) return null
  const raw = goodsName.trim()
  if (goodsImageMap.value[raw]) return goodsImageMap.value[raw]
  const normalized = raw.replace(/\s+/g, '').replace(/[（）()]/g, '').toLowerCase()
  if (goodsImageMap.value[normalized]) return goodsImageMap.value[normalized]
  for (const [key, value] of Object.entries(goodsImageMap.value)) {
    const keyClean = key.replace(/\s+/g, '').toLowerCase()
    if (keyClean.includes(normalized) || normalized.includes(keyClean)) {
      return value
    }
  }
  return null
}

const handleImageError = (event, goodsName) => {
  event.target.style.display = 'none'
  const parent = event.target.parentElement
  const placeholder = document.createElement('div')
  placeholder.className = 'goods-image-placeholder'
  placeholder.style.backgroundColor = getColor(Math.floor(Math.random() * colors.length))
  placeholder.textContent = goodsName.charAt(0).toUpperCase()
  parent.appendChild(placeholder)
}

// ====== 根据商品名称获取真实单价 ======
const getGoodsPrice = (goodsName) => {
  if (!goodsName) return null
  const raw = goodsName.trim()
  for (const item of goodsList.value) {
    if (item.name && item.name.trim() === raw) {
      return Number(item.price) || 0
    }
  }
  const normalized = raw.replace(/\s+/g, '').replace(/[（）()]/g, '').toLowerCase()
  for (const item of goodsList.value) {
    if (!item.name) continue
    const itemName = item.name.replace(/\s+/g, '').replace(/[（）()]/g, '').toLowerCase()
    if (itemName === normalized || itemName.includes(normalized) || normalized.includes(itemName)) {
      return Number(item.price) || 0
    }
  }
  return null
}

// ====== 商品信息解析（优先使用真实单价） ======
const parseGoodsList = (order) => {
  if (!order || !order.goodsInfo) return []

  const goodsInfo = order.goodsInfo
  const totalPrice = Number(order.totalPrice) || 0
  const separators = /[；;，,、\n]+/
  const parts = goodsInfo.split(separators).filter(s => s.trim())

  const goodsListResult = []

  for (const part of parts) {
    const match = part.match(/^\s*(.+?)\s*×\s*(\d+)/)
    if (match) {
      const name = match[1].trim()
      const qty = parseInt(match[2]) || 1
      const price = getGoodsPrice(name)
      goodsListResult.push({ name, qty, price: price !== null ? price : 0 })
    }
  }

  if (goodsListResult.length === 0 && goodsInfo.trim()) {
    const match = goodsInfo.match(/^\s*(.+?)\s*×\s*(\d+)/)
    if (match) {
      const name = match[1].trim()
      const qty = parseInt(match[2]) || 1
      const price = getGoodsPrice(name)
      goodsListResult.push({ name, qty, price: price !== null ? price : 0 })
    } else {
      const price = getGoodsPrice(goodsInfo.trim())
      goodsListResult.push({
        name: goodsInfo.trim(),
        qty: 1,
        price: price !== null ? price : 0
      })
    }
  }

  // 匹配不到价格的商品用平均分摊
  const unmatched = goodsListResult.filter(g => g.price === 0)
  const matched = goodsListResult.filter(g => g.price > 0)
  const matchedTotal = matched.reduce((sum, g) => sum + g.price * g.qty, 0)
  const remainingTotal = totalPrice - matchedTotal

  if (unmatched.length > 0 && remainingTotal > 0) {
    const unmatchedQty = unmatched.reduce((sum, g) => sum + g.qty, 0)
    if (unmatchedQty > 0) {
      const avgPrice = remainingTotal / unmatchedQty
      for (const goods of unmatched) {
        goods.price = avgPrice
      }
    }
  }

  const allZero = goodsListResult.every(g => g.price === 0)
  if (allZero && totalPrice > 0) {
    const totalQty = goodsListResult.reduce((sum, g) => sum + g.qty, 0)
    if (totalQty > 0) {
      for (const goods of goodsListResult) {
        goods.price = (totalPrice * goods.qty) / totalQty
      }
    }
  }

  return goodsListResult
}

// ====== 获取用户昵称（带缓存） ======
const fetchUserNickname = async (userId) => {
  if (!userId) return null
  if (userCache.value[userId]) {
    return userCache.value[userId]
  }
  try {
    const res = await fetch(`http://localhost:8080/api/user/info/${userId}`)
    const result = await res.json()
    if (result.success && result.data) {
      const nickname = result.data.nickname || result.data.username
      userCache.value[userId] = nickname
      return nickname
    }
    return null
  } catch (err) {
    console.error('获取用户信息失败', err)
    return null
  }
}

// ====== 为订单列表补充昵称 ======
const enrichOrdersWithNickname = async (orders) => {
  if (!orders || orders.length === 0) return orders
  const userIds = orders.map(o => o.userId).filter(id => id)
  const uniqueUserIds = [...new Set(userIds)]
  const promises = uniqueUserIds.map(id => fetchUserNickname(id))
  await Promise.all(promises)

  return orders.map(order => {
    if (order.userId && userCache.value[order.userId]) {
      order.userNickname = userCache.value[order.userId]
    } else {
      order.userNickname = order.username || '未知用户'
    }
    return order
  })
}

// ====== 数据请求 ======
const fetchOrderList = async () => {
  try {
    const res = await fetch('http://localhost:8080/api/order/list')
    const result = await res.json()
    let orders = result.data || result || []
    orders = await enrichOrdersWithNickname(orders)
    orderList.value = orders
  } catch (err) {
    console.error('获取订单失败', err)
    orderList.value = []
  }
}

const fetchGoodsList = async () => {
  try {
    const res = await fetch('http://localhost:8080/api/goods')
    const data = await res.json()
    goodsList.value = data.map(item => ({
      id: item.id,
      name: item.name,
      cover: item.cover,
      price: item.price
    }))
    goodsImageMap.value = buildGoodsImageMap(goodsList.value)
  } catch (err) {
    console.error('获取商品列表失败', err)
  }
}

// ====== 更新状态 ======
const updateOrderStatus = async (orderNo, status) => {
  try {
    await fetch(`http://localhost:8080/api/order/${orderNo}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    await fetchOrderList()
  } catch (err) {}
}

// ====== 发货 ======
const confirmShip = (orderNo) => {
  currentOrderNo.value = orderNo
  showShipModal.value = true
}
const closeShipModal = () => {
  showShipModal.value = false
}
const confirmShipOrder = async () => {
  await updateOrderStatus(currentOrderNo.value, 'shipped')
  closeShipModal()
}

// ====== 删除 ======
const openDeleteModal = (orderNo) => {
  currentOrderNo.value = orderNo
  showDeleteModal.value = true
}
const closeDeleteModal = () => {
  showDeleteModal.value = false
}
const confirmDelete = async () => {
  try {
    await fetch(`http://localhost:8080/api/order/${currentOrderNo.value}`, {
      method: 'DELETE'
    })
    await fetchOrderList()
  } catch (err) {}
  closeDeleteModal()
}

// ====== 点击行展示详情 ======
const showOrderDetail = (order) => {
  selectedOrder.value = order
  showDetailModal.value = true
}

// ====== 筛选 ======
const filteredOrderList = computed(() => {
  let filtered = orderList.value || []
  if (searchKey.value) {
    const key = searchKey.value.toLowerCase()
    filtered = filtered.filter(i =>
      (i.orderNo || '').toLowerCase().includes(key) ||
      (i.goodsInfo || '').toLowerCase().includes(key)
    )
  }
  if (statusFilter.value) {
    filtered = filtered.filter(i => i.status === statusFilter.value)
  }
  return filtered
})

// ====== 路由 ======
const goTo = (path) => router.push(path)
const logout = () => router.push('/login')

// ====== 生命周期 ======
onMounted(() => {
  fetchOrderList()
  fetchGoodsList()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* ====== 导航栏固定定位 ====== */
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
.avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 999px;
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
}
.avatar-name {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

/* ====== 主体布局（为固定导航栏预留 100px 顶部空间） ====== */
.admin-body {
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 32px 32px 32px;
  display: flex;
  gap: 32px;
}

.sidebar {
  width: 220px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
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
}
.menu-item:hover {
  background: #f5f7f9;
}
.menu-item.active {
  background: #e6f7ef;
  color: #2ecc71;
  font-weight: 600;
}

.main-container {
  flex: 1;
}
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 28px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
  align-items: center;
}
.search-input {
  flex: 1;
  height: 48px;
  padding: 0 18px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  outline: none;
}
.search-input:focus {
  border-color: #2ecc71;
  box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
}

.custom-select {
  position: relative;
  width: 160px;
  z-index: 99;
}
.select-trigger {
  height: 48px;
  padding: 0 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}
.select-trigger:hover {
  border-color: #2ecc71;
}
.select-value {
  font-size: 14px;
  color: #333;
}
.select-arrow {
  font-size: 10px;
  color: #999;
}
.select-dropdown {
  position: absolute;
  top: 52px;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}
.select-option {
  padding: 12px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.select-option:hover {
  background: #e8f5e9;
  color: #2ecc71;
}

.table-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  background: #fafbfc;
  padding: 20px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 15px;
  color: #444;
}
.data-table th.user-th {
  white-space: nowrap;
  min-width: 95px;
}
.data-table td {
  padding: 20px 16px;
  border-bottom: 1px solid #f1f3f5;
  font-size: 15px;
  vertical-align: middle;
}
.order-row {
  cursor: pointer;
  transition: background 0.2s ease;
}
.order-row:hover {
  background: #f8fafc;
}

.status-cell {
  width: 100px;
}

.status-pending,
.status-shipped,
.status-received {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
}
.status-pending {
  background: #fff7e6;
  color: #ff9800;
}
.status-shipped {
  background: #e6f7ff;
  color: #1890ff;
}
.status-received {
  background: #e6f7ef;
  color: #2ecc71;
}

.action-cell {
  width: 160px;
  white-space: nowrap;
}
.action-cell .btn {
  display: inline-block;
  vertical-align: middle;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  min-width: 60px;
  text-align: center;
  transition: all 0.2s ease;
  margin: 0 4px;
}
.btn-ship {
  background: #e6f7ef;
  color: #2ecc71;
}
.btn-ship:hover {
  background: #2ecc71;
  color: #fff;
}
.btn-finish {
  background: #f5f5f5;
  color: #bbb;
  cursor: not-allowed;
}
.btn-delete {
  background: #fef0f0;
  color: #f56c6c;
}
.btn-delete:hover {
  background: #f56c6c;
  color: #fff;
}

.goods-cell {
  padding: 10px 16px !important;
}
.goods-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.goods-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
}
.goods-item:not(:last-child) {
  border-bottom: 1px dashed #f0f0f0;
}
.goods-image-wrapper {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f6f8;
  border: 1px solid #eee;
}
.goods-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.goods-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}
.goods-detail {
  flex: 1;
  min-width: 0;
}
.goods-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  line-height: 1.4;
  word-break: break-word;
}
.goods-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 2px;
  font-size: 13px;
  color: #888;
}
.goods-qty {
  color: #999;
}
.goods-price {
  color: #ff6b6b;
  font-weight: 600;
  font-size: 14px;
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
  overflow: hidden;
}
.modal-title {
  padding: 24px 24px 0;
  font-size: 19px;
  font-weight: 600;
  text-align: center;
}
.modal-content {
  padding: 16px 24px 24px;
  color: #666;
  text-align: center;
}
.modal-footer {
  display: flex;
  border-top: 1px solid #f3f4f6;
}
.modal-footer button {
  flex: 1;
  height: 52px;
  border: none;
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
}

.modal-detail {
  width: 480px;
  max-width: 92vw;
  max-height: 90vh;
  overflow-y: auto;
}
.detail-content {
  padding: 16px 24px 8px 24px;
}
.detail-section {
  margin-bottom: 4px;
}
.detail-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f5f6f8;
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-label {
  width: 80px;
  flex-shrink: 0;
  color: #999;
  font-size: 14px;
}
.detail-value {
  flex: 1;
  color: #333;
  font-size: 14px;
  word-break: break-all;
}
.detail-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 12px 0;
}
.detail-goods-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}
.detail-goods-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}
.detail-goods-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  background: #fafbfc;
  border-radius: 10px;
}
.detail-goods-image-wrapper {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f6f8;
  border: 1px solid #eee;
}
.detail-goods-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.detail-goods-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}
.detail-goods-info {
  flex: 1;
  min-width: 0;
}
.detail-goods-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  line-height: 1.4;
}
.detail-goods-meta {
  display: flex;
  gap: 16px;
  margin-top: 4px;
  font-size: 13px;
  color: #888;
  flex-wrap: wrap;
}
.detail-goods-subtotal {
  color: #ff6b6b;
  font-weight: 600;
}
.detail-total {
  text-align: right;
  font-size: 16px;
  color: #666;
  padding: 12px 0 4px 0;
  border-top: 1px solid #f0f0f0;
}
.detail-total-amount {
  font-size: 20px;
  font-weight: 700;
  color: #ff6b6b;
}
</style>
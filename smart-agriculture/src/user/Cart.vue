<template>
  <div class="cart-page" @click="closeDropAll">
    <!-- 导航栏固定 -->
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

    <!-- ========== 退出登录弹窗 ========== -->
    <div class="modal-mask" v-if="showLogout" @click="showLogout = false">
      <div class="modal-dialog logout-dialog" @click.stop>
        <div class="modal-title">退出登录</div>
        <div class="modal-content">确定要退出当前账号吗？</div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showLogout = false">取消</button>
          <button class="btn-confirm" @click="confirmLogout">确认退出</button>
        </div>
      </div>
    </div>

    <!-- ========== 订单确认弹窗 ========== -->
    <div class="modal-mask" v-if="showOrderConfirm" @click="showOrderConfirm = false">
      <div class="modal-dialog order-confirm-dialog" @click.stop>
        <div class="modal-title">订单确认</div>
        <div class="modal-content" style="text-align: left; padding: 20px 24px;">
          <div class="order-summary">
            <div class="order-row">
              <span class="order-label">收货地址</span>
              <span class="order-value">
                {{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}
              </span>
            </div>
            <div class="order-row">
              <span class="order-label">收货人</span>
              <span class="order-value">{{ selectedAddress.name }} {{ selectedAddress.phone }}</span>
            </div>
            <div class="order-row">
              <span class="order-label">商品总数</span>
              <span class="order-value">{{ cartItems.length }} 件</span>
            </div>
            <div class="order-row">
              <span class="order-label">合计金额</span>
              <span class="order-value total">¥{{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showOrderConfirm = false">取消</button>
          <button class="btn-confirm" @click="confirmOrder">确认下单</button>
        </div>
      </div>
    </div>

    <!-- ========== 结算成功弹窗 ========== -->
    <div class="modal-mask" v-if="showOrderSuccess" @click="showOrderSuccess = false">
      <div class="modal-dialog success-dialog" @click.stop>
        <div class="modal-title">下单成功</div>
        <div class="modal-content" style="padding: 30px 24px;">
          <p style="font-size: 16px; color: #333; margin: 8px 0;">您的订单已提交成功</p>
          <p style="font-size: 14px; color: #999;">预计 2-3 个工作日内发货</p>
        </div>
        <div class="modal-footer">
          <button class="btn-confirm" @click="showOrderSuccess = false" style="border-radius: 0 0 20px 20px;">关闭</button>
        </div>
      </div>
    </div>

    <!-- 主内容 -->
    <main class="main-container">
      <!-- 购物车头部 -->
      <div class="cart-header">
        <div class="cart-title-wrapper">
          <h2 class="cart-title">购物车</h2>
          <div class="address-icon-wrapper" @click="openAddressModal">
            <svg class="address-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span class="address-icon-label">地址</span>
            <span v-if="selectedAddress" class="address-badge">✓</span>
          </div>
        </div>
        <div v-if="selectedAddress" class="selected-address">
          <span class="addr-label">配送至：</span>
          <span class="addr-text">{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}</span>
          <span class="addr-name">{{ selectedAddress.name }} {{ selectedAddress.phone }}</span>
        </div>
        <div v-else class="selected-address no-address" @click="openAddressModal">
          请选择收货地址
        </div>
      </div>

      <!-- 购物车列表 -->
      <div class="cart-content" v-if="cartItems.length > 0">
        <div
          v-for="item in cartItems"
          :key="item.id"
          class="cart-item"
        >
          <div class="item-info">
            <div class="item-img">
              <img :src="item.img" :alt="item.title" />
            </div>
            <div class="item-details">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-price">¥{{ item.price.toFixed(2) }}</div>
            </div>
          </div>
          <div class="item-actions">
            <div class="quantity-control">
              <button class="qty-btn" @click="updateQuantity(item.id, -1)">−</button>
              <span class="qty-num">{{ item.count }}</span>
              <button class="qty-btn" @click="updateQuantity(item.id, 1)">+</button>
            </div>
            <button class="remove-btn" @click="removeItem(item.id)">✕</button>
          </div>
        </div>

        <!-- 结算栏 -->
        <div class="checkout-bar">
          <div class="checkout-left">
            <span class="total-label">合计：</span>
            <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <div class="checkout-right">
            <button
              class="btn-checkout"
              :class="{ disabled: !selectedAddress }"
              @click="handleCheckout"
            >
              {{ selectedAddress ? '立即结算' : '请选择地址' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 空购物车 -->
      <div v-else class="empty-cart">
        <p>购物车是空的</p>
        <router-link to="/user/shop" class="go-shop">去逛逛</router-link>
      </div>
    </main>

    <!-- 地址管理弹窗 -->
    <div class="modal-mask" v-if="showAddressModal" @click="closeAddressModal">
      <div class="modal-dialog address-modal" @click.stop>
        <div class="modal-title">
          地址管理
          <button class="modal-close" @click="closeAddressModal">✕</button>
        </div>
        <div class="address-list">
          <div
            v-for="addr in addressList"
            :key="addr.id"
            class="address-item"
            :class="{ active: selectedAddressId === addr.id }"
            @click="selectAddress(addr.id)"
          >
            <div class="address-info">
              <div class="address-name">
                {{ addr.name }}
                <span class="address-phone">{{ addr.phone }}</span>
                <span v-if="addr.isDefault === 1" class="tag-default">默认</span>
              </div>
              <div class="address-detail">
                {{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}
              </div>
            </div>
            <div class="address-actions">
              <button class="addr-btn edit" @click.stop="openEditAddress(addr)">✎</button>
              <button class="addr-btn delete" @click.stop="deleteAddress(addr.id)">✕</button>
              <button
                v-if="addr.isDefault !== 1"
                class="addr-btn default"
                @click.stop="setDefaultAddress(addr.id)"
              >设为默认</button>
            </div>
          </div>
          <div v-if="addressList.length === 0" class="empty-address">暂无地址，请添加</div>
        </div>
        <div class="address-footer">
          <button class="btn-add-address" @click="openAddAddress">+ 添加新地址</button>
          <button class="btn-confirm-address" @click="confirmAddress">确认选择</button>
        </div>
      </div>
    </div>

    <!-- 新增/编辑地址弹窗 -->
    <div class="modal-mask" v-if="showAddressForm" @click="showAddressForm = false">
      <div class="modal-dialog address-form-modal" @click.stop>
        <div class="modal-title">
          {{ isEditAddress ? '修改地址' : '添加地址' }}
          <button class="modal-close" @click="showAddressForm = false">✕</button>
        </div>
        <div class="address-form">
          <div class="form-row">
            <div class="form-group half">
              <label>收货人 *</label>
              <input v-model="addressForm.name" type="text" placeholder="请输入姓名" />
            </div>
            <div class="form-group half">
              <label>手机号 *</label>
              <input v-model="addressForm.phone" type="text" placeholder="请输入11位手机号" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group third">
              <label>省份 *</label>
              <input v-model="addressForm.province" type="text" placeholder="省份" />
            </div>
            <div class="form-group third">
              <label>城市 *</label>
              <input v-model="addressForm.city" type="text" placeholder="城市" />
            </div>
            <div class="form-group third">
              <label>区/县 *</label>
              <input v-model="addressForm.district" type="text" placeholder="区/县" />
            </div>
          </div>
          <div class="form-group">
            <label>详细地址 *</label>
            <input v-model="addressForm.detail" type="text" placeholder="街道、门牌号等" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showAddressForm = false">取消</button>
          <button class="btn-confirm" @click="submitAddressForm">保存</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ========== 手机号错误提示（自动淡出） ========== -->
  <Transition name="fade">
    <div v-if="showPhoneError" class="error-toast">
      请输入正确的电话号码
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

// ★ 创建带请求拦截器的 axios 实例（自动添加 X-User-Id）
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

// ========== 弹窗控制 ==========
const showOrderConfirm = ref(false)
const showOrderSuccess = ref(false)

// ========== 购物车数据 ==========
const cartItems = ref([])

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.count, 0)
})

// ★ 从后端加载购物车数据
const loadCart = async () => {
  try {
    const res = await request.get('/api/cart')
    cartItems.value = res.data.map(item => ({
      id: item.goodsId,
      title: item.goodsName,
      price: item.goodsPrice,
      img: item.goodsCover,
      count: item.quantity,
      cartId: item.id
    }))
  } catch (err) {
    console.error('加载购物车失败', err)
    cartItems.value = []
  }
}

// ★ 更新数量
const updateQuantity = async (id, delta) => {
  const item = cartItems.value.find(i => i.id === id)
  if (!item) return
  const newCount = Math.max(1, item.count + delta)
  try {
    await request.put('/api/cart/update', {
      goodsId: id,
      quantity: newCount
    })
    item.count = newCount
  } catch (err) {
    console.error('更新数量失败', err)
  }
}

// ★ 删除购物车项
const removeItem = async (id) => {
  try {
    await request.delete(`/api/cart/remove/${id}`)
    cartItems.value = cartItems.value.filter(i => i.id !== id)
  } catch (err) {
    console.error('删除失败', err)
  }
}

// ========== 结算相关 ==========
const handleCheckout = () => {
  if (!selectedAddress.value) {
    openAddressModal()
    return
  }
  showOrderConfirm.value = true
}

const confirmOrder = async () => {
  showOrderConfirm.value = false

  const goodsInfo = cartItems.value.map(item =>
    `${item.title} × ${item.count}`
  ).join('；')

  const items = cartItems.value.map(item => ({
    id: item.id,
    count: item.count
  }))

  const fullAddress = `${selectedAddress.value.province}${selectedAddress.value.city}${selectedAddress.value.district}${selectedAddress.value.detail}`

  const orderData = {
    goodsInfo: goodsInfo,
    totalPrice: totalPrice.value,
    address: fullAddress,
    items: items,
    userId: userStore.getUserId(),
    username: userStore.getUsername()
  }

  try {
    const res = await request.post('/api/order/create', orderData)
    if (res.data.success) {
      // ★ 结算后清空后端购物车
      await request.delete('/api/cart/clear')
      cartItems.value = []
      showOrderSuccess.value = true
    } else {
      alert('下单失败：' + res.data.message)
    }
  } catch (err) {
    console.error('创建订单失败', err)
    alert('网络异常，请稍后重试')
  }
}

// ========== 地址相关 ==========
const showAddressModal = ref(false)
const showAddressForm = ref(false)
const isEditAddress = ref(false)
const addressList = ref([])
const selectedAddressId = ref(null)
const selectedAddress = ref(null)
const editingAddressId = ref(null)

const addressForm = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

const AMAP_KEY = 'bbdec4225355063f28d8a3544e95c337'

const autoFillLocation = async () => {
  if (isEditAddress.value) return
  if (!navigator.geolocation) {
    console.warn('浏览器不支持地理定位')
    return
  }
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      })
    })
    const { latitude, longitude } = position.coords
    const res = await axios.get(
      `https://restapi.amap.com/v3/geocode/regeo?location=${longitude},${latitude}&key=${AMAP_KEY}&output=json`
    )
    if (res.data.status === '1' && res.data.regeocode) {
      const ac = res.data.regeocode.addressComponent
      addressForm.value.province = ac.province || ''
      addressForm.value.city = ac.city || ac.district || ''
      addressForm.value.district = ac.district || ''
    } else {
      console.warn('高德逆地理编码失败', res.data)
    }
  } catch (err) {
    console.error('定位或逆地理编码失败', err)
  }
}

const fetchAddresses = async () => {
  try {
    const res = await request.get('/api/address/list')
    addressList.value = res.data || []
    if (!selectedAddressId.value && addressList.value.length > 0) {
      const defaultAddr = addressList.value.find(a => a.isDefault === 1)
      if (defaultAddr) {
        selectedAddressId.value = defaultAddr.id
        selectedAddress.value = defaultAddr
      } else {
        selectedAddressId.value = addressList.value[0].id
        selectedAddress.value = addressList.value[0]
      }
    }
  } catch (err) {
    console.error('获取地址失败', err)
  }
}

const openAddressModal = () => {
  fetchAddresses()
  showAddressModal.value = true
}

const closeAddressModal = () => {
  showAddressModal.value = false
}

const selectAddress = (id) => {
  const addr = addressList.value.find(a => a.id === id)
  if (addr) {
    selectedAddressId.value = id
    selectedAddress.value = addr
  }
}

const confirmAddress = () => {
  if (selectedAddressId.value) {
    const addr = addressList.value.find(a => a.id === selectedAddressId.value)
    if (addr) {
      selectedAddress.value = addr
    }
  }
  showAddressModal.value = false
}

const openAddAddress = () => {
  isEditAddress.value = false
  addressForm.value = {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false
  }
  showAddressForm.value = true
  autoFillLocation()
}

const openEditAddress = (addr) => {
  isEditAddress.value = true
  editingAddressId.value = addr.id
  let rawPhone = addr.phone || ''
  if (rawPhone.startsWith('+86')) {
    rawPhone = rawPhone.slice(3)
  }
  addressForm.value = {
    name: addr.name,
    phone: rawPhone,
    province: addr.province,
    city: addr.city,
    district: addr.district,
    detail: addr.detail,
    isDefault: addr.isDefault === 1
  }
  showAddressForm.value = true
}

const showPhoneError = ref(false)
let phoneErrorTimer = null

const triggerPhoneError = () => {
  if (phoneErrorTimer) {
    clearTimeout(phoneErrorTimer)
    showPhoneError.value = false
  }
  showPhoneError.value = true
  phoneErrorTimer = setTimeout(() => {
    showPhoneError.value = false
    phoneErrorTimer = null
  }, 2500)
}

const submitAddressForm = async () => {
  const form = addressForm.value
  if (!form.name || !form.phone || !form.province || !form.city || !form.district || !form.detail) {
    alert('请填写完整信息')
    return
  }
  if (!/^\d{11}$/.test(form.phone)) {
    triggerPhoneError()
    return
  }
  const phoneWithCountryCode = '+86' + form.phone

  try {
    if (isEditAddress.value) {
      await request.put('/api/address/update', {
        id: editingAddressId.value,
        name: form.name,
        phone: phoneWithCountryCode,
        province: form.province,
        city: form.city,
        district: form.district,
        detail: form.detail,
        isDefault: form.isDefault ? 1 : 0
      })
    } else {
      await request.post('/api/address/add', {
        name: form.name,
        phone: phoneWithCountryCode,
        province: form.province,
        city: form.city,
        district: form.district,
        detail: form.detail,
        isDefault: 0
      })
    }
    showAddressForm.value = false
    await fetchAddresses()
    if (!selectedAddressId.value && addressList.value.length > 0) {
      const defaultAddr = addressList.value.find(a => a.isDefault === 1)
      if (defaultAddr) {
        selectedAddressId.value = defaultAddr.id
        selectedAddress.value = defaultAddr
      } else {
        selectedAddressId.value = addressList.value[0].id
        selectedAddress.value = addressList.value[0]
      }
    }
  } catch (err) {
    console.error('保存地址失败', err)
    alert('保存失败，请重试')
  }
}

const deleteAddress = async (id) => {
  try {
    await request.delete(`/api/address/delete/${id}`)
    await fetchAddresses()
    if (selectedAddressId.value === id) {
      selectedAddressId.value = null
      selectedAddress.value = null
    }
  } catch (err) {
    console.error('删除地址失败', err)
    alert('删除失败，请重试')
  }
}

const setDefaultAddress = async (id) => {
  try {
    await request.put(`/api/address/default/${id}`)
    await fetchAddresses()
    const defaultAddr = addressList.value.find(a => a.isDefault === 1)
    if (defaultAddr) {
      selectedAddressId.value = defaultAddr.id
      selectedAddress.value = defaultAddr
    }
  } catch (err) {
    console.error('设置默认地址失败', err)
    alert('设置失败，请重试')
  }
}

const confirmLogout = () => {
  showLogout.value = false
  userStore.logout()
  router.push('/login')
}

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

onMounted(async () => {
  if (!userStore.isLoggedIn()) {
    router.push('/login')
    return
  }
  await loadCart()
  await fetchAddresses()
})
</script>

<style scoped>
/* 样式完全保持不变 */
.cart-page {
  min-height: 100vh;
  background-color: #f5f7f9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
.nav-item.active {
  background: #e6f7ef;
  color: #2ecc71;
  font-weight: 500;
}
.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
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

.modal-mask .modal-dialog.logout-dialog {
  width: 340px !important;
  max-width: 340px !important;
  min-width: 340px !important;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: modalShow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.logout-dialog .modal-title {
  padding: 24px 24px 0 !important;
  font-size: 19px !important;
  font-weight: 600;
  color: #222;
  text-align: center;
  border-bottom: none !important;
  display: block !important;
}

.logout-dialog .modal-content {
  padding: 16px 24px 24px;
  font-size: 15px;
  color: #666;
  text-align: center;
  line-height: 1.6;
}

.logout-dialog .modal-footer {
  display: flex;
  border-top: 1px solid #f3f4f6;
}

.logout-dialog .modal-footer button {
  flex: 1;
  height: 52px;
  border: none;
  outline: none;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-dialog .btn-cancel {
  background: #f9fafb;
  color: #555;
}
.logout-dialog .btn-cancel:hover {
  background: #f3f4f6;
}

.logout-dialog .btn-confirm {
  background: #2ecc71;
  color: #fff;
  font-weight: 500;
}
.logout-dialog .btn-confirm:hover {
  background: #27ae60;
}

@keyframes modalShow {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-dialog {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-width: 90vw;
  max-height: 90vh;
}
.modal-title {
  padding: 20px 24px;
  font-size: 18px;
  font-weight: 600;
  color: #222;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}
.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}
.modal-close:hover {
  background: #f0f0f0;
  color: #333;
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
  transition: background 0.2s;
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

.order-confirm-dialog {
  width: 460px;
}
.order-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.order-row {
  display: flex;
  align-items: baseline;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}
.order-row:last-child {
  border-bottom: none;
}
.order-label {
  font-size: 14px;
  color: #888;
  min-width: 80px;
}
.order-value {
  font-size: 14px;
  color: #333;
  flex: 1;
}
.order-value.total {
  font-size: 18px;
  font-weight: 700;
  color: #ff4d4f;
}

.success-dialog {
  width: 360px;
}

.main-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 32px 32px 32px;
}

.cart-header {
  background: #fff;
  border-radius: 16px;
  padding: 20px 28px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.cart-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cart-title {
  font-size: 22px;
  font-weight: 700;
  color: #222;
  margin: 0;
}

.address-icon-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 999px;
  transition: all 0.2s ease;
  background: #f5f7f9;
  position: relative;
}
.address-icon-wrapper:hover {
  background: #e6f7ef;
  color: #2ecc71;
}
.address-svg {
  width: 22px;
  height: 22px;
  color: #555;
  transition: color 0.2s ease;
}
.address-icon-wrapper:hover .address-svg {
  color: #2ecc71;
}
.address-icon-label {
  font-size: 14px;
  color: #555;
  font-weight: 500;
}
.address-icon-wrapper:hover .address-icon-label {
  color: #2ecc71;
}
.address-badge {
  position: absolute;
  top: -4px;
  right: -2px;
  background: #2ecc71;
  color: #fff;
  font-size: 10px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-address {
  margin-top: 12px;
  padding: 10px 16px;
  background: #f0faf4;
  border-radius: 10px;
  font-size: 14px;
  color: #333;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  border-left: 3px solid #2ecc71;
}
.selected-address .addr-label {
  color: #888;
  font-weight: 500;
}
.selected-address .addr-text {
  color: #222;
  font-weight: 500;
}
.selected-address .addr-name {
  color: #2ecc71;
  font-weight: 500;
  background: #fff;
  padding: 2px 12px;
  border-radius: 12px;
}
.selected-address.no-address {
  background: #fff5f5;
  border-left-color: #f56c6c;
  color: #f56c6c;
  cursor: pointer;
}
.selected-address.no-address:hover {
  background: #fff0f0;
}

.cart-content {
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}
.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}
.cart-item:last-child {
  border-bottom: none;
}
.item-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}
.item-img img {
  width: 70px;
  height: 70px;
  border-radius: 10px;
  object-fit: cover;
}
.item-details {
  flex: 1;
}
.item-title {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}
.item-price {
  font-size: 16px;
  color: #ff4d4f;
  font-weight: 600;
  margin-top: 4px;
}
.item-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f7f9;
  border-radius: 8px;
  padding: 2px 4px;
}
.qty-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  font-size: 16px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s ease;
}
.qty-btn:hover {
  background: #e8eaed;
}
.qty-num {
  min-width: 24px;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
}
.remove-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #ccc;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}
.remove-btn:hover {
  color: #f56c6c;
  background: #fef0f0;
}

.checkout-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
  margin-top: 4px;
}
.checkout-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.total-label {
  font-size: 16px;
  color: #888;
}
.total-price {
  font-size: 24px;
  font-weight: 700;
  color: #ff4d4f;
}
.btn-checkout {
  padding: 14px 40px;
  background: #2ecc71;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
.btn-checkout:hover:not(.disabled) {
  background: #27ae60;
  transform: scale(1.02);
}
.btn-checkout.disabled {
  background: #ccc;
  cursor: not-allowed;
}

.empty-cart {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}
.empty-cart p {
  font-size: 18px;
  color: #999;
  margin-bottom: 20px;
}
.go-shop {
  display: inline-block;
  padding: 12px 36px;
  background: #2ecc71;
  color: #fff;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s ease;
}
.go-shop:hover {
  background: #27ae60;
}

.address-modal {
  width: 560px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}
.address-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  max-height: 350px;
}
.address-item {
  padding: 14px 16px;
  border: 2px solid #e8eaed;
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.address-item:hover {
  border-color: #c0c4cc;
}
.address-item.active {
  border-color: #2ecc71;
  background: #f0faf4;
}
.address-info {
  flex: 1;
}
.address-name {
  font-size: 15px;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}
.address-phone {
  font-weight: 400;
  color: #888;
  margin-left: 8px;
}
.tag-default {
  font-size: 11px;
  background: #2ecc71;
  color: #fff;
  padding: 1px 10px;
  border-radius: 10px;
  margin-left: 8px;
}
.address-detail {
  font-size: 14px;
  color: #666;
}
.address-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.addr-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.addr-btn.edit {
  background: #e6f7ef;
  color: #2ecc71;
}
.addr-btn.edit:hover {
  background: #2ecc71;
  color: #fff;
}
.addr-btn.delete {
  background: #fef0f0;
  color: #f56c6c;
}
.addr-btn.delete:hover {
  background: #f56c6c;
  color: #fff;
}
.addr-btn.default {
  background: #f0f0f0;
  color: #666;
}
.addr-btn.default:hover {
  background: #2ecc71;
  color: #fff;
}
.empty-address {
  text-align: center;
  color: #bbb;
  padding: 40px 0;
}
.address-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
}
.btn-add-address {
  flex: 1;
  padding: 10px 0;
  background: #f5f7f9;
  border: 1px dashed #ccc;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
  transition: all 0.2s ease;
}
.btn-add-address:hover {
  background: #e6f7ef;
  border-color: #2ecc71;
  color: #2ecc71;
}
.btn-confirm-address {
  flex: 1;
  padding: 10px 0;
  background: #2ecc71;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.btn-confirm-address:hover {
  background: #27ae60;
}

.address-form-modal {
  width: 480px;
}
.address-form {
  padding: 20px 24px;
}
.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}
.form-group {
  flex: 1;
}
.form-group label {
  display: block;
  font-size: 13px;
  color: #888;
  margin-bottom: 4px;
}
.form-group input[type="text"] {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}
.form-group input[type="text"]:focus {
  border-color: #2ecc71;
}

.error-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 77, 79, 0.95);
  color: #fff;
  padding: 16px 32px;
  border-radius: 12px;
  z-index: 99999;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .main-container {
    padding: 80px 12px 16px 12px;
  }
  .cart-header {
    padding: 16px 18px;
  }
  .cart-title {
    font-size: 18px;
  }
  .address-modal {
    width: 95vw;
  }
  .address-form-modal {
    width: 95vw;
  }
  .order-confirm-dialog {
    width: 92vw;
  }
  .success-dialog {
    width: 85vw;
  }
  .cart-item {
    flex-wrap: wrap;
    gap: 12px;
  }
  .item-info {
    width: 100%;
  }
  .item-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .checkout-bar {
    flex-wrap: wrap;
    gap: 12px;
  }
  .checkout-left {
    width: 100%;
    justify-content: center;
  }
  .btn-checkout {
    width: 100%;
    padding: 12px;
  }
  .form-row {
    flex-direction: column;
  }
  .address-item {
    flex-wrap: wrap;
  }
  .address-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
  }
}
</style>
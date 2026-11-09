import axios from 'axios';
import { userStore } from '@/stores/userStore';

const request = axios.create({
    baseURL: 'http://localhost:8080'
});

// 请求拦截器：自动添加 X-User-Id
request.interceptors.request.use(config => {
    const store = userStore();
    if (store.isLoggedIn()) {
        config.headers['X-User-Id'] = store.getUserId();
    }
    return config;
});

// ========== 购物车 API 调用 ==========

// 获取购物车
export const getCart = async () => {
    try {
        const res = await request.get('/api/cart');
        return res.data.map(item => ({
            id: item.goodsId,
            title: item.goodsName,
            price: item.goodsPrice,
            img: item.goodsCover,
            count: item.quantity,
            cartId: item.id
        }));
    } catch (err) {
        console.error('获取购物车失败', err);
        return [];
    }
};

// 增加数量
export const increment = async (id) => {
    try {
        const cart = await getCart();
        const item = cart.find(i => i.id === id);
        if (item) {
            await request.put('/api/cart/update', {
                goodsId: id,
                quantity: item.count + 1
            });
        }
    } catch (err) {
        console.error('增加数量失败', err);
    }
};

// 减少数量
export const decrement = async (id) => {
    try {
        const cart = await getCart();
        const item = cart.find(i => i.id === id);
        if (item && item.count > 1) {
            await request.put('/api/cart/update', {
                goodsId: id,
                quantity: item.count - 1
            });
        } else if (item && item.count === 1) {
            await removeFromCart(id);
        }
    } catch (err) {
        console.error('减少数量失败', err);
    }
};

// 直接更新数量
export const updateCount = async (id, count) => {
    try {
        const newCount = Math.max(1, parseInt(count) || 1);
        await request.put('/api/cart/update', {
            goodsId: id,
            quantity: newCount
        });
    } catch (err) {
        console.error('更新数量失败', err);
    }
};

// 删除商品
export const removeFromCart = async (id) => {
    try {
        await request.delete(`/api/cart/remove/${id}`);
    } catch (err) {
        console.error('删除商品失败', err);
    }
};

// 清空购物车
export const clearCart = async () => {
    try {
        await request.delete('/api/cart/clear');
    } catch (err) {
        console.error('清空购物车失败', err);
    }
};

// 计算总价
export const calcTotal = async () => {
    try {
        const cart = await getCart();
        return cart.reduce((total, item) => total + item.price * item.count, 0);
    } catch (err) {
        console.error('计算总价失败', err);
        return 0;
    }
};

// 添加商品到购物车
export const addToCart = async (goodsId, quantity = 1) => {
    try {
        await request.post('/api/cart/add', {
            goodsId,
            quantity
        });
        return true;
    } catch (err) {
        console.error('加入购物车失败', err);
        return false;
    }
};

// 获取购物车总数量（用于角标）
export const getCartTotalCount = async () => {
    try {
        const cart = await getCart();
        return cart.reduce((sum, item) => sum + item.count, 0);
    } catch (err) {
        console.error('获取购物车总数失败', err);
        return 0;
    }
};
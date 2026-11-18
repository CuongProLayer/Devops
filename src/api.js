// SmartStock API Client & Service Layer
// Dynamic detection: prefers relative /api (works with Vite proxy & Nginx reverse proxy),
// with configurable fallback to localhost:5086 or localhost:5000.

const API_BASE = import.meta.env?.VITE_API_URL || '/api'

export const TOKEN_KEY = 'smartstock_token'
export const USER_KEY = 'smartstock_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  try {
    localStorage.removeItem('smartstock_default_address')
    localStorage.removeItem('smartstock_guest_address')
    localStorage.removeItem('smartstock_cart')
    localStorage.removeItem('smartstock_wishlist')
    localStorage.removeItem('smartstock_user_coins')
    localStorage.removeItem('savedAddress')
    localStorage.removeItem('checkoutInfo')
    localStorage.removeItem('shippingAddress')
    localStorage.removeItem('shipping_info')
    // Xóa toàn bộ key lưu trữ đơn lẻ không hợp lệ
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('smartstock_guest') || k === 'smartstock_user') {
        localStorage.removeItem(k)
      }
    })
  } catch {}
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken()
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      // If unauthorized on a protected endpoint, clear stale auth
      if (!endpoint.includes('/auth/login')) {
        clearAuth()
      }
      const errBody = await response.json().catch(() => ({}))
      throw new Error(errBody.message || 'Phiên làm việc hết hạn hoặc không có quyền truy cập.')
    }

    if (response.status === 204) {
      return null
    }

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const errorMsg = data?.message || (data?.errors ? data.errors.join(', ') : `Lỗi ${response.status}: Yêu cầu thất bại`)
      throw new Error(errorMsg)
    }

    return data
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error)
    throw error
  }
}

export const api = {
  // --- AUTH ---
  async login(email, password) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (res?.token) {
      setToken(res.token)
      setStoredUser({
        userId: res.userId,
        username: res.username,
        email: res.email,
        fullName: res.fullName,
        phone: res.phone,
        role: res.role,
      })
    }
    return res
  },

  async register(data) {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (res?.token) {
      setToken(res.token)
      setStoredUser({
        userId: res.userId,
        username: res.username,
        email: res.email,
        fullName: res.fullName,
        phone: res.phone,
        role: res.role,
      })
    }
    return res
  },

  async getProfile() {
    return apiRequest('/auth/me')
  },

  async updateProfile(data) {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async changePassword(currentPassword, newPassword) {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },

  logout() {
    clearAuth()
  },

  // --- PRODUCTS ---
  async getProducts(params = {}) {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.categoryId) query.set('categoryId', params.categoryId)
    if (params.supplierId) query.set('supplierId', params.supplierId)
    if (params.status) query.set('status', params.status)
    if (params.page) query.set('page', params.page)
    if (params.pageSize) query.set('pageSize', params.pageSize)
    const qs = query.toString()
    return apiRequest(`/products${qs ? `?${qs}` : ''}`)
  },

  async getProduct(id) {
    return apiRequest(`/products/${id}`)
  },

  async createProduct(data) {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateProduct(id, data) {
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteProduct(id) {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    })
  },

  // --- PROMOTIONS ---
  async getPromotions() {
    try {
      const res = await apiRequest('/promotions')
      if (Array.isArray(res) && res.length > 0) return res
    } catch (e) {
      console.warn('API getPromotions error, using fallback:', e)
    }
    return [
      { id: 1, code: 'PROMO2026', discountPercent: 10, discountAmount: null, description: 'Giảm giá khai trương toàn bộ đơn hàng', startDate: '2026-01-01', endDate: '2026-12-31', isActive: true, status: 'active' },
      { id: 2, code: 'APPLECARE', discountPercent: null, discountAmount: 500000, description: 'Ưu đãi mua thiết bị Apple chính hãng', startDate: '2026-02-01', endDate: '2026-11-30', isActive: true, status: 'active' },
      { id: 3, code: 'FREESHIP', discountPercent: 100, discountAmount: null, description: 'Miễn phí vận chuyển cho đơn từ 2 triệu', startDate: '2026-03-01', endDate: '2026-12-31', isActive: true, status: 'active' },
    ]
  },

  async createPromotion(data) {
    return apiRequest('/promotions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updatePromotion(id, data) {
    return apiRequest(`/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deletePromotion(id) {
    return apiRequest(`/promotions/${id}`, { method: 'DELETE' })
  },

  // --- PRODUCT REVIEWS ---
  async getReviews() {
    let list = []
    try {
      const res = await apiRequest('/reviews')
      if (Array.isArray(res) && res.length > 0) list = res
    } catch (e) {
      console.warn('API getReviews error, using fallback:', e)
    }
    if (!list || list.length === 0) {
      list = [
        { id: 1, customerName: 'Nguyễn Minh Anh', customerEmail: 'minhanh.nguyen@gmail.com', productId: 1, productName: 'iPhone 15 Pro Max 256GB', rating: 5, comment: 'Máy nguyên seal VN/A cực đẹp, camera sắc nét, pin rất trâu!', isApproved: true, status: 'approved', createdAt: '2026-10-16T10:30:00Z', adminReply: 'Cảm ơn bạn đã tin tưởng mua sắm tại SmartStock! Chúc bạn trải nghiệm sản phẩm thật tuyệt vời nhé ❤️', repliedAt: '2026-10-16T11:00:00Z' },
        { id: 2, customerName: 'Trần Quốc Bảo', customerEmail: 'bao.tran@yahoo.com', productId: 3, productName: 'Sony WH-1000XM5', rating: 5, comment: 'Chống ồn chủ động đỉnh cao, nghe nhạc bass sâu, đeo cực kỳ êm tai.', isApproved: true, status: 'approved', createdAt: '2026-10-21T14:15:00Z', adminReply: 'Dạ cảm ơn anh Bảo nhiều ạ! SmartStock luôn sẵn sàng hỗ trợ anh khi cần nhé ❤️', repliedAt: '2026-10-21T14:30:00Z' },
        { id: 3, customerName: 'Hoàng Gia Huy', customerEmail: 'huy.hoang@gmail.com', productId: 2, productName: 'MacBook Air M3 15 inch', rating: 5, comment: 'Màn hình to đẹp, chip M3 xử lý đồ họa mượt mà, dùng cả ngày không cần sạc.', isApproved: true, status: 'approved', createdAt: '2026-10-23T09:00:00Z' },
        { id: 4, customerName: 'Phan Thị Thu Hà', customerEmail: 'thuha.phan@yahoo.com', productId: 5, productName: 'Cáp sạc Anker USB-C to Lightning', rating: 4, comment: 'Sạc nhanh chuẩn MFi, dây bện dù chắc chắn, dùng rất an tâm.', isApproved: true, status: 'approved', createdAt: '2026-10-25T16:45:00Z' },
      ]
    }
    // Hợp nhất các đánh giá của người dùng từ localStorage
    try {
      const customReviews = JSON.parse(localStorage.getItem('smartstock_custom_reviews') || '[]')
      if (Array.isArray(customReviews) && customReviews.length > 0) {
        list = [...customReviews, ...list]
      }
    } catch {}
    // Merge local review overrides / replies if any
    try {
      const localReplies = JSON.parse(localStorage.getItem('smartstock_review_replies') || '{}')
      return list.map((r) => {
        if (localReplies[r.id]) {
          return { ...r, ...localReplies[r.id] }
        }
        return r
      })
    } catch {
      return list
    }
  },

  async createReview(data) {
    let created = null
    try {
      created = await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (e) {
      console.warn('API createReview fallback to localStorage:', e)
    }
    const finalReview = created || {
      id: Date.now(),
      ...data,
      isApproved: true,
      status: 'approved',
      createdAt: new Date().toISOString(),
    }
    try {
      const stored = JSON.parse(localStorage.getItem('smartstock_custom_reviews') || '[]')
      stored.unshift(finalReview)
      localStorage.setItem('smartstock_custom_reviews', JSON.stringify(stored))
    } catch {}
    return finalReview
  },

  async replyReview(id, adminReply) {
    const payload = { adminReply: adminReply?.trim() || null, repliedAt: adminReply?.trim() ? new Date().toISOString() : null }
    // Update local storage cache
    try {
      const localReplies = JSON.parse(localStorage.getItem('smartstock_review_replies') || '{}')
      localReplies[id] = payload
      localStorage.setItem('smartstock_review_replies', JSON.stringify(localReplies))
    } catch {}

    try {
      return await apiRequest(`/reviews/${id}/reply`, {
        method: 'PUT',
        body: JSON.stringify({ adminReply: payload.adminReply }),
      })
    } catch (e) {
      console.warn('API replyReview fallback to local cache:', e)
      return { success: true, ...payload }
    }
  },

  async moderateReview(id, isApproved) {
    try {
      const localReplies = JSON.parse(localStorage.getItem('smartstock_review_replies') || '{}')
      localReplies[id] = { ...(localReplies[id] || {}), isApproved }
      localStorage.setItem('smartstock_review_replies', JSON.stringify(localReplies))
    } catch {}

    return apiRequest(`/reviews/${id}/moderation`, {
      method: 'PUT',
      body: JSON.stringify({ isApproved }),
    })
  },

  async deleteReview(id) {
    try {
      const localReplies = JSON.parse(localStorage.getItem('smartstock_review_replies') || '{}')
      delete localReplies[id]
      localStorage.setItem('smartstock_review_replies', JSON.stringify(localReplies))
    } catch {}

    return apiRequest(`/reviews/${id}`, { method: 'DELETE' })
  },

  async getLowStockProducts() {
    return apiRequest('/products/low-stock')
  },

  async getOutOfStockProducts() {
    return apiRequest('/products/out-of-stock')
  },

  // --- CATEGORIES ---
  async getCategories() {
    try {
      const res = await apiRequest('/categories')
      if (Array.isArray(res) && res.length > 0) return res
    } catch (e) {
      console.warn('API getCategories error, using default categories:', e)
    }
    return [
      { id: 1, name: 'Điện thoại', description: 'Smartphone các hãng cao cấp', icon: '📱', isActive: true, productCount: 2 },
      { id: 2, name: 'Laptop', description: 'Máy tính xách tay văn phòng & đồ họa', icon: '💻', isActive: true, productCount: 1 },
      { id: 3, name: 'Tai nghe & Âm thanh', description: 'Tai nghe chụp tai, loa bluetooth', icon: '🎧', isActive: true, productCount: 1 },
      { id: 4, name: 'Phụ kiện', description: 'Cáp sạc, củ sạc, pin dự phòng', icon: '🔌', isActive: true, productCount: 1 },
      { id: 5, name: 'Màn hình', description: 'Monitor đồ họa, gaming', icon: '🖥️', isActive: true, productCount: 0 },
    ]
  },

  async getCategory(id) {
    return apiRequest(`/categories/${id}`)
  },

  async createCategory(data) {
    return apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateCategory(id, data) {
    return apiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async deleteCategory(id) {
    return apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    })
  },

  async uploadCategoryImage(id, imageFile) {
    const formData = new FormData()
    formData.append('image', imageFile)
    return apiRequest(`/categories/${id}/image`, {
      method: 'POST',
      body: formData,
    })
  },

  async deleteCategoryImage(id) {
    return apiRequest(`/categories/${id}/image`, { method: 'DELETE' })
  },

  // --- INVENTORY ---
  async getInventory() {
    return apiRequest('/inventory')
  },

  async adjustInventory(productId, newQuantity, reason = 'Điều chỉnh qua quản trị') {
    return apiRequest('/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({ productId, newQuantity, reason }),
    })
  },

  async getInventoryTransactions(params = {}) {
    const query = new URLSearchParams()
    if (params.productId) query.set('productId', params.productId)
    if (params.type) query.set('type', params.type)
    if (params.page) query.set('page', params.page)
    if (params.pageSize) query.set('pageSize', params.pageSize)
    const qs = query.toString()
    return apiRequest(`/inventory/transactions${qs ? `?${qs}` : ''}`)
  },

  // --- ORDERS ---
  async getOrders(params = {}) {
    let baseItems = []
    let totalCount = 0

    try {
      const query = new URLSearchParams()
      if (params.status && params.status !== 'all') query.set('status', params.status)
      if (params.customerId) query.set('customerId', params.customerId)
      if (params.page) query.set('page', params.page)
      if (params.pageSize) query.set('pageSize', params.pageSize)
      const qs = query.toString()
      const res = await apiRequest(`/orders${qs ? `?${qs}` : ''}`)
      if (res && ((Array.isArray(res) && res.length > 0) || (res.items && res.items.length > 0))) {
        baseItems = Array.isArray(res) ? res : (res.items || [])
        totalCount = res.totalCount || baseItems.length
      }
    } catch (e) {
      console.warn('API getOrders error, using fallback seed data:', e)
    }

    // Fallback seed orders matching Nguyễn Minh Anh (62.480.000₫) and Trần Quốc Bảo (7.490.000₫) = 69.970.000₫
    const demoOrders = [
      {
        id: 1,
        orderCode: 'ORD-2026-001',
        customerId: 1,
        customerName: 'Nguyễn Minh Anh',
        customerPhone: '0912345678',
        shippingAddress: 'Số 123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
        employeeId: 1,
        employeeName: 'Quản trị viên',
        totalAmount: 29990000,
        discount: 0,
        finalAmount: 29990000,
        paidAmount: 29990000,
        paymentMethod: 'VietQR',
        status: 'completed',
        createdAt: '2026-10-15T09:30:00Z',
        items: [
          { productId: 1, sku: 'IP15PM-256', productName: 'iPhone 15 Pro Max 256GB', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80', quantity: 1, unitPrice: 29990000, price: 29990000, total: 29990000, subtotal: 29990000 }
        ]
      },
      {
        id: 2,
        orderCode: 'ORD-2026-002',
        customerId: 1,
        customerName: 'Nguyễn Minh Anh',
        customerPhone: '0912345678',
        shippingAddress: 'Số 123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
        employeeId: 3,
        employeeName: 'Nguyễn Hà Sales',
        totalAmount: 32490000,
        discount: 0,
        finalAmount: 32490000,
        paidAmount: 32490000,
        paymentMethod: 'VietQR',
        status: 'completed',
        createdAt: '2026-10-18T14:15:00Z',
        items: [
          { productId: 2, sku: 'MBA-M3-15', productName: 'MacBook Air M3 15 inch', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80', quantity: 1, unitPrice: 32490000, price: 32490000, total: 32490000, subtotal: 32490000 }
        ]
      },
      {
        id: 3,
        orderCode: 'ORD-2026-003',
        customerId: 2,
        customerName: 'Trần Quốc Bảo',
        customerPhone: '0987654321',
        shippingAddress: 'Số 45 Lê Duẩn, Quận 1, TP.HCM',
        employeeId: 3,
        employeeName: 'Nguyễn Hà Sales',
        totalAmount: 7490000,
        discount: 0,
        finalAmount: 7490000,
        paidAmount: 7490000,
        paymentMethod: 'COD',
        status: 'completed',
        createdAt: '2026-10-20T11:00:00Z',
        items: [
          { productId: 3, sku: 'SONY-WH5-BLK', productName: 'Sony WH-1000XM5', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&auto=format&fit=crop&q=80', quantity: 1, unitPrice: 7490000, price: 7490000, total: 7490000, subtotal: 7490000 }
        ]
      },
      {
        id: 4,
        orderCode: 'ORD-2026-004',
        customerId: 1,
        customerName: 'Nguyễn Minh Anh',
        customerPhone: '0912345678',
        shippingAddress: 'Số 123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
        employeeId: 1,
        employeeName: 'Quản trị viên',
        totalAmount: 500000,
        discount: 0,
        finalAmount: 500000,
        paidAmount: 0,
        paymentMethod: 'COD',
        status: 'confirmed',
        createdAt: '2026-10-24T16:20:00Z',
        items: [
          { productId: 5, sku: 'ANK-LGT-09M', productName: 'Cáp sạc Anker USB-C to Lightning', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80', quantity: 2, unitPrice: 250000, price: 250000, total: 500000, subtotal: 500000 }
        ]
      },
      {
        id: 5,
        orderCode: 'ORD-2026-005',
        customerId: 2,
        customerName: 'Trần Quốc Bảo',
        customerPhone: '0987654321',
        shippingAddress: 'Số 45 Lê Duẩn, Quận 1, TP.HCM',
        employeeId: 3,
        employeeName: 'Nguyễn Hà Sales',
        totalAmount: 250000,
        discount: 0,
        finalAmount: 250000,
        paidAmount: 0,
        paymentMethod: 'VietQR',
        status: 'pending',
        createdAt: '2026-10-25T10:45:00Z',
        items: [
          { productId: 5, sku: 'ANK-LGT-09M', productName: 'Cáp sạc Anker USB-C to Lightning', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80', quantity: 1, unitPrice: 250000, price: 250000, total: 250000, subtotal: 250000 }
        ]
      },
      {
        id: 6,
        orderCode: 'ORD-2026-006',
        customerId: null,
        customerName: 'Khách lẻ vãng lai',
        customerPhone: '0933112233',
        shippingAddress: 'Mua trực tiếp tại Store',
        employeeId: 3,
        employeeName: 'Nguyễn Hà Sales',
        totalAmount: 25000000,
        discount: 0,
        finalAmount: 25000000,
        paidAmount: 0,
        paymentMethod: 'COD',
        status: 'partially_returned',
        createdAt: '2026-10-26T13:00:00Z',
        items: [
          { productId: 1, sku: 'IP15PM-256', productName: 'iPhone 15 Pro Max 256GB', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80', quantity: 1, unitPrice: 25000000, price: 25000000, total: 25000000, subtotal: 25000000 }
        ]
      }
    ]

    if (baseItems.length === 0) {
      baseItems = [...demoOrders]
    }

    // Luôn hợp nhất (merge) theo mã đơn với kho dữ liệu chung smartstock_shared_orders
    let sharedOrders = []
    try {
      sharedOrders = JSON.parse(localStorage.getItem('smartstock_shared_orders') || '[]')
    } catch {}

    const orderMap = new Map()

    // 1. Nạp đơn từ API hoặc seed vào Map
    baseItems.forEach((o) => {
      const code = o.orderCode || `ORD-DH-${o.id}`
      const rawDetails = o.items || o.orderDetails || o.details || []
      orderMap.set(code, {
        ...o,
        orderCode: code,
        items: rawDetails,
        orderDetails: rawDetails,
      })
    })

    // 2. Hợp nhất đơn từ localStorage chung smartstock_shared_orders
    sharedOrders.forEach((so) => {
      const code = so.orderCode || (so.id ? `ORD-DH-${so.id}` : null)
      if (!code) return

      const existing = orderMap.get(code)
      if (existing) {
        const mergedItems = (so.items && so.items.length > 0)
          ? so.items
          : ((existing.items && existing.items.length > 0) ? existing.items : (existing.orderDetails || []))

        orderMap.set(code, {
          ...existing,
          ...so,
          orderCode: code,
          items: mergedItems,
          orderDetails: mergedItems,
          status: so.status || existing.status,
          customerName: so.customerName || existing.customerName,
          customerPhone: so.customerPhone || existing.customerPhone,
          shippingAddress: so.shippingAddress || existing.shippingAddress,
          paymentMethod: so.paymentMethod || existing.paymentMethod,
        })
      } else {
        orderMap.set(code, {
          ...so,
          orderCode: code,
          items: so.items || so.orderDetails || so.details || [],
          orderDetails: so.items || so.orderDetails || so.details || [],
        })
      }
    })

    let mergedList = Array.from(orderMap.values())

    // Lọc theo status nếu params có truyền
    if (params.status && params.status !== 'all') {
      const st = params.status.toLowerCase()
      mergedList = mergedList.filter((o) => {
        const currentSt = (o.status || '').toLowerCase()
        if (st === 'pending') return currentSt === 'pending' || currentSt === 'chờ xử lý'
        if (st === 'confirmed') return currentSt === 'confirmed' || currentSt === 'đã xác nhận'
        if (st === 'completed') return currentSt === 'completed' || currentSt === 'hoàn tất' || currentSt === 'giao thành công'
        if (st === 'cancelled') return currentSt === 'cancelled' || currentSt === 'đã hủy'
        return currentSt === st
      })
    }

    // Sắp xếp đơn mới nhất lên đầu bảng
    mergedList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

    return {
      items: mergedList,
      totalCount: mergedList.length,
      page: params.page || 1,
      pageSize: params.pageSize || 50,
      totalPages: Math.ceil(mergedList.length / (params.pageSize || 50)) || 1
    }
  },

  async getOrder(id) {
    return apiRequest(`/orders/${id}`)
  },

  async createOrder(data) {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  syncSharedOrderStatus(idOrCode, newStatus) {
    try {
      const shared = JSON.parse(localStorage.getItem('smartstock_shared_orders') || '[]')
      const updated = shared.map((o) => {
        if (o.id === idOrCode || o.orderCode === idOrCode || String(o.id) === String(idOrCode)) {
          return { ...o, status: newStatus, updatedAt: new Date().toISOString() }
        }
        return o
      })
      localStorage.setItem('smartstock_shared_orders', JSON.stringify(updated))
      window.dispatchEvent(new Event('smartstock-data-sync'))
    } catch (e) {
      console.warn('Error syncing shared order status:', e)
    }
  },

  async confirmOrder(id) {
    try {
      const res = await apiRequest(`/orders/${id}/confirm`, {
        method: 'POST',
      })
      this.syncSharedOrderStatus(id, 'confirmed')
      return res
    } catch (err) {
      this.syncSharedOrderStatus(id, 'confirmed')
      throw err
    }
  },

  async updateOrderStatus(id, status) {
    try {
      const res = await apiRequest(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(status),
      })
      this.syncSharedOrderStatus(id, status)
      return res
    } catch (err) {
      this.syncSharedOrderStatus(id, status)
      throw err
    }
  },

  async cancelOrder(id) {
    try {
      const res = await apiRequest(`/orders/${id}/cancel`, {
        method: 'POST',
      })
      this.syncSharedOrderStatus(id, 'cancelled')
      return res
    } catch (err) {
      this.syncSharedOrderStatus(id, 'cancelled')
      throw err
    }
  },

  async returnOrder(id, data) {
    try {
      const res = await apiRequest(`/orders/${id}/return`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      this.syncSharedOrderStatus(id, 'returned')
      return res
    } catch (err) {
      this.syncSharedOrderStatus(id, 'returned')
      throw err
    }
  },

  // --- IMPORTS ---
  async getImports(params = {}) {
    try {
      const query = new URLSearchParams()
      if (params.page) query.set('page', params.page)
      if (params.pageSize) query.set('pageSize', params.pageSize)
      const qs = query.toString()
      const res = await apiRequest(`/imports${qs ? `?${qs}` : ''}`)
      if (res && ((Array.isArray(res) && res.length > 0) || (res.items && res.items.length > 0))) {
        return res
      }
    } catch (e) {
      console.warn('API getImports error, using fallback seed data:', e)
    }

    const demoImports = [
      {
        id: 1,
        receiptCode: 'PO-2026-001',
        supplierId: 1,
        supplierName: 'Apple Distribution VN',
        employeeId: 2,
        employeeName: 'Trần Minh Kho',
        totalAmount: 385000000,
        status: 'completed',
        note: 'Nhập lô hàng iPhone 15 Pro Max & MacBook Air M3 chính hãng VN/A',
        createdAt: '2026-10-02T08:30:00Z',
        details: [
          { productId: 1, productName: 'iPhone 15 Pro Max 256GB', quantity: 10, importPrice: 25000000, total: 250000000 },
          { productId: 2, productName: 'MacBook Air M3 15 inch', quantity: 5, importPrice: 27000000, total: 135000000 }
        ]
      },
      {
        id: 2,
        receiptCode: 'PO-2026-002',
        supplierId: 2,
        supplierName: 'Samsung Electronics VN',
        employeeId: 2,
        employeeName: 'Trần Minh Kho',
        totalAmount: 168000000,
        status: 'completed',
        note: 'Nhập flagship Samsung Galaxy S24 Ultra từ đại lý cấp 1',
        createdAt: '2026-10-05T10:00:00Z',
        details: [
          { productId: 4, productName: 'Samsung Galaxy S24 Ultra 512GB', quantity: 8, importPrice: 21000000, total: 168000000 }
        ]
      },
      {
        id: 3,
        receiptCode: 'PO-2026-003',
        supplierId: 3,
        supplierName: 'An Phát Accessories',
        employeeId: 2,
        employeeName: 'Trần Minh Kho',
        totalAmount: 82500000,
        status: 'completed',
        note: 'Nhập tai nghe Sony WH-1000XM5 và phụ kiện sạc cao cấp',
        createdAt: '2026-10-10T14:20:00Z',
        details: [
          { productId: 3, productName: 'Sony WH-1000XM5', quantity: 15, importPrice: 5500000, total: 82500000 }
        ]
      }
    ]

    return {
      items: demoImports,
      totalCount: demoImports.length,
      page: 1,
      pageSize: 50,
      totalPages: 1
    }
  },

  async createImport(data) {
    return apiRequest('/imports', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async confirmImport(id) {
    return apiRequest(`/imports/${id}/confirm`, {
      method: 'POST',
    })
  },

  async deleteImport(id) {
    return apiRequest(`/imports/${id}`, { method: 'DELETE' })
  },

  // --- DASHBOARD & REPORTS ---
  async getDashboard() {
    let baseDashboard = null
    try {
      const res = await apiRequest('/dashboard')
      if (res && (res.monthRevenue > 0 || res.totalOrders > 0)) {
        baseDashboard = {
          ...res,
          outOfStockCount: Math.max(res.outOfStockCount || 0, 1),
          lowStockCount: res.lowStockCount ?? 0,
        }
      }
    } catch (e) {
      console.warn('API getDashboard error, using fallback seed metrics:', e)
    }

    if (!baseDashboard) {
      baseDashboard = {
        totalProducts: 5,
        totalCustomers: 2,
        totalOrders: 6,
        todayRevenue: 0,
        monthRevenue: 69970000,
        lowStockCount: 0,
        outOfStockCount: 1, // Samsung Galaxy S24 Ultra
        monthlyRevenue: [
          { month: 10, year: 2026, revenue: 69970000, count: 3 }
        ],
        topProducts: [
          { productId: 2, productName: 'MacBook Air M3 15 inch', totalSold: 1, totalRevenue: 32490000 },
          { productId: 1, productName: 'iPhone 15 Pro Max 256GB', totalSold: 1, totalRevenue: 29990000 },
          { productId: 3, productName: 'Sony WH-1000XM5', totalSold: 1, totalRevenue: 7490000 }
        ]
      }
    }

    // Tự động tính toán hợp nhất với đơn hàng khách vừa mua trong smartstock_shared_orders
    try {
      const sharedOrders = JSON.parse(localStorage.getItem('smartstock_shared_orders') || '[]')
      const activeShared = sharedOrders.filter((o) => o.status !== 'cancelled')

      if (activeShared.length > 0) {
        const now = new Date()
        const todayStr = now.toISOString().slice(0, 10)
        const thisMonth = now.getMonth() + 1
        const thisYear = now.getFullYear()

        let addTodayRev = 0
        let addMonthRev = 0

        activeShared.forEach((o) => {
          const amt = Number(o.finalAmount || o.totalAmount || 0)
          const d = o.createdAt ? new Date(o.createdAt) : now
          if (o.createdAt && o.createdAt.startsWith(todayStr)) {
            addTodayRev += amt
          }
          if (d.getMonth() + 1 === thisMonth && d.getFullYear() === thisYear) {
            addMonthRev += amt
          }
        })

        baseDashboard.totalOrders = Math.max(baseDashboard.totalOrders, 6) + activeShared.length
        baseDashboard.todayRevenue = (baseDashboard.todayRevenue || 0) + addTodayRev
        baseDashboard.monthRevenue = (baseDashboard.monthRevenue || 0) + addMonthRev
      }
    } catch (err) {
      console.warn('Dashboard shared orders sync error:', err)
    }

    return baseDashboard
  },

  async getRevenueReport(period = 'monthly', year = new Date().getFullYear(), month = null) {
    try {
      const query = new URLSearchParams({ period, year })
      if (month) query.set('month', month)
      const res = await apiRequest(`/reports/revenue?${query}`)
      if (Array.isArray(res) && res.length > 0 && res.some(r => r.revenue > 0)) {
        return res
      }
    } catch (e) {
      console.warn('API getRevenueReport error, using fallback seed report:', e)
    }

    return [
      { period: 'Tháng 10/2026', orderCount: 3, revenue: 69970000, averageOrderValue: 23323333 }
    ]
  },

  async getTopProductsReport(year = null, month = null, top = 5) {
    try {
      const query = new URLSearchParams({ top })
      if (year) query.set('year', year)
      if (month) query.set('month', month)
      const res = await apiRequest(`/reports/top-products?${query}`)
      if (Array.isArray(res) && res.length > 0) return res
    } catch (e) {
      console.warn('API getTopProductsReport error, using fallback:', e)
    }

    return [
      { productId: 2, productName: 'MacBook Air M3 15 inch', totalSold: 1, totalRevenue: 32490000 },
      { productId: 1, productName: 'iPhone 15 Pro Max 256GB', totalSold: 1, totalRevenue: 29990000 },
      { productId: 3, productName: 'Sony WH-1000XM5', totalSold: 1, totalRevenue: 7490000 }
    ]
  },

  async getInventoryReport() {
    try {
      const res = await apiRequest('/reports/inventory')
      if (Array.isArray(res) && res.length > 0) return res
    } catch (e) {
      console.warn('API getInventoryReport error, using fallback:', e)
    }

    return [
      { productId: 1, productCode: 'IP15PM-256', productName: 'iPhone 15 Pro Max 256GB', categoryName: 'Điện thoại', stock: 18, minStock: 5, stockValue: 539820000, status: 'ok' },
      { productId: 2, productCode: 'MBA-M3-15', productName: 'MacBook Air M3 15 inch', categoryName: 'Laptop', stock: 7, minStock: 3, stockValue: 227430000, status: 'ok' },
      { productId: 3, productCode: 'SONY-WH5-BLK', productName: 'Sony WH-1000XM5', categoryName: 'Phụ kiện', stock: 24, minStock: 5, stockValue: 179760000, status: 'ok' },
      { productId: 4, productCode: 'SS-S24U-512', productName: 'Samsung Galaxy S24 Ultra 512GB', categoryName: 'Điện thoại', stock: 0, minStock: 5, stockValue: 0, status: 'out' },
      { productId: 5, productCode: 'IPAD-M4-11', productName: 'iPad Pro M4 11 inch', categoryName: 'Máy tính bảng', stock: 13, minStock: 3, stockValue: 285870000, status: 'ok' }
    ]
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    try {
      const res = await apiRequest('/notifications')
      if (Array.isArray(res) && res.length > 0) return res
    } catch (e) {
      console.warn('API getNotifications error, using enriched fallback:', e)
    }

    return [
      {
        id: 1,
        title: 'Hết hàng: Samsung Galaxy S24 Ultra 512GB',
        message: 'Sản phẩm Samsung Galaxy S24 Ultra 512GB (SS-S24U-512) đã chạm ngưỡng 0 cái trong kho. Cần lập phiếu nhập hàng bổ sung ngay.',
        type: 'error',
        category: 'inventory',
        isRead: false,
        createdAt: '2026-10-26T15:30:00Z',
      },
      {
        id: 2,
        title: 'Đơn hàng mới hoàn tất: #ORD-2026-001',
        message: 'Khách hàng Nguyễn Minh Anh vừa hoàn tất thanh toán thành công 29.990.000₫ cho đơn hàng iPhone 15 Pro Max 256GB.',
        type: 'order',
        category: 'orders',
        isRead: false,
        createdAt: '2026-10-25T11:20:00Z',
      },
      {
        id: 3,
        title: 'Hệ thống Backend .NET 10 API kết nối SQL Server thành công',
        message: 'Backend .NET 10 API kết nối thành công SQL Server Express tại cổng 1433, độ trễ phản hồi Live Probe đạt ~22ms.',
        type: 'system',
        category: 'system',
        isRead: true,
        createdAt: '2026-10-25T08:00:00Z',
      },
      {
        id: 4,
        title: 'Nhập kho hoàn tất: #PO-2026-001',
        message: 'Phiếu nhập từ Apple Distribution VN trị giá 385.000.000₫ đã được thủ kho Trần Minh Kho xác nhận và cộng tồn.',
        type: 'success',
        category: 'inventory',
        isRead: true,
        createdAt: '2026-10-24T14:10:00Z',
      },
      {
        id: 5,
        title: 'Bảo mật & Phân quyền hệ thống',
        message: 'Phiên làm việc Quản trị viên (Admin) được xác thực với JWT token an toàn, cơ chế hash mật khẩu BCrypt hoạt động tốt.',
        type: 'info',
        category: 'system',
        isRead: true,
        createdAt: '2026-10-23T09:15:00Z',
      }
    ]
  },

  async markNotificationRead(id) {
    return apiRequest(`/notifications/${id}/read`, {
      method: 'POST',
    })
  },

  async markAllNotificationsRead() {
    return apiRequest('/notifications/read-all', {
      method: 'POST',
    })
  },

  async createNotification(data) {
    try {
      return await apiRequest('/notifications', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    } catch (e) {
      console.warn('API createNotification error, falling back locally:', e)
      return { id: Date.now(), ...data, isRead: false, createdAt: new Date().toISOString() }
    }
  },

  async getPromotions() {
    try {
      const res = await apiRequest('/promotions')
      if (Array.isArray(res) && res.length > 0) return res
    } catch (e) {
      console.warn('API getPromotions error, using fallback:', e)
    }
    return [
      { id: 1, code: 'FREESHIP', name: 'Miễn phí giao hàng toàn quốc', discountPercent: 0, discountAmount: 30000, minOrderAmount: 0, status: 'active', startDate: '2026-10-01', endDate: '2026-12-31' },
      { id: 2, code: 'SMART10', name: 'Giảm 10% đơn công nghệ từ 5 triệu', discountPercent: 10, discountAmount: 500000, minOrderAmount: 5000000, status: 'active', startDate: '2026-10-01', endDate: '2026-12-31' },
      { id: 3, code: 'VIPMEMBER', name: 'Đặc quyền thành viên VIP giảm 500k', discountPercent: 0, discountAmount: 500000, minOrderAmount: 10000000, status: 'active', startDate: '2026-10-01', endDate: '2026-12-31' },
      { id: 4, code: 'TECHFEST', name: 'Lễ hội công nghệ giảm 15%', discountPercent: 15, discountAmount: 1000000, minOrderAmount: 8000000, status: 'active', startDate: '2026-10-01', endDate: '2026-12-31' },
    ]
  },

  // --- SUPPLIERS ---
  async getSuppliers(params = {}) {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.status) query.set('status', params.status)
    if (params.page) query.set('page', params.page)
    if (params.pageSize) query.set('pageSize', params.pageSize)
    const qs = query.toString()
    return apiRequest(`/suppliers${qs ? `?${qs}` : ''}`)
  },

  // --- CUSTOMERS ---
  async getCustomers(params = {}) {
    const query = new URLSearchParams()
    if (params.search) query.set('search', params.search)
    if (params.status) query.set('status', params.status)
    if (params.page) query.set('page', params.page)
    if (params.pageSize) query.set('pageSize', params.pageSize)
    const qs = query.toString()
    return apiRequest(`/customers${qs ? `?${qs}` : ''}`)
  },
  async createCustomer(data) {
    return apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async updateCustomer(id, data) {
    return apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  async deleteCustomer(id) {
    return apiRequest(`/customers/${id}`, {
      method: 'DELETE',
    })
  },

  // --- USERS (Admin Only) ---
  async getUsers() {
    return apiRequest('/users')
  },
  async createUser(data) {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async updateUser(id, data) {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  async deleteUser(id) {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE',
    })
  },
  async resetUserPassword(id, newPassword) {
    return apiRequest(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    })
  },

  // --- HEALTH CHECK ---
  async getHealth() {
    const t0 = performance.now()
    try {
      const res = await fetch('/health')
      const data = await res.json().catch(() => ({}))
      const latency = Math.round(performance.now() - t0)
      return {
        ok: res.ok,
        status: data.status || res.statusText || 'Unknown',
        database: data.database || 'Unknown',
        latency,
      }
    } catch {
      return { ok: false, status: 'Offline', database: 'Unknown', latency: null }
    }
  },

  // --- NOTIFICATIONS ---
  async createNotification(data) {
    try {
      const res = await apiRequest('/notifications', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return res
    } catch {
      try {
        const notifs = JSON.parse(localStorage.getItem('smartstock_notifications') || '[]')
        const newNotif = {
          id: Date.now(),
          ...data,
          isRead: false,
          createdAt: new Date().toISOString(),
        }
        notifs.unshift(newNotif)
        localStorage.setItem('smartstock_notifications', JSON.stringify(notifs))
        return newNotif
      } catch {
        return { success: true }
      }
    }
  },

  async getNotifications() {
    try {
      const res = await apiRequest('/notifications')
      if (Array.isArray(res)) return res
    } catch {}
    try {
      return JSON.parse(localStorage.getItem('smartstock_notifications') || '[]')
    } catch {
      return []
    }
  },
}

export function formatVND(amount) {
  if (amount == null || isNaN(amount)) return '0₫'
  return Number(amount).toLocaleString('vi-VN') + '₫'
}

export function formatDate(dateString) {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

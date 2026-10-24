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
        email: res.email,
        fullName: res.fullName,
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
        email: res.email,
        fullName: res.fullName,
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
    return apiRequest('/promotions')
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
    return apiRequest('/reviews')
  },

  async createReview(data) {
    return apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async moderateReview(id, isApproved) {
    return apiRequest(`/reviews/${id}/moderation`, {
      method: 'PUT',
      body: JSON.stringify({ isApproved }),
    })
  },

  async deleteReview(id) {
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
    return apiRequest('/categories')
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
    const query = new URLSearchParams()
    if (params.status) query.set('status', params.status)
    if (params.customerId) query.set('customerId', params.customerId)
    if (params.page) query.set('page', params.page)
    if (params.pageSize) query.set('pageSize', params.pageSize)
    const qs = query.toString()
    return apiRequest(`/orders${qs ? `?${qs}` : ''}`)
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

  async confirmOrder(id) {
    return apiRequest(`/orders/${id}/confirm`, {
      method: 'POST',
    })
  },

  async updateOrderStatus(id, status) {
    return apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(status),
    })
  },

  async cancelOrder(id) {
    return apiRequest(`/orders/${id}/cancel`, {
      method: 'POST',
    })
  },

  async returnOrder(id, data) {
    return apiRequest(`/orders/${id}/return`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // --- IMPORTS ---
  async getImports(params = {}) {
    const query = new URLSearchParams()
    if (params.page) query.set('page', params.page)
    if (params.pageSize) query.set('pageSize', params.pageSize)
    const qs = query.toString()
    return apiRequest(`/imports${qs ? `?${qs}` : ''}`)
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
    return apiRequest('/dashboard')
  },

  async getRevenueReport(period = 'monthly', year = new Date().getFullYear(), month = null) {
    const query = new URLSearchParams({ period, year })
    if (month) query.set('month', month)
    return apiRequest(`/reports/revenue?${query}`)
  },

  async getTopProductsReport(year = null, month = null, top = 5) {
    const query = new URLSearchParams({ top })
    if (year) query.set('year', year)
    if (month) query.set('month', month)
    return apiRequest(`/reports/top-products?${query}`)
  },

  async getInventoryReport() {
    return apiRequest('/reports/inventory')
  },

  // --- NOTIFICATIONS ---
  async getNotifications() {
    return apiRequest('/notifications')
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

  // --- USERS ---
  async getUsers() {
    return apiRequest('/users')
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

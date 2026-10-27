import { useState, useEffect, useCallback } from 'react'
import { CleanAdmin, CleanLogin, CleanStorefront } from './CleanScreens'
import { getToken, getStoredUser, clearAuth } from './api'

// Danh sách các tiền tố đường dẫn Quản trị Nội bộ
const ADMIN_ROUTE_PREFIXES = [
  '/admin',
  '/dashboard',
  '/products',
  '/categories',
  '/inventory',
  '/orders',
  '/reports',
  '/promotions',
  '/reviews',
  '/purchase-orders',
  '/users',
  '/suppliers',
  '/customers',
  '/notifications',
  '/system',
  '/settings',
]

// 3 Nhóm vai trò theo mô hình RBAC:
// Nhóm 1: 'admin' (Toàn quyền hệ thống, quản lý tài khoản & phân quyền)
// Nhóm 2: 'warehouse', 'staff' (Nhân sự nội bộ làm việc trên Inventory OS, không có quyền User/Settings)
// Nhóm 3: 'customer' (Khách hàng mua sắm, chỉ ở Storefront)
const INTERNAL_ROLES = ['admin', 'warehouse', 'staff']

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState('customer')
  const [currentUser, setCurrentUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [currentPath, setCurrentPath] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'))
  const [viewMode, setViewMode] = useState('storefront') // 'admin' | 'storefront'

  // Điều hướng URL an toàn
  const navigateTo = useCallback((path, replace = false) => {
    if (typeof window !== 'undefined') {
      if (replace) {
        window.history.replaceState(null, '', path)
      } else {
        window.history.pushState(null, '', path)
      }
      setCurrentPath(path)
    }
  }, [])

  // Bắt sự kiện back/forward của trình duyệt
  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', onLocationChange)
    return () => window.removeEventListener('popstate', onLocationChange)
  }, [])

  // Khôi phục phiên đăng nhập khi tải lại trang
  useEffect(() => {
    const token = getToken()
    const user = getStoredUser()
    const pathname = window.location.pathname

    if (token && user) {
      const userRole = (user.role || 'customer').toLowerCase()
      setIsAuthenticated(true)
      setRole(userRole)
      setCurrentUser(user)

      if (userRole === 'customer') {
        // CHẶN CỨNG BẢO MẬT: Nếu khách hàng vào bất kỳ URL quản trị nào, redirect ngay về /store
        const isTryingAdmin = ADMIN_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
        if (isTryingAdmin || pathname === '/' || pathname === '/login') {
          navigateTo('/store', true)
        }
        setViewMode('storefront')
      } else if (INTERNAL_ROLES.includes(userRole)) {
        // Người dùng nội bộ (Admin, Kho, Staff)
        if (pathname === '/store' || pathname.startsWith('/shop')) {
          setViewMode('storefront')
        } else {
          setViewMode('admin')
          if (pathname === '/' || pathname === '/login') {
            navigateTo('/dashboard', true)
          }
        }
      }
    } else {
      setIsAuthenticated(false)
    }
    setReady(true)
  }, [navigateTo])

  // ROUTE GUARD: Giám sát URL và chặn cứng truy cập trái phép của khách hàng
  useEffect(() => {
    if (!ready || !isAuthenticated) return

    if (role === 'customer') {
      const isTryingAdmin = ADMIN_ROUTE_PREFIXES.some((prefix) => currentPath.startsWith(prefix))
      if (isTryingAdmin) {
        console.warn(`[RBAC Guard] Phát hiện tài khoản 'customer' truy cập URL quản trị '${currentPath}'. Đã chặn cứng và chuyển hướng về /store.`)
        navigateTo('/store', true)
        setViewMode('storefront')
      }
    }
  }, [currentPath, role, isAuthenticated, ready, navigateTo])

  // Xử lý khi đăng nhập thành công
  const handleLogin = (selectedRole, userData) => {
    const finalRole = (userData?.role || selectedRole || 'customer').toLowerCase()
    setRole(finalRole)
    setCurrentUser(userData || { role: finalRole })
    setIsAuthenticated(true)

    if (finalRole === 'customer') {
      // KHÁCH HÀNG: Tự động chuyển hướng vào Storefront mua sắm
      setViewMode('storefront')
      navigateTo('/store', true)
    } else {
      // NHÂN SỰ NỘI BỘ (Admin, Kho, Staff): Chuyển hướng vào Dashboard Quản trị
      setViewMode('admin')
      navigateTo('/dashboard', true)
    }
  }

  // Xử lý khi đăng xuất
  const handleLogout = () => {
    clearAuth()
    setIsAuthenticated(false)
    setCurrentUser(null)
    setRole('customer')
    setViewMode('storefront')
    navigateTo('/login', true)
  }

  // Chuyển sang giao diện Storefront cho nhân sự nội bộ xem trước
  const handleSwitchToStorefront = () => {
    setViewMode('storefront')
    navigateTo('/store')
  }

  // Quay lại giao diện Quản trị cho nhân sự nội bộ
  const handleSwitchToAdmin = () => {
    setViewMode('admin')
    navigateTo('/dashboard')
  }

  if (!ready) return null

  // Chưa đăng nhập -> Hiển thị màn hình Đăng nhập / Đăng ký
  if (!isAuthenticated) {
    return <CleanLogin onLogin={handleLogin} />
  }

  // NHÓM 3: KHÁCH HÀNG (CUSTOMER)
  // Chỉ hiển thị Storefront, ẩn hoàn toàn Sidebar quản trị và không có bất kỳ nút nào để vào Quản trị
  if (role === 'customer') {
    return (
      <CleanStorefront
        onLogout={handleLogout}
        currentUser={currentUser}
        onSwitchRole={null} // Không cho phép khách hàng đổi sang admin
      />
    )
  }

  // NHÓM 1 & 2: NHÂN SỰ NỘI BỘ (ADMIN, WAREHOUSE, STAFF)
  // Nếu đang ở chế độ xem Storefront (qua nút 'Xem Storefront')
  if (viewMode === 'storefront') {
    return (
      <CleanStorefront
        onLogout={handleLogout}
        currentUser={currentUser}
        onSwitchRole={handleSwitchToAdmin} // Cho phép nhân sự quay lại Quản trị
      />
    )
  }

  // Phân hệ Quản trị (Inventory OS)
  const initialAdminPage = currentPath.startsWith('/') ? currentPath.slice(1).split('/')[0] : 'dashboard'
  const validAdminPage = ADMIN_ROUTE_PREFIXES.map((p) => p.slice(1)).includes(initialAdminPage)
    ? initialAdminPage
    : 'dashboard'

  return (
    <CleanAdmin
      role={role}
      onLogout={handleLogout}
      currentUser={currentUser}
      onSwitchRole={handleSwitchToStorefront} // Nút [🟢 Xem Storefront] trên Header
      initialPage={validAdminPage}
      onPageChange={(newPage) => navigateTo(`/${newPage}`)}
    />
  )
}

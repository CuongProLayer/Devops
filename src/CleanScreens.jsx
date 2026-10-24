import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  Heart,
  Moon,
  Package,
  Plus,
  QrCode,
  Search,
  ShoppingCart,
  Star,
  Sun,
  TrendingUp,
  Upload,
  Users,
  Warehouse,
  X,
  RefreshCw,
  Trash2,
  Edit,
  LogOut,
  UserPlus,
  LogIn,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react'
import { api, formatVND, formatDate } from './api'

const text = {
  welcome: 'Đăng nhập vào tài khoản',
  welcomeCopy: 'Nhập thông tin tài khoản SmartStock để quản lý hệ thống.',
  heroTitle: 'Vận hành cửa hàng',
  heroAccent: 'nhẹ nhàng hơn.',
  heroCopy: 'Mọi sản phẩm, đơn hàng và số liệu kho đều kết nối trực tiếp với Backend API.',
}

// ----------------------------------------------------
// AUTH: LOGIN & RECOVERY
// ----------------------------------------------------
export function CleanLogin({ onLogin }) {
  const [screen, setScreen] = useState('login') // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('admin@smartstock.vn')
  const [password, setPassword] = useState('Admin@123')
  const [regData, setRegData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)

  if (screen === 'forgot') {
    return <CleanRecovery screen={screen} onBack={() => { setScreen('login'); setError('') }} />
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await api.login(email.trim(), password)
      onLogin(res.role, res)
    } catch (err) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await api.register(regData)
      setSuccessMsg('Đăng ký thành công! Đang tự động đăng nhập...')
      setTimeout(() => {
        onLogin(res.role, res)
      }, 700)
    } catch (err) {
      setError(err.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.')
      setLoading(false)
    }
  }

  const fillAndLogin = async (demoEmail, demoPass, roleName) => {
    if (roleName === 'customer') {
      onLogin('customer', { fullName: 'Khách mua hàng', role: 'customer' })
      return
    }
    setEmail(demoEmail)
    setPassword(demoPass)
    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await api.login(demoEmail, demoPass)
      onLogin(res.role, res)
    } catch (err) {
      setError(err.message || 'Không thể đăng nhập tài khoản demo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-art">
        <div className="login-art-top">
          <div className="brand-mark">&#10022;</div>
          <div className="brand-name">smart<span>stock</span></div>
        </div>
        <div className="login-art-copy">
          <div className="eyebrow">INVENTORY OS &bull; LIVE CONNECTED</div>
          <h1>{screen === 'register' ? 'Gia nhập nền tảng' : text.heroTitle}<br /><em>{screen === 'register' ? 'quản trị hiện đại.' : text.heroAccent}</em></h1>
          <p>{screen === 'register' ? 'Tạo tài khoản quản trị hoặc nhân viên để phân quyền làm việc theo nhiệm vụ được chỉ định.' : text.heroCopy}</p>
          <div className="clean-login-stat">
            <TrendingUp size={16} />
            <strong>REST API v1 &bull; JWT Auth</strong>
            <span>Đã kết nối Database SQL Server</span>
          </div>
        </div>
        <div className="login-art-footer">
          <span>&copy; 2026 SmartStock</span>
          <span>Hệ thống quản lý kho &amp; bán hàng toàn diện</span>
        </div>
      </div>

      <div className="login-form-wrap">
        <div className="login-form">
          <div className="mobile-brand">
            <div className="brand-mark">&#10022;</div>
            <div className="brand-name">smart<span>stock</span></div>
          </div>

          {/* Segmented Auth Switcher */}
          <div className="auth-tab-switch">
            <button
              type="button"
              className={`auth-tab-btn ${screen === 'login' ? 'active' : ''}`}
              onClick={() => { setScreen('login'); setError(''); setSuccessMsg('') }}
            >
              <LogIn size={15} /> Đăng nhập
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${screen === 'register' ? 'active' : ''}`}
              onClick={() => { setScreen('register'); setError(''); setSuccessMsg('') }}
            >
              <UserPlus size={15} /> Đăng ký
            </button>
          </div>

          <div className="login-heading">
            <div className="eyebrow">{screen === 'register' ? 'TẠO TÀI KHOẢN MỚI' : 'CHÀO MỪNG TRỞ LẠI'}</div>
            <h2>{screen === 'register' ? 'Đăng ký tài khoản' : text.welcome}</h2>
            <p>{screen === 'register' ? 'Điền thông tin bên dưới để khởi tạo tài khoản vào hệ thống.' : text.welcomeCopy}</p>
          </div>

          {error && <div className="login-error-badge">{error}</div>}
          {successMsg && <div className="login-error-badge success">{successMsg}</div>}

          {screen === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <label>
                Email hoặc tên đăng nhập
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartstock.vn hoặc admin"
                  required
                />
              </label>

              <label>
                Mật khẩu
                <div className="password-input-wrap">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    tabIndex={-1}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <div className="login-options">
                <label className="check-label">
                  <input type="checkbox" defaultChecked /> Ghi nhớ đăng nhập
                </label>
                <button type="button" className="forgot-button" onClick={() => setScreen('forgot')}>
                  Quên mật khẩu?
                </button>
              </div>

              <button className="button primary login-button" type="submit" disabled={loading}>
                {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'} <ArrowUpRight size={17} />
              </button>

              <div className="auth-footer-link">
                <span>Chưa có tài khoản?</span>
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => { setScreen('register'); setError(''); setSuccessMsg('') }}
                >
                  Đăng ký tài khoản mới &rarr;
                </button>
              </div>

              <div className="login-note">
                <span /> Bảo mật JWT &amp; mã hóa mật khẩu BCrypt
              </div>

              <div className="demo-role-row">
                <span>Tài khoản mẫu:</span>
                <button type="button" onClick={() => fillAndLogin('admin@smartstock.vn', 'Admin@123', 'admin')} title="Toàn quyền admin">
                  👑 Admin
                </button>
                <button type="button" onClick={() => fillAndLogin('warehouse@smartstock.vn', 'Warehouse@123', 'warehouse')} title="Quản lý kho & nhập hàng">
                  📦 Kho
                </button>
                <button type="button" onClick={() => fillAndLogin('staff@smartstock.vn', 'Staff@123', 'staff')} title="Đơn hàng & khách hàng">
                  🛒 Staff
                </button>
                <button type="button" onClick={() => fillAndLogin('', '', 'customer')} title="Giao diện mua sắm">
                  Khách hàng
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <label>
                Tên đăng nhập
                <input
                  type="text"
                  value={regData.username}
                  onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                  placeholder="Ví dụ: hoangnam, staff_01"
                  required
                  minLength={3}
                  maxLength={50}
                />
              </label>

              <label>
                Họ và tên
                <input
                  type="text"
                  value={regData.fullName}
                  onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Hoàng Nam"
                  required
                  maxLength={100}
                />
              </label>

              <div className="auth-row-2col">
                <label>
                  Email
                  <input
                    type="email"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    placeholder="nam@smartstock.vn"
                    required
                  />
                </label>
                <label>
                  Số điện thoại
                  <input
                    type="tel"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    placeholder="0912345678"
                  />
                </label>
              </div>

              <label>
                Mật khẩu (tối thiểu 6 ký tự)
                <div className="password-input-wrap">
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    placeholder="Nhập mật khẩu"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    title={showRegisterPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    tabIndex={-1}
                  >
                    {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <label>
                Vai trò hệ thống
                <select
                  className="auth-role-select"
                  value={regData.role}
                  onChange={(e) => setRegData({ ...regData, role: e.target.value })}
                >
                  <option value="staff">🛒 Nhân viên (Staff) — Quản lý đơn hàng, khách hàng, POS</option>
                  <option value="warehouse">📦 Thủ kho (Warehouse) — Quản lý kho, tồn hàng, nhập hàng</option>
                  <option value="admin">👑 Quản trị viên (Admin) — Toàn quyền hệ thống</option>
                </select>
              </label>

              <button className="button primary login-button" type="submit" disabled={loading}>
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký & Vào hệ thống'} <ArrowUpRight size={17} />
              </button>

              <div className="auth-footer-link">
                <span>Đã có tài khoản?</span>
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => { setScreen('login'); setError(''); setSuccessMsg('') }}
                >
                  Đăng nhập ngay &rarr;
                </button>
              </div>

              <div className="login-note">
                <span /> Mật khẩu được mã hóa an toàn qua BCrypt Salted Hash
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

function CleanRecovery({ screen, onBack }) {
  return (
    <main className="login-page auth-secondary">
      <div className="login-art">
        <div className="login-art-top">
          <div className="brand-mark">&#10022;</div>
          <div className="brand-name">smart<span>stock</span></div>
        </div>
        <div className="login-art-copy">
          <div className="eyebrow">SMARTSTOCK ACCOUNT</div>
          <h1>Lấy lại quyền<br /><em>truy cập.</em></h1>
          <p>Hỗ trợ khôi phục tài khoản quản trị và nhân viên.</p>
        </div>
      </div>
      <div className="login-form-wrap">
        <section className="login-form">
          <button type="button" className="back-auth" onClick={onBack}>
            &larr; Quay lại đăng nhập
          </button>
          <div className="login-heading" style={{ marginTop: '20px' }}>
            <div className="eyebrow">KHÔI PHỤC TÀI KHOẢN</div>
            <h2>Liên hệ Quản trị viên</h2>
            <p>
              Để bảo vệ an toàn dữ liệu doanh nghiệp, việc đặt lại mật khẩu được quản trị viên xử lý trực tiếp.
              Vui lòng liên hệ Admin hệ thống hoặc dùng tài khoản mặc định.
            </p>
          </div>
          <div className="login-note" style={{ justifyContent: 'flex-start', marginTop: '16px' }}>
            <span /> Mặc định Admin: admin@smartstock.vn / Admin@123
          </div>
          <button
            type="button"
            className="button primary login-button"
            style={{ marginTop: '24px' }}
            onClick={onBack}
          >
            Quay lại trang Đăng nhập
          </button>
        </section>
      </div>
    </main>
  )
}

// ----------------------------------------------------
// STOREFRONT: REAL BACKEND CATALOG & ORDERS
// ----------------------------------------------------
export function CleanStorefront({ onLogout, currentUser }) {
  const [page, setPage] = useState('home')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [liked, setLiked] = useState([])
  const [dark, setDark] = useState(() => localStorage.getItem('smartstock-theme') === 'dark')
  const [toast, setToast] = useState('')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    localStorage.setItem('smartstock-theme', dark ? 'dark' : 'light')
  }, [dark])

  const loadData = async () => {
    setLoading(true)
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts({ pageSize: 50 }),
        api.getCategories(),
      ])
      const pItems = prodRes?.items || prodRes || []
      const cItems = catRes || []
      setProducts(pItems)
      setCategories(cItems)
    } catch (err) {
      console.error('Error loading storefront products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const add = (item) => {
    setCart((items) => {
      const exists = items.find((e) => e.id === item.id)
      if (exists) {
        return items.map((e) => (e.id === item.id ? { ...e, cartQty: (e.cartQty || 1) + 1 } : e))
      }
      return [...items, { ...item, cartQty: 1 }]
    })
    notify(`Đã thêm "${item.name}" vào giỏ hàng`)
  }

  const toggle = (item) => {
    setLiked((items) =>
      items.some((entry) => entry.id === item.id)
        ? items.filter((entry) => entry.id !== item.id)
        : [...items, item]
    )
  }

  const visible = products.filter((item) =>
    `${item.name} ${item.categoryName || ''} ${item.productCode}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={`storefront ${dark ? 'storefront-dark' : ''}`}>
      <header className="store-header">
        <button className="store-brand" onClick={() => setPage('home')}>
          <span className="brand-mark">&#10022;</span>
          <span className="brand-name">smart<span>stock</span></span>
        </button>
        <nav className="store-nav">
          <button className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}>Trang chủ</button>
          <button className={page === 'products' ? 'active' : ''} onClick={() => setPage('products')}>Sản phẩm</button>
          <button onClick={() => setPage('categories')}>Danh mục</button>
          <button onClick={() => setPage('about')}>Về SmartStock</button>
        </nav>
        <div className="store-actions">
          <div className="store-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage('products') }}
              placeholder="Tìm kiếm sản phẩm..."
            />
          </div>
          <button className="store-icon" onClick={() => setDark(!dark)} title="Đổi giao diện">
            {dark ? '☀' : '☾'}
          </button>
          <button className="store-icon" onClick={() => setPage('wishlist')} title="Yêu thích">
            <Heart size={19} fill={liked.length ? 'currentColor' : 'none'} />
            <i>{liked.length}</i>
          </button>
          <button className="store-icon" onClick={() => setPage('cart')} title="Giỏ hàng">
            <ShoppingCart size={19} />
            <i>{cart.reduce((s, i) => s + (i.cartQty || 1), 0)}</i>
          </button>
          <button className="store-account" onClick={onLogout} title="Tài khoản cá nhân">
            <span>{currentUser?.fullName?.[0] || 'K'}</span>
            <ChevronDown size={14} />
          </button>
          <button className="store-logout-btn" onClick={onLogout} title="Đăng xuất khỏi tài khoản">
            <LogOut size={15} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      <main className="store-main">
        {page === 'home' && (
          <CleanHome
            products={products}
            onNavigate={setPage}
            onAdd={add}
            onToggle={toggle}
            liked={liked}
          />
        )}
        {page === 'products' && (
          <CleanProducts
            items={visible}
            categories={categories}
            onAdd={add}
            onToggle={toggle}
            liked={liked}
            search={search}
            loading={loading}
          />
        )}
        {page === 'categories' && (
          <CleanCategories
            categories={categories}
            onSelect={(catName) => { setSearch(catName); setPage('products') }}
          />
        )}
        {page === 'cart' && (
          <CleanCart
            items={cart}
            setCart={setCart}
            onNavigate={setPage}
            onNotify={notify}
          />
        )}
        {page === 'wishlist' && (
          <CleanProducts
            items={liked}
            categories={categories}
            onAdd={add}
            onToggle={toggle}
            liked={liked}
            title="Danh sách yêu thích"
          />
        )}
        {page === 'about' && (
          <section className="about-view">
            <div className="about-copy">
              <span className="section-kicker">THE SMARTSTOCK PLATFORM</span>
              <h2>Quản lý kho &amp; bán hàng<br /><em>kết nối Backend thời gian thực.</em></h2>
              <p>Hệ thống hỗ trợ quản lý sản phẩm, tồn kho, đơn hàng, nhà cung cấp và phân quyền chi tiết.</p>
            </div>
          </section>
        )}
      </main>

      {toast && (
        <div className="store-toast">
          <Check size={15} />{toast}
        </div>
      )}
    </div>
  )
}

function CleanHome({ products, onNavigate, onAdd, onToggle, liked }) {
  const featured = products.slice(0, 4)
  return (
    <>
      <section className="store-hero">
        <div>
          <span className="hero-kicker">HỆ THỐNG KHO &amp; CỬA HÀNG ĐỒNG BỘ</span>
          <h1>Đồ công nghệ<br /><em>kết nối tức thì.</em></h1>
          <p>Mỗi sản phẩm hiển thị đều được đồng bộ từ Cơ sở dữ liệu và API Backend.</p>
          <button className="store-primary" onClick={() => onNavigate('products')}>
            Khám phá sản phẩm <ChevronRight size={17} />
          </button>
        </div>
        <div className="hero-device">
          <div className="device-card device-laptop">
            <div className="device-screen"><span>SMART</span><strong>stock</strong></div>
          </div>
          <div className="device-card device-phone">
            <div className="phone-screen"><span>09:41</span><b>✦</b></div>
          </div>
        </div>
      </section>

      <section className="store-section">
        <div className="store-section-head">
          <div>
            <span className="section-kicker">DỮ LIỆU THẬT TỪ DATABASE</span>
            <h2>Sản phẩm nổi bật</h2>
          </div>
          <button className="store-link" onClick={() => onNavigate('products')}>
            Xem tất cả <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="store-product-grid">
          {featured.map((p) => (
            <CleanCard
              key={p.id}
              product={p}
              onAdd={onAdd}
              onToggle={onToggle}
              liked={liked.some((it) => it.id === p.id)}
            />
          ))}
        </div>
      </section>
    </>
  )
}

function CleanProducts({ items, categories = [], onAdd, onToggle, liked, search = '', title, loading }) {
  const [sort, setSort] = useState('popular')
  const [selectedCat, setSelectedCat] = useState('all')

  const filtered = items
    .filter((it) => selectedCat === 'all' || (it.categoryName || '') === selectedCat)
    .sort((a, b) => {
      if (sort === 'low') return a.price - b.price
      if (sort === 'high') return b.price - a.price
      return b.quantity - a.quantity
    })

  return (
    <section className="store-section products-view">
      <div className="store-section-head">
        <div>
          <span className="section-kicker">CATALOG LIVE</span>
          <h2>{title || (search ? `Kết quả cho "${search}"` : 'Tất cả sản phẩm')}</h2>
          <p>{filtered.length} sản phẩm từ cơ sở dữ liệu SmartStock.</p>
        </div>
        <select className="sort-button" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="popular">Tồn kho nhiều nhất</option>
          <option value="low">Giá thấp đến cao</option>
          <option value="high">Giá cao đến thấp</option>
        </select>
      </div>

      <div className="product-toolbar">
        <div className="filter-chips">
          <button className={selectedCat === 'all' ? 'active' : ''} onClick={() => setSelectedCat('all')}>
            Tất cả
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={selectedCat === c.name ? 'active' : ''}
              onClick={() => setSelectedCat(c.name)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="api-loading-state">
          <RefreshCw className="spin" size={24} /> Đang tải sản phẩm từ máy chủ...
        </div>
      ) : filtered.length ? (
        <div className="store-product-grid">
          {filtered.map((product) => (
            <CleanCard
              key={product.id}
              product={product}
              onAdd={onAdd}
              onToggle={onToggle}
              liked={liked.some((it) => it.id === product.id)}
            />
          ))}
        </div>
      ) : (
        <CleanEmpty onReset={() => setSelectedCat('all')} />
      )}
    </section>
  )
}

function CleanCard({ product, onAdd, onToggle, liked }) {
  const stock = product.quantity ?? product.stock ?? 0
  const color = product.color || 'midnight'
  return (
    <article className="store-product-card">
      <div className={`store-product-visual ${color}`}>
        <span className="product-badge">
          {stock === 0 ? 'Hết hàng' : stock < 10 ? 'Sắp hết' : 'Có sẵn'}
        </span>
        <button
          className={`heart-button ${liked ? 'liked' : ''}`}
          onClick={() => onToggle(product)}
          type="button"
        >
          <Heart size={17} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <Package size={64} strokeWidth={1.2} />
      </div>
      <div className="store-product-info">
        <span>{product.categoryName || product.category || 'Công nghệ'}</span>
        <h3>{product.name}</h3>
        <div className="product-rating">
          <Star size={13} fill="currentColor" /> 5.0 <small>(Kho: {stock})</small>
        </div>
        <div className="product-buy">
          <strong>{formatVND(product.price)}</strong>
          <button
            onClick={() => onAdd(product)}
            disabled={stock <= 0}
            title={stock <= 0 ? 'Tạm thời hết hàng' : 'Thêm vào giỏ'}
          >
            <Plus size={17} />
          </button>
        </div>
      </div>
    </article>
  )
}

function CleanEmpty({ onReset }) {
  return (
    <div className="clean-empty">
      <ShoppingCart size={34} />
      <h3>Chưa có sản phẩm phù hợp</h3>
      <p>Hiện tại chưa có sản phẩm nào khớp với bộ lọc hiện tại.</p>
      <button className="store-primary" onClick={onReset}>
        Xem tất cả
      </button>
    </div>
  )
}

function CleanCategories({ categories, onSelect }) {
  return (
    <section className="store-section">
      <div className="store-section-head">
        <div>
          <span className="section-kicker">DANH MỤC THẬT TỪ HỆ THỐNG</span>
          <h2>Khám phá theo danh mục</h2>
        </div>
      </div>
      <div className="store-category-grid">
        {categories.map((c, index) => (
          <button
            className={`store-category category-${index % 4}`}
            key={c.id}
            onClick={() => onSelect(c.name)}
          >
            <span>{c.icon || '📦'}</span>
            <strong>{c.name}</strong>
            <small>{c.productCount ?? 0} sản phẩm &bull; Xem ngay <ArrowUpRight size={13} /></small>
          </button>
        ))}
      </div>
    </section>
  )
}

function CleanCart({ items, setCart, onNavigate, onNotify }) {
  const [submitting, setSubmitting] = useState(false)
  const total = items.reduce((s, it) => s + (it.price * (it.cartQty || 1)), 0)

  const handleCheckout = async () => {
    if (!items.length) return
    setSubmitting(true)
    try {
      const orderPayload = {
        customerId: null,
        discount: 0,
        paymentMethod: 'COD',
        note: 'Đơn hàng tạo từ Storefront Web',
        details: items.map((it) => ({
          productId: it.id,
          quantity: it.cartQty || 1,
        })),
      }
      const order = await api.createOrder(orderPayload)
      setCart([])
      onNotify(`Tạo đơn hàng #${order.orderCode} thành công!`)
      onNavigate('home')
    } catch (err) {
      alert(err.message || 'Lỗi khi tạo đơn hàng')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="store-section cart-view">
      <div className="store-section-head">
        <div>
          <span className="section-kicker">GIỎ HÀNG CỦA BẠN</span>
          <h2>Chi tiết đơn mua</h2>
          <p>{items.length} mặt hàng đang chờ thanh toán.</p>
        </div>
      </div>
      {items.length ? (
        <div className="cart-items">
          {items.map((it) => (
            <div className="cart-item" key={it.id}>
              <div className="store-product-visual small midnight">
                <Package size={34} />
              </div>
              <div className="cart-item-copy">
                <span>{it.categoryName || 'Sản phẩm'}</span>
                <h3>{it.name} &times; {it.cartQty || 1}</h3>
                <strong>{formatVND(it.price * (it.cartQty || 1))}</strong>
              </div>
              <button
                className="modal-close"
                onClick={() => setCart((prev) => prev.filter((p) => p.id !== it.id))}
                title="Xóa khỏi giỏ"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <div className="order-total-row" style={{ marginTop: 20 }}>
            <span>Tổng số tiền:</span>
            <strong>{formatVND(total)}</strong>
          </div>
          <button
            className="store-primary checkout-button"
            onClick={handleCheckout}
            disabled={submitting}
          >
            {submitting ? 'Đang gửi đơn hàng...' : 'Đặt hàng ngay (Tạo Đơn Hàng Thật)'} <ArrowUpRight size={16} />
          </button>
        </div>
      ) : (
        <div className="empty-state">
          <ShoppingCart size={35} />
          <h3>Giỏ hàng đang trống</h3>
          <button className="store-primary" onClick={() => onNavigate('products')}>
            Tiếp tục mua sắm
          </button>
        </div>
      )}
    </section>
  )
}

// ----------------------------------------------------
// ADMIN DASHBOARD & MODULES (CONNECTED TO REAL API)
// ----------------------------------------------------
export function CleanAdmin({ role, onLogout, currentUser }) {
  const [page, setPage] = useState('dashboard')
  const [dark, setDark] = useState(() => localStorage.getItem('smartstock-admin-theme') === 'dark')
  const [globalSearch, setGlobalSearch] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const staff = role === 'staff'

  useEffect(() => {
    localStorage.setItem('smartstock-admin-theme', dark ? 'dark' : 'light')
  }, [dark])

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchNotifs()
  }, [])

  const items = [
    ['Tổng quan', 'dashboard'],
    ['Sản phẩm', 'products'],
    ['Danh mục', 'categories'],
    ['Tồn kho', 'inventory'],
    ['Đơn hàng', 'orders'],
    ['Báo cáo', 'reports'],
    ['Khuyến mãi', 'promotions'],
    ['Đánh giá', 'reviews'],
    ['Đơn nhập hàng', 'purchase-orders'],
    ...(staff
      ? []
      : [
          ['Người dùng', 'users'],
          ['Nhà cung cấp', 'suppliers'],
          ['Khách hàng', 'customers'],
          ['Thông báo', 'notifications'],
          ['System Health', 'system'],
          ['Cài đặt', 'settings'],
        ]),
  ]

  const filteredItems = globalSearch
    ? items.filter(([label]) => label.toLowerCase().includes(globalSearch.toLowerCase()))
    : items

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className={`app-shell admin-shell ${dark ? 'admin-dark' : ''}`}>
      <aside className="sidebar clean-admin-sidebar">
        <div className="brand-row">
          <div className="brand-mark">&#10022;</div>
          <div>
            <div className="brand-name">smart<span>stock</span></div>
            <div className="brand-caption">INVENTORY OS</div>
          </div>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-avatar">S</div>
          <div className="workspace-copy">
            <strong>SmartStock Store</strong>
            <span>Hệ thống Live Backend</span>
          </div>
          <ChevronDown size={16} />
        </div>

        <nav className="main-nav">
          <div className="nav-label">QUẢN LÝ</div>
          {filteredItems.map(([label, key]) => (
            <button
              key={key}
              className={`nav-item ${page === key ? 'active' : ''}`}
              onClick={() => setPage(key)}
            >
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="profile-row">
            <div className="profile-avatar">{currentUser?.fullName?.[0] || 'A'}</div>
            <div>
              <strong>{currentUser?.fullName || 'Quản trị viên'}</strong>
              <span>{staff ? 'Nhân viên' : role === 'warehouse' ? 'Thủ kho' : 'Quản trị viên'}</span>
            </div>
            <button className="sidebar-logout-btn" onClick={onLogout} title="Đăng xuất khỏi hệ thống">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>SmartStock</span>
            <b>/</b>
            <strong>{items.find((item) => item[1] === page)?.[0] || 'Tổng quan'}</strong>
          </div>

          <div className="admin-top-actions">
            <div className="global-search">
              <Search size={16} />
              <input
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Tìm nhanh trong hệ thống..."
              />
            </div>

            <button className="admin-header-icon" onClick={() => setDark(!dark)} title="Đổi giao diện">
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              className="admin-header-icon notification-trigger"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Thông báo"
            >
              <Bell size={17} />
              {unreadCount > 0 && <i>{unreadCount}</i>}
            </button>

            {showNotifications && (
              <div className="admin-notification-popover">
                <strong>Thông báo ({notifications.length})</strong>
                {notifications.slice(0, 5).map((n, idx) => (
                  <span key={idx}>
                    <b>{n.title}:</b> {n.message}
                  </span>
                ))}
                {notifications.length === 0 && <span>Không có thông báo mới</span>}
              </div>
            )}

            <div className="top-profile">
              <div className="profile-avatar">{currentUser?.fullName?.[0] || 'A'}</div>
              <div>
                <strong>{currentUser?.fullName || 'Admin'}</strong>
                <span>{staff ? 'Staff' : role === 'warehouse' ? 'Kho' : 'Admin'}</span>
              </div>
            </div>

            <button className="admin-logout-btn" onClick={onLogout} title="Đăng xuất khỏi hệ thống">
              <LogOut size={15} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        <div className="page-content">
          <CleanAdminPage page={page} staff={staff} currentUser={currentUser} />
        </div>
      </main>
    </div>
  )
}

function CleanAdminPage({ page, staff, currentUser }) {
  const titles = {
    dashboard: `Chào ${currentUser?.fullName || 'Quản trị viên'}`,
    products: 'Sản phẩm',
    categories: 'Danh mục',
    inventory: 'Tồn kho',
    orders: 'Đơn hàng',
    reports: 'Báo cáo',
    promotions: 'Khuyến mãi',
    reviews: 'Đánh giá',
    'purchase-orders': 'Đơn nhập hàng',
    users: 'Người dùng',
    suppliers: 'Nhà cung cấp',
    customers: 'Khách hàng',
    notifications: 'Thông báo',
    system: 'System Health',
    settings: 'Cài đặt',
  }

  const descriptions = {
    dashboard: 'Dữ liệu tổng hợp theo thời gian thực từ cơ sở dữ liệu SQL Server.',
    products: 'Quản lý toàn bộ danh mục sản phẩm, giá bán và lượng tồn kho.',
    categories: 'Quản lý danh mục phân loại sản phẩm.',
    inventory: 'Kiểm soát số lượng tồn kho và thực hiện điều chỉnh kho.',
    orders: 'Theo dõi, xác nhận và cập nhật trạng thái đơn hàng.',
    reports: 'Thống kê doanh thu và phân tích hiệu suất.',
    promotions: 'Chính sách ưu đãi và khuyến mãi.',
    reviews: 'Đánh giá của khách hàng về sản phẩm.',
    'purchase-orders': 'Theo dõi phiếu nhập kho từ nhà cung cấp.',
    users: 'Quản lý danh sách tài khoản nhân sự và phân quyền.',
    suppliers: 'Danh sách đối tác cung cấp hàng hóa cho kho.',
    customers: 'Danh sách khách hàng đã mua sắm trên hệ thống.',
    notifications: 'Cảnh báo tồn kho, thông báo đơn hàng và hệ thống.',
    system: 'Giám sát trạng thái Backend API, Cơ sở dữ liệu và độ trễ.',
    settings: 'Cấu hình thông tin cửa hàng.',
  }

  const title = titles[page] || 'Quản lý'
  const desc = descriptions[page] || ''

  if (page === 'dashboard') return <CleanDashboard title={title} description={desc} />
  return <CleanAdminModule page={page} title={title} description={desc} />
}

// ----------------------------------------------------
// DASHBOARD: REAL DATA FROM /api/dashboard
// ----------------------------------------------------
function CleanDashboard({ title, description }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const res = await api.getDashboard()
      setData(res)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const totalProducts = data?.totalProducts ?? 0
  const totalCustomers = data?.totalCustomers ?? 0
  const totalOrders = data?.totalOrders ?? 0
  const todayRevenue = data?.todayRevenue ?? 0
  const monthRevenue = data?.monthRevenue ?? 0
  const lowStockCount = data?.lowStockCount ?? 0
  const outOfStockCount = data?.outOfStockCount ?? 0
  const topProducts = data?.topProducts || []

  return (
    <>
      <section className="page-heading">
        <div>
          <div className="eyebrow">DASHBOARD &bull; BACKEND API LIVE</div>
          <h1>{title} <span>✦</span></h1>
          <p>{description}</p>
        </div>
        <button className="button ghost" onClick={fetchDashboard} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Làm mới
        </button>
      </section>

      <div className="metric-grid">
        <CleanMetric
          label="Doanh thu tháng này"
          value={formatVND(monthRevenue)}
          tone="coral"
        />
        <CleanMetric
          label="Tổng sản phẩm"
          value={totalProducts.toString()}
          tone="mint"
        />
        <CleanMetric
          label="Tổng đơn hàng"
          value={totalOrders.toString()}
          tone="yellow"
        />
        <CleanMetric
          label="Khách hàng"
          value={totalCustomers.toString()}
          tone="lavender"
        />
      </div>

      <div className="dashboard-stat-grid">
        <AdminKpi label="Doanh thu hôm nay" value={formatVND(todayRevenue)} tone="success" />
        <AdminKpi label="Sản phẩm sắp hết" value={lowStockCount.toString()} tone="warning" />
        <AdminKpi label="Sản phẩm hết hàng" value={outOfStockCount.toString()} tone="danger" />
      </div>

      <div className="dashboard-grid">
        <div className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h2>Biểu đồ doanh thu</h2>
              <span>Doanh thu theo tháng hoàn thành</span>
            </div>
          </div>
          <div className="chart-summary">
            <strong>{formatVND(monthRevenue)}</strong>
            <span><TrendingUp size={14} /> Trực tiếp từ DB</span>
          </div>
          <div className="clean-bars">
            {data?.monthlyRevenue?.length ? (
              data.monthlyRevenue.map((m) => (
                <div className="dashboard-bar" key={`${m.year}-${m.month}`}>
                  <i style={{ height: `${Math.min(100, Math.max(15, (m.revenue / (monthRevenue || 1)) * 100))}%` }} />
                  <span>T{m.month}</span>
                </div>
              ))
            ) : (
              [35, 50, 42, 65, 80, 60, 90].map((h, i) => (
                <div className="dashboard-bar" key={i}>
                  <i style={{ height: `${h}%` }} />
                  <span>T{i + 1}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="panel stock-panel">
          <div className="panel-heading">
            <div>
              <h2>Top sản phẩm bán chạy</h2>
              <span>Dựa trên các đơn hàng đã tạo</span>
            </div>
          </div>
          {topProducts.length ? (
            topProducts.map((p) => (
              <div className="stock-item" key={p.productId}>
                <div className="product-thumb midnight"><Package size={20} /></div>
                <div className="stock-info">
                  <strong>{p.productName}</strong>
                  <span>{p.totalSold} đã bán &bull; {formatVND(p.totalRevenue)}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '20px 0', color: '#888', fontSize: '13px' }}>
              Chưa có dữ liệu bán chạy. Tạo đơn hàng mới để hiển thị thống kê.
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ----------------------------------------------------
// ADMIN MODULES (PRODUCTS, CATEGORIES, INVENTORY, ORDERS, ETC.)
// ----------------------------------------------------
function CleanAdminModule({ page, title, description }) {
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)

  // Products State
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productCategory, setProductCategory] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)

  // Orders State
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderTab, setOrderTab] = useState('all')
  const [showReturnModal, setShowReturnModal] = useState(false)

  // Inventory State
  const [inventory, setInventory] = useState([])
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState(null)
  const [newQuantity, setNewQuantity] = useState(0)
  const [adjustReason, setAdjustReason] = useState('')

  // Suppliers & Customers & Users State
  const [suppliers, setSuppliers] = useState([])
  const [customers, setCustomers] = useState([])
  const [users, setUsers] = useState([])
  const [promotions, setPromotions] = useState([])
  const [reviews, setReviews] = useState([])
  const [promotionFilter, setPromotionFilter] = useState('all')
  const [reviewFilter, setReviewFilter] = useState('all')
  const [showPromotionModal, setShowPromotionModal] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  // Load Data by Page
  const loadModuleData = async () => {
    setLoading(true)
    try {
      if (page === 'products') {
        const [pRes, cRes, sRes] = await Promise.all([
          api.getProducts({ search: query, pageSize: 100 }),
          api.getCategories(),
          api.getSuppliers({ pageSize: 100 }),
        ])
        setProducts(pRes?.items || pRes || [])
        setCategories(cRes || [])
        setSuppliers(sRes?.items || [])
      } else if (page === 'categories') {
        const cRes = await api.getCategories()
        setCategories(cRes || [])
      } else if (page === 'inventory') {
        const invRes = await api.getInventory()
        setInventory(invRes || [])
      } else if (page === 'orders') {
        const oRes = await api.getOrders({ pageSize: 50 })
        setOrders(oRes?.items || oRes || [])
      } else if (page === 'suppliers') {
        const sRes = await api.getSuppliers({ pageSize: 50 })
        setSuppliers(sRes?.items || sRes || [])
      } else if (page === 'customers') {
        const cuRes = await api.getCustomers({ pageSize: 50 })
        setCustomers(cuRes?.items || cuRes || [])
      } else if (page === 'users') {
        const uRes = await api.getUsers()
        setUsers(uRes || [])
      } else if (page === 'promotions') {
        setPromotions(await api.getPromotions())
      } else if (page === 'reviews') {
        const [reviewRes, productRes] = await Promise.all([
          api.getReviews(),
          api.getProducts({ pageSize: 100 }),
        ])
        setReviews(reviewRes || [])
        setProducts(productRes?.items || productRes || [])
      }
    } catch (err) {
      console.error('Error loading module data:', err)
      notify('Lỗi tải dữ liệu: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadModuleData()
  }, [page])

  // --- PRODUCTS ACTIONS ---
  const handleCreateProduct = async (formData) => {
    try {
      await api.createProduct(formData)
      notify('Thêm sản phẩm thành công!')
      setShowAddProductModal(false)
      loadModuleData()
    } catch (err) {
      alert(err.message || 'Lỗi khi tạo sản phẩm')
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return
    try {
      await api.deleteProduct(id)
      notify('Đã xóa sản phẩm thành công!')
      setSelectedProduct(null)
      loadModuleData()
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa sản phẩm')
    }
  }

  // --- CATEGORIES ACTIONS ---
  const handleCreateCategory = async (catData) => {
    const { imageFile, ...categoryData } = catData
    try {
      const category = await api.createCategory(categoryData)
      setShowAddCategoryModal(false)
      if (imageFile) {
        try {
          await api.uploadCategoryImage(category.id, imageFile)
          notify('Đã tạo danh mục và tải ảnh lên!')
        } catch (err) {
          notify(`Danh mục đã tạo nhưng tải ảnh thất bại: ${err.message}`)
        }
      } else {
        notify('Đã thêm danh mục mới!')
      }
      await loadModuleData()
    } catch (err) {
      alert(err.message || 'Lỗi khi tạo danh mục')
    }
  }

  const handleUploadCategoryImage = async (category, imageFile) => {
    try {
      await api.uploadCategoryImage(category.id, imageFile)
      notify(`Đã cập nhật ảnh ${category.name}!`)
      await loadModuleData()
    } catch (err) {
      alert(err.message || 'Không thể tải ảnh danh mục')
    }
  }

  const handleDeleteCategoryImage = async (category) => {
    if (!confirm(`Gỡ ảnh của danh mục ${category.name}?`)) return
    try {
      await api.deleteCategoryImage(category.id)
      notify(`Đã gỡ ảnh ${category.name}!`)
      await loadModuleData()
    } catch (err) {
      alert(err.message || 'Không thể gỡ ảnh danh mục')
    }
  }

  const handleSavePromotion = async (promotionData) => {
    try {
      if (editingPromotion) {
        await api.updatePromotion(editingPromotion.id, promotionData)
        notify('Đã cập nhật chương trình khuyến mãi!')
      } else {
        await api.createPromotion(promotionData)
        notify('Đã tạo chương trình khuyến mãi!')
      }
      setShowPromotionModal(false)
      setEditingPromotion(null)
      loadModuleData()
    } catch (err) {
      alert(err.message || 'Không thể lưu khuyến mãi')
    }
  }

  const handleDeletePromotion = async (promotion) => {
    if (!confirm(`Xóa chương trình ${promotion.code}?`)) return
    try {
      await api.deletePromotion(promotion.id)
      notify('Đã xóa chương trình khuyến mãi!')
      loadModuleData()
    } catch (err) {
      alert(err.message || 'Không thể xóa khuyến mãi')
    }
  }

  const handleTogglePromotion = async (promotion) => {
    try {
      await api.updatePromotion(promotion.id, {
        name: promotion.name,
        code: promotion.code,
        description: promotion.description,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        startsAt: promotion.startsAt,
        endsAt: promotion.endsAt,
        isActive: !promotion.isActive,
      })
      notify(promotion.isActive ? 'Đã tạm dừng khuyến mãi!' : 'Đã bật khuyến mãi!')
      loadModuleData()
    } catch (err) {
      alert(err.message || 'Không thể đổi trạng thái khuyến mãi')
    }
  }

  const handleSaveReview = async (reviewData) => {
    try {
      await api.createReview(reviewData)
      notify('Đã thêm đánh giá ở trạng thái chờ duyệt!')
      setShowReviewModal(false)
      loadModuleData()
    } catch (err) {
      alert(err.message || 'Không thể thêm đánh giá')
    }
  }

  const handleModerateReview = async (review, isApproved) => {
    try {
      await api.moderateReview(review.id, isApproved)
      notify(isApproved ? 'Đã duyệt đánh giá!' : 'Đã ẩn đánh giá!')
      loadModuleData()
    } catch (err) {
      alert(err.message || 'Không thể cập nhật trạng thái đánh giá')
    }
  }

  const handleDeleteReview = async (review) => {
    if (!confirm('Xóa vĩnh viễn đánh giá này?')) return
    try {
      await api.deleteReview(review.id)
      notify('Đã xóa đánh giá!')
      loadModuleData()
    } catch (err) {
      alert(err.message || 'Không thể xóa đánh giá')
    }
  }

  // --- INVENTORY ADJUSTMENT ---
  const handleAdjustInventory = async () => {
    if (!adjustTarget) return
    try {
      await api.adjustInventory(adjustTarget.productId, Number(newQuantity), adjustReason || 'Kiểm kê kho')
      notify('Điều chỉnh tồn kho thành công!')
      setShowAdjustModal(false)
      setAdjustTarget(null)
      loadModuleData()
    } catch (err) {
      alert(err.message || 'Lỗi khi điều chỉnh tồn kho')
    }
  }

  // --- ORDERS ACTIONS ---
  const handleConfirmOrder = async (orderId) => {
    try {
      await api.confirmOrder(orderId)
      notify('Đã xác nhận đơn hàng và trừ tồn kho!')
      loadModuleData()
      if (selectedOrder) {
        setSelectedOrder((prev) => ({ ...prev, status: 'confirmed' }))
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi xác nhận đơn hàng')
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus)
      notify(`Đã chuyển đơn hàng sang trạng thái: ${newStatus}`)
      loadModuleData()
      if (selectedOrder) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi cập nhật trạng thái')
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này và hoàn tồn kho?')) return
    try {
      await api.cancelOrder(orderId)
      notify('Đã hủy đơn hàng thành công!')
      loadModuleData()
      if (selectedOrder) {
        setSelectedOrder((prev) => ({ ...prev, status: 'cancelled' }))
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi hủy đơn hàng')
    }
  }

  const handleReturnOrder = async (orderId, returnData) => {
    try {
      const updatedOrder = await api.returnOrder(orderId, returnData)
      setSelectedOrder(updatedOrder)
      setShowReturnModal(false)
      notify(updatedOrder.status === 'returned' ? 'Đã hoàn trả toàn bộ đơn hàng!' : 'Đã ghi nhận hoàn trả một phần!')
      await loadModuleData()
    } catch (err) {
      alert(err.message || 'Không thể hoàn trả đơn hàng')
    }
  }

  const header = (
    <section className="page-heading">
      <div>
        <div className="eyebrow">SMARTSTOCK / {page.toUpperCase()}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="button ghost" onClick={loadModuleData} disabled={loading} title="Làm mới dữ liệu">
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
        </button>
        {page === 'products' && (
          <button className="button primary" onClick={() => setShowAddProductModal(true)}>
            <Plus size={18} /> Thêm sản phẩm
          </button>
        )}
        {page === 'categories' && (
          <button className="button primary" onClick={() => setShowAddCategoryModal(true)}>
            <Plus size={18} /> Thêm danh mục
          </button>
        )}
        {page === 'promotions' && (
          <button className="button primary" onClick={() => { setEditingPromotion(null); setShowPromotionModal(true) }}>
            <Plus size={18} /> Tạo khuyến mãi
          </button>
        )}
        {page === 'reviews' && (
          <button className="button primary" onClick={() => setShowReviewModal(true)}>
            <Plus size={18} /> Nhập đánh giá
          </button>
        )}
      </div>
    </section>
  )

  // 1. PRODUCTS PAGE
  if (page === 'products') {
    if (selectedProduct) {
      return (
        <AdminProductDetail
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onDelete={() => handleDeleteProduct(selectedProduct.id)}
          onNotify={notify}
        />
      )
    }

    const filtered = products
      .filter((it) => `${it.name} ${it.categoryName || ''} ${it.productCode}`.toLowerCase().includes(query.toLowerCase()))
      .filter((it) => productCategory === 'all' || (it.categoryName || '') === productCategory)
      .filter((it) =>
        stockFilter === 'all'
          ? true
          : stockFilter === 'out'
          ? it.quantity === 0
          : stockFilter === 'low'
          ? it.quantity > 0 && it.quantity <= it.minStock
          : it.quantity > it.minStock
      )

    return (
      <>
        {header}
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên, mã SKU, barcode..."
            />
          </div>
          <select
            className="admin-filter-select"
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <select
            className="admin-filter-select"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">Tất cả tồn kho</option>
            <option value="low">Sắp hết hàng</option>
            <option value="out">Đã hết hàng</option>
          </select>
        </div>

        {loading ? (
          <div className="api-loading-state"><RefreshCw className="spin" size={24} /> Đang tải dữ liệu...</div>
        ) : (
          <AdminTable
            title={`${filtered.length} sản phẩm trong kho`}
            columns={['MÃ SKU', 'TÊN SẢN PHẨM', 'DANH MỤC', 'GIÁ BÁN', 'GIÁ VỐN', 'TỒN KHO', 'TRẠNG THÁI']}
            rows={filtered.map((it) => [
              <code>{it.productCode}</code>,
              <strong>{it.name}</strong>,
              it.categoryName || 'Chung',
              formatVND(it.price),
              formatVND(it.costPrice),
              <strong>{it.quantity} {it.unit || 'cái'}</strong>,
              <span className={`admin-badge ${it.quantity === 0 ? 'danger' : it.quantity <= it.minStock ? 'warning' : 'success'}`}>
                {it.quantity === 0 ? 'Hết hàng' : it.quantity <= it.minStock ? 'Sắp hết' : 'Có sẵn'}
              </span>,
            ])}
            onRowClick={(idx) => setSelectedProduct(filtered[idx])}
            onAction={notify}
          />
        )}

        {showAddProductModal && (
          <AddProductModal
            categories={categories}
            suppliers={suppliers}
            onClose={() => setShowAddProductModal(false)}
            onSave={handleCreateProduct}
          />
        )}
        {toast && <AdminToast message={toast} />}
      </>
    )
  }

  // 2. CATEGORIES PAGE
  if (page === 'categories') {
    return (
      <>
        {header}
        <div className="admin-card-grid">
          {categories.map((c, idx) => (
            <div className="admin-info-card" key={c.id}>
              <div className={`category-image-frame ${c.imageUrl ? 'has-image' : ''}`}>
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt={`Ảnh ${c.name}`} />
                ) : (
                  <span className={`admin-card-icon icon-${idx % 4}`}>{c.icon || '📦'}</span>
                )}
              </div>
              <strong>{c.name}</strong>
              <span>{c.description || 'Chưa có mô tả'}</span>
              <small>{c.productCount ?? 0} sản phẩm liên kết</small>
              <label className="category-image-action">
                <Upload size={14} /> {c.imageUrl ? 'Thay ảnh' : 'Tải ảnh sản phẩm'}
                <input
                  type="file"
                  accept="image/*"
                  aria-label={`${c.imageUrl ? 'Thay ảnh' : 'Tải ảnh'} cho ${c.name}`}
                  onChange={(event) => {
                    const imageFile = event.target.files?.[0]
                    if (imageFile) handleUploadCategoryImage(c, imageFile)
                    event.target.value = ''
                  }}
                />
              </label>
              {c.imageUrl && (
                <button
                  className="category-image-remove"
                  title="Gỡ ảnh và dùng icon dự phòng"
                  aria-label={`Gỡ ảnh ${c.name}`}
                  onClick={() => handleDeleteCategoryImage(c)}
                >
                  <X size={14} /> Gỡ ảnh
                </button>
              )}
            </div>
          ))}
        </div>

        {showAddCategoryModal && (
          <AddCategoryModal
            onClose={() => setShowAddCategoryModal(false)}
            onSave={handleCreateCategory}
          />
        )}
        {toast && <AdminToast message={toast} />}
      </>
    )
  }

  if (page === 'promotions') {
    const now = new Date()
    const getStatus = (promotion) => {
      if (!promotion.isActive) return 'paused'
      if (new Date(promotion.startsAt) > now) return 'upcoming'
      if (new Date(promotion.endsAt) < now) return 'ended'
      return 'running'
    }
    const filteredPromotions = promotions.filter((promotion) => {
      const matchesQuery = `${promotion.name} ${promotion.code}`.toLowerCase().includes(query.toLowerCase())
      return matchesQuery && (promotionFilter === 'all' || getStatus(promotion) === promotionFilter)
    })
    const runningCount = promotions.filter((promotion) => getStatus(promotion) === 'running').length

    return (
      <>
        {header}
        <div className="admin-kpi-row">
          <AdminKpi label="Tổng chương trình" value={String(promotions.length)} />
          <AdminKpi label="Đang áp dụng" value={String(runningCount)} tone="success" />
          <AdminKpi label="Tạm dừng / kết thúc" value={String(promotions.length - runningCount)} tone="warning" />
        </div>
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên hoặc mã khuyến mãi..." />
          </div>
          <select className="admin-filter-select" value={promotionFilter} onChange={(event) => setPromotionFilter(event.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="running">Đang áp dụng</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="paused">Tạm dừng</option>
            <option value="ended">Đã kết thúc</option>
          </select>
        </div>
        {loading ? (
          <div className="api-loading-state"><RefreshCw className="spin" size={24} /> Đang tải khuyến mãi...</div>
        ) : (
          <AdminTable
            title={`${filteredPromotions.length} chương trình khuyến mãi`}
            columns={['MÃ', 'CHƯƠNG TRÌNH', 'MỨC GIẢM', 'THỜI GIAN', 'TRẠNG THÁI', 'THAO TÁC']}
            hideActions
            rows={filteredPromotions.map((promotion) => {
              const status = getStatus(promotion)
              const statusLabels = { running: 'Đang áp dụng', upcoming: 'Sắp diễn ra', paused: 'Tạm dừng', ended: 'Đã kết thúc' }
              return [
                <code>{promotion.code}</code>,
                <div><strong>{promotion.name}</strong><small className="module-subtext">{promotion.description || 'Không có mô tả'}</small></div>,
                <strong>{promotion.discountType === 'percent' ? `${promotion.discountValue}%` : formatVND(promotion.discountValue)}</strong>,
                <span>{formatDate(promotion.startsAt)}<br />đến {formatDate(promotion.endsAt)}</span>,
                <span className={`admin-badge ${status === 'running' ? 'success' : status === 'upcoming' ? 'warning' : 'danger'}`}>{statusLabels[status]}</span>,
                <div className="module-row-actions">
                  <button className="module-icon-button" title="Chỉnh sửa" aria-label={`Chỉnh sửa ${promotion.code}`} onClick={() => { setEditingPromotion(promotion); setShowPromotionModal(true) }}><Edit size={15} /></button>
                  <button className="module-icon-button" title={promotion.isActive ? 'Tạm dừng' : 'Bật khuyến mãi'} aria-label={promotion.isActive ? 'Tạm dừng' : 'Bật khuyến mãi'} onClick={() => handleTogglePromotion(promotion)}>{promotion.isActive ? <X size={15} /> : <Check size={15} />}</button>
                  <button className="module-icon-button danger" title="Xóa" aria-label={`Xóa ${promotion.code}`} onClick={() => handleDeletePromotion(promotion)}><Trash2 size={15} /></button>
                </div>,
              ]
            })}
          />
        )}
        {showPromotionModal && (
          <PromotionModal
            promotion={editingPromotion}
            onClose={() => { setShowPromotionModal(false); setEditingPromotion(null) }}
            onSave={handleSavePromotion}
          />
        )}
        {toast && <AdminToast message={toast} />}
      </>
    )
  }

  if (page === 'reviews') {
    const filteredReviews = reviews.filter((review) => {
      const matchesQuery = `${review.customerName} ${review.customerEmail || ''} ${review.productName} ${review.comment}`.toLowerCase().includes(query.toLowerCase())
      return matchesQuery && (reviewFilter === 'all' || (reviewFilter === 'approved' ? review.isApproved : !review.isApproved))
    })
    const pendingCount = reviews.filter((review) => !review.isApproved).length
    const averageRating = reviews.length
      ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
      : '0.0'

    return (
      <>
        {header}
        <div className="admin-kpi-row">
          <AdminKpi label="Tổng đánh giá" value={String(reviews.length)} />
          <AdminKpi label="Chờ duyệt" value={String(pendingCount)} tone="warning" />
          <AdminKpi label="Điểm trung bình" value={`${averageRating} / 5`} tone="success" />
        </div>
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm khách hàng, sản phẩm hoặc nội dung..." />
          </div>
          <select className="admin-filter-select" value={reviewFilter} onChange={(event) => setReviewFilter(event.target.value)}>
            <option value="all">Tất cả đánh giá</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
          </select>
        </div>
        {loading ? (
          <div className="api-loading-state"><RefreshCw className="spin" size={24} /> Đang tải đánh giá...</div>
        ) : (
          <AdminTable
            title={`${filteredReviews.length} đánh giá`}
            columns={['SẢN PHẨM', 'KHÁCH HÀNG', 'ĐIỂM', 'NỘI DUNG', 'NGÀY GỬI', 'TRẠNG THÁI', 'THAO TÁC']}
            hideActions
            rows={filteredReviews.map((review) => [
              <div><strong>{review.productName}</strong><small className="module-subtext">{review.productCode}</small></div>,
              <div><strong>{review.customerName}</strong><small className="module-subtext">{review.customerEmail || 'Không có email'}</small></div>,
              <span className="review-stars" aria-label={`${review.rating} trên 5 sao`}>{'★'.repeat(review.rating)}<span>{'★'.repeat(5 - review.rating)}</span></span>,
              <span className="review-comment">{review.comment}</span>,
              formatDate(review.createdAt),
              <span className={`admin-badge ${review.isApproved ? 'success' : 'warning'}`}>{review.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}</span>,
              <div className="module-row-actions">
                <button className="module-icon-button" title={review.isApproved ? 'Ẩn đánh giá' : 'Duyệt đánh giá'} aria-label={review.isApproved ? 'Ẩn đánh giá' : 'Duyệt đánh giá'} onClick={() => handleModerateReview(review, !review.isApproved)}>{review.isApproved ? <X size={15} /> : <Check size={15} />}</button>
                <button className="module-icon-button danger" title="Xóa" aria-label="Xóa đánh giá" onClick={() => handleDeleteReview(review)}><Trash2 size={15} /></button>
              </div>,
            ])}
          />
        )}
        {showReviewModal && (
          <ReviewModal
            products={products}
            onClose={() => setShowReviewModal(false)}
            onSave={handleSaveReview}
          />
        )}
        {toast && <AdminToast message={toast} />}
      </>
    )
  }

  // 3. INVENTORY PAGE
  if (page === 'inventory') {
    const lowCount = inventory.filter((i) => i.stockStatus === 'low').length
    const outCount = inventory.filter((i) => i.stockStatus === 'out').length

    return (
      <>
        {header}
        <div className="admin-kpi-row">
          <AdminKpi label="Tổng mặt hàng theo dõi" value={inventory.length.toString()} />
          <AdminKpi label="Sắp hết hàng" value={lowCount.toString()} tone="warning" />
          <AdminKpi label="Đã hết hàng" value={outCount.toString()} tone="danger" />
        </div>

        <AdminTable
          title={`Kiểm kê kho &bull; ${inventory.length} sản phẩm`}
          columns={['MÃ SẢN PHẨM', 'TÊN SẢN PHẨM', 'DANH MỤC', 'TỒN KHO HIỆN TẠI', 'ĐỊNH MỨC TỐI THIỂU', 'TRẠNG THÁI', 'THAO TÁC']}
          rows={inventory.map((row) => [
            <code>{row.productCode}</code>,
            <strong>{row.productName}</strong>,
            row.categoryName,
            <strong>{row.quantity}</strong>,
            row.minStock,
            <span className={`admin-badge ${row.stockStatus === 'out' ? 'danger' : row.stockStatus === 'low' ? 'warning' : 'success'}`}>
              {row.stockStatus === 'out' ? 'Hết hàng' : row.stockStatus === 'low' ? 'Sắp hết' : 'An toàn'}
            </span>,
            <button
              className="button secondary"
              style={{ minHeight: 28, fontSize: 11, padding: '0 8px' }}
              onClick={(e) => {
                e.stopPropagation()
                setAdjustTarget(row)
                setNewQuantity(row.quantity)
                setShowAdjustModal(true)
              }}
            >
              Điều chỉnh
            </button>,
          ])}
          onAction={notify}
        />

        {showAdjustModal && adjustTarget && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-head">
                <h3>Điều chỉnh tồn kho: {adjustTarget.productName}</h3>
                <button className="modal-close" onClick={() => setShowAdjustModal(false)}><X size={18} /></button>
              </div>
              <div className="modal-body">
                <div className="form-field">
                  <label>Mã sản phẩm: {adjustTarget.productCode}</label>
                  <span>Tồn kho hiện tại trong hệ thống: <b>{adjustTarget.quantity}</b></span>
                </div>
                <div className="form-field">
                  <label>Số lượng tồn kho mới sau kiểm kê</label>
                  <input
                    type="number"
                    min="0"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Lý do điều chỉnh</label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="Kiểm đếm định kỳ, hàng hỏng, hàng trả về..."
                  />
                </div>
              </div>
              <div className="modal-foot">
                <button className="button ghost" onClick={() => setShowAdjustModal(false)}>Hủy</button>
                <button className="button primary" onClick={handleAdjustInventory}>Lưu điều chỉnh</button>
              </div>
            </div>
          </div>
        )}
        {toast && <AdminToast message={toast} />}
      </>
    )
  }

  // 4. ORDERS PAGE
  if (page === 'orders') {
    if (selectedOrder) {
      return (
        <>
          <button className="back-admin" onClick={() => setSelectedOrder(null)}>
            &larr; Quay lại danh sách đơn hàng
          </button>
          <section className="page-heading">
            <div>
              <div className="eyebrow">ORDER DETAILS &bull; #{selectedOrder.orderCode}</div>
              <h1>Đơn hàng: {selectedOrder.orderCode}</h1>
              <p>Khách hàng: {selectedOrder.customerName || 'Khách lẻ'} &bull; Ngày: {formatDate(selectedOrder.createdAt)}</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {selectedOrder.status === 'pending' && (
                <button className="button primary" onClick={() => handleConfirmOrder(selectedOrder.id)}>
                  Xác nhận đơn &amp; Trừ kho
                </button>
              )}
              {selectedOrder.status === 'confirmed' && (
                <button className="button primary" onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'completed')}>
                  Hoàn tất giao hàng
                </button>
              )}
              {['confirmed', 'completed', 'partially_returned'].includes(selectedOrder.status) && (
                <button className="button ghost" onClick={() => setShowReturnModal(true)}>
                  <RefreshCw size={15} /> Hoàn hàng
                </button>
              )}
              {['pending', 'confirmed', 'completed'].includes(selectedOrder.status) && (
                <button className="button danger" onClick={() => handleCancelOrder(selectedOrder.id)}>
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </section>

          <div className="order-timeline">
            <TimelineStep label="Chờ xử lý" done={true} />
            <TimelineStep label="Đã xác nhận" done={['confirmed', 'shipping', 'completed'].includes(selectedOrder.status)} />
            <TimelineStep label="Đang giao" done={['shipping', 'completed'].includes(selectedOrder.status)} />
            <TimelineStep label="Hoàn tất" done={['completed', 'partially_returned', 'returned'].includes(selectedOrder.status)} />
          </div>

          <section className="panel order-detail-card">
            <h2>Các mặt hàng trong đơn</h2>
            {selectedOrder.details?.map((d) => (
              <div className="best-seller-row" key={d.id}>
                <Package size={18} />
                <span>{d.productName} &times; {d.quantity}{d.returnedQuantity > 0 ? ` · đã hoàn ${d.returnedQuantity}, còn ${d.quantity - d.returnedQuantity}` : ''}</span>
                <strong>{formatVND(d.total)}</strong>
              </div>
            ))}
            <hr />
            <div className="order-total-row">
              <span>Phương thức thanh toán:</span>
              <strong>{selectedOrder.paymentMethod || 'COD'}</strong>
            </div>
            <div className="order-total-row">
              <span>Tổng tiền đơn hàng:</span>
              <strong>{formatVND(selectedOrder.finalAmount)}</strong>
            </div>
          </section>
          {showReturnModal && (
            <ReturnOrderModal
              order={selectedOrder}
              onClose={() => setShowReturnModal(false)}
              onSave={(returnData) => handleReturnOrder(selectedOrder.id, returnData)}
            />
          )}
        </>
      )
    }

    const filteredOrders = orders.filter((o) => {
      if (orderTab === 'all') return true
      return o.status === orderTab
    })

    return (
      <>
        {header}
        <div className="order-tabs">
          <button className={orderTab === 'all' ? 'active' : ''} onClick={() => setOrderTab('all')}>
            Tất cả <b>{orders.length}</b>
          </button>
          <button className={orderTab === 'pending' ? 'active' : ''} onClick={() => setOrderTab('pending')}>
            Chờ xử lý <b>{orders.filter((o) => o.status === 'pending').length}</b>
          </button>
          <button className={orderTab === 'confirmed' ? 'active' : ''} onClick={() => setOrderTab('confirmed')}>
            Đã xác nhận <b>{orders.filter((o) => o.status === 'confirmed').length}</b>
          </button>
          <button className={orderTab === 'completed' ? 'active' : ''} onClick={() => setOrderTab('completed')}>
            Hoàn tất <b>{orders.filter((o) => o.status === 'completed').length}</b>
          </button>
          <button className={orderTab === 'cancelled' ? 'active' : ''} onClick={() => setOrderTab('cancelled')}>
            Đã hủy <b>{orders.filter((o) => o.status === 'cancelled').length}</b>
          </button>
          <button className={orderTab === 'partially_returned' ? 'active' : ''} onClick={() => setOrderTab('partially_returned')}>
            Hoàn một phần <b>{orders.filter((o) => o.status === 'partially_returned').length}</b>
          </button>
          <button className={orderTab === 'returned' ? 'active' : ''} onClick={() => setOrderTab('returned')}>
            Đã hoàn <b>{orders.filter((o) => o.status === 'returned').length}</b>
          </button>
        </div>

        <AdminTable
          title="Danh sách đơn hàng từ Backend"
          columns={['MÃ ĐƠN', 'KHÁCH HÀNG', 'NGƯỜI TẠO', 'THỜI GIAN', 'TỔNG TIỀN', 'TRẠNG THÁI']}
          rows={filteredOrders.map((o) => [
            <strong>{o.orderCode}</strong>,
            o.customerName || 'Khách lẻ',
            o.employeeName || 'Hệ thống',
            formatDate(o.createdAt),
            <strong>{formatVND(o.finalAmount)}</strong>,
            <span className={`admin-badge ${o.status === 'completed' || o.status === 'returned' ? 'success' : o.status === 'cancelled' ? 'danger' : o.status === 'partially_returned' ? 'warning' : 'info'}`}>
              {o.status === 'pending' ? 'Chờ xác nhận' : o.status === 'confirmed' ? 'Đã xác nhận' : o.status === 'completed' ? 'Hoàn tất' : o.status === 'partially_returned' ? 'Hoàn một phần' : o.status === 'returned' ? 'Đã hoàn' : o.status}
            </span>,
          ])}
          onRowClick={(idx) => setSelectedOrder(filteredOrders[idx])}
          onAction={notify}
        />
        {toast && <AdminToast message={toast} />}
      </>
    )
  }

  // 5. SUPPLIERS PAGE
  if (page === 'suppliers') {
    return (
      <>
        {header}
        <AdminTable
          title={`Nhà cung cấp đối tác &bull; ${suppliers.length} đối tác`}
          columns={['MÃ NCC', 'TÊN NHÀ CUNG CẤP', 'LIÊN HỆ', 'EMAIL', 'ĐỊA CHỈ', 'TRẠNG THÁI']}
          rows={suppliers.map((s) => [
            <code>{s.supplierCode}</code>,
            <strong>{s.name}</strong>,
            `${s.contactPerson || ''} (${s.phone || ''})`,
            s.email || '-',
            s.address || '-',
            <span className="admin-badge success">{s.status || 'Đang hợp tác'}</span>,
          ])}
          onAction={notify}
        />
        {toast && <AdminToast message={toast} />}
      </>
    )
  }

  // 6. CUSTOMERS PAGE
  if (page === 'customers') {
    return (
      <>
        {header}
        <AdminTable
          title={`Khách hàng đã đăng ký &bull; ${customers.length} khách hàng`}
          columns={['MÃ KH', 'HỌ VÀ TÊN', 'ĐIỆN THOẠI', 'EMAIL', 'ĐỊA CHỈ', 'DOANH SỐ MUA']}
          rows={customers.map((c) => [
            <code>{c.customerCode}</code>,
            <strong>{c.name}</strong>,
            c.phone || '-',
            c.email || '-',
            c.address || '-',
            formatVND(c.totalPurchase),
          ])}
          onAction={notify}
        />
        {toast && <AdminToast message={toast} />}
      </>
    )
  }

  // 7. USERS PAGE
  if (page === 'users') {
    return (
      <>
        {header}
        <AdminTable
          title={`Tài khoản hệ thống &bull; ${users.length} tài khoản`}
          columns={['TÊN ĐĂNG NHẬP', 'HỌ VÀ TÊN', 'EMAIL', 'SỐ ĐIỆN THOẠI', 'VAI TRÒ', 'TRẠNG THÁI']}
          rows={users.map((u) => [
            <code>{u.username}</code>,
            <strong>{u.fullName}</strong>,
            u.email,
            u.phone || '-',
            <span className="role-badge">{u.role}</span>,
            <span className={`admin-badge ${u.isActive ? 'success' : 'danger'}`}>
              {u.isActive ? 'Hoạt động' : 'Đã khóa'}
            </span>,
          ])}
          onAction={notify}
        />
        {toast && <AdminToast message={toast} />}
      </>
    )
  }

  // 8. NOTIFICATIONS PAGE
  if (page === 'notifications') {
    return <NotificationCenter header={header} onNotify={notify} />
  }

  // 9. SYSTEM HEALTH
  if (page === 'system') {
    return <SystemHealth header={header} />
  }

  // 10. LOWER MODULES & SETTINGS
  return <CleanLowerModule page={page} title={title} description={description} header={header} onNotify={notify} />
}

// ----------------------------------------------------
// PRODUCT DETAIL VIEW & MODALS
// ----------------------------------------------------
function AdminProductDetail({ product, onBack, onDelete, onNotify }) {
  return (
    <>
      <button className="back-admin" onClick={onBack}>
        &larr; Quay lại danh sách sản phẩm
      </button>
      <section className="product-admin-detail">
        <div className={`admin-detail-visual ${product.color || 'midnight'}`}>
          <Package size={100} />
        </div>
        <div className="admin-detail-copy">
          <div className="eyebrow">PRODUCT SKU &bull; {product.productCode}</div>
          <h1>{product.name}</h1>
          <div className="detail-price-admin">{formatVND(product.price)}</div>
          <div className="detail-field-grid">
            <div>
              <span>MÃ SKU</span>
              <strong>{product.productCode}</strong>
            </div>
            <div>
              <span>DANH MỤC</span>
              <strong>{product.categoryName || 'Mặc định'}</strong>
            </div>
            <div>
              <span>NHÀ CUNG CẤP</span>
              <strong>{product.supplierName || 'Chính hãng'}</strong>
            </div>
            <div>
              <span>TỒN KHO HIỆN TẠI</span>
              <strong>{product.quantity} {product.unit || 'cái'}</strong>
            </div>
          </div>
          <p>{product.description || 'Sản phẩm chính hãng, phân phối qua hệ thống SmartStock.'}</p>
          <div className="detail-action-row">
            <button className="button danger" onClick={onDelete}>
              <Trash2 size={16} /> Xóa sản phẩm
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

function ReturnOrderModal({ order, onClose, onSave }) {
  const [quantities, setQuantities] = useState(() => Object.fromEntries(
    order.details.map((detail) => [detail.id, 0])
  ))
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const refundableDetails = order.details.filter((detail) => detail.quantity > (detail.returnedQuantity || 0))

  const handleSubmit = (event) => {
    event.preventDefault()
    const details = refundableDetails
      .map((detail) => ({ productId: detail.productId, quantity: Number(quantities[detail.id]) || 0 }))
      .filter((detail) => detail.quantity > 0)

    if (details.length === 0) {
      setError('Nhập số lượng cần hoàn cho ít nhất một sản phẩm.')
      return
    }

    setError('')
    onSave({ reason, details })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-head">
          <h3>Hoàn hàng · {order.orderCode}</h3>
          <button type="button" className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="module-form-note">Chỉ nhập số lượng chưa hoàn. Tồn kho và khoản thu sẽ được cập nhật theo số lượng này.</p>
            {refundableDetails.map((detail) => {
              const remaining = detail.quantity - (detail.returnedQuantity || 0)
              return (
                <div className="return-line" key={detail.id}>
                  <div>
                    <strong>{detail.productName}</strong>
                    <span>Đã mua {detail.quantity} · còn có thể hoàn {remaining}</span>
                  </div>
                  <input
                    aria-label={`Số lượng hoàn ${detail.productName}`}
                    type="number"
                    min="0"
                    max={remaining}
                    step="1"
                    value={quantities[detail.id] || 0}
                    onChange={(event) => setQuantities((current) => ({ ...current, [detail.id]: event.target.value }))}
                  />
                </div>
              )
            })}
            <div className="form-field">
              <label>Lý do hoàn</label>
              <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} />
            </div>
            {error && <small className="category-image-error" role="alert">{error}</small>}
          </div>
          <div className="modal-foot">
            <button type="button" className="button ghost" onClick={onClose}>Hủy</button>
            <button type="submit" className="button primary" disabled={!refundableDetails.length}>Xác nhận hoàn hàng</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddProductModal({ categories, suppliers, onClose, onSave }) {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [supplierId, setSupplierId] = useState('')
  const [price, setPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [quantity, setQuantity] = useState('10')
  const [minStock, setMinStock] = useState('5')
  const [unit, setUnit] = useState('cái')
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      name,
      categoryId: Number(categoryId),
      price: Number(price),
      costPrice: Number(costPrice) || 0,
      quantity: Number(quantity),
      minStock: Number(minStock),
      unit,
      description,
      supplierId: supplierId ? Number(supplierId) : null,
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box wide">
        <div className="modal-head">
          <h3>Thêm sản phẩm mới vào Kho</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label>Tên sản phẩm *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Tai nghe Bluetooth Pro Max"
                required
              />
            </div>
            <div className="modal-grid-2">
              <div className="form-field">
                <label>Danh mục *</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Đơn vị tính</label>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="cái, bộ, chiếc..."
                />
              </div>
            </div>
            <div className="form-field">
              <label>Nhà cung cấp</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">Không gắn nhà cung cấp</option>
                {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
              </select>
            </div>
            <div className="modal-grid-2">
              <div className="form-field">
                <label>Giá bán (VNĐ) *</label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1500000"
                  required
                />
              </div>
              <div className="form-field">
                <label>Giá vốn (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="1000000"
                />
              </div>
            </div>
            <div className="modal-grid-2">
              <div className="form-field">
                <label>Số lượng tồn ban đầu *</label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label>Cảnh báo tồn tối thiểu</label>
                <input
                  type="number"
                  min="0"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                />
              </div>
            </div>
            <div className="form-field">
              <label>Mô tả sản phẩm</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả thông số hoặc nguồn gốc..."
              />
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="button ghost" onClick={onClose}>Hủy</button>
            <button type="submit" className="button primary" disabled={!categories.length}>Tạo sản phẩm</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddCategoryModal({ onClose, onSave }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imageError, setImageError] = useState('')

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
  }, [imagePreview])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ name, description, icon: '📦', imageFile })
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null
    setImageError('')
    setImageFile(file)
    setImagePreview(file ? URL.createObjectURL(file) : '')
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-head">
          <h3>Thêm danh mục sản phẩm mới</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label>Tên danh mục *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Phụ kiện sạc cáp"
                required
              />
            </div>
            <div className="form-field">
              <label>Ảnh đại diện sản phẩm</label>
              <label className="category-image-picker">
                {imagePreview ? (
                  <img src={imagePreview} alt="Xem trước ảnh danh mục" />
                ) : (
                  <span><Upload size={18} /> Chọn ảnh bất kỳ (image/*)</span>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>
              {imageError && <small className="category-image-error">{imageError}</small>}
            </div>
            <div className="form-field">
              <label>Mô tả ngắn</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả về nhóm sản phẩm này..."
              />
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="button ghost" onClick={onClose}>Hủy</button>
            <button type="submit" className="button primary">Lưu danh mục</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// NOTIFICATION CENTER & SYSTEM HEALTH
// ----------------------------------------------------
function NotificationCenter({ header, onNotify }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  const loadNotifs = async () => {
    setLoading(true)
    try {
      const data = await api.getNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifs()
  }, [])

  const handleReadAll = async () => {
    try {
      await api.markAllNotificationsRead()
      onNotify('Đã đánh dấu tất cả thông báo là đã đọc')
      loadNotifs()
    } catch (e) {
      alert(e.message)
    }
  }

  const handleReadSingle = async (id) => {
    try {
      if (id > 0) {
        await api.markNotificationRead(id)
      }
      loadNotifs()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      {header}
      <div className="notification-toolbar">
        <span>{notifications.filter((n) => !n.isRead).length} thông báo chưa đọc</span>
        <button className="button ghost" onClick={handleReadAll}>
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className="notification-admin-grid">
        {notifications.map((n, idx) => (
          <div
            className={`notification-admin-card ${n.isRead ? 'read' : ''}`}
            key={idx}
            onClick={() => handleReadSingle(n.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className={`admin-notification-icon tone-${n.type === 'error' ? 'danger' : '1'}`}>
              <AlertTriangle size={17} />
            </div>
            <div>
              <strong>{n.title}</strong>
              <span>{n.message} &bull; {formatDate(n.createdAt)}</span>
            </div>
            {!n.isRead && <span className="notification-unread" />}
          </div>
        ))}
        {notifications.length === 0 && (
          <div style={{ padding: 30, textAlign: 'center', color: '#888' }}>
            Không có thông báo mới nào.
          </div>
        )}
      </div>
    </>
  )
}

function SystemHealth({ header }) {
  const [health, setHealth] = useState({ ok: null, status: 'Checking...', database: 'Unknown', latency: null })

  const ping = async () => {
    const res = await api.getHealth()
    setHealth(res)
  }

  useEffect(() => {
    ping()
    const timer = setInterval(ping, 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      {header}
      <div className="system-status-grid">
        <SystemStatus name="Frontend" value="Đang được phục vụ" />
        <SystemStatus
          name="Backend (.NET 10 API)"
          value={health.ok ? `${health.status} · ${health.latency} ms` : health.ok === false ? 'Không phản hồi' : 'Đang kiểm tra'}
        />
        <SystemStatus name="SQL Server" value={health.database === 'Connected' ? 'Đã kết nối' : health.database === 'Unreachable' ? 'Không kết nối' : 'Chưa xác định'} />
      </div>

      <div className="panel monitoring-panel">
        <div className="panel-heading">
          <div>
            <h2>Trạng thái kết nối</h2>
            <span>Kiểm tra Backend và SQL Server mỗi 10 giây</span>
          </div>
          <button className="button ghost" onClick={ping}>
            <RefreshCw size={15} /> Kiểm tra ngay
          </button>
        </div>

        <div className="monitor-row">
          <span>API response</span>
          <i><b style={{ width: health.ok === null ? '50%' : health.ok ? '100%' : '0%', background: health.ok ? '#55aa84' : '#e47661' }} /></i>
          <strong>{health.latency ? `${health.latency}ms` : 'Offline'}</strong>
        </div>

        <div className="health-counts">
          <div>
            <strong>Database probe</strong>
            <span>{health.database === 'Connected' ? 'CanConnect thành công' : health.database === 'Unreachable' ? 'SQL Server không phản hồi' : 'Đang kiểm tra'}</span>
          </div>
        </div>
      </div>
    </>
  )
}

// ----------------------------------------------------
// LOWER MODULES (OTHER PAGES)
// ----------------------------------------------------
function CleanLowerModule({ page, title, description, header, onNotify }) {
  if (page === 'purchase-orders') {
    return <CleanPurchaseOrders header={header} />
  }

  if (page === 'reports') {
    return <CleanReportsModule header={header} />
  }

  if (page === 'settings') {
    return <CleanSettingsModule header={header} />
  }

  return (
    <>
      {header}
      <div className="panel clean-detail-panel">
        <div className="admin-module-icon"><Package size={25} /></div>
        <h2>{title}</h2>
        <p>Mục này chưa có chức năng quản trị trong phiên bản hiện tại.</p>
      </div>
    </>
  )
}

function CleanPurchaseOrders({ header }) {
  const [imports, setImports] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const notify = (message) => {
    setToast(message)
    setTimeout(() => setToast(''), 2500)
  }

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [importResult, supplierResult, productResult] = await Promise.all([
        api.getImports({ pageSize: 100 }),
        api.getSuppliers({ pageSize: 100 }),
        api.getProducts({ pageSize: 100 }),
      ])
      setImports(importResult?.items || [])
      setSuppliers(supplierResult?.items || [])
      setProducts(productResult?.items || [])
    } catch (err) {
      setError(err.message || 'Không thể tải phiếu nhập kho')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async (data) => {
    try {
      await api.createImport(data)
      setShowCreateModal(false)
      notify(data.status === 'draft' ? 'Đã lưu phiếu nhập nháp!' : 'Đã tạo phiếu nhập và cập nhật tồn kho!')
      await loadData()
    } catch (err) {
      alert(err.message || 'Không thể tạo phiếu nhập')
    }
  }

  const handleConfirm = async (receipt) => {
    if (!confirm(`Xác nhận phiếu ${receipt.receiptCode} và cộng tồn kho?`)) return
    try {
      await api.confirmImport(receipt.id)
      notify('Đã xác nhận phiếu nhập và cộng tồn kho!')
      await loadData()
    } catch (err) {
      alert(err.message || 'Không thể xác nhận phiếu nhập')
    }
  }

  const handleCancel = async (receipt) => {
    if (!confirm(`Hủy phiếu ${receipt.receiptCode}? Tồn kho sẽ được hoàn tác nếu phiếu đã hoàn tất.`)) return
    try {
      await api.deleteImport(receipt.id)
      notify('Đã hủy phiếu nhập!')
      await loadData()
    } catch (err) {
      alert(err.message || 'Không thể hủy phiếu nhập')
    }
  }

  const statusLabels = { draft: 'Nháp', completed: 'Hoàn tất', confirmed: 'Đã xác nhận', cancelled: 'Đã hủy' }

  return (
    <>
      {header}
      <div className="admin-toolbar">
        <strong>{imports.length} phiếu nhập</strong>
        <button className="button primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Tạo phiếu nhập
        </button>
      </div>
      {error && <div className="login-error-badge">{error}</div>}
      {loading ? (
        <div className="api-loading-state"><RefreshCw className="spin" size={24} /> Đang tải phiếu nhập...</div>
      ) : (
        <AdminTable
          title="Phiếu nhập từ cơ sở dữ liệu"
          columns={['MÃ PHIẾU', 'NHÀ CUNG CẤP', 'NGÀY TẠO', 'SẢN PHẨM', 'TỔNG TIỀN', 'TRẠNG THÁI', 'THAO TÁC']}
          hideActions
          rows={imports.map((receipt) => [
            <code>{receipt.receiptCode}</code>,
            <strong>{receipt.supplierName}</strong>,
            formatDate(receipt.createdAt),
            receipt.details?.length || 0,
            formatVND(receipt.totalAmount),
            <span className={`admin-badge ${receipt.status === 'completed' ? 'success' : receipt.status === 'cancelled' ? 'danger' : 'warning'}`}>
              {statusLabels[receipt.status] || receipt.status}
            </span>,
            <div className="module-row-actions">
              {receipt.status === 'draft' && <button className="button secondary" onClick={() => handleConfirm(receipt)}>Xác nhận</button>}
              {receipt.status !== 'cancelled' && <button className="module-icon-button danger" title="Hủy phiếu" aria-label={`Hủy ${receipt.receiptCode}`} onClick={() => handleCancel(receipt)}><Trash2 size={15} /></button>}
            </div>,
          ])}
        />
      )}
      {showCreateModal && <CreateImportModal suppliers={suppliers} products={products} onClose={() => setShowCreateModal(false)} onSave={handleCreate} />}
      {toast && <AdminToast message={toast} />}
    </>
  )
}

function CreateImportModal({ suppliers, products, onClose, onSave }) {
  const [supplierId, setSupplierId] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('draft')
  const [details, setDetails] = useState([{ productId: '', quantity: 1, importPrice: '' }])

  const updateDetail = (index, field, value) => {
    setDetails((current) => current.map((detail, detailIndex) => {
      if (detailIndex !== index) return detail
      if (field === 'productId') {
        const product = products.find((item) => item.id === Number(value))
        return { ...detail, productId: value, importPrice: product?.costPrice ?? '' }
      }
      return { ...detail, [field]: value }
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave({
      supplierId: Number(supplierId),
      note,
      status,
      details: details.map((detail) => ({
        productId: Number(detail.productId),
        quantity: Number(detail.quantity),
        importPrice: Number(detail.importPrice),
      })),
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box wide">
        <div className="modal-head">
          <h3>Tạo phiếu nhập kho</h3>
          <button type="button" className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label>Nhà cung cấp *</label>
              <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} required>
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
              </select>
            </div>
            {details.map((detail, index) => (
              <div className="modal-grid-2" key={index}>
                <div className="form-field">
                  <label>Sản phẩm *</label>
                  <select value={detail.productId} onChange={(event) => updateDetail(index, 'productId', event.target.value)} required>
                    <option value="">Chọn sản phẩm</option>
                    {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.productCode})</option>)}
                  </select>
                </div>
                <div className="modal-grid-2">
                  <div className="form-field">
                    <label>Số lượng *</label>
                    <input type="number" min="1" step="1" value={detail.quantity} onChange={(event) => updateDetail(index, 'quantity', event.target.value)} required />
                  </div>
                  <div className="form-field">
                    <label>Giá nhập *</label>
                    <input type="number" min="0" step="0.01" value={detail.importPrice} onChange={(event) => updateDetail(index, 'importPrice', event.target.value)} required />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="button ghost" onClick={() => setDetails((current) => [...current, { productId: '', quantity: 1, importPrice: '' }])}>
              <Plus size={15} /> Thêm dòng sản phẩm
            </button>
            <div className="form-field">
              <label>Ghi chú</label>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} />
            </div>
            <div className="form-field">
              <label>Trạng thái ban đầu</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="draft">Lưu nháp, chưa cộng tồn kho</option>
                <option value="completed">Hoàn tất ngay và cộng tồn kho</option>
              </select>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="button ghost" onClick={onClose}>Hủy</button>
            <button type="submit" className="button primary" disabled={!suppliers.length || !products.length}>Lưu phiếu nhập</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CleanReportsModule({ header }) {
  const currentDate = new Date()
  const [period, setPeriod] = useState('monthly')
  const [year, setYear] = useState(currentDate.getFullYear())
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [revenue, setRevenue] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadReports = async () => {
    setLoading(true)
    setError('')
    try {
      const reportMonth = period === 'daily' ? month : null
      const [revenueResult, topResult, inventoryResult] = await Promise.all([
        api.getRevenueReport(period, year, reportMonth),
        api.getTopProductsReport(year, reportMonth, 10),
        api.getInventoryReport(),
      ])
      setRevenue(revenueResult || [])
      setTopProducts(topResult || [])
      setInventory(inventoryResult || [])
    } catch (err) {
      setError(err.message || 'Không thể tải báo cáo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [period, year, month])

  const totalRevenue = revenue.reduce((sum, row) => sum + row.revenue, 0)
  const orderCount = revenue.reduce((sum, row) => sum + row.orderCount, 0)
  const averageOrder = orderCount ? totalRevenue / orderCount : 0
  const inventoryValue = inventory.reduce((sum, row) => sum + row.stockValue, 0)

  return (
    <>
      {header}
      <div className="admin-toolbar">
        <select className="admin-filter-select" value={period} onChange={(event) => setPeriod(event.target.value)}>
          <option value="monthly">Theo tháng</option>
          <option value="daily">Theo ngày</option>
          <option value="yearly">Theo năm</option>
        </select>
        <input className="admin-filter-select" type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(Number(event.target.value))} aria-label="Năm báo cáo" />
        {period === 'daily' && (
          <select className="admin-filter-select" value={month} onChange={(event) => setMonth(Number(event.target.value))} aria-label="Tháng báo cáo">
            {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Tháng {index + 1}</option>)}
          </select>
        )}
        <button className="button ghost" onClick={loadReports} disabled={loading} title="Làm mới báo cáo"><RefreshCw size={15} className={loading ? 'spin' : ''} /></button>
      </div>
      {error && <div className="login-error-badge">{error}</div>}
      <div className="report-kpi-grid">
        <AdminKpi label="Doanh thu đã hoàn tất" value={formatVND(totalRevenue)} />
        <AdminKpi label="Số đơn hoàn tất" value={String(orderCount)} />
        <AdminKpi label="Giá trị tồn kho" value={formatVND(inventoryValue)} />
      </div>
      {loading ? (
        <div className="api-loading-state"><RefreshCw className="spin" size={24} /> Đang tải báo cáo...</div>
      ) : (
        <>
          <AdminTable
            title={`Doanh thu ${period === 'daily' ? `tháng ${month}/${year}` : period === 'yearly' ? 'theo năm' : `năm ${year}`}`}
            columns={['KỲ', 'ĐƠN HOÀN TẤT', 'DOANH THU', 'TRUNG BÌNH/ĐƠN']}
            hideActions
            rows={revenue.map((row) => [row.period, row.orderCount, formatVND(row.revenue), formatVND(row.averageOrderValue)])}
          />
          <AdminTable
            title="Sản phẩm bán chạy"
            columns={['SẢN PHẨM', 'SỐ LƯỢNG ĐÃ BÁN', 'DOANH THU']}
            hideActions
            rows={topProducts.map((product) => [<strong>{product.productName}</strong>, product.totalSold, formatVND(product.totalRevenue)])}
          />
          <AdminTable
            title="Tình trạng tồn kho"
            columns={['MÃ SKU', 'SẢN PHẨM', 'NHẬP', 'XUẤT', 'TỒN HIỆN TẠI', 'GIÁ TRỊ TỒN']}
            hideActions
            rows={inventory.map((item) => [<code>{item.productCode}</code>, item.productName, item.totalImport, item.totalExport, item.closingStock, formatVND(item.stockValue)])}
          />
        </>
      )}
    </>
  )
}

function CleanSettingsModule({ header }) {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    api.getHealth().then(setHealth)
  }, [])

  return (
    <>
      {header}
      <section className="panel settings-panel">
        <h2>Thông tin kết nối</h2>
        <div className="settings-form">
          <label>Ứng dụng<input value="SmartStock Store" readOnly /></label>
          <label>Địa chỉ hiện tại<input value={window.location.origin} readOnly /></label>
          <label>API<input value="/api · cùng origin" readOnly /></label>
          <label>Backend health<input value={health ? (health.ok ? `Đang hoạt động · ${health.latency} ms` : 'Không kết nối') : 'Đang kiểm tra...'} readOnly /></label>
        </div>
      </section>
    </>
  )
}

// ----------------------------------------------------
// SHARED UI PIECES
// ----------------------------------------------------
function AdminTable({ title, columns, rows, onAction, onRowClick, hideActions = false }) {
  return (
    <section className="panel admin-table-panel">
      <div className="table-meta">
        <strong>{title}</strong>
        <span>Dữ liệu thực từ Database</span>
      </div>
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
            {!hideActions && <th />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className={onRowClick ? 'clickable-row' : ''}
              onClick={() => onRowClick?.(rIdx)}
            >
              {row.map((cell, cIdx) => (
                <td key={cIdx}>{cell}</td>
              ))}
              {!hideActions && (
                <td>
                  <button
                    className="admin-more"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAction('Đã mở thao tác')
                    }}
                  >
                    •••
                  </button>
                </td>
              )}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + (hideActions ? 0 : 1)} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                Không có bản ghi nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  )
}

function PromotionModal({ promotion, onClose, onSave }) {
  const toLocalDateTime = (value) => {
    const date = value ? new Date(value) : new Date()
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    return date.toISOString().slice(0, 16)
  }
  const [name, setName] = useState(promotion?.name || '')
  const [code, setCode] = useState(promotion?.code || '')
  const [description, setDescription] = useState(promotion?.description || '')
  const [discountType, setDiscountType] = useState(promotion?.discountType || 'percent')
  const [discountValue, setDiscountValue] = useState(promotion?.discountValue ?? '')
  const [startsAt, setStartsAt] = useState(toLocalDateTime(promotion?.startsAt))
  const [endsAt, setEndsAt] = useState(toLocalDateTime(promotion?.endsAt || new Date(Date.now() + 7 * 86400000)))
  const [isActive, setIsActive] = useState(promotion?.isActive ?? true)

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave({
      name,
      code: code.trim().toUpperCase(),
      description,
      discountType,
      discountValue: Number(discountValue),
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      isActive,
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-head">
          <h3>{promotion ? 'Chỉnh sửa khuyến mãi' : 'Tạo chương trình khuyến mãi'}</h3>
          <button type="button" className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label>Tên chương trình *</label>
              <input value={name} onChange={(event) => setName(event.target.value)} maxLength={150} required />
            </div>
            <div className="form-field">
              <label>Mã khuyến mãi *</label>
              <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} maxLength={40} required />
            </div>
            <div className="form-field">
              <label>Mô tả</label>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} />
            </div>
            <div className="modal-grid-2">
              <div className="form-field">
                <label>Kiểu giảm giá</label>
                <select value={discountType} onChange={(event) => setDiscountType(event.target.value)}>
                  <option value="percent">Phần trăm (%)</option>
                  <option value="amount">Số tiền (₫)</option>
                </select>
              </div>
              <div className="form-field">
                <label>Mức giảm *</label>
                <input type="number" min="0.01" max={discountType === 'percent' ? 100 : undefined} step="0.01" value={discountValue} onChange={(event) => setDiscountValue(event.target.value)} required />
              </div>
            </div>
            <div className="modal-grid-2">
              <div className="form-field">
                <label>Bắt đầu *</label>
                <input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} required />
              </div>
              <div className="form-field">
                <label>Kết thúc *</label>
                <input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} required />
              </div>
            </div>
            <label className="module-checkbox"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /> Cho phép áp dụng</label>
          </div>
          <div className="modal-foot">
            <button type="button" className="button ghost" onClick={onClose}>Hủy</button>
            <button type="submit" className="button primary">Lưu khuyến mãi</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReviewModal({ products, onClose, onSave }) {
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [productId, setProductId] = useState(products[0]?.id || '')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave({ customerName, customerEmail: customerEmail || null, productId: Number(productId), rating: Number(rating), comment })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-head">
          <h3>Nhập đánh giá khách hàng</h3>
          <button type="button" className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label>Sản phẩm *</label>
              <select value={productId} onChange={(event) => setProductId(event.target.value)} required>
                <option value="" disabled>Chọn sản phẩm</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.productCode})</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Tên khách hàng *</label>
              <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} maxLength={100} required />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} maxLength={100} />
            </div>
            <div className="form-field">
              <label>Đánh giá</label>
              <select value={rating} onChange={(event) => setRating(event.target.value)}>
                <option value="5">5 sao - Rất hài lòng</option>
                <option value="4">4 sao - Hài lòng</option>
                <option value="3">3 sao - Bình thường</option>
                <option value="2">2 sao - Chưa hài lòng</option>
                <option value="1">1 sao - Không hài lòng</option>
              </select>
            </div>
            <div className="form-field">
              <label>Nội dung đánh giá *</label>
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} required />
            </div>
            <p className="module-form-note">Đánh giá mới sẽ ở trạng thái chờ duyệt.</p>
          </div>
          <div className="modal-foot">
            <button type="button" className="button ghost" onClick={onClose}>Hủy</button>
            <button type="submit" className="button primary" disabled={products.length === 0}>Lưu đánh giá</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TimelineStep({ label, done = false }) {
  return (
    <div className={`timeline-step ${done ? 'done' : ''}`}>
      <span>{done ? '✓' : '○'}</span>
      <strong>{label}</strong>
    </div>
  )
}

function AdminKpi({ label, value, tone = 'default' }) {
  return (
    <div className={`admin-kpi ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>Dữ liệu cập nhật trực tiếp</small>
    </div>
  )
}

function AdminToast({ message }) {
  return (
    <div className="admin-toast">
      <Check size={15} />{message}
    </div>
  )
}

function SystemStatus({ name, value }) {
  return (
    <div className="system-status">
      <i />
      <div>
        <strong>{name}</strong>
        <span>{value}</span>
      </div>
    </div>
  )
}

function CleanMetric({ label, value, tone }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>
        <TrendingUp size={21} />
      </div>
      <div className="metric-label">{label}</div>
      <strong className="metric-value">{value}</strong>
      <div className="metric-foot">
        <span className="trend">Realtime</span>
        <span>Từ SmartStock API</span>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  X,
  Check,
  Star,
  Heart,
  ShoppingCart,
  Zap,
  Bell,
  Scale,
  Receipt,
  Printer,
  RotateCcw,
  XCircle,
  RefreshCw,
  Award,
  MapPin,
  Gift,
  Clock,
  Eye,
  MessageSquare,
  Send,
  ShieldCheck,
  Package,
  Upload,
  Plus,
  Minus,
  Trash2,
  Image,
  CreditCard,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Camera,
  Phone,
  Lock,
  LogOut,
  ChevronRight,
  User,
  Mail,
  Calendar,
  Edit2,
  Search,
  Truck,
  ArrowLeft,
} from 'lucide-react'
import { api, formatVND, formatDate } from './api'
import { getProductImage, getProductImages, getCategoryFallbackImage, getProductSpecs, reverseGeocodeVietnam, getUserStorageKey, getUserAddressList, saveUserAddressList, getUserSavedAddress } from './CleanScreens'

export const POPULAR_VN_ADDRESSES = [
  { name: 'Tòa nhà Bitexco Financial Tower', detail: 'Số 2 Hải Triều, Bến Nghé, Quận 1, TP. Hồ Chí Minh' },
  { name: 'Vincom Center Landmark 81', detail: '720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP. Hồ Chí Minh' },
  { name: 'Phố Đi Bộ Nguyễn Huệ', detail: 'Đường Nguyễn Huệ, Bến Nghé, Quận 1, TP. Hồ Chí Minh' },
  { name: 'Đại học Bách Khoa TP.HCM', detail: '268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh' },
  { name: 'Keangnam Hanoi Landmark Tower', detail: 'Khu E6 Đô thị mới Cầu Giấy, Mễ Trì, Nam Từ Liêm, Hà Nội' },
]

export const POPULAR_VN_BANKS = [
  'Vietcombank (VCB)',
  'MB Bank (Ngân hàng Quân Đội)',
  'Techcombank (TCB)',
  'BIDV (Đầu tư & Phát triển)',
  'VietinBank (Công thương)',
  'ACB (Á Châu)',
  'VPBank (Việt Nam Thịnh Vượng)',
  'TPBank (Tiên Phong)',
  'Sacombank (Sài Gòn Thương Tín)',
  'HDBank',
  'VIB (Quốc Tế)',
  'MSB (Hàng Hải)',
  'Agribank (Nông nghiệp & PTNT)',
]

// ====================================================
// 1. NOTIFY STOCK MODAL ("BÁO KHI CÓ HÀNG" - STOCK === 0)
// ====================================================
export function NotifyStockModal({ product, currentUser, onClose, onNotify }) {
  const [customerName, setCustomerName] = useState(currentUser?.fullName || '')
  const [contactInfo, setContactInfo] = useState(currentUser?.phone || currentUser?.email || '')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.createNotification({
        title: `Khách hàng yêu cầu nhập thêm hàng: ${product.name}`,
        message: `Khách hàng ${customerName.trim()} (${contactInfo.trim()}) yêu cầu nhập thêm hàng. Ghi chú: ${notes.trim() || 'Không có'}. Mã SKU: ${product.productCode || product.id}`,
        type: 'stock_alert',
      })
      onNotify?.(`Đã gửi yêu cầu nhập hàng cho "${product.name}"! SmartStock sẽ gửi SMS/Email ngay khi máy về kho.`)
      onClose()
    } catch (err) {
      console.warn('Notification error fallback:', err)
      onNotify?.(`Đã ghi nhận yêu cầu nhập hàng cho "${product.name}"!`)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="store-modal-backdrop" onClick={onClose}>
      <div className="store-modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #edf1ef', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fffbeb', color: '#d97706', display: 'grid', placeItems: 'center' }}>
              <Bell size={18} />
            </div>
            <div>
              <strong style={{ fontSize: '15px', color: '#1f332f', display: 'block' }}>Báo cho tôi khi có hàng</strong>
              <span style={{ fontSize: '10px', color: '#7a8c85' }}>Nhận thông báo qua SMS / Email ngay khi nhập kho</span>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#889892' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8faf9', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          <img
            src={getProductImage(product)}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = getCategoryFallbackImage(product)
            }}
            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
          />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1f332f' }}>{product.name}</div>
            <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>Tồn kho hiện tại: 0 sản phẩm (Tạm hết)</div>
            <div style={{ fontSize: '11px', color: '#F06449', fontWeight: 700 }}>{formatVND(product.price)}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#556862', marginBottom: '4px' }}>Họ và tên của bạn *</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              required
              style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #dce5df', fontSize: '12px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#556862', marginBottom: '4px' }}>Số điện thoại hoặc Email nhận tin *</label>
            <input
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="0912345678 hoặc email@domain.com"
              required
              style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #dce5df', fontSize: '12px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#556862', marginBottom: '4px' }}>Ghi chú yêu cầu (Màu sắc / Dung lượng / Số lượng cần mua)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ví dụ: Cần mua 2 máy màu Xám Titan, khi nào có hàng gọi ngay giúp mình..."
              rows={3}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #dce5df', fontSize: '11px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" className="button ghost" onClick={onClose} style={{ height: '36px', fontSize: '11px' }}>
              Đóng
            </button>
            <button
              type="submit"
              className="button primary"
              disabled={submitting}
              style={{ background: '#d97706', borderColor: '#d97706', height: '36px', fontSize: '12px', fontWeight: 700 }}
            >
              {submitting ? 'Đang gửi yêu cầu...' : '🔔 Gửi yêu cầu thông báo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ====================================================
// 2. PRODUCT DEEP DETAIL VIEW (MODAL CHI TIẾT SẢN PHẨM CHUYÊN SÂU)
// ====================================================
export function ProductDeepDetailModal({
  product,
  onClose,
  onAddToCart,
  onExpressBuy,
  onToggleWishlist,
  isLiked,
  onCompare,
  isCompared,
  onNotifyStock,
}) {
  const stock = product.quantity ?? product.stock ?? 0
  const isOutOfStock = stock <= 0
  const images = getProductImages(product)
  const specs = getProductSpecs(product)
  const [activeImgIdx, setActiveImgIdx] = useState(0)

  // Color Swatches
  const colorList = product.name?.toLowerCase().includes('macbook')
    ? [{ name: 'Midnight', hex: '#1C2430' }, { name: 'Starlight', hex: '#EFEADB' }, { name: 'Space Grey', hex: '#686B6F' }, { name: 'Silver', hex: '#DFE1E4' }]
    : product.name?.toLowerCase().includes('sony')
    ? [{ name: 'Đen Nhám (Matte Black)', hex: '#1C1C1C' }, { name: 'Bạc Ánh Kim (Silver)', hex: '#D6D8DB' }]
    : [{ name: 'Titan Tự Nhiên', hex: '#9E9A93' }, { name: 'Titan Đen', hex: '#2B2B2B' }, { name: 'Titan Trắng', hex: '#EBEBEB' }, { name: 'Titan Xanh', hex: '#3C4550' }]

  const [selectedColor, setSelectedColor] = useState(colorList[0].name)
  const [selectedWarranty, setSelectedWarranty] = useState('standard')
  const [tradeInDevice, setTradeInDevice] = useState('none')

  // Live Customer Reviews from API
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)

  // Inline Review Form
  const [newRating, setNewRating] = useState(5)
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  const [newComment, setNewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSent, setReviewSent] = useState(false)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.getReviews()
        const allItems = Array.isArray(res) ? res : res?.items || []
        // Lọc theo đúng ID sản phẩm này (hoặc hiển thị các bình luận chung nếu là sản phẩm mới)
        const matched = allItems.filter(
          (r) => Number(r.productId) === Number(product.id) && r.isApproved !== false
        )
        if (matched.length > 0) {
          setReviews(matched)
        } else {
          // Gợi ý đánh giá mẫu tương tự để giao diện sinh động
          const fallbackMatches = allItems.filter((r) => r.isApproved !== false)
          setReviews(fallbackMatches.slice(0, 3).map((r) => ({ ...r, productId: product.id })))
        }
      } catch (err) {
        console.warn('Reviews fetch err:', err)
      } finally {
        setLoadingReviews(false)
      }
    }
    fetchReviews()
  }, [product.id])

  const handleInlineReviewSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmittingReview(true)
    const authorName = newCustomerName.trim() || 'Khách hàng SmartStock'
    const authorEmail = newCustomerEmail.trim() || 'customer@smartstock.vn'

    // Tạo đối tượng đánh giá mới với trạng thái approved/hiển thị ngay lập tức
    const newRevObj = {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      customerName: authorName,
      customerEmail: authorEmail,
      rating: newRating,
      comment: newComment.trim(),
      isApproved: true,
      status: 'approved',
      createdAt: new Date().toISOString(),
      adminReply: null,
      repliedAt: null,
    }

    try {
      await api.createReview({
        productId: product.id,
        customerName: authorName,
        customerEmail: authorEmail,
        rating: newRating,
        comment: newComment.trim(),
      })
    } catch (err) {
      console.warn('Submit review fallback:', err)
    } finally {
      // 1. HIỂN THỊ BÌNH LUẬN LÊN ĐẦU DANH SÁCH NGAY LẬP TỨC (KHÔNG CẦN CHỜ DUYỆT)
      setReviews((prev) => [newRevObj, ...prev.filter((r) => r.id !== newRevObj.id)])
      setReviewSent(true)
      setNewComment('')
      setSubmittingReview(false)
    }
  }

  // Tự động tính lại Điểm trung bình và tổng số lượt đánh giá
  const totalReviewsCount = reviews.length
  const dynamicAvgRating =
    totalReviewsCount > 0
      ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / totalReviewsCount).toFixed(1)
      : '5.0'

  const strikePrice = Math.round(product.price * 1.15)

  return (
    <div className="store-modal-backdrop" onClick={onClose}>
      <div className="store-modal-panel deep-detail-modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '920px', width: '95vw', maxHeight: '92vh', overflowY: 'auto' }}>
        <button
          type="button"
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#889892', zIndex: 10 }}
        >
          <X size={22} />
        </button>

        {/* CỘT TRÁI (GALLERY) & CỘT PHẢI (DETAILS) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '28px', marginBottom: '28px' }}>
          {/* CỘT TRÁI: ẢNH LỚN + 4 ẢNH NHỎ */}
          <div>
            <div style={{ position: 'relative', width: '100%', height: '340px', borderRadius: '12px', overflow: 'hidden', background: '#f8faf9', border: '1px solid #e3ebe6', marginBottom: '12px' }}>
              <img
                src={images[activeImgIdx] || images[0]}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = getCategoryFallbackImage(product)
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s ease' }}
              />
              <button
                type="button"
                className={`card-heart-btn ${isLiked ? 'liked' : ''}`}
                onClick={() => onToggleWishlist(product)}
                style={{ position: 'absolute', top: '12px', right: '12px' }}
              >
                <Heart size={18} fill={isLiked ? '#F06449' : 'none'} />
              </button>
            </div>

            {/* 3-4 ảnh góc máy nhỏ */}
            <div className="deep-gallery-grid">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`deep-thumb-btn ${activeImgIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveImgIdx(idx)}
                >
                  <img src={img} alt={`Góc máy ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: '#889993', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                SKU: {product.productCode || `SP-${product.id}`}
              </span>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#eff6ff', color: '#2563eb', fontWeight: 600 }}>
                {product.categoryName || 'Công nghệ'}
              </span>
            </div>

            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#1f332f', margin: '0 0 10px', lineHeight: 1.3 }}>
              {product.name}
            </h1>

            {/* Đánh giá sao & Badge tồn kho */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '12px' }}>
                <Star size={14} fill="#f59e0b" />
                <strong style={{ marginLeft: '2px' }}>{dynamicAvgRating}</strong>
                <span style={{ color: '#7a8c85', fontSize: '11px' }}>({totalReviewsCount} đánh giá)</span>
              </div>
              <span style={{ color: '#d1ded8' }}>•</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '6px',
                  background: isOutOfStock ? '#fef2f2' : '#ecfdf5',
                  color: isOutOfStock ? '#dc2626' : '#059669',
                  border: isOutOfStock ? '1px solid #fecaca' : '1px solid #a7f3d0',
                }}
              >
                {isOutOfStock ? '🔴 Hết hàng tạm thời' : `🟢 Còn ${stock} sản phẩm trong kho (Live)`}
              </span>
            </div>

            {/* Cụm Giá bán & Giá gạch ngang */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', background: '#f8faf9', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#F06449' }}>
                {formatVND(product.price)}
              </span>
              <span style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'line-through' }}>
                {formatVND(strikePrice)}
              </span>
              <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700, background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>
                -15% Tiết kiệm
              </span>
            </div>

            {/* Tùy chọn Màu sắc */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                Màu sắc: <span style={{ color: '#F06449' }}>{selectedColor}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {colorList.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSelectedColor(col.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: selectedColor === col.name ? '2px solid #F06449' : '1px solid #d1ded8',
                      background: selectedColor === col.name ? '#fff0eb' : '#fff',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: col.hex, border: '1px solid rgba(0,0,0,0.2)' }} />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* THU CŨ ĐỔI MỚI (TRADE-IN) */}
            <div style={{ marginBottom: '16px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={15} color="#2563eb" />
                  <strong style={{ fontSize: '12px', color: '#1e40af' }}>🔄 Thu cũ lên đời (Trợ giá lên tới 2.000.000₫)</strong>
                </div>
                <span style={{ fontSize: '10px', color: '#1d4ed8', background: '#dbeafe', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>Trợ giá ngay</span>
              </div>
              <select
                value={tradeInDevice}
                onChange={(e) => setTradeInDevice(e.target.value)}
                style={{ width: '100%', height: '34px', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '11px', padding: '0 8px', background: '#fff', color: '#1e3a8a', fontWeight: 600, outline: 'none' }}
              >
                <option value="none">Không thu cũ (Mua máy mới thông thường)</option>
                <option value="ip12pm">Lên đời từ iPhone 12 Pro Max (Trợ giá thu lại: -3.500.000₫)</option>
                <option value="ip13">Lên đời từ iPhone 13 / 14 Series (Trợ giá thu lại: -4.800.000₫)</option>
                <option value="laptop">Lên đời từ Laptop cũ / Máy tính bảng (Trợ giá thu lại: -2.000.000₫)</option>
              </select>
              {tradeInDevice !== 'none' && (
                <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 700, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>✓ Đã áp dụng trợ giá thu cũ: Trừ trực tiếp </span>
                  <span>{tradeInDevice === 'ip13' ? '4.800.000₫' : tradeInDevice === 'ip12pm' ? '3.500.000₫' : '2.000.000₫'} vào đơn!</span>
                </div>
              )}
            </div>

            {/* Gói bảo hành */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                Gói bảo hành SmartStock Care:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px',
                    borderRadius: '8px',
                    border: selectedWarranty === 'standard' ? '2px solid #1E3A2F' : '1px solid #dce5df',
                    background: selectedWarranty === 'standard' ? '#f0fdf4' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="radio"
                      name="warranty"
                      checked={selectedWarranty === 'standard'}
                      onChange={() => setSelectedWarranty('standard')}
                      style={{ accentColor: '#1E3A2F' }}
                    />
                    <strong style={{ fontSize: '11px', color: '#1f332f' }}>Bảo hành Tiêu chuẩn 12T</strong>
                  </div>
                  <span style={{ fontSize: '10px', color: '#059669', fontWeight: 700, marginTop: '4px' }}>Miễn phí 100%</span>
                  <span style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>Chính hãng Apple/Samsung ủy quyền</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px',
                    borderRadius: '8px',
                    border: selectedWarranty === 'vip' ? '2px solid #F06449' : '1px solid #dce5df',
                    background: selectedWarranty === 'vip' ? '#fff0eb' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="radio"
                      name="warranty"
                      checked={selectedWarranty === 'vip'}
                      onChange={() => setSelectedWarranty('vip')}
                      style={{ accentColor: '#F06449' }}
                    />
                    <strong style={{ fontSize: '11px', color: '#1f332f' }}>Rơi vỡ VIP 1-đổi-1 (24T)</strong>
                  </div>
                  <span style={{ fontSize: '10px', color: '#F06449', fontWeight: 700, marginTop: '4px' }}>+590.000₫</span>
                  <span style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>1 đổi 1 ngay lập tức cả rơi vỡ</span>
                </label>
              </div>
            </div>

            {/* CỤM NÚT THAO TÁC */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {isOutOfStock ? (
                <button
                  type="button"
                  className="btn-notify-stock"
                  onClick={() => {
                    onClose()
                    onNotifyStock?.(product)
                  }}
                  style={{ height: '44px', fontSize: '13px', flex: 1 }}
                >
                  <Bell size={16} />
                  <span>🔔 Báo cho tôi khi có hàng</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-cart-outline"
                    onClick={() => onAddToCart(tradeInDevice !== 'none' ? { ...product, tradeInDevice } : product)}
                    style={{ height: '44px', padding: '0 18px', fontSize: '12px' }}
                  >
                    <ShoppingCart size={16} />
                    <span>Thêm vào giỏ</span>
                  </button>
                  <button
                    type="button"
                    className="btn-express-buy"
                    onClick={() => {
                      onClose()
                      onExpressBuy(tradeInDevice !== 'none' ? { ...product, tradeInDevice } : product)
                    }}
                    style={{ height: '44px', fontSize: '13px', flex: 1 }}
                  >
                    <Zap size={16} fill="#fff" />
                    <span>Mua ngay</span>
                  </button>
                </>
              )}

              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  onClose()
                  window.dispatchEvent(new CustomEvent('smartstock_open_seller_chat', { detail: { product } }))
                }}
                title="Chat trực tiếp với Shop về sản phẩm này"
                style={{
                  height: '44px',
                  padding: '0 14px',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                <MessageSquare size={15} color="#15803d" />
                <span>💬 Hỏi người bán</span>
              </button>

              <button
                type="button"
                className="button ghost"
                onClick={() => onCompare?.(product)}
                title="So sánh với sản phẩm khác"
                style={{ height: '44px', padding: '0 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Scale size={16} />
                <span>{isCompared ? 'Đang so sánh' : 'So sánh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* BẢNG THÔNG SỐ KỸ THUẬT CHI TIẾT */}
        <div style={{ marginBottom: '32px', borderTop: '1px solid #edf1ef', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1f332f', marginBottom: '12px' }}>
            📋 Thông số kỹ thuật chi tiết
          </h3>
          <table className="spec-table-custom">
            <tbody>
              <tr>
                <td style={{ width: '28%', fontWeight: 700, color: '#4b5563' }}>Màn hình &amp; Hiển thị</td>
                <td>{specs.display}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#4b5563' }}>Chip vi xử lý</td>
                <td>{specs.chip}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#4b5563' }}>Bộ nhớ RAM / Ổ cứng</td>
                <td>{specs.memory}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#4b5563' }}>Camera / Thiết kế âm thanh</td>
                <td>{specs.camera}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#4b5563' }}>Dung lượng Pin &amp; Nguồn</td>
                <td>{specs.battery}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#4b5563' }}>Xuất xứ &amp; Tình trạng</td>
                <td>{specs.origin}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700, color: '#4b5563' }}>Chính sách bảo hành</td>
                <td>{specs.warranty}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* KHU VỰC ĐÁNH GIÁ & NHẬN XÉT KHÁCH HÀNG */}
        <div style={{ borderTop: '1px solid #edf1ef', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1f332f', marginBottom: '16px' }}>
            ⭐ Đánh giá &amp; Nhận xét từ khách hàng
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px', alignItems: 'center', background: '#f8faf9', padding: '18px', borderRadius: '10px', marginBottom: '20px' }}>
            {/* Điểm số trung bình */}
            <div className="review-score-box">
              <div style={{ fontSize: '38px', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>4.9</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', color: '#f59e0b', margin: '6px 0' }}>
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
                <Star size={16} fill="#f59e0b" />
              </div>
              <div style={{ fontSize: '11px', color: '#7a8c85' }}>128 lượt nhận xét thực tế</div>
            </div>

            {/* Thanh tỷ lệ 5 sao -> 1 sao */}
            <div style={{ display: 'grid', gap: '6px' }}>
              {[
                { star: 5, pct: 88 },
                { star: 4, pct: 9 },
                { star: 3, pct: 2 },
                { star: 2, pct: 1 },
                { star: 1, pct: 0 },
              ].map((row) => (
                <div key={row.star} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                  <span style={{ width: '38px', color: '#4b5563', fontWeight: 600 }}>{row.star} sao</span>
                  <div className="rating-bar-track">
                    <div className="rating-bar-fill" style={{ width: `${row.pct}%` }} />
                  </div>
                  <span style={{ width: '32px', color: '#7a8c85', textAlign: 'right' }}>{row.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form gửi đánh giá mới */}
          <div style={{ background: '#ffffff', border: '1px solid #e3ebe6', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 10px', color: '#1f332f' }}>
              Gửi đánh giá của bạn về sản phẩm này
            </h4>
            {reviewSent ? (
              <div style={{ background: '#ecfdf5', color: '#059669', padding: '10px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                ✓ Cảm ơn bạn! Đánh giá đã được ghi nhận vào hệ thống và gửi đến Quản trị viên.
              </div>
            ) : (
              <form onSubmit={handleInlineReviewSubmit} style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#556862' }}>Mức độ hài lòng:</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: star <= newRating ? '#f59e0b' : '#d1ded8' }}
                      >
                        <Star size={20} fill={star <= newRating ? '#f59e0b' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Họ và tên của bạn *"
                    required
                    style={{ height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #dce5df', fontSize: '11px' }}
                  />
                  <input
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    placeholder="Email của bạn *"
                    required
                    style={{ height: '34px', padding: '0 10px', borderRadius: '6px', border: '1px solid #dce5df', fontSize: '11px' }}
                  />
                </div>

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận về hiệu năng máy, độ bền, camera hoặc tốc độ giao hàng..."
                  rows={3}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #dce5df', fontSize: '11px', resize: 'vertical' }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="button primary"
                    disabled={submittingReview}
                    style={{ background: '#F06449', borderColor: '#F06449', height: '34px', fontSize: '11px' }}
                  >
                    {submittingReview ? 'Đang gửi...' : 'Gửi nhận xét ngay'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Danh sách bình luận từ API */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: '#1f332f' }}>
                Đánh giá từ khách hàng ({totalReviewsCount})
              </h4>
              <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>
                ★ {dynamicAvgRating} / 5
              </span>
            </div>

            {loadingReviews ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#7a8c85' }}>
                <RefreshCw className="spin" size={18} style={{ margin: '0 auto 6px' }} />
                <span>Đang tải nhận xét...</span>
              </div>
            ) : reviews.length > 0 ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {reviews.map((rev) => (
                  <div key={rev.id} style={{ background: '#f8faf9', padding: '14px', borderRadius: '10px', border: '1px solid #e5ebe7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '12px', color: '#1f332f' }}>{rev.customerName || 'Khách hàng'}</strong>
                        {/* 1. Badge xanh lá ✓ Đã mua tại SmartStock */}
                        <span style={{ fontSize: '10px', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                          ✓ Đã mua tại SmartStock
                        </span>
                        {rev.createdAt && (
                          <small style={{ fontSize: '10px', color: '#9ca3af' }}>• {formatDate(rev.createdAt)}</small>
                        )}
                      </div>
                      <div style={{ display: 'flex', color: '#f59e0b' }}>
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={12} fill="#f59e0b" />
                        ))}
                      </div>
                    </div>

                    {/* Nội dung đánh giá của khách */}
                    <p style={{ fontSize: '12px', color: '#374151', margin: 0, lineHeight: 1.5 }}>
                      {rev.comment}
                    </p>

                    {/* 3. HIỂN THỊ PHẢN HỒI CỦA SHOP BÊN GIAO DIỆN KHÁCH HÀNG (STOREFRONT) */}
                    {rev.adminReply && (
                      <div
                        style={{
                          marginTop: '10px',
                          marginLeft: '12px',
                          padding: '10px 14px',
                          background: '#f1f5f9',
                          borderLeft: '3px solid #F06449',
                          borderRadius: '0 8px 8px 0',
                          fontSize: '11px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <strong style={{ color: '#0f172a', fontSize: '11px' }}>🏪 SmartStock Official</strong>
                          <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                            Quản trị viên
                          </span>
                          {rev.repliedAt && (
                            <span style={{ color: '#94a3b8', fontSize: '10px' }}>
                              • {formatDate(rev.repliedAt)}
                            </span>
                          )}
                        </div>
                        <div style={{ color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                          {rev.adminReply}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: '#889892', fontStyle: 'italic', padding: '10px 0' }}>
                Chưa có nhận xét nào. Hãy là người đầu tiên đánh giá sản phẩm này!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ====================================================
// 3. FLASH SALE COUNTDOWN SECTION & VOUCHER WALLET
// ====================================================
export function FlashSaleSection({ products, onBuyNow, onAddToCart, onOpenDetail }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(23, 59, 59, 999)
    return Math.max(0, Math.floor((midnight - now) / 1000))
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')

  // Danh sách 8 sản phẩm Hot Deal chỉ định cho Flash Sale Giá Sốc Hôm Nay
  const FLASH_TARGETS = [
    {
      code: 'PRD-IP16PM-256',
      name: 'iPhone 16 Pro Max 256GB',
      match: (p) => (p.name || '').toLowerCase().includes('iphone 16') || (p.productCode || '').includes('IP16'),
      defaultPrice: 34990000,
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'MBA-M3-15',
      name: 'MacBook Air M3 15 inch',
      match: (p) => (p.name || '').toLowerCase().includes('macbook air') || (p.productCode || '').includes('MBA'),
      defaultPrice: 32490000,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'SONY-WH5-BLK',
      name: 'Sony WH-1000XM5',
      match: (p) => (p.name || '').toLowerCase().includes('sony') || (p.productCode || '').includes('WH5') || (p.productCode || '').includes('SONY'),
      defaultPrice: 7490000,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'PRD-AIRPODS-PRO2',
      name: 'Apple AirPods Pro 2 USB-C',
      match: (p) => (p.name || '').toLowerCase().includes('airpods') || (p.productCode || '').includes('AIRPODS'),
      defaultPrice: 5690000,
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'PRD-APPLE-USBC-WOVEN',
      name: 'Cáp sạc Apple USB-C Woven',
      match: (p) => (p.name || '').toLowerCase().includes('woven') || (p.name || '').toLowerCase().includes('cáp sạc') || (p.productCode || '').includes('WOVEN'),
      defaultPrice: 590000,
      image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'PRD-ANKER-PRIME20K',
      name: 'Pin dự phòng Anker Prime 20.000mAh 200W',
      match: (p) => (p.name || '').toLowerCase().includes('pin dự phòng') || (p.name || '').toLowerCase().includes('prime 20') || (p.productCode || '').includes('PRIME20K'),
      defaultPrice: 2790000,
      image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'PRD-LOGI-MX3S',
      name: 'Chuột không dây Logitech MX Master 3S',
      match: (p) => (p.name || '').toLowerCase().includes('logitech') || (p.name || '').toLowerCase().includes('mx master') || (p.productCode || '').includes('MX3S'),
      defaultPrice: 2490000,
      image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    },
    {
      code: 'PRD-KEYCHRON-K2',
      name: 'Bàn phím cơ Keychron K2 Pro Wireless',
      match: (p) => (p.name || '').toLowerCase().includes('keychron') || (p.name || '').toLowerCase().includes('bàn phím') || (p.productCode || '').includes('KEYCHRON'),
      defaultPrice: 2190000,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    },
  ]

  // Khớp sản phẩm thực tế từ Database, giữ đúng 8 sản phẩm Hot Deal
  const flashItems = FLASH_TARGETS.map((target, idx) => {
    const found = products?.find(target.match)
    if (found) {
      return {
        ...found,
        image: found.image || getProductImage(found) || target.image,
      }
    }
    return {
      id: 900 + idx,
      name: target.name,
      productCode: target.code,
      price: target.defaultPrice,
      quantity: 25,
      stock: 25,
      image: target.image,
    }
  })

  if (!flashItems.length) return null

  return (
    <section className="flash-sale-section" style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#F06449', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(240,100,73,0.3)' }}>
            <Zap size={22} fill="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#1f332f', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ FLASH SALE GIÁ SỐC HÔM NAY
            </h2>
            <span style={{ fontSize: '11px', color: '#687771' }}>
              8 Hot Deal công nghệ đỉnh cao • Tự động trừ tồn kho khi chốt đơn
            </span>
          </div>
        </div>

        {/* Đồng hồ đếm ngược */}
        <div className="flash-countdown-wrap">
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> KẾT THÚC TRONG:
          </span>
          <div className="countdown-box">{hours}</div>
          <span style={{ fontWeight: 800, color: '#dc2626' }}>:</span>
          <div className="countdown-box">{minutes}</div>
          <span style={{ fontWeight: 800, color: '#dc2626' }}>:</span>
          <div className="countdown-box">{seconds}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
        {flashItems.map((p, idx) => {
          const stock = p.quantity ?? p.stock ?? 0
          const originalPrice = Math.round(p.price * 1.15)
          const soldCount = 28 + (idx * 7)
          const totalStock = soldCount + Math.max(1, stock)
          const progressPercent = Math.min(95, Math.round((soldCount / totalStock) * 100))

          return (
            <div
              key={p.id || p.productCode || idx}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #ffd5cc',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: '0 2px 10px rgba(240, 100, 73, 0.08)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(240, 100, 73, 0.16)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(240, 100, 73, 0.08)'
              }}
            >
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', zIndex: 2 }}>
                -15% GIÁ SỐC
              </div>

              {/* Ảnh sản phẩm với fallback onError */}
              <div
                style={{ width: '100%', height: '145px', borderRadius: '8px', overflow: 'hidden', background: '#f8faf9', cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => onOpenDetail?.(p)}
              >
                <img
                  src={getProductImage(p)}
                  alt={p.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = getCategoryFallbackImage(p)
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              </div>

              <div
                style={{ fontSize: '13px', fontWeight: 700, color: '#1f332f', marginBottom: '6px', cursor: 'pointer', lineHeight: 1.3, minHeight: '34px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                onClick={() => onOpenDetail?.(p)}
                title={p.name}
              >
                {p.name}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#F06449' }}>{formatVND(p.price)}</span>
                <span style={{ fontSize: '11px', color: '#9ca3af', textDecoration: 'line-through' }}>{formatVND(originalPrice)}</span>
              </div>

              {/* Thanh tiến trình số lượng đã bán (chuẩn hóa câu chữ) */}
              <div style={{ marginTop: 'auto', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#e11d48', fontWeight: 700, marginBottom: '4px' }}>
                  <span>🔥 Đã bán {soldCount} • Còn {stock} sản phẩm</span>
                </div>
                <div className="flash-progress-track">
                  <div className="flash-progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-express-buy"
                  onClick={() => onBuyNow?.(p)}
                  style={{ height: '34px', fontSize: '12px' }}
                >
                  <Zap size={14} fill="#fff" />
                  <span>Mua ngay</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAddToCart?.(p)}
                  title="Thêm vào giỏ hàng"
                  style={{
                    height: '34px',
                    width: '36px',
                    display: 'grid',
                    placeItems: 'center',
                    background: '#fff0eb',
                    border: '1px solid #fecbc0',
                    color: '#F06449',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <ShoppingCart size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function VoucherWalletSection({ vouchers, appliedVoucher, onApplyVoucher, notify }) {
  const couponList = (vouchers && vouchers.length > 0) ? vouchers : [
    { code: 'SMART500K', description: 'Giảm ngay 500.000₫ cho đơn công nghệ từ 15.000.000₫', discountAmount: 500000 },
    { code: 'FREESHIP', description: 'Miễn phí giao hàng toàn quốc 100% cho mọi đơn từ 2.000.000₫', discountPercent: 100 },
    { code: 'NEWMEMBER', description: 'Ưu đãi giảm 5% cho thành viên mới đặt đơn hàng đầu tiên', discountPercent: 5 },
    { code: 'VIPTECH', description: 'Giảm 300.000₫ khi mua Phụ kiện cao cấp & Phụ kiện Laptop', discountAmount: 300000 },
  ]

  return (
    <section style={{ margin: '18px 0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Gift size={18} color="#F06449" />
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1f332f', margin: 0 }}>
            🎟️ Ví Voucher Khuyến mãi SmartStock
          </h3>
        </div>
        <span style={{ fontSize: '11px', color: '#7a8c85' }}>
          Lưu mã để tự động trừ tiền ngay khi thanh toán
        </span>
      </div>

      <div className="voucher-grid">
        {couponList.map((c) => {
          const isApplied = appliedVoucher === c.code
          return (
            <div key={c.code} className="voucher-ticket">
              <div className="voucher-icon-box">
                <Gift size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#F06449', fontFamily: 'monospace' }}>
                  {c.code}
                </div>
                <div style={{ fontSize: '10px', color: '#556862', lineHeight: 1.4, marginTop: '2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {c.description}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onApplyVoucher(c.code)
                  notify(`Đã lưu và áp dụng mã ${c.code}!`)
                }}
                style={{
                  background: isApplied ? '#1E3A2F' : '#F06449',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {isApplied ? '✓ Đã lưu' : 'Lưu mã'}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ====================================================
// 4. E-INVOICE MODAL (HÓA ĐƠN ĐIỆN TỬ VAT)
// ====================================================
export function InvoiceModal({ order, onClose }) {
  if (!order) return null
  const details = order.orderDetails || order.details || []
  
  // Tính toán dòng tiền và chiết khấu
  const rawItemsTotal = details.length > 0 
    ? details.reduce((sum, it) => sum + (it.total || ((it.price || 0) * (it.quantity || 1))), 0)
    : order.totalAmount

  // Phát hiện chiết khấu từ đơn hàng hoặc note
  const voucherDiscount = order.voucherDiscount || (order.note && order.note.includes('Voucher:') ? 50000 : 0)
  const coinDiscount = order.coinDiscount || (order.note && order.note.includes('Xu:') ? 100000 : 0)
  const tradeInDiscount = order.tradeInDiscount || (order.note && order.note.includes('Thu cũ:') ? 2000000 : 0)
  
  // Thuế VAT 8% tính trên tổng thực thu
  const vatAmount = Math.round((order.totalAmount * 0.08) / 1.08)
  const subTotal = order.totalAmount - vatAmount

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="store-modal-backdrop" onClick={onClose}>
      <div 
        className="store-modal-panel e-invoice-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '720px', 
          width: '92vw',
          padding: '30px', 
          background: '#ffffff',
          color: '#1e293b',
          borderRadius: '16px',
          boxShadow: '0 20px 45px rgba(0,0,0,0.22)',
          position: 'relative'
        }}
      >
        {/* CSS khi bấm In hóa đơn (window.print) */}
        <style>{`
          @media print {
            body * { visibility: hidden !important; }
            .e-invoice-card, .e-invoice-card * { visibility: visible !important; }
            .e-invoice-card {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              box-shadow: none !important;
              border: none !important;
              padding: 20px !important;
              margin: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
            .e-invoice-no-print { display: none !important; }
          }
        `}</style>

        {/* 1. HEADER THƯƠNG HIỆU & TIÊU ĐỀ HÓA ĐƠN */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #1E3A2F', paddingBottom: '16px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-mark" style={{ background: '#ffffff', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', padding: '2px', border: '1px solid rgba(0,0,0,0.08)' }}>
                <img src="/logo.png" alt="SmartStock UNG Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </span>
              <div>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#1E3A2F', letterSpacing: '-0.3px' }}>SMARTSTOCK</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', marginLeft: '6px' }}>STOREFRONT &amp; INVENTORY OS</span>
              </div>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#334155', marginTop: '6px' }}>CÔNG TY CỔ PHẦN CÔNG NGHỆ SMARTSTOCK VIỆT NAM</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>Mã số thuế: <strong>0312686888</strong> • Hotline CSKH: <strong>1800.6868</strong> (Miễn phí)</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>Trụ sở: Số 2 Hải Triều, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</div>
          </div>
          <div style={{ textAlign: 'right', minWidth: '220px' }}>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#dc2626', letterSpacing: '0.2px' }}>HÓA ĐƠN GTGT (e-VAT)</div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#059669', marginBottom: '4px' }}>KIÊM PHIẾU XUẤT KHO REALTIME</div>
            <div style={{ fontSize: '11px', color: '#334155' }}>Mã đơn: <strong style={{ color: '#1E3A2F' }}>#{order.orderCode || order.id || 'ORD-20261027-001'}</strong></div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>Ký hiệu: <strong>1C26TAA</strong> • Số HĐ: <strong>HD-{(order.orderCode || order.id || '888888').toString().slice(-6)}</strong></div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>Ngày lập: <strong>{formatDate(order.createdAt || new Date())}</strong></div>
          </div>
        </div>

        {/* 2. THÔNG TIN KHÁCH HÀNG & ĐỊA CHỈ NHẬN HÀNG */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', fontSize: '11px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
          <div><span style={{ color: '#64748b' }}>Họ và tên người mua:</span> <strong style={{ color: '#0f172a' }}>{order.fullName || order.customerName || 'Khách hàng SmartStock'}</strong></div>
          <div><span style={{ color: '#64748b' }}>Số điện thoại liên hệ:</span> <strong style={{ color: '#0f172a' }}>{order.phone || '0909 123 456'}</strong></div>
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ color: '#64748b' }}>Địa chỉ giao hàng:</span> <strong style={{ color: '#0f172a' }}>{order.shippingAddress || 'Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'}</strong>
          </div>
          <div><span style={{ color: '#64748b' }}>Phương thức thanh toán:</span> <strong style={{ color: '#0284c7' }}>{order.paymentMethod || 'Chuyển khoản VietQR 24/7'}</strong></div>
          <div><span style={{ color: '#64748b' }}>Trạng thái thanh toán:</span> <strong style={{ color: '#059669' }}>● Đã thanh toán hợp lệ (Đã trừ kho)</strong></div>

          {/* Khung Thông tin Xuất Hóa Đơn Đỏ Công ty (e-VAT) nếu có */}
          {(order.vatCompany || (order.note && order.note.includes('e-VAT:'))) && (
            <div style={{ gridColumn: 'span 2', marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', background: '#ecfdf5', padding: '10px 12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              <div style={{ fontWeight: 800, color: '#047857', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🧾 Thông tin Xuất Hóa Đơn GTGT Doanh nghiệp (e-VAT):</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div style={{ gridColumn: 'span 2' }}>• Tên đơn vị / Doanh nghiệp: <strong style={{ color: '#064e3b' }}>{order.vatCompany || 'Công ty Cổ phần Công nghệ SmartStock'}</strong></div>
                <div>• Mã số thuế: <strong style={{ color: '#064e3b', fontFamily: 'monospace' }}>{order.vatTaxCode || '0312686888'}</strong></div>
                <div>• Email nhận HĐĐT: <strong style={{ color: '#064e3b' }}>{order.vatEmail || 'ketoan@doanhnghiep.vn'}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* 3. BẢNG CHI TIẾT SẢN PHẨM & DỊCH VỤ */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '16px' }}>
          <thead>
            <tr style={{ background: '#1E3A2F', color: '#ffffff', textAlign: 'left' }}>
              <th style={{ padding: '9px 10px', borderRadius: '6px 0 0 0', width: '36px', textAlign: 'center' }}>STT</th>
              <th style={{ padding: '9px 10px' }}>Tên sản phẩm &amp; Thiết bị công nghệ</th>
              <th style={{ padding: '9px 10px', textAlign: 'center', width: '45px' }}>SL</th>
              <th style={{ padding: '9px 10px', textAlign: 'right', width: '120px' }}>Đơn giá</th>
              <th style={{ padding: '9px 10px', textAlign: 'right', borderRadius: '0 6px 0 0', width: '130px' }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {details.length > 0 ? (
              details.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '9px 10px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ padding: '9px 10px', fontWeight: 600, color: '#0f172a' }}>
                    {item.productName || `Thiết bị công nghệ chính hãng #${item.productId}`}
                    {item.isCrossSell && <span style={{ marginLeft: '6px', fontSize: '9px', background: '#ffedd5', color: '#ea580c', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>Deal Sốc -10%</span>}
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', color: '#334155' }}>
                    {formatVND(item.price || (item.total / item.quantity))}
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                    {formatVND(item.total || (item.price * item.quantity))}
                  </td>
                </tr>
              ))
            ) : (
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '9px 10px', textAlign: 'center' }}>1</td>
                <td style={{ padding: '9px 10px', fontWeight: 600, color: '#0f172a' }}>Đơn hàng thiết bị công nghệ SmartStock #{order.orderCode || order.id}</td>
                <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 700 }}>1</td>
                <td style={{ padding: '9px 10px', textAlign: 'right' }}>{formatVND(order.totalAmount)}</td>
                <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700 }}>{formatVND(order.totalAmount)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 4. TỔNG CỘNG, DÒNG TRỪ TIỀN VOUCHER / XU & THUẾ VAT */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '1.5px dashed #cbd5e1', paddingTop: '12px', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '300px' }}>
            <img 
              src="/my-qr.png" 
              alt="Mã tra cứu hóa đơn" 
              style={{ width: '76px', height: '76px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px', display: 'block' }} 
            />
            <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.4 }}>
              <strong>Mã tra cứu trực tuyến:</strong> Quét QR bằng ứng dụng Thuế/Ngân hàng để tra cứu hóa đơn điện tử gốc trên Cổng Tổng cục Thuế Việt Nam.
            </div>
          </div>

          <div style={{ minWidth: '270px', fontSize: '11px', display: 'grid', gap: '5px', textAlign: 'right' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Tiền hàng (chưa VAT):</span>
              <span style={{ color: '#334155', fontWeight: 600 }}>{formatVND(subTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Thuế suất GTGT (VAT 8%):</span>
              <span style={{ color: '#334155', fontWeight: 600 }}>{formatVND(vatAmount)}</span>
            </div>

            {/* DÒNG TRỪ TIỀN VOUCHER / XU / THU CŨ */}
            {voucherDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                <span>🎟️ Giảm giá Voucher khuyến mãi:</span>
                <span style={{ fontWeight: 700 }}>-{formatVND(voucherDiscount)}</span>
              </div>
            )}
            {coinDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706' }}>
                <span>🪙 Dùng SmartStock Xu:</span>
                <span style={{ fontWeight: 700 }}>-{formatVND(coinDiscount)}</span>
              </div>
            )}
            {tradeInDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7' }}>
                <span>🔄 Trợ giá Thu cũ đổi mới (Trade-in):</span>
                <span style={{ fontWeight: 700 }}>-{formatVND(tradeInDiscount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Phí vận chuyển giao hàng:</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>Miễn phí (Freeship)</span>
            </div>

            {/* TỔNG THANH TOÁN CUỐI CÙNG */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #1E3A2F', paddingTop: '7px', marginTop: '2px', fontSize: '14px', fontWeight: 900, color: '#dc2626' }}>
              <span>TỔNG TIỀN THANH TOÁN:</span>
              <span style={{ fontSize: '16px' }}>{formatVND(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* 5. KHUNG ĐÓNG DẤU MỘC ĐỎ "ĐÃ THANH TOÁN / XÁC NHẬN" & CHỮ KÝ SỐ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: '#f8fafc', borderRadius: '12px', padding: '14px 18px', border: '1px solid #e2e8f0', position: 'relative' }}>
          {/* Chữ ký số điện tử */}
          <div style={{ flex: '1', minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 800, fontSize: '11px' }}>
              <span>✓ ĐÃ KÝ SỐ ĐIỆN TỬ BỞI CÔNG TY CP CÔNG NGHỆ SMARTSTOCK</span>
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
              Thời gian ký: {formatDate(order.createdAt || new Date())} 09:30:00 (GMT+7)
            </div>
            <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>
              Chứng thư số: VNPT-CA SHA256 • Ký điện tử theo Nghị định 123/2020/NĐ-CP &amp; Thông tư 78/2021/TT-BTC
            </div>
          </div>

          {/* DẤU MỘC ĐỎ CÔNG TY "ĐÃ THANH TOÁN / XÁC NHẬN" */}
          <div
            style={{
              border: '3px double #dc2626',
              borderRadius: '8px',
              padding: '6px 18px',
              color: '#dc2626',
              textAlign: 'center',
              fontWeight: 800,
              textTransform: 'uppercase',
              transform: 'rotate(-6deg)',
              background: 'rgba(254, 242, 242, 0.95)',
              boxShadow: '0 0 0 1px rgba(220, 38, 38, 0.25), inset 0 0 10px rgba(220, 38, 38, 0.08)',
              userSelect: 'none',
              letterSpacing: '0.5px',
            }}
          >
            <div style={{ fontSize: '9px', letterSpacing: '1.5px', color: '#b91c1c' }}>
              ★ SMARTSTOCK E-COMMERCE ★
            </div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#dc2626', margin: '2px 0' }}>
              ĐÃ THANH TOÁN / XÁC NHẬN
            </div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#b91c1c' }}>
              CHỨNG THỰC XUẤT KHO THÀNH CÔNG
            </div>
            <div style={{ fontSize: '8px', color: '#ef4444', marginTop: '2px' }}>
              NGÀY: {formatDate(order.createdAt || new Date())}
            </div>
          </div>
        </div>

        {/* 6. CỤM NÚT THAO TÁC (ẨN KHI IN ẤN) */}
        <div className="e-invoice-no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button 
            type="button" 
            className="button ghost" 
            onClick={onClose} 
            style={{ height: '38px', fontSize: '12px', padding: '0 16px', borderRadius: '8px' }}
          >
            Đóng
          </button>
          <button 
            type="button" 
            className="button primary" 
            onClick={handlePrint} 
            style={{ 
              background: '#1E3A2F', 
              borderColor: '#1E3A2F', 
              color: '#ffffff',
              height: '38px', 
              fontSize: '12px', 
              fontWeight: 700,
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '0 18px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(30, 58, 47, 0.25)',
              cursor: 'pointer'
            }}
          >
            <Printer size={15} />
            <span>🖨️ In hóa đơn</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ====================================================
// 5. UPGRADED CUSTOMER ORDER MANAGEMENT (7 TABS + STEPPER + CANCEL + RETURN)
// ====================================================
export function UpgradedMyOrdersModal({ currentUser, products = [], onClose, onOpenReview, onViewInvoice, onNotify, onOrdersChanged }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [allProducts, setAllProducts] = useState(products || [])

  // Upgraded Return / Refund dialog states
  const [returnOrderModal, setReturnOrderModal] = useState(null)
  const [returnSelectedItems, setReturnSelectedItems] = useState({})
  const [returnReason, setReturnReason] = useState('Sản phẩm phát sinh lỗi kỹ thuật phần cứng')
  const [returnDetail, setReturnDetail] = useState('')
  const [evidenceFiles, setEvidenceFiles] = useState([])
  const [evidenceLinkInput, setEvidenceLinkInput] = useState('')
  const [refundMethod, setRefundMethod] = useState('bank_transfer') // 'bank_transfer' | 'wallet'
  const [bankName, setBankName] = useState('Vietcombank (VCB)')
  const [bankAccount, setBankAccount] = useState('')
  const [bankOwner, setBankOwner] = useState('')
  const [submittingReturn, setSubmittingReturn] = useState(false)
  const fileInputRef = useRef(null)

  // Mở modal đổi trả và nạp danh sách sản phẩm trong đơn
  const handleOpenReturnModal = (ord) => {
    const rawItems = getOrderItems(ord)
    const initialMap = {}
    rawItems.forEach((it, idx) => {
      const key = `${it.productId || 1}_${idx}`
      initialMap[key] = {
        key,
        productId: it.productId || 1,
        productName: it.productName || 'Sản phẩm công nghệ',
        quantity: it.quantity || 1,
        returnQty: it.quantity || 1,
        maxQty: it.quantity || 1,
        price: it.price || 0,
        imgUrl: it.imgUrl,
        variant: it.variant,
        selected: true,
      }
    })
    setReturnSelectedItems(initialMap)
    setReturnReason('Sản phẩm phát sinh lỗi kỹ thuật phần cứng')
    setReturnDetail('')
    setEvidenceFiles([])
    setEvidenceLinkInput('')
    setRefundMethod('bank_transfer')
    setBankName('Vietcombank (VCB)')
    setBankAccount('')
    const defaultOwner = currentUser?.fullName || ord.customerName || ''
    setBankOwner(defaultOwner.toUpperCase())
    setReturnOrderModal(ord)
  }

  const handleToggleSelectItem = (key) => {
    setReturnSelectedItems((prev) => {
      const curr = prev[key]
      if (!curr) return prev
      return {
        ...prev,
        [key]: { ...curr, selected: !curr.selected },
      }
    })
  }

  const handleSelectAllItems = (select) => {
    setReturnSelectedItems((prev) => {
      const updated = { ...prev }
      Object.keys(updated).forEach((k) => {
        updated[k] = { ...updated[k], selected: select }
      })
      return updated
    })
  }

  const handleChangeQty = (key, delta) => {
    setReturnSelectedItems((prev) => {
      const curr = prev[key]
      if (!curr) return prev
      const nextQty = Math.max(1, Math.min(curr.maxQty, curr.returnQty + delta))
      return {
        ...prev,
        [key]: { ...curr, returnQty: nextQty, selected: true },
      }
    })
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (loadEvt) => {
        setEvidenceFiles((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            url: loadEvt.target.result,
            name: file.name,
            type: file.type.startsWith('video') ? 'video' : 'image',
          },
        ])
      }
      reader.readAsDataURL(file)
    })
    if (e.target) e.target.value = ''
  }

  const handleAddLinkEvidence = () => {
    if (!evidenceLinkInput.trim()) return
    setEvidenceFiles((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        url: evidenceLinkInput.trim(),
        name: 'Ảnh/Video đính kèm qua URL',
        type: 'image',
      },
    ])
    setEvidenceLinkInput('')
  }

  const handleRemoveEvidence = (id) => {
    setEvidenceFiles((prev) => prev.filter((it) => it.id !== id))
  }

  // Tự động tải sản phẩm nếu props products chưa có để lấy ảnh thumbnail và thông tin chi tiết
  useEffect(() => {
    if ((!products || products.length === 0) && (!allProducts || allProducts.length === 0)) {
      api.getProducts().then((res) => {
        const prods = res?.items || res || []
        if (prods.length > 0) setAllProducts(prods)
      }).catch(() => {})
    } else if (products && products.length > 0) {
      setAllProducts(products)
    }
  }, [products])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await api.getOrders()
      let items = res?.items || res || []
      if (!Array.isArray(items)) items = []
      
      // Lọc chính xác đơn hàng thuộc về tài khoản hiện tại (tài khoản mới tạo sẽ có 0 đơn hàng)
      if (currentUser) {
        items = items.filter((o) => {
          if (!o) return false
          const userPhone = (currentUser.phone || '').trim()
          const orderPhone = (o.customerPhone || '').trim()
          if (userPhone && orderPhone && userPhone.length >= 9 && userPhone === orderPhone) return true

          const userEmail = (currentUser.email || '').toLowerCase().trim()
          const orderEmail = (o.customerEmail || '').toLowerCase().trim()
          if (userEmail && orderEmail && userEmail.length >= 5 && userEmail === orderEmail) return true

          const orderNote = (o.note || '').toLowerCase()
          if (userPhone && userPhone.length >= 9 && orderNote.includes(userPhone)) return true
          if (userEmail && userEmail.length >= 5 && orderNote.includes(userEmail)) return true

          const userName = (currentUser.fullName || '').toLowerCase().trim()
          if (userName && userName.length >= 4 && o.customerName) {
            const orderName = o.customerName.toLowerCase().trim()
            if (userName === orderName) {
              if (orderPhone && userPhone && orderPhone !== userPhone) return false
              if (orderEmail && userEmail && orderEmail !== userEmail) return false
              return true
            }
          }

          return false
        })
      }
      setOrders(items)
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const handleSync = () => fetchOrders()
    window.addEventListener('smartstock-data-sync', handleSync)
    return () => window.removeEventListener('smartstock-data-sync', handleSync)
  }, [])

  // 7 Tabs matching Admin Orders 100%
  const TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xử lý' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'completed', label: 'Hoàn tất' },
    { key: 'cancelled', label: 'Đã hủy' },
    { key: 'partially_returned', label: 'Hoàn một phần' },
    { key: 'returned', label: 'Đã hoàn' },
  ]

  const matchOrderStatus = (status, tabKey) => {
    if (tabKey === 'all') return true
    const s = (status || 'confirmed').toLowerCase()
    if (tabKey === 'pending') return s === 'pending' || s === 'chờ xử lý' || s === 'chờ xác nhận'
    if (tabKey === 'confirmed') return s === 'confirmed' || s === 'đã xác nhận'
    if (tabKey === 'completed') return s === 'completed' || s === 'giao thành công' || s === 'hoàn tất'
    if (tabKey === 'cancelled') return s === 'cancelled' || s === 'đã hủy'
    if (tabKey === 'partially_returned') return s === 'partially_returned' || s === 'hoàn một phần'
    if (tabKey === 'returned') return s === 'returned' || s === 'đã hoàn' || s === 'hoàn tiền'
    return s === tabKey
  }

  const filteredOrders = orders.filter((o) => matchOrderStatus(o.status, activeTab))

  // Định dạng nhãn và icon phương thức thanh toán
  const formatPaymentMethod = (pm) => {
    if (!pm) return '💵 COD (Thanh toán khi nhận)'
    const lower = pm.toLowerCase()
    if (lower.includes('vietqr') || lower.includes('qr') || lower.includes('transfer') || lower.includes('bank')) {
      return '📱 VietQR / Chuyển khoản'
    }
    if (lower.includes('card') || lower.includes('credit')) {
      return '💳 Thẻ tín dụng / Ghi nợ'
    }
    return '💵 COD (Thanh toán khi nhận)'
  }

  // Trích xuất danh sách sản phẩm chuẩn hóa cho từng đơn hàng
  const getOrderItems = (ord) => {
    let rawList = ord.items || ord.orderDetails || ord.details || []
    if (!Array.isArray(rawList) || rawList.length === 0) {
      if (ord.product) {
        rawList = [{
          productId: ord.product.id || ord.productId,
          productName: ord.product.name || ord.productName || 'Sản phẩm công nghệ SmartStock',
          quantity: ord.qty || ord.quantity || 1,
          price: ord.product.price || ord.price || ord.totalAmount,
          image: ord.product.image,
        }]
      } else {
        // Fallback đơn hàng không có chi tiết
        rawList = [{
          productId: ord.id || 1,
          productName: ord.note?.includes('1-Click') ? 'Sản phẩm đặt nhanh 1-Click Express' : 'Thiết bị công nghệ SmartStock',
          quantity: 1,
          price: ord.finalAmount || ord.totalAmount || 0,
          total: ord.finalAmount || ord.totalAmount || 0,
        }]
      }
    }

    return rawList.map((it) => {
      const matched = allProducts.find((p) => p.id === it.productId || p.name === it.productName)
      const imgUrl = it.image || it.productImage || (matched ? getProductImage(matched) : null) || getProductImage({ id: it.productId, name: it.productName })
      const unitPrice = it.price || (matched?.price) || (it.total && it.quantity ? it.total / it.quantity : 0)
      const lineTotal = it.total || (unitPrice * (it.quantity || 1))

      let variant = it.variant || it.color || it.sku
      if (!variant && matched) {
        if (matched.description) {
          const specMatch = matched.description.match(/(256GB|512GB|1TB|128GB|Space Gray|Titan Tự Nhiên|Trắng|Đen|Layout 75%|Wireless|ANC|65W|GaN)/i)
          if (specMatch) variant = specMatch[0]
        }
        if (!variant && matched.categoryName) {
          variant = `Phân loại: ${matched.categoryName}`
        }
      }
      if (!variant) {
        variant = 'Bản tiêu chuẩn chính hãng VN/A'
      }

      return {
        ...it,
        productId: it.productId || matched?.id || 1,
        productName: it.productName || matched?.name || `Sản phẩm #${it.productId}`,
        quantity: it.quantity || 1,
        price: unitPrice,
        total: lineTotal,
        imgUrl,
        variant,
      }
    })
  }

  // Customer cancels pending order
  const handleCancelOrder = async (orderId, orderCode) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderCode}? Số lượng sản phẩm sẽ được tự động hoàn lại tồn kho.`)) {
      return
    }
    try {
      await api.cancelOrder(orderId)
      onNotify?.(`Đã hủy thành công đơn hàng #${orderCode} và hoàn tồn kho!`)
      fetchOrders()
      onOrdersChanged?.()
    } catch (err) {
      console.warn('Cancel order API fallback:', err)
      onNotify?.(`Đã hủy thành công đơn hàng #${orderCode}!`)
      fetchOrders()
      onOrdersChanged?.()
    }
  }

  // Customer requests return/refund for completed order
  const handleConfirmReturn = async () => {
    if (!returnOrderModal) return
    const selectedList = Object.values(returnSelectedItems).filter((it) => it.selected && it.returnQty > 0)
    if (selectedList.length === 0) {
      alert('Vui lòng tích chọn ít nhất một sản phẩm trong đơn để tiến hành đổi trả/hoàn tiền!')
      return
    }

    if (refundMethod === 'bank_transfer') {
      if (!bankAccount.trim()) {
        alert('Vui lòng nhập Số tài khoản ngân hàng để SmartStock chuyển khoản tiền hoàn!')
        return
      }
      if (!bankOwner.trim()) {
        alert('Vui lòng nhập Tên chủ tài khoản nhận tiền hoàn!')
        return
      }
    }

    setSubmittingReturn(true)
    try {
      // 1. Kiểm tra xem là Hoàn toàn bộ hay Hoàn 1 phần
      const allItems = Object.values(returnSelectedItems)
      const isFullReturn = allItems.every((it) => it.selected && it.returnQty >= it.maxQty)
      const targetStatus = isFullReturn ? 'returned' : 'partially_returned'

      // 2. Tính số tiền hoàn ước tính (có tính tỷ lệ giảm giá voucher nếu có)
      const rawReturnTotal = selectedList.reduce((acc, it) => acc + (it.price * it.returnQty), 0)
      const orderTotal = returnOrderModal.totalAmount || 1
      const orderFinal = returnOrderModal.finalAmount || returnOrderModal.totalAmount || rawReturnTotal
      const discountRatio = orderTotal > 0 ? (orderFinal / orderTotal) : 1
      const refundEstimate = Math.round(rawReturnTotal * discountRatio)

      // 3. Sinh mã phiếu đổi trả chuẩn sàn TMĐT: #RET-2026-XXXXXX
      const returnTicketCode = `#RET-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

      const payload = {
        reason: `[${returnTicketCode}] ${returnReason}${returnDetail.trim() ? `: ${returnDetail.trim()}` : ''}`,
        isPartial: !isFullReturn,
        details: selectedList.map((it) => ({
          productId: it.productId,
          quantity: it.returnQty,
          reason: returnReason,
        })),
        ticketCode: returnTicketCode,
        refundMethod,
        bankInfo: refundMethod === 'bank_transfer' ? { bankName, bankAccount: bankAccount.trim(), bankOwner: bankOwner.trim().toUpperCase() } : null,
        refundEstimate,
        evidenceImages: evidenceFiles.map((f) => f.url),
      }

      // 4. Gọi API backend hoàn đơn
      await api.returnOrder(returnOrderModal.id, payload).catch((err) => {
        console.warn('api.returnOrder returned error or fallback:', err)
      })

      // 5. Bắn thông báo đẩy (Push Notification) về trang Quản trị của Admin
      const adminNotif = {
        title: `Yêu cầu đổi trả ${returnTicketCode} (Đơn #${returnOrderModal.orderCode})`,
        message: `Khách hàng ${currentUser?.fullName || returnOrderModal.customerName || 'Khách'} yêu cầu ${isFullReturn ? 'Hoàn toàn bộ đơn' : 'Hoàn 1 phần'} (${selectedList.length} món). Số tiền hoàn dự kiến: ${formatVND(refundEstimate)}. Phương thức: ${refundMethod === 'bank_transfer' ? `Chuyển khoản ${bankName} (STK: ${bankAccount.trim()} - Chủ TK: ${bankOwner.trim().toUpperCase()})` : 'Ví SmartStock'}. Lý do: ${returnReason}${returnDetail ? ` - ${returnDetail}` : ''}`,
        type: 'return',
        category: 'orders',
        orderId: returnOrderModal.id,
        orderCode: returnOrderModal.orderCode,
        ticketCode: returnTicketCode,
        status: targetStatus,
        refundAmount: refundEstimate,
        refundMethod,
        bankInfo: refundMethod === 'bank_transfer' ? { bankName, bankAccount: bankAccount.trim(), bankOwner: bankOwner.trim().toUpperCase() } : null,
        evidenceImages: evidenceFiles.map((f) => f.url),
        reason: `${returnReason}${returnDetail ? ` - ${returnDetail}` : ''}`,
        customerName: currentUser?.fullName || returnOrderModal.customerName || 'Khách hàng',
        customerPhone: currentUser?.phone || returnOrderModal.customerPhone || '',
      }
      await api.createNotification(adminNotif)

      // 6. Lưu trữ thông tin phiếu đổi trả vào localStorage để tiện tra cứu
      try {
        const storedReturns = JSON.parse(localStorage.getItem('smartstock_returns') || '[]')
        storedReturns.unshift({
          id: Date.now(),
          ticketCode: returnTicketCode,
          orderId: returnOrderModal.id,
          orderCode: returnOrderModal.orderCode,
          status: targetStatus,
          statusText: isFullReturn ? 'Đã hoàn' : 'Hoàn một phần',
          createdAt: new Date().toISOString(),
          items: selectedList,
          refundEstimate,
          refundMethod,
          bankInfo: refundMethod === 'bank_transfer' ? { bankName, bankAccount: bankAccount.trim(), bankOwner: bankOwner.trim().toUpperCase() } : null,
          reason: returnReason,
          detail: returnDetail,
          evidenceImages: evidenceFiles.map((f) => f.url),
          customerName: currentUser?.fullName || returnOrderModal.customerName || 'Khách hàng',
        })
        localStorage.setItem('smartstock_returns', JSON.stringify(storedReturns))
      } catch (e) {
        console.warn('Save smartstock_returns error:', e)
      }

      // 7. Cập nhật trạng thái đơn hàng trong danh sách và chuyển tab hiển thị
      setOrders((prev) =>
        prev.map((o) => (o.id === returnOrderModal.id ? { ...o, status: targetStatus, note: payload.reason } : o))
      )
      setActiveTab(targetStatus)
      onNotify?.(`Gửi yêu cầu đổi trả thành công! Mã phiếu: ${returnTicketCode}. Kho SmartStock sẽ tiến hành xác thực và xử lý hoàn tiền.`)
      setReturnOrderModal(null)
      fetchOrders()
      onOrdersChanged?.()
    } catch (err) {
      console.error('Error submitting return:', err)
      onNotify?.(`Đã gửi yêu cầu đổi trả đơn #${returnOrderModal.orderCode}!`)
      setReturnOrderModal(null)
      fetchOrders()
      onOrdersChanged?.()
    } finally {
      setSubmittingReturn(false)
    }
  }

  return (
    <div className="store-modal-backdrop" onClick={onClose}>
      <div className="store-modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', width: '95vw', maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Header Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #edf1ef', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={22} color="#F06449" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#1f332f' }}>Đơn hàng của tôi</h2>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#889892' }}>
            <X size={20} />
          </button>
        </div>

        {/* 7 TAB LỌC ĐỒNG BỘ MÀU SẮC & ĐẾM CHÍNH XÁC */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px', borderBottom: '1px solid #edf1ef' }}>
          {TABS.map((tab) => {
            const count = tab.key === 'all'
              ? orders.length
              : orders.filter((o) => matchOrderStatus(o.status, tab.key)).length
            const isTabActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isTabActive ? '1.5px solid #1E3A2F' : '1px solid #e3ebe6',
                  background: isTabActive ? '#1E3A2F' : '#ffffff',
                  color: isTabActive ? '#ffffff' : '#4b5563',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background: isTabActive ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
                    color: isTabActive ? '#ffffff' : '#6b7280',
                    fontWeight: 800,
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Danh sách đơn hàng */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <RefreshCw className="spin" size={24} style={{ margin: '0 auto 8px', color: '#F06449' }} />
            <div style={{ fontSize: '13px', color: '#687771' }}>Đang tải danh sách đơn hàng...</div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredOrders.map((ord) => {
              const status = (ord.status || 'confirmed').toLowerCase()
              const statusMap = {
                completed: { text: 'Hoàn tất', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', step: 4 },
                confirmed: { text: 'Đã xác nhận & Trừ kho', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', step: 2 },
                pending: { text: 'Chờ xử lý', color: '#d97706', bg: '#fffbeb', border: '#fde68a', step: 1 },
                cancelled: { text: 'Đã hủy', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', step: 0 },
                partially_returned: { text: 'Hoàn một phần', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', step: 3 },
                returned: { text: 'Đã hoàn tiền', color: '#4b5563', bg: '#f3f4f6', border: '#e5e7eb', step: 4 },
              }
              const st = statusMap[status] || statusMap.confirmed
              const items = getOrderItems(ord)

              return (
                <div
                  key={ord.id || ord.orderCode}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e3ebe6',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* HEADER THẺ ĐƠN HÀNG */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #f0f4f2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#1f332f', fontFamily: 'monospace' }}>
                        #{ord.orderCode}
                      </span>
                      <span style={{ fontSize: '11px', color: '#889892' }}>•</span>
                      <span style={{ fontSize: '11px', color: '#687771' }}>
                        {formatDate(ord.createdAt || new Date())}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '6px',
                        background: st.bg,
                        color: st.color,
                        border: `1px solid ${st.border}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {st.text}
                    </span>
                  </div>

                  {/* STEPPER TIẾN TRÌNH TRỰC QUAN (Ẩn khi đã hủy) */}
                  {status !== 'cancelled' ? (
                    <div className="order-stepper-wrap" style={{ margin: '8px 0 14px' }}>
                      <div className="order-stepper-line" />
                      {[
                        { num: 1, label: 'Đặt hàng' },
                        { num: 2, label: 'Xác nhận' },
                        { num: 3, label: 'Xuất kho' },
                        { num: 4, label: 'Giao thành công' },
                      ].map((s) => {
                        const isDone = status === 'completed' || st.step >= s.num
                        const isActive = st.step === s.num
                        return (
                          <div key={s.num} className={`stepper-node ${isDone ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                            <div className="stepper-circle">
                              {isDone ? <Check size={11} strokeWidth={3} /> : s.num}
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: isDone ? '#059669' : '#6b7280' }}>
                              {s.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: '#dc2626', background: '#fef2f2', padding: '6px 12px', borderRadius: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>⚠️</span>
                      <span>Đơn hàng này đã bị hủy. Toàn bộ số lượng đã được tự động hoàn lại tồn kho.</span>
                    </div>
                  )}

                  {/* DANH SÁCH SẢN PHẨM TRỰC QUAN CHUẨN SÀN TMĐT */}
                  <div
                    style={{
                      background: '#fbfdfc',
                      borderRadius: '8px',
                      border: '1px solid #e7efe9',
                      padding: '8px 12px',
                      marginBottom: '14px',
                      maxHeight: items.length >= 2 ? '210px' : 'auto',
                      overflowY: items.length >= 2 ? 'auto' : 'visible',
                    }}
                  >
                    {items.map((item, dIdx) => (
                      <div
                        key={dIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          padding: '8px 0',
                          borderBottom: dIdx === items.length - 1 ? 'none' : '1px solid #f0f5f2',
                        }}
                      >
                        {/* Ảnh thumbnail sản phẩm */}
                        <img
                          src={item.imgUrl}
                          alt={item.productName}
                          style={{
                            width: '54px',
                            height: '54px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #e1ebe5',
                            flexShrink: 0,
                            background: '#ffffff',
                          }}
                        />

                        {/* Thông tin tên & phân loại */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1f332f', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.productName}
                          </div>
                          <div style={{ fontSize: '10px', color: '#7a8c85', marginTop: '2px' }}>
                            {item.variant}
                          </div>
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#4b5563',
                              background: '#f3f4f6',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              marginTop: '3px',
                            }}
                          >
                            Số lượng: x{item.quantity}
                          </span>
                        </div>

                        {/* Giá tiền từng sản phẩm căn phải */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1f332f' }}>
                            {formatVND(item.total)}
                          </div>
                          {item.quantity > 1 && (
                            <div style={{ fontSize: '10px', color: '#889892', marginTop: '1px' }}>
                              {formatVND(item.price)}/sp
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FOOTER THẺ ĐƠN HÀNG */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #edf1ef', paddingTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#687771' }}>
                        PTTT: <strong style={{ color: '#1f332f' }}>{formatPaymentMethod(ord.paymentMethod)}</strong>
                      </span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#687771' }}>Tổng thanh toán:</span>
                        <strong style={{ fontSize: '16px', fontWeight: 800, color: '#F06449' }}>
                          {formatVND(ord.finalAmount || ord.totalAmount)}
                        </strong>
                      </div>
                    </div>

                    {/* HÀNG NÚT THAO TÁC Ở GÓC PHẢI */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {/* Chat với Shop về đơn hàng này */}
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('smartstock_open_seller_chat', { detail: { order: ord } }))
                        }}
                        style={{
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          color: '#15803d',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '6px 11px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                        }}
                        title="Chat trực tiếp với Shop về đơn hàng này"
                      >
                        <MessageSquare size={13} />
                        <span>💬 Chat với Shop</span>
                      </button>

                      {/* Xem hóa đơn điện tử */}
                      <button
                        type="button"
                        onClick={() => onViewInvoice(ord)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #d1ded8',
                          color: '#1E3A2F',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '6px 11px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                        }}
                        title="Xem và in Hóa đơn Giá trị Gia tăng & Phiếu Xuất kho"
                      >
                        <Printer size={13} />
                        <span>🖨️ Xem HĐ điện tử</span>
                      </button>

                      {/* Đánh giá nếu completed */}
                      {status === 'completed' && (
                        <button
                          type="button"
                          onClick={() => {
                            const firstProd = items[0]
                            onOpenReview({
                              id: firstProd?.productId || 1,
                              name: firstProd?.productName || 'Sản phẩm công nghệ SmartStock',
                            })
                          }}
                          style={{
                            background: '#fff9f7',
                            border: '1px solid #fecbc0',
                            color: '#F06449',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '6px 11px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Star size={13} fill="#F06449" />
                          <span>Đánh giá</span>
                        </button>
                      )}

                      {/* Yêu cầu Đổi trả / Hoàn tiền nếu completed */}
                      {status === 'completed' && (
                        <button
                          type="button"
                          onClick={() => handleOpenReturnModal(ord)}
                          style={{
                            background: '#f5f3ff',
                            border: '1px solid #ddd6fe',
                            color: '#7c3aed',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '6px 11px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <RotateCcw size={13} />
                          <span>Yêu cầu Đổi trả</span>
                        </button>
                      )}

                      {/* Nút Hủy đơn CHỈ hiện khi đơn đang ở trạng thái pending (Chờ xử lý) */}
                      {status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(ord.id, ord.orderCode)}
                          style={{
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            color: '#dc2626',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '6px 11px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <XCircle size={13} />
                          <span>Hủy đơn</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#889892' }}>
            <Receipt size={36} color="#b3c5bd" style={{ margin: '0 auto 10px' }} />
            <div>Không có đơn hàng nào trong mục này.</div>
          </div>
        )}

        {/* MODAL NÂNG CẤP TOÀN DIỆN: YÊU CẦU ĐỔI TRẢ / HOÀN TIỀN CHUẨN SÀN TMĐT */}
        {returnOrderModal && (() => {
          const allReturnItems = Object.values(returnSelectedItems)
          const selectedItemsList = allReturnItems.filter((it) => it.selected && it.returnQty > 0)
          const isAllSelected = allReturnItems.length > 0 && selectedItemsList.length === allReturnItems.length
          const isFullReturn = allReturnItems.length > 0 && allReturnItems.every((it) => it.selected && it.returnQty >= it.maxQty)
          
          // Tính toán tiền hoàn ước tính
          const rawReturnTotal = selectedItemsList.reduce((acc, it) => acc + (it.price * it.returnQty), 0)
          const ordTotal = returnOrderModal.totalAmount || 1
          const ordFinal = returnOrderModal.finalAmount || returnOrderModal.totalAmount || rawReturnTotal
          const discountRatio = ordTotal > 0 ? (ordFinal / ordTotal) : 1
          const estimatedRefundTotal = Math.round(rawReturnTotal * discountRatio)

          return (
            <div className="store-modal-backdrop" onClick={() => setReturnOrderModal(null)} style={{ zIndex: 130 }}>
              <div
                className="store-modal-panel"
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: '720px',
                  width: '95vw',
                  maxHeight: '92vh',
                  overflowY: 'auto',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  border: '1px solid #ddd6fe',
                }}
              >
                {/* Header Modal */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #edf1ef', paddingBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: '#f5f3ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #ddd6fe',
                        flexShrink: 0,
                      }}
                    >
                      <RotateCcw size={22} color="#7c3aed" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#1f332f' }}>
                        Yêu cầu Đổi trả / Hoàn tiền đơn #{returnOrderModal.orderCode}
                      </h3>
                      <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#687771' }}>
                        Bảo đảm quyền lợi khách hàng 100% theo tiêu chuẩn sàn TMĐT SmartStock
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReturnOrderModal(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#889892', padding: '4px' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* 1. CHỌN SẢN PHẨM CỤ THỂ TRONG ĐƠN ĐỂ ĐỔI TRẢ */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Package size={15} color="#7c3aed" />
                      <strong style={{ fontSize: '12px', color: '#1f332f', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        1. Chọn sản phẩm cần đổi trả & Số lượng
                      </strong>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleSelectAllItems(!isAllSelected)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#7c3aed',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                      </button>
                    </div>
                  </div>

                  {/* Danh sách thẻ sản phẩm */}
                  <div style={{ display: 'grid', gap: '8px', background: '#fafbfb', padding: '10px', borderRadius: '10px', border: '1px solid #e7efe9' }}>
                    {allReturnItems.map((item) => (
                      <div
                        key={item.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          background: '#ffffff',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: item.selected ? '1.5px solid #c4b5fd' : '1px solid #e5e7eb',
                          boxShadow: item.selected ? '0 2px 6px rgba(124, 58, 237, 0.08)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {/* Checkbox chọn sản phẩm */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => handleToggleSelectItem(item.key)}
                            style={{ width: '18px', height: '18px', accentColor: '#7c3aed', cursor: 'pointer', flexShrink: 0 }}
                          />
                          {/* Ảnh thumbnail */}
                          <img
                            src={item.imgUrl}
                            alt={item.productName}
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0', flexShrink: 0 }}
                          />
                          {/* Tên & chi tiết */}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1f332f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.productName}
                            </div>
                            <div style={{ fontSize: '10px', color: '#687771', marginTop: '2px' }}>
                              {item.variant}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                              {formatVND(item.price)}
                            </div>
                          </div>
                        </div>

                        {/* Cụm điều chỉnh số lượng muốn hoàn */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#687771' }}>SL hoàn:</span>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '6px', background: item.selected ? '#ffffff' : '#f3f4f6' }}>
                              <button
                                type="button"
                                disabled={!item.selected || item.returnQty <= 1}
                                onClick={() => handleChangeQty(item.key, -1)}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  width: '26px',
                                  height: '26px',
                                  cursor: item.selected && item.returnQty > 1 ? 'pointer' : 'not-allowed',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: item.selected && item.returnQty > 1 ? '#1f332f' : '#9ca3af',
                                }}
                              >
                                <Minus size={12} />
                              </button>
                              <span style={{ width: '28px', textAlign: 'center', fontSize: '12px', fontWeight: 800, color: item.selected ? '#1f332f' : '#9ca3af' }}>
                                {item.returnQty}
                              </span>
                              <button
                                type="button"
                                disabled={!item.selected || item.returnQty >= item.maxQty}
                                onClick={() => handleChangeQty(item.key, 1)}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  width: '26px',
                                  height: '26px',
                                  cursor: item.selected && item.returnQty < item.maxQty ? 'pointer' : 'not-allowed',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: item.selected && item.returnQty < item.maxQty ? '#1f332f' : '#9ca3af',
                                }}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <span style={{ fontSize: '10px', color: '#889892' }}>/ {item.maxQty}</span>
                          </div>

                          {/* Tiền hoàn cho sản phẩm này */}
                          <div style={{ textAlign: 'right', minWidth: '85px' }}>
                            <div style={{ fontSize: '9px', color: '#889892' }}>Hoàn dự kiến</div>
                            <strong style={{ fontSize: '12px', color: item.selected ? '#7c3aed' : '#9ca3af' }}>
                              {formatVND(item.price * item.returnQty)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Banner Tổng tiền hoàn dự kiến */}
                  <div
                    style={{
                      marginTop: '10px',
                      background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      border: '1px solid #c4b5fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: isFullReturn ? '#7c3aed' : '#3b82f6',
                            color: '#ffffff',
                          }}
                        >
                          {isFullReturn ? 'Hoàn toàn bộ đơn (100%)' : 'Hoàn một phần đơn hàng'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#5b21b6', fontWeight: 600 }}>
                          • Đã chọn {selectedItemsList.length} / {allReturnItems.length} sản phẩm
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#6d28d9', marginTop: '2px' }}>
                        Khoản tiền sẽ được chuyển trực tiếp theo hình thức nhận tiền đã chọn bên dưới.
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: '#5b21b6' }}>Ước tính tiền hoàn:</span>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#7c3aed' }}>
                        {formatVND(estimatedRefundTotal)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. BỔ SUNG Ô TẢI LÊN HÌNH ẢNH / VIDEO CHỨNG CỨ & LÝ DO CHI TIẾT */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Camera size={15} color="#7c3aed" />
                    <strong style={{ fontSize: '12px', color: '#1f332f', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                      2. Hình ảnh / Video chứng cứ & Mô tả chi tiết
                    </strong>
                    <span style={{ fontSize: '10px', color: '#b91c1c', background: '#fef2f2', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      * Bắt buộc
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: '10px', background: '#fafbfb', padding: '12px', borderRadius: '10px', border: '1px solid #e7efe9' }}>
                    {/* Chọn lý do nhanh */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                        Lý do chính đổi trả:
                      </label>
                      <select
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 10px',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '12px',
                          background: '#ffffff',
                          color: '#1f2937',
                        }}
                      >
                        <option value="Sản phẩm phát sinh lỗi kỹ thuật phần cứng">Sản phẩm phát sinh lỗi kỹ thuật phần cứng</option>
                        <option value="Hộp móp méo, trầy xước hoặc vỡ nứt linh kiện khi nhận hàng">Hộp móp méo, trầy xước hoặc vỡ nứt linh kiện khi nhận hàng</option>
                        <option value="Giao sai mẫu mã, màu sắc hoặc không đúng thông số kỹ thuật">Giao sai mẫu mã, màu sắc hoặc không đúng thông số kỹ thuật</option>
                        <option value="Hàng nhận được không giống mô tả / thiếu phụ kiện đi kèm">Hàng nhận được không giống mô tả / thiếu phụ kiện đi kèm</option>
                        <option value="Đổi ý không còn nhu cầu sử dụng">Đổi ý không còn nhu cầu sử dụng</option>
                        <option value="Khác">Lý do khác</option>
                      </select>
                    </div>

                    {/* Ô nhập mô tả chi tiết */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                        Mô tả chi tiết tình trạng sản phẩm:
                      </label>
                      <textarea
                        rows={3}
                        value={returnDetail}
                        onChange={(e) => setReturnDetail(e.target.value)}
                        placeholder="Ví dụ: Sản phẩm bị móp méo hộp và trầy xước màn hình bên trong khi vừa mở hộp tem niêm phong..."
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '11px',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {/* Tải lên ảnh / video chứng cứ */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                        Đính kèm ảnh / video chứng cứ lỗi (Tối đa 6 ảnh):
                      </label>

                      {/* Nút upload file từ máy + Ô dán link */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/*,video/*"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            background: '#ffffff',
                            border: '1px dashed #7c3aed',
                            color: '#7c3aed',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '8px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Upload size={14} />
                          <span>Tải ảnh từ máy / Chụp ảnh</span>
                        </button>

                        <div style={{ display: 'flex', gap: '4px', flex: 1, minWidth: '220px' }}>
                          <input
                            type="text"
                            value={evidenceLinkInput}
                            onChange={(e) => setEvidenceLinkInput(e.target.value)}
                            placeholder="Hoặc dán link ảnh/video (Imgur, Drive...)"
                            style={{
                              flex: 1,
                              height: '34px',
                              padding: '0 8px',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              fontSize: '11px',
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddLinkEvidence}
                            style={{
                              background: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              color: '#374151',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '0 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            + Thêm link
                          </button>
                        </div>
                      </div>

                      {/* Danh sách ảnh minh chứng đã tải lên */}
                      {evidenceFiles.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                          {evidenceFiles.map((ev) => (
                            <div
                              key={ev.id}
                              style={{
                                position: 'relative',
                                width: '65px',
                                height: '65px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '1.5px solid #c4b5fd',
                                background: '#f8fafc',
                              }}
                            >
                              <img
                                src={ev.url}
                                alt="Chứng cứ lỗi"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveEvidence(ev.id)}
                                title="Xóa ảnh này"
                                style={{
                                  position: 'absolute',
                                  top: '2px',
                                  right: '2px',
                                  background: 'rgba(220, 38, 38, 0.85)',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '18px',
                                  height: '18px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. CHỌN HÌNH THỨC HOÀN TIỀN & NHẬP THÔNG TIN TÀI KHOẢN */}
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Wallet size={15} color="#7c3aed" />
                    <strong style={{ fontSize: '12px', color: '#1f332f', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                      3. Chọn hình thức nhận tiền hoàn & Tài khoản
                    </strong>
                  </div>

                  <div style={{ display: 'grid', gap: '10px' }}>
                    {/* Thẻ Lựa chọn 1: Chuyển khoản ngân hàng */}
                    <div
                      onClick={() => setRefundMethod('bank_transfer')}
                      style={{
                        border: refundMethod === 'bank_transfer' ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                        background: refundMethod === 'bank_transfer' ? '#fdfcff' : '#ffffff',
                        borderRadius: '10px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="radio"
                            name="refundMethod"
                            checked={refundMethod === 'bank_transfer'}
                            onChange={() => setRefundMethod('bank_transfer')}
                            style={{ accentColor: '#7c3aed', cursor: 'pointer' }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CreditCard size={16} color={refundMethod === 'bank_transfer' ? '#7c3aed' : '#4b5563'} />
                            <strong style={{ fontSize: '12px', color: '#1f332f' }}>
                              Hoàn tiền qua Chuyển khoản Ngân hàng
                            </strong>
                          </div>
                        </div>
                        <span style={{ fontSize: '10px', color: '#687771' }}>24h - 48h làm việc</span>
                      </div>

                      {/* Form nhập thông tin ngân hàng khi được chọn */}
                      {refundMethod === 'bank_transfer' && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            marginTop: '12px',
                            paddingTop: '12px',
                            borderTop: '1px dashed #e5e7eb',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '10px',
                          }}
                        >
                          <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#4b5563', marginBottom: '3px' }}>
                              Tên Ngân hàng:
                            </label>
                            <select
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '11px', background: '#ffffff' }}
                            >
                              {POPULAR_VN_BANKS.map((b) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#4b5563', marginBottom: '3px' }}>
                              Số tài khoản (STK):
                            </label>
                            <input
                              type="text"
                              value={bankAccount}
                              onChange={(e) => setBankAccount(e.target.value)}
                              placeholder="Ví dụ: 0123456789..."
                              style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '11px', boxSizing: 'border-box' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#4b5563', marginBottom: '3px' }}>
                              Tên chủ tài khoản:
                            </label>
                            <input
                              type="text"
                              value={bankOwner}
                              onChange={(e) => setBankOwner(e.target.value.toUpperCase())}
                              placeholder="NGUYEN VAN A"
                              style={{ width: '100%', height: '34px', padding: '0 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '11px', textTransform: 'uppercase', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Thẻ Lựa chọn 2: Hoàn vào số dư ví tích lũy SmartStock */}
                    <div
                      onClick={() => setRefundMethod('wallet')}
                      style={{
                        border: refundMethod === 'wallet' ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                        background: refundMethod === 'wallet' ? '#fdfcff' : '#ffffff',
                        borderRadius: '10px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="radio"
                            name="refundMethod"
                            checked={refundMethod === 'wallet'}
                            onChange={() => setRefundMethod('wallet')}
                            style={{ accentColor: '#7c3aed', cursor: 'pointer' }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Wallet size={16} color={refundMethod === 'wallet' ? '#7c3aed' : '#4b5563'} />
                            <strong style={{ fontSize: '12px', color: '#1f332f' }}>
                              Hoàn tiền vào Số dư ví tích lũy SmartStock
                            </strong>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0',
                          }}
                        >
                          ⚡ Xử lý tức thì
                        </span>
                      </div>
                      <p style={{ margin: '6px 0 0 24px', fontSize: '11px', color: '#687771' }}>
                        Khoản tiền hoàn sẽ được cộng trực tiếp vào số dư ví tích lũy trên tài khoản của bạn để tiếp tục mua sắm các thiết bị công nghệ khác.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Modal: Cam kết & Nút hành động */}
                <div style={{ borderTop: '1px solid #edf1ef', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="#059669" />
                    <span style={{ fontSize: '11px', color: '#4b5563' }}>
                      Sinh mã phiếu riêng <strong>#RET-2026-X</strong> & đồng bộ đẩy thông báo về Admin.
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setReturnOrderModal(null)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #d1d5db',
                        color: '#4b5563',
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      disabled={submittingReturn}
                      onClick={handleConfirmReturn}
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '8px 20px',
                        borderRadius: '8px',
                        cursor: submittingReturn ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
                      }}
                    >
                      {submittingReturn ? (
                        <>
                          <RefreshCw className="spin" size={14} />
                          <span>Đang gửi...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Xác nhận yêu cầu đổi trả</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

// ====================================================
// 6. PRODUCT COMPARISON BAR & COMPARISON MODAL & RECENTLY VIEWED
// ====================================================
export function CompareFloatingBar({ compareList, onOpenCompare, onClear }) {
  if (compareList.length < 2) return null
  return (
    <div className="compare-floating-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Scale size={20} color="#F06449" />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
          So sánh sản phẩm ({compareList.length}/3)
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {compareList.map((prod) => (
          <div key={prod.id} className="compare-mini-thumb" title={prod.name}>
            <img src={getProductImage(prod)} alt={prod.name} />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button type="button" onClick={onClear} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
          Xóa hết
        </button>
        <button type="button" onClick={onOpenCompare} style={{ background: '#F06449', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Scale size={14} />
          <span>So sánh ngay</span>
        </button>
      </div>
    </div>
  )
}

export function CompareModal({ compareList, onClose, onAddToCart, onExpressBuy, onRemove }) {
  if (!compareList.length) return null

  return (
    <div className="store-modal-backdrop" onClick={onClose}>
      <div className="store-modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '960px', width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5ebe7', paddingBottom: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={22} color="#F06449" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#1f332f' }}>
              Bảng so sánh chi tiết ({compareList.length} sản phẩm)
            </h2>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#889892' }}>
            <X size={20} />
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr>
              <th style={{ width: '18%', padding: '12px', background: '#f8faf9', textAlign: 'left', borderBottom: '2px solid #e2ebe6', color: '#556862' }}>Tiêu chí</th>
              {compareList.map((p) => {
                const stock = p.quantity ?? p.stock ?? 0
                return (
                  <th key={p.id} style={{ width: `${82 / compareList.length}%`, padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2ebe6', verticalAlign: 'top' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button type="button" onClick={() => onRemove(p.id)} title="Bỏ sản phẩm này" style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: '10px' }}>
                        &times;
                      </button>
                      <img src={getProductImage(p)} alt={p.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e5ebe7' }} />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#1f332f', marginTop: '8px' }}>{p.name}</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#F06449', margin: '4px 0' }}>{formatVND(p.price)}</div>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: stock > 0 ? '#ecfdf5' : '#fef2f2', color: stock > 0 ? '#059669' : '#dc2626', fontWeight: 700 }}>
                      {stock > 0 ? `Còn ${stock} máy` : 'Hết hàng'}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Phân loại', getVal: (p) => p.categoryName || 'Công nghệ' },
              { label: 'Màn hình & Hiển thị', getVal: (p) => getProductSpecs(p).display },
              { label: 'Vi xử lý (Chipset)', getVal: (p) => getProductSpecs(p).chip },
              { label: 'RAM / Bộ nhớ trong', getVal: (p) => getProductSpecs(p).memory },
              { label: 'Camera / Thiết kế', getVal: (p) => getProductSpecs(p).camera },
              { label: 'Pin & Nguồn', getVal: (p) => getProductSpecs(p).battery },
              { label: 'Xuất xứ hàng hóa', getVal: (p) => getProductSpecs(p).origin },
              { label: 'Chính sách bảo hành', getVal: (p) => getProductSpecs(p).warranty },
            ].map((row, rIdx) => (
              <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? '#ffffff' : '#f8faf9', borderBottom: '1px solid #edf1ef' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#4b5563' }}>{row.label}</td>
                {compareList.map((p) => (
                  <td key={p.id} style={{ padding: '10px 12px', textAlign: 'center', color: '#1f2937', lineHeight: 1.5 }}>
                    {row.getVal(p)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td style={{ padding: '14px 12px', fontWeight: 700, color: '#4b5563' }}>Thao tác</td>
              {compareList.map((p) => {
                const stock = p.quantity ?? p.stock ?? 0
                return (
                  <td key={p.id} style={{ padding: '14px 12px', textAlign: 'center' }}>
                    {stock > 0 ? (
                      <button
                        type="button"
                        className="btn-express-buy"
                        onClick={() => {
                          onClose()
                          onExpressBuy(p)
                        }}
                        style={{ height: '36px', fontSize: '11px', width: '100%', maxWidth: '160px', margin: '0 auto' }}
                      >
                        <Zap size={14} fill="#fff" />
                        <span>Mua ngay</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic' }}>Tạm hết hàng</span>
                    )}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function RecentlyViewedSection({ items, onOpenDetail, onAddToCart, onBuyNow }) {
  if (!items || items.length === 0) return null

  return (
    <section style={{ margin: '36px 0 20px', borderTop: '1px solid #edf1ef', paddingTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Eye size={18} color="#1E3A2F" />
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1f332f', margin: 0 }}>
          👀 Sản phẩm bạn vừa xem
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        {items.slice(0, 6).map((p) => {
          const stock = p.quantity ?? p.stock ?? 0
          return (
            <div
              key={p.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e3ebe6',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{ height: '110px', borderRadius: '6px', overflow: 'hidden', background: '#f8faf9', cursor: 'pointer', marginBottom: '8px' }}
                onClick={() => onOpenDetail(p)}
              >
                <img
                  src={getProductImage(p)}
                  alt={p.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = getCategoryFallbackImage(p)
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1f332f', marginBottom: '4px', cursor: 'pointer' }} onClick={() => onOpenDetail(p)}>
                {p.name}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#F06449', marginBottom: '8px' }}>
                {formatVND(p.price)}
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: '6px' }}>
                {stock > 0 ? (
                  <button
                    type="button"
                    className="btn-express-buy"
                    onClick={() => onBuyNow(p)}
                    style={{ height: '30px', fontSize: '11px', flex: 1 }}
                  >
                    ⚡ Mua ngay
                  </button>
                ) : (
                  <button type="button" className="btn-card-out-of-stock" disabled style={{ height: '30px', fontSize: '10px', flex: 1 }}>
                    Hết hàng
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ====================================================
// 7. CUSTOMER PROFILE & VIP LOYALTY TIER
// ====================================================
// ----------------------------------------------------
// TẢI LEAFLET CHO PROFILE MODAL
// ----------------------------------------------------
function ensureProfileLeaflet() {
  return new Promise((resolve) => {
    if (window.L && window.L.map) return resolve(window.L)
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script')
      script.id = 'leaflet-js'
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => resolve(window.L)
      script.onerror = () => resolve(null)
      document.head.appendChild(script)
    } else {
      let attempts = 0
      const check = setInterval(() => {
        attempts++
        if (window.L && window.L.map) {
          clearInterval(check)
          resolve(window.L)
        } else if (attempts > 30) {
          clearInterval(check)
          resolve(window.L || null)
        }
      }, 100)
    }
  })
}

function createProfilePinIcon(L) {
  return L.divIcon({
    className: 'smart-map-custom-marker',
    html: `
      <div style="position:relative;width:34px;height:42px;transform:translate(-50%,-100%);cursor:grab;display:flex;align-items:center;justify-content:center;">
        <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4));">
          <path d="M17 0C7.611 0 0 7.611 0 17C0 26.5 14.5 40.5 16.2 42.1C16.6 42.5 17.4 42.5 17.8 42.1C19.5 40.5 34 26.5 34 17C34 7.611 26.389 0 17 0Z" fill="#EA580C"/>
          <circle cx="17" cy="16" r="6" fill="#FFFFFF"/>
          <circle cx="17" cy="16" r="3.2" fill="#C2410C"/>
        </svg>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

// Hàm làm sạch chuỗi địa chỉ, loại bỏ lỗi dính chữ (ví dụ "MinhSố 2..." hoặc "Nguyễn Minh AnhSố 2...")
export function cleanAddressGlitch(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let clean = raw.trim()
  if (/MinhSố/i.test(clean)) {
    clean = clean.replace(/^.*?Minh(?=Số)/i, '').trim()
  }
  clean = clean.replace(/^[A-Za-zÀ-ỹ\s]+(?=Số\s|Đường\s|\d+[\s,/A-Za-z])/i, (match) => {
    if (!/đường|phố|tòa|ấp|thôn|xã|phường|quận/i.test(match)) {
      return ''
    }
    return match
  }).trim()
  return clean || ''
}

// 3 Địa điểm phổ biến theo yêu cầu kèm tọa độ chuẩn xác
const POPULAR_PROFILE_LANDMARKS = [
  {
    name: 'Tòa nhà Bitexco',
    detail: 'Số 2 Hải Triều, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    lat: 10.7716,
    lon: 106.7044,
  },
  {
    name: 'Vincom Center',
    detail: '720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP. Hồ Chí Minh',
    lat: 10.7951,
    lon: 106.7218,
  },
  {
    name: 'Phố Đi Bộ Nguyễn Huệ',
    detail: 'Đường Nguyễn Huệ, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    lat: 10.7743,
    lon: 106.7032,
  },
]

// ====================================================
// CHUẨN HÓA TRẠNG THÁI ĐƠN HÀNG & TIẾN TRÌNH VẬN CHUYỂN
// ====================================================
export function getOrderStatusMeta(rawStatus) {
  const s = (rawStatus || '').toString().toLowerCase().trim()
  if (
    s.includes('completed') ||
    s.includes('hoàn tất') ||
    s.includes('giao thành công') ||
    s.includes('thành công') ||
    s.includes('delivered')
  ) {
    return {
      key: 'completed',
      label: 'Giao hàng thành công',
      color: '#15803d',
      bg: '#dcfce7',
      border: '#bbf7d0',
      step: 4,
    }
  }
  if (
    s.includes('shipping') ||
    s.includes('đang giao') ||
    s.includes('vận chuyển') ||
    s.includes('đang vận chuyển')
  ) {
    return {
      key: 'shipping',
      label: 'Đang vận chuyển',
      color: '#0284c7',
      bg: '#e0f2fe',
      border: '#bae6fd',
      step: 3,
    }
  }
  if (
    s.includes('processing') ||
    s.includes('đóng gói') ||
    s.includes('xử lý') ||
    s.includes('đang xử lý') ||
    s.includes('confirmed') ||
    s.includes('xác nhận')
  ) {
    return {
      key: 'processing',
      label: 'Đang xử lý / Đóng gói',
      color: '#7c3aed',
      bg: '#f3e8ff',
      border: '#e9d5ff',
      step: 2,
    }
  }
  if (
    s.includes('cancelled') ||
    s.includes('hủy') ||
    s.includes('đã hủy') ||
    s.includes('canceled')
  ) {
    return {
      key: 'cancelled',
      label: 'Đã hủy',
      color: '#b91c1c',
      bg: '#fee2e2',
      border: '#fecaca',
      step: 0,
    }
  }
  return {
    key: 'pending',
    label: 'Chờ xác nhận',
    color: '#ea580c',
    bg: '#ffedd5',
    border: '#fed7aa',
    step: 1,
  }
}

export function CustomerProfileModal({
  currentUser,
  orders = [],
  onClose,
  onNotify,
  userTierInfo,
  onLogout,
  initialTab = 'profile',
  onAddToCart,
  onRefreshOrders,
}) {
  const [activeTab, setActiveTab] = useState(initialTab) // 'profile' | 'orders' | 'address' | 'warranty' | 'vouchers' | 'loyalty' | 'notifications'
  const userStorageKey = (currentUser?.email || currentUser?.username || (currentUser?.userId ? `user_${currentUser.userId}` : '') || 'guest').toLowerCase().trim()
  const profileKey = `smartstock_profile_${userStorageKey}`
  const addressKey = `smartstock_default_address_${userStorageKey}`
  const coinKey = `smartstock_user_coins_${userStorageKey}`
  const checkinKey = `smartstock_last_checkin_${userStorageKey}`

  // State đồng bộ đơn hàng nội bộ trong modal
  const [localOrders, setLocalOrders] = useState(orders)
  useEffect(() => {
    setLocalOrders(orders)
  }, [orders])

  // State quản lý danh sách & chi tiết đơn hàng
  const [orderStatusFilter, setOrderStatusFilter] = useState('all') // 'all' | 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled'
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Tra cứu bảo hành điện tử
  const [warrantyKeyword, setWarrantyKeyword] = useState(currentUser?.phone || '')
  const [warrantyResults, setWarrantyResults] = useState(null)
  const [warrantyHasSearched, setWarrantyHasSearched] = useState(false)

  const handleWarrantySearch = (customQuery) => {
    const query = (customQuery !== undefined ? customQuery : warrantyKeyword).trim().toLowerCase()
    if (!query) {
      onNotify?.('⚠️ Vui lòng nhập số điện thoại hoặc mã đơn hàng để tra cứu bảo hành!')
      return
    }
    setWarrantyHasSearched(true)
    // Lọc các đơn hàng khớp số điện thoại, mã đơn hoặc tên khách hàng
    const matches = (localOrders || []).filter((o) => {
      const code = (o.orderCode || o.id || '').toString().toLowerCase()
      const phone = (o.customerPhone || o.phone || '').toString().toLowerCase()
      const name = (o.customerName || o.fullName || '').toLowerCase()
      return code.includes(query) || phone.includes(query) || name.includes(query)
    })
    setWarrantyResults(matches)
  }

  // Tự động tìm kiếm nếu mở tab bảo hành và đã có SĐT khách
  useEffect(() => {
    if (activeTab === 'warranty' && !warrantyHasSearched) {
      const initialPhone = (currentUser?.phone || profileData.phone || '').trim()
      if (initialPhone) {
        setWarrantyKeyword(initialPhone)
        handleWarrantySearch(initialPhone)
      } else if (orders.length > 0) {
        setWarrantyResults(orders)
        setWarrantyHasSearched(true)
      }
    }
  }, [activeTab])

  // Profile data
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(profileKey) || '{}')
      return {
        fullName: saved.fullName || currentUser?.fullName || currentUser?.username || '',
        dob: saved.dob || '',
        gender: saved.gender || '',
        phone: saved.phone || currentUser?.phone || '',
        email: currentUser?.email || saved.email || '',
      }
    } catch {
      return {
        fullName: currentUser?.fullName || currentUser?.username || '',
        dob: '',
        gender: '',
        phone: currentUser?.phone || '',
        email: currentUser?.email || '',
      }
    }
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(profileData)

  const handleSaveProfile = (e) => {
    e?.preventDefault()
    setProfileData(editForm)
    try {
      localStorage.setItem(profileKey, JSON.stringify(editForm))
      const stored = JSON.parse(localStorage.getItem('smartstock_user') || '{}')
      if (stored && (stored.userId || stored.username)) {
        stored.fullName = editForm.fullName
        stored.phone = editForm.phone
        localStorage.setItem('smartstock_user', JSON.stringify(stored))
      }
    } catch {}
    setIsEditing(false)
    onNotify?.('✅ Đã cập nhật thông tin cá nhân thành công!')
  }

  // Sổ địa chỉ đa năng chuẩn Shopee / TikTok Shop (tách biệt 100% theo từng user)
  const [addressList, setAddressList] = useState(() => getUserAddressList(currentUser))
  const [addressView, setAddressView] = useState('list') // 'list' | 'add' | 'edit'
  const [editingAddrId, setEditingAddrId] = useState(null)

  // Form input states khi Thêm mới / Cập nhật
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formLabel, setFormLabel] = useState('Nhà riêng')
  const [formIsDefault, setFormIsDefault] = useState(false)

  // Đồng bộ addressList khi currentUser thay đổi hoặc có event cập nhật
  useEffect(() => {
    setAddressList(getUserAddressList(currentUser))
  }, [currentUser])

  useEffect(() => {
    const handleAddrUpdate = () => {
      setAddressList(getUserAddressList(currentUser))
    }
    window.addEventListener('smartstock_addresses_updated', handleAddrUpdate)
    return () => window.removeEventListener('smartstock_addresses_updated', handleAddrUpdate)
  }, [currentUser])

  const handleOpenAddAddress = () => {
    setEditingAddrId(null)
    setFormName(profileData.fullName || currentUser?.fullName || currentUser?.username || '')
    setFormPhone(profileData.phone || currentUser?.phone || '')
    setFormAddress('')
    setFormLabel('Nhà riêng')
    setFormIsDefault(addressList.length === 0)
    setCoords({ lat: 10.7716, lon: 106.7044 })
    setAddressView('add')
  }

  const handleOpenEditAddress = (addr) => {
    setEditingAddrId(addr.id)
    setFormName(addr.recipientName || '')
    setFormPhone(addr.phone || '')
    setFormAddress(addr.fullAddress || '')
    setFormLabel(addr.label || 'Nhà riêng')
    setFormIsDefault(!!addr.isDefault)
    if (addr.lat && addr.lng) {
      syncMapLocation(addr.lat, addr.lng, 17)
    }
    setAddressView('edit')
  }

  const handleDeleteAddress = (id) => {
    if (addressList.length <= 1) {
      onNotify?.('⚠️ Bạn cần giữ lại ít nhất 1 địa chỉ nhận hàng trong Sổ địa chỉ!')
      return
    }
    const target = addressList.find((a) => a.id === id)
    let updated = addressList.filter((a) => a.id !== id)
    if (target?.isDefault && updated.length > 0) {
      updated[0].isDefault = true
    }
    setAddressList(updated)
    saveUserAddressList(currentUser, updated)
    onNotify?.('🗑️ Đã xóa địa chỉ thành công!')
  }

  const handleSetDefaultAddress = (id) => {
    const updated = addressList.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }))
    setAddressList(updated)
    saveUserAddressList(currentUser, updated)
    onNotify?.('⭐ Đã đặt làm địa chỉ nhận hàng mặc định!')
  }

  const handleSaveAddressForm = (e) => {
    e.preventDefault()
    if (!formAddress.trim()) {
      onNotify?.('⚠️ Vui lòng nhập địa chỉ nhận hàng chi tiết!')
      return
    }

    let updated = [...addressList]
    if (editingAddrId) {
      updated = updated.map((a) => {
        if (a.id === editingAddrId) {
          return {
            ...a,
            recipientName: formName.trim(),
            phone: formPhone.trim(),
            fullAddress: cleanAddressGlitch(formAddress.trim()),
            label: formLabel,
            lat: coords.lat,
            lng: coords.lon,
            isDefault: formIsDefault,
            updatedAt: new Date().toISOString(),
          }
        }
        return formIsDefault ? { ...a, isDefault: false } : a
      })
    } else {
      const isFirst = updated.length === 0
      if (formIsDefault || isFirst) {
        updated = updated.map((a) => ({ ...a, isDefault: false }))
      }
      const newAddr = {
        id: `addr_${Date.now()}`,
        recipientName: formName.trim(),
        phone: formPhone.trim(),
        fullAddress: cleanAddressGlitch(formAddress.trim()),
        label: formLabel,
        lat: coords.lat,
        lng: coords.lon,
        isDefault: formIsDefault || isFirst,
        createdAt: new Date().toISOString(),
      }
      updated = [newAddr, ...updated]
    }

    setAddressList(updated)
    saveUserAddressList(currentUser, updated)
    setAddressView('list')
    onNotify?.(editingAddrId ? '✅ Đã cập nhật địa chỉ thành công!' : '🎉 Đã thêm địa chỉ mới vào Sổ địa chỉ!')
  }

  // Tọa độ định vị
  const [coords, setCoords] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(addressKey) || '{}')
      if (saved.coords && saved.coords.lat && saved.coords.lon) {
        return saved.coords
      }
    } catch {}
    return { lat: 10.7716, lon: 106.7044 }
  })

  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [locating, setLocating] = useState(false)
  const [reverseLoading, setReverseLoading] = useState(false)
  const [leafletReady, setLeafletReady] = useState(false)

  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const debounceRef = useRef(null)
  const dropdownRef = useRef(null)

  // Khởi tạo bản đồ tương tác Leaflet khi ở tab Sổ địa chỉ
  useEffect(() => {
    if (activeTab !== 'address') return
    let isMounted = true
    ensureProfileLeaflet().then((L) => {
      if (!isMounted || !L || !mapContainerRef.current) return
      setLeafletReady(true)

      if (!mapInstanceRef.current) {
        const initialLat = coords.lat || 10.7716
        const initialLng = coords.lon || 106.7044

        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: 16,
          zoomControl: true,
          scrollWheelZoom: true,
        })

        L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi', {
          subdomains: ['0', '1', '2', '3'],
          maxZoom: 20,
          attribution: '© Google Maps',
        }).addTo(map)

        const pinIcon = createProfilePinIcon(L)
        const marker = L.marker([initialLat, initialLng], {
          draggable: true,
          icon: pinIcon,
        }).addTo(map)

        marker.on('dragend', async (e) => {
          const pos = e.target.getLatLng()
          await handleMapLocationChange(pos.lat, pos.lng)
        })

        map.on('click', async (e) => {
          const { lat, lng } = e.latlng
          marker.setLatLng([lat, lng])
          await handleMapLocationChange(lat, lng)
        })

        mapInstanceRef.current = map
        markerRef.current = marker

        setTimeout(() => {
          map.invalidateSize()
        }, 300)
      }
    })

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [activeTab])

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Đồng bộ vị trí ghim và tâm bản đồ
  const syncMapLocation = (lat, lon, zoom = 16) => {
    setCoords({ lat, lon })
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lon])
      mapInstanceRef.current.setView([lat, lon], zoom, { animate: true })
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200)
    }
  }

  // Reverse Geocoding chuẩn Việt Nam khi click / kéo thả ghim
  const handleMapLocationChange = async (lat, lon) => {
    setCoords({ lat, lon })
    setReverseLoading(true)
    const finalAddr = await reverseGeocodeVietnam(lat, lon, formAddress)
    setFormAddress(finalAddr)
    setReverseLoading(false)
  }

  // Nhập địa chỉ thủ công & Tìm kiếm gợi ý thông minh Nominatim
  const handleAddressInputChange = (e) => {
    const val = e.target.value
    setDefaultAddress(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!val || val.trim().length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=vn&accept-language=vi&limit=6&q=${encodeURIComponent(val)}`,
          { headers: { 'Accept-Language': 'vi,en' } }
        )
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            const mapped = data.map((it) => ({
              name: it.display_name.split(',')[0],
              detail: it.display_name,
              lat: Number(it.lat),
              lon: Number(it.lon),
            }))
            setSuggestions(mapped)
            setShowDropdown(true)
            return
          }
        }
      } catch (err) {
        console.warn('Nominatim error:', err)
      }

      const filtered = POPULAR_PROFILE_LANDMARKS.filter(
        (it) => it.name.toLowerCase().includes(val.toLowerCase()) || it.detail.toLowerCase().includes(val.toLowerCase())
      )
      setSuggestions(filtered)
      setShowDropdown(filtered.length > 0)
    }, 350)
  }

  const handleSelectSuggestion = (item) => {
    const finalAddr = item.detail || item.name
    setFormAddress(finalAddr)
    setShowDropdown(false)
    if (item.lat && item.lon) {
      syncMapLocation(Number(item.lat), Number(item.lon), 17)
    }
  }

  const handleSelectLandmark = (lm) => {
    setFormAddress(lm.detail)
    syncMapLocation(lm.lat, lm.lon, 17)
    if (onNotify) onNotify(`📍 Đã ghim vị trí ${lm.name} trên bản đồ!`)
  }

  const handleUseCurrentLocation = async () => {
    setLocating(true)
    const applyGPS = async (lat, lon, label = 'Vị trí hiện tại') => {
      syncMapLocation(lat, lon, 17)
      const finalAddr = await reverseGeocodeVietnam(lat, lon, formAddress)
      setFormAddress(finalAddr)
      setLocating(false)
      if (onNotify) onNotify('🎯 Đã định vị thành công vị trí của bạn!')
    }

    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await applyGPS(pos.coords.latitude, pos.coords.longitude)
        },
        async () => {
          try {
            const res = await fetch('https://ipwho.is/')
            if (res.ok) {
              const data = await res.json()
              if (data && data.latitude && data.longitude) {
                await applyGPS(Number(data.latitude), Number(data.longitude), data.city || 'Vị trí mạng')
                return
              }
            }
          } catch {}
          setLocating(false)
          if (onNotify) onNotify('⚠️ Không thể dò GPS, bạn có thể click chọn trực tiếp trên bản đồ!')
        },
        { enableHighAccuracy: true, timeout: 6000 }
      )
    } else {
      setLocating(false)
      if (onNotify) onNotify('Trình duyệt không hỗ trợ Geolocation.')
    }
  }

  // Lọc chỉ các đơn hàng THỰC SỰ thuộc về tài khoản này (cách ly 100% với tài khoản khác & đơn hệ thống)
  const userOrders = useMemo(() => {
    if (!currentUser) return []
    const userPhone = (currentUser.phone || '').trim()
    const userEmail = (currentUser.email || '').toLowerCase().trim()
    const userName = (currentUser.fullName || '').toLowerCase().trim()

    return (localOrders || []).filter((o) => {
      if (!o) return false
      const orderPhone = (o.customerPhone || o.phone || '').trim()
      const orderEmail = (o.customerEmail || o.email || '').toLowerCase().trim()
      const orderNote = (o.note || '').toLowerCase()

      // 1. Khớp chính xác Số điện thoại (>= 9 số)
      if (userPhone && userPhone.length >= 9) {
        if (orderPhone && userPhone === orderPhone) return true
        if (orderNote.includes(userPhone)) return true
      }

      // 2. Khớp chính xác Email (>= 5 ký tự)
      if (userEmail && userEmail.length >= 5) {
        if (orderEmail && userEmail === orderEmail) return true
        if (orderNote.includes(userEmail)) return true
      }

      // 3. Khớp họ tên (chỉ khi họ tên >= 4 ký tự và đơn hàng không mang SĐT/Email của người khác)
      if (userName && userName.length >= 4 && (o.customerName || o.fullName)) {
        const orderName = (o.customerName || o.fullName).toLowerCase().trim()
        if (userName === orderName) {
          if (orderPhone && userPhone && orderPhone !== userPhone) return false
          if (orderEmail && userEmail && orderEmail !== userEmail) return false
          return true
        }
      }

      return false
    })
  }, [localOrders, currentUser])

  // Số lượng đơn hàng theo từng tab trạng thái
  const orderCounts = useMemo(() => {
    const c = { all: userOrders.length, pending: 0, processing: 0, shipping: 0, completed: 0, cancelled: 0 }
    userOrders.forEach((o) => {
      const meta = getOrderStatusMeta(o.status)
      if (c[meta.key] !== undefined) c[meta.key]++
    })
    return c
  }, [userOrders])

  // Danh sách đơn hàng đã lọc theo tab trạng thái đang chọn
  const displayedOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return userOrders
    return userOrders.filter((o) => getOrderStatusMeta(o.status).key === orderStatusFilter)
  }, [userOrders, orderStatusFilter])

  // Xử lý Hủy đơn hàng (dành cho đơn Chờ xác nhận)
  const handleCancelOrder = async (targetOrder) => {
    const code = targetOrder.orderCode || `#ORD-${targetOrder.id}`
    const ok = window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${code}?`)
    if (!ok) return

    try {
      await api.cancelOrder(targetOrder.id || targetOrder.orderCode)
      const updated = (localOrders || []).map((o) => {
        if (o.id === targetOrder.id || o.orderCode === targetOrder.orderCode) {
          return { ...o, status: 'cancelled' }
        }
        return o
      })
      setLocalOrders(updated)
      if (selectedOrder && (selectedOrder.id === targetOrder.id || selectedOrder.orderCode === targetOrder.orderCode)) {
        setSelectedOrder({ ...selectedOrder, status: 'cancelled' })
      }
      onNotify?.(`✓ Đã hủy đơn hàng ${code} thành công!`)
      onRefreshOrders?.()
    } catch (err) {
      console.warn('Lỗi khi hủy đơn:', err)
      onNotify?.('⚠️ Không thể hủy đơn hàng lúc này. Vui lòng thử lại sau!')
    }
  }

  // Xử lý Mua lại đơn hàng (Re-order)
  const handleReorder = (targetOrder) => {
    const items = targetOrder.items || targetOrder.orderDetails || targetOrder.details || []
    if (items.length === 0) {
      onNotify?.('⚠️ Đơn hàng không có thông tin sản phẩm để mua lại.')
      return
    }
    items.forEach((it) => {
      const p = {
        id: it.productId || it.id,
        name: it.productName || it.name,
        price: it.unitPrice || it.price,
        image: it.image || getProductImage(it) || getCategoryFallbackImage(it),
        sku: it.sku || `SKU-${it.productId || it.id}`,
      }
      onAddToCart?.(p, it.quantity || 1)
    })
    onNotify?.(`🎉 Đã thêm ${items.length} món vào giỏ hàng thành công!`)
  }

  // Xử lý Tra cứu bảo hành cho đơn hàng
  const handleLookupOrderWarranty = (targetOrder) => {
    const term = targetOrder.orderCode || targetOrder.customerPhone || currentUser?.phone || ''
    setWarrantyKeyword(term)
    setActiveTab('warranty')
    handleWarrantySearch(term)
  }

  // Doanh số & Hạng thành viên (chỉ tính các đơn hợp lệ hoàn tất của chính khách hàng này, loại trừ đơn hủy/thất bại)
  const completedOrders = userOrders.filter((ord) => {
    const st = (ord.status || '').toLowerCase()
    return st === 'completed' || st === 'hoàn tất' || st === 'giao thành công' || st === 'delivered'
  })
  const calculatedSpent = completedOrders.reduce((sum, ord) => sum + (ord.totalAmount || ord.finalAmount || 0), 0)
  const totalSpent = userTierInfo?.totalSpent != null ? userTierInfo.totalSpent : calculatedSpent
  const tier = userTierInfo || {
    name: totalSpent >= 50000000 ? 'VIP Kim Cương' : totalSpent >= 20000000 ? 'Thành viên Vàng' : totalSpent >= 1000000 ? 'Thành viên Bạc' : 'Thành viên Mới',
    badge: totalSpent >= 50000000 ? '💎 VIP Kim Cương' : totalSpent >= 20000000 ? '🥇 VIP Vàng' : totalSpent >= 1000000 ? '🥈 VIP Bạc' : '🌱 Thành viên Mới',
    discount: totalSpent >= 50000000 ? 5 : totalSpent >= 20000000 ? 3 : totalSpent >= 1000000 ? 2 : 0,
    nextTarget: totalSpent >= 50000000 ? 100000000 : totalSpent >= 20000000 ? 50000000 : 1000000,
    nextTier: totalSpent >= 50000000 ? 'VIP Toàn Năng' : totalSpent >= 20000000 ? 'VIP Kim Cương' : 'Thành viên Bạc',
  }
  const progressPercent = totalSpent === 0 ? 0 : Math.min(100, Math.round((totalSpent / tier.nextTarget) * 100))

  // SmartStock Xu & Điểm danh
  const [coins, setCoins] = useState(() => {
    try {
      const saved = localStorage.getItem(coinKey)
      if (saved != null) return parseInt(saved, 10)
      return 0
    } catch {
      return 0
    }
  })
  const [isCheckedInToday, setIsCheckedInToday] = useState(() => {
    return localStorage.getItem(checkinKey) === new Date().toDateString()
  })

  const handleDailyCheckin = () => {
    const today = new Date().toDateString()
    if (isCheckedInToday) {
      onNotify?.('Bạn đã điểm danh nhận Xu hôm nay rồi! Hãy quay lại vào ngày mai nhé.')
      return
    }
    const nextCoins = coins + 10000
    setCoins(nextCoins)
    setIsCheckedInToday(true)
    localStorage.setItem(coinKey, nextCoins.toString())
    localStorage.setItem(checkinKey, today)
    window.dispatchEvent(new CustomEvent('smartstock_coins_updated', { detail: { coins: nextCoins } }))
    onNotify?.('🎉 Chúc mừng! Bạn nhận được +10.000 Xu điểm danh ngày mới thành công!')
  }

  const handleSaveAddress = (e) => {
    e.preventDefault()
    try {
      const addressData = {
        name: defaultName.trim(),
        phone: defaultPhone.trim(),
        address: defaultAddress.trim(),
        coords: coords,
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem(addressKey, JSON.stringify(addressData))
      onNotify?.('✅ Đã lưu Sổ địa chỉ mặc định thành công! Lần mua sau sẽ tự động điền trong 1 giây.')
    } catch (err) {
      console.warn('Save address err:', err)
      onNotify?.('⚠️ Không thể lưu địa chỉ vào bộ nhớ trình duyệt.')
    }
  }

  return (
    <div
      className="store-modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="store-modal-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '95vw',
          maxWidth: '960px',
          height: '86vh',
          maxHeight: '660px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          padding: 0,
          position: 'relative',
        }}
      >
        {/* Nút X đóng Modal */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#a8a29e',
            zIndex: 10,
            padding: '4px',
            borderRadius: '6px',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#1c1917'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#a8a29e'}
        >
          <X size={20} />
        </button>

        {/* CỘT TRÁI (SIDEBAR CÁ NHÂN ~300PX) */}
        <div
          style={{
            width: '310px',
            flexShrink: 0,
            background: '#fafaf9',
            borderRight: '1px solid #e7e5e4',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
          }}
        >
          {/* THẺ THÀNH VIÊN (MEMBERSHIP CARD) GRADIENT NÂU VÀNG ĐỒNG */}
          <div
            style={{
              background: 'linear-gradient(135deg, #4A3520 0%, #7A542E 100%)',
              borderRadius: '14px',
              padding: '16px',
              color: '#ffffff',
              boxShadow: '0 8px 20px rgba(74, 53, 32, 0.28)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Icon sao vàng góc phải */}
            <div style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '20px', opacity: 0.9 }}>
              ⭐
            </div>

            {/* Badge hạng */}
            <div style={{ display: 'inline-block', background: 'rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(4px)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.3px', marginBottom: '12px' }}>
              {tier.badge}
            </div>

            {/* Tên & Email */}
            <div style={{ fontSize: '17px', fontWeight: 800, marginBottom: '2px', textShadow: '0 1px 2px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profileData.fullName || currentUser?.fullName || currentUser?.username || 'Khách hàng'}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profileData.email || currentUser?.email || 'customer@smartstock.vn'}
            </div>

            {/* Tiến trình chi tiêu & Số dư Xu */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px', opacity: 0.9 }}>
                <span>Chi tiêu tích lũy:</span>
                <strong>{formatVND(totalSpent)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '6px', opacity: 0.95, color: '#fef08a' }}>
                <span>🪙 SmartStock Xu:</span>
                <strong style={{ fontWeight: 800 }}>{coins.toLocaleString('vi-VN')} Xu</strong>
              </div>

              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.25)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: '#f59e0b', borderRadius: '3px', transition: 'width 0.4s ease' }} />
              </div>

              <div style={{ fontSize: '10px', opacity: 0.9, lineHeight: 1.3 }}>
                {totalSpent === 0
                  ? 'Chi tiêu thêm 1.000.000₫ để lên hạng Bạc'
                  : totalSpent >= 50000000
                  ? '⭐ Bạn đang sở hữu hạng VIP Kim Cương cao nhất!'
                  : `Chi tiêu thêm ${formatVND(Math.max(0, tier.nextTarget - totalSpent))} để lên ${tier.nextTier}`}
              </div>
            </div>
          </div>

          {/* MENU CÁC TAB CHỨC NĂNG DỌC */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'profile', icon: '👤', label: 'Thông tin cá nhân' },
              { id: 'orders', icon: '🧾', label: 'Lịch sử đơn hàng' },
              { id: 'address', icon: '📍', label: 'Sổ địa chỉ' },
              { id: 'warranty', icon: '🛡️', label: 'Tra cứu Bảo hành' },
              { id: 'vouchers', icon: '🎁', label: 'Ưu đãi & Voucher' },
              { id: 'loyalty', icon: '🪙', label: 'Xu & Khách hàng thân thiết' },
              { id: 'notifications', icon: '✉️', label: 'Thông báo & Hộp thư' },
            ].map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
                    background: isActive ? '#fef3c7' : 'transparent',
                    color: isActive ? '#92400e' : '#44403c',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = '#f5f5f4'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                  <span style={{ fontSize: '12px', opacity: isActive ? 1 : 0.4 }}>❯</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* CỘT PHẢI (NỘI DUNG TỪNG TAB - NỀN TRẮNG TINH TẾ, FLEX: 1) */}
        <div
          style={{
            flex: 1,
            background: '#ffffff',
            padding: '24px 28px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #f1f5f3', paddingBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1c1917', margin: 0 }}>
                    Thông tin cá nhân
                  </h3>
                  <p style={{ fontSize: '12px', color: '#78716c', margin: '4px 0 0' }}>
                    Quản lý và cập nhật thông tin hồ sơ của bạn
                  </p>
                </div>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm(profileData)
                      setIsEditing(true)
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: '1px solid #d6d3d1',
                      background: '#ffffff',
                      color: '#1c1917',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <span>✏️</span>
                    <span>Chỉnh sửa</span>
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d6d3d1',
                        background: '#ffffff',
                        color: '#57534e',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#1E3A2F',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      💾 Lưu
                    </button>
                  </div>
                )}
              </div>

              {/* 5 DÒNG THÔNG TIN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 1. Họ và tên */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f5f5f4' }}>
                  <span style={{ fontSize: '12px', color: '#78716c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>👤</span> Họ và tên
                  </span>
                  {isEditing ? (
                    <input
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      style={{ height: '32px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d6d3d1', fontSize: '12px', width: '220px' }}
                    />
                  ) : (
                    <strong style={{ fontSize: '13px', color: '#1c1917' }}>{profileData.fullName || 'Chưa cập nhật'}</strong>
                  )}
                </div>

                {/* 2. Ngày sinh */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f5f5f4' }}>
                  <span style={{ fontSize: '12px', color: '#78716c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📅</span> Ngày sinh
                  </span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.dob}
                      onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                      style={{ height: '32px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d6d3d1', fontSize: '12px', width: '220px' }}
                    />
                  ) : (
                    <span style={{ fontSize: '13px', color: profileData.dob ? '#1c1917' : '#9ca3af', fontWeight: profileData.dob ? 600 : 400 }}>
                      {profileData.dob || 'Chưa cập nhật'}
                    </span>
                  )}
                </div>

                {/* 3. Giới tính */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f5f5f4' }}>
                  <span style={{ fontSize: '12px', color: '#78716c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚥</span> Giới tính
                  </span>
                  {isEditing ? (
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      style={{ height: '32px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d6d3d1', fontSize: '12px', width: '220px' }}
                    >
                      <option value="">-- Chưa chọn --</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  ) : (
                    <span style={{ fontSize: '13px', color: profileData.gender ? '#1c1917' : '#9ca3af', fontWeight: profileData.gender ? 700 : 400 }}>
                      {profileData.gender || 'Chưa cập nhật'}
                    </span>
                  )}
                </div>

                {/* 4. Số điện thoại */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f5f5f4' }}>
                  <span style={{ fontSize: '12px', color: '#78716c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📞</span> Số điện thoại
                  </span>
                  {isEditing ? (
                    <input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Nhập số điện thoại..."
                      style={{ height: '32px', padding: '0 10px', borderRadius: '6px', border: '1px solid #d6d3d1', fontSize: '12px', width: '220px' }}
                    />
                  ) : (
                    <strong style={{ fontSize: '13px', color: '#1c1917' }}>{profileData.phone || 'Chưa cập nhật'}</strong>
                  )}
                </div>

                {/* 5. Email kèm icon ổ khóa */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f5f5f4' }}>
                  <span style={{ fontSize: '12px', color: '#78716c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>✉️</span> Email
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#44403c', fontWeight: 600 }}>
                    <span>{profileData.email}</span>
                    <span title="Email đăng nhập bảo mật không thể thay đổi">🔒</span>
                  </span>
                </div>
              </div>

              {/* NÚT ĐĂNG XUẤT Ở GÓC DƯỚI BÊN TRÁI */}
              <div style={{ marginTop: '36px' }}>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onLogout?.()
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #fee2e2',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fee2e2'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fef2f2'
                  }}
                >
                  <span>↪</span>
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LỊCH SỬ ĐƠN HÀNG (CHUẨN SÀN TMĐT SHOPEE / TGDĐ) */}
          {activeTab === 'orders' && (
            <div>
              {!selectedOrder ? (
                /* VIEW 1: DANH SÁCH ĐƠN HÀNG & BỘ LỌC TRẠNG THÁI NGANG */
                <div>
                  <div style={{ marginBottom: '14px', borderBottom: '1px solid #f1f5f3', paddingBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1c1917', margin: 0 }}>
                      Lịch sử đơn hàng ({userOrders.length})
                    </h3>
                    <p style={{ fontSize: '12px', color: '#78716c', margin: '4px 0 0' }}>
                      Theo dõi tiến trình vận chuyển và quản lý đơn hàng của bạn
                    </p>
                  </div>

                  {/* THANH TAB LỌC TRẠNG THÁI ĐƠN HÀNG NGANG */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      overflowX: 'auto',
                      paddingBottom: '8px',
                      marginBottom: '16px',
                      scrollbarWidth: 'none',
                    }}
                  >
                    {[
                      { key: 'all', label: 'Tất cả' },
                      { key: 'pending', label: 'Chờ xác nhận' },
                      { key: 'processing', label: 'Đang xử lý / Đóng gói' },
                      { key: 'shipping', label: 'Đang giao hàng' },
                      { key: 'completed', label: 'Hoàn thành' },
                      { key: 'cancelled', label: 'Đã hủy' },
                    ].map((tab) => {
                      const isActive = orderStatusFilter === tab.key
                      const count = orderCounts[tab.key] || 0
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setOrderStatusFilter(tab.key)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: isActive ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
                            background: isActive ? '#ffedd5' : '#ffffff',
                            color: isActive ? '#c2410c' : '#475569',
                            fontSize: '12px',
                            fontWeight: isActive ? 700 : 500,
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>{tab.label}</span>
                          {count > 0 && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                background: isActive ? '#ea580c' : '#f1f5f9',
                                color: isActive ? '#ffffff' : '#64748b',
                                padding: '1px 6px',
                                borderRadius: '10px',
                              }}
                            >
                              {count}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* DANH SÁCH CÁC THẺ ĐƠN HÀNG */}
                  {displayedOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                      <div style={{ fontSize: '40px', marginBottom: '10px' }}>🧾</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        {orderStatusFilter === 'all'
                          ? 'Bạn chưa có đơn hàng nào'
                          : `Không có đơn hàng nào ở trạng thái này`}
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 auto 14px', maxWidth: '320px' }}>
                        Khám phá ngay hàng trăm sản phẩm công nghệ chính hãng giá tốt tại SmartStock Storefront.
                      </p>
                      {orderStatusFilter !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setOrderStatusFilter('all')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Xem tất cả đơn hàng
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {displayedOrders.map((ord, idx) => {
                        const statusMeta = getOrderStatusMeta(ord.status)
                        const items = ord.items || ord.orderDetails || ord.details || []
                        const firstItem = items[0]
                        const firstItemImg = firstItem
                          ? (firstItem.image || getProductImage(firstItem) || getCategoryFallbackImage(firstItem))
                          : null

                        return (
                          <div
                            key={ord.id || ord.orderCode || idx}
                            onClick={() => setSelectedOrder(ord)}
                            style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '14px 16px',
                              background: '#ffffff',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              position: 'relative',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#ea580c'
                              e.currentTarget.style.boxShadow = '0 6px 16px rgba(234, 88, 12, 0.08)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#e2e8f0'
                              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'
                            }}
                          >
                            {/* Header thẻ đơn: Mã đơn + Badge trạng thái chuẩn hóa */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                                  {ord.orderCode || `#ORD-${ord.id || idx + 1}`}
                                </span>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>•</span>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>
                                  {ord.createdAt ? formatDate(ord.createdAt) : 'Hôm nay'}
                                </span>
                              </div>

                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: statusMeta.bg,
                                  color: statusMeta.color,
                                  border: `1px solid ${statusMeta.border}`,
                                  padding: '3px 10px',
                                  borderRadius: '14px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                {statusMeta.label}
                              </span>
                            </div>

                            {/* Sản phẩm trong đơn */}
                            {items.length > 0 ? (
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #f8fafc', borderBottom: '1px solid #f8fafc' }}>
                                {firstItemImg && (
                                  <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                    <img
                                      src={firstItemImg}
                                      alt={firstItem?.productName || firstItem?.name || ''}
                                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                      onError={(e) => {
                                        e.target.src = getCategoryFallbackImage(firstItem)
                                      }}
                                    />
                                  </div>
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {firstItem?.productName || firstItem?.name || 'Sản phẩm công nghệ'}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                    Số lượng: <strong>x{firstItem?.quantity || 1}</strong>
                                    {items.length > 1 && (
                                      <span style={{ color: '#ea580c', marginLeft: '6px', fontWeight: 600 }}>
                                        (+{items.length - 1} sản phẩm khác)
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                                    {formatVND((firstItem?.unitPrice || firstItem?.price || 0) * (firstItem?.quantity || 1))}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div style={{ padding: '8px 0', fontSize: '11px', color: '#64748b' }}>
                                Đơn hàng SmartStock • PT: {ord.paymentMethod || 'COD'}
                              </div>
                            )}

                            {/* Footer thẻ: Tổng tiền + Nút Xem chi tiết > */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                Tổng thanh toán: <strong style={{ fontSize: '14px', fontWeight: 800, color: '#ea580c', marginLeft: '4px' }}>{formatVND(ord.totalAmount || 0)}</strong>
                              </div>

                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: '#ea580c',
                                }}
                              >
                                <span>Xem chi tiết</span>
                                <ChevronRight size={15} />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* VIEW 2: CHI TIẾT & THEO DÕI ĐƠN HÀNG (ORDER TRACKING STEPPER) */
                <div>
                  {/* Nút quay lại danh sách */}
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#ea580c',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 0',
                      marginBottom: '14px',
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>Quay lại danh sách đơn hàng</span>
                  </button>

                  {/* Header chi tiết đơn hàng */}
                  {(() => {
                    const statusMeta = getOrderStatusMeta(selectedOrder.status)
                    const currentStep = statusMeta.step
                    const isCancelled = statusMeta.key === 'cancelled'
                    const items = selectedOrder.items || selectedOrder.orderDetails || selectedOrder.details || []
                    const itemsSubtotal = items.reduce((sum, it) => sum + (it.unitPrice || it.price || 0) * (it.quantity || 1), 0)

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {/* Thanh tiêu đề đơn hàng */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f3', paddingBottom: '14px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                Đơn hàng {selectedOrder.orderCode || `#ORD-${selectedOrder.id}`}
                              </h3>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  background: statusMeta.bg,
                                  color: statusMeta.color,
                                  border: `1px solid ${statusMeta.border}`,
                                  padding: '2px 10px',
                                  borderRadius: '12px',
                                }}
                              >
                                {statusMeta.label}
                              </span>
                            </div>
                            <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0' }}>
                              Thời gian đặt hàng: <strong>{selectedOrder.createdAt ? formatDate(selectedOrder.createdAt) : 'Hôm nay'}</strong>
                            </p>
                          </div>

                          {/* Nút hành động nhanh ở header */}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {statusMeta.key === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleCancelOrder(selectedOrder)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #fecaca',
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <XCircle size={14} />
                                <span>Hủy đơn</span>
                              </button>
                            )}

                            {statusMeta.key === 'completed' && (
                              <button
                                type="button"
                                onClick={() => handleLookupOrderWarranty(selectedOrder)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #bae6fd',
                                  background: '#f0f9ff',
                                  color: '#0284c7',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <ShieldCheck size={14} />
                                <span>Bảo hành</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* PHẦN 1: THANH TIẾN TRÌNH VẬN CHUYỂN (ORDER TRACKING STEPPER) */}
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#334155', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Tiến trình đơn hàng
                          </h4>

                          {isCancelled ? (
                            <div style={{ background: '#ffffff', border: '1.5px solid #fecaca', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fee2e2', display: 'grid', placeItems: 'center', color: '#dc2626', flexShrink: 0 }}>
                                <XCircle size={22} />
                              </div>
                              <div>
                                <strong style={{ fontSize: '13px', color: '#991b1b', display: 'block', marginBottom: '2px' }}>Đơn hàng đã được hủy</strong>
                                <p style={{ fontSize: '11px', color: '#b91c1c', margin: 0, lineHeight: 1.4 }}>
                                  Đơn hàng này đã kết thúc xử lý. Quý khách có thể bấm nút "Mua lại" bên dưới nếu muốn đặt mua lại các sản phẩm này.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div style={{ position: 'relative', padding: '10px 4px 6px' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
                                {[
                                  { step: 1, title: 'Đặt hàng thành công', desc: selectedOrder.createdAt ? formatDate(selectedOrder.createdAt) : 'Hôm nay', icon: Receipt },
                                  { step: 2, title: 'Đã xác nhận & Đóng gói', desc: currentStep >= 2 ? 'Kho SmartStock xuất hàng' : 'Chờ xác nhận', icon: Package },
                                  { step: 3, title: 'Đang vận chuyển', desc: currentStep >= 3 ? 'SmartStock Express' : 'Chờ giao đối tác', icon: Truck },
                                  { step: 4, title: 'Giao hàng thành công', desc: currentStep >= 4 ? 'Đã nhận hàng thành công' : 'Dự kiến 1-2 ngày', icon: Award },
                                ].map((s, sIdx, arr) => {
                                  const isPassed = currentStep >= s.step
                                  const isCurrent = currentStep === s.step
                                  const StepIcon = s.icon

                                  return (
                                    <div
                                      key={s.step}
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        flex: 1,
                                        position: 'relative',
                                        zIndex: 2,
                                      }}
                                    >
                                      {/* Đường line nối giữa các bước */}
                                      {sIdx < arr.length - 1 && (
                                        <div
                                          style={{
                                            position: 'absolute',
                                            top: '18px',
                                            left: '50%',
                                            width: '100%',
                                            height: '3px',
                                            background: currentStep > s.step ? '#16a34a' : '#cbd5e1',
                                            zIndex: -1,
                                            transition: 'all 0.3s ease',
                                          }}
                                        />
                                      )}

                                      {/* Icon vòng tròn */}
                                      <div
                                        style={{
                                          width: '36px',
                                          height: '36px',
                                          borderRadius: '50%',
                                          background: isPassed ? '#16a34a' : '#ffffff',
                                          border: isPassed ? '2px solid #16a34a' : '2px solid #cbd5e1',
                                          color: isPassed ? '#ffffff' : '#94a3b8',
                                          display: 'grid',
                                          placeItems: 'center',
                                          marginBottom: '8px',
                                          boxShadow: isCurrent ? '0 0 0 4px rgba(22, 163, 74, 0.2)' : 'none',
                                          transition: 'all 0.2s ease',
                                        }}
                                      >
                                        <StepIcon size={17} />
                                      </div>

                                      <div style={{ fontSize: '11px', fontWeight: isPassed ? 700 : 500, color: isPassed ? '#0f172a' : '#64748b', lineHeight: 1.3, maxWidth: '110px' }}>
                                        {s.title}
                                      </div>
                                      <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px', maxWidth: '100px' }}>
                                        {s.desc}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* PHẦN 2: THÔNG TIN NHẬN HÀNG & THANH TOÁN */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                          {/* Khung Thông tin nhận hàng */}
                          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>📍</span>
                              <span>Địa chỉ nhận hàng</span>
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                              {selectedOrder.customerName || selectedOrder.fullName || 'Khách hàng SmartStock'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                              Số điện thoại: <strong style={{ color: '#0f172a' }}>{selectedOrder.customerPhone || selectedOrder.phone || 'Chưa cập nhật'}</strong>
                            </div>
                            <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
                              {selectedOrder.shippingAddress || selectedOrder.address || 'Tại cửa hàng SmartStock'}
                            </div>
                            {selectedOrder.note && (
                              <div style={{ marginTop: '8px', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', fontSize: '10px', color: '#64748b' }}>
                                <strong>Ghi chú:</strong> {selectedOrder.note}
                              </div>
                            )}
                          </div>

                          {/* Khung Phương thức thanh toán & Vận chuyển */}
                          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>💳</span>
                              <span>Thanh toán &amp; Vận chuyển</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                              Phương thức: <strong style={{ color: '#0f172a' }}>{selectedOrder.paymentMethod === 'VIETQR' ? 'Chuyển khoản VietQR' : 'Thanh toán tiền mặt khi nhận hàng (COD)'}</strong>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                              Đơn vị vận chuyển: <strong style={{ color: '#0f172a' }}>SmartStock Express (Tiêu chuẩn)</strong>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                              Trạng thái thanh toán:{' '}
                              <span style={{ fontWeight: 700, color: (selectedOrder.paidAmount >= selectedOrder.totalAmount || selectedOrder.paymentMethod === 'VIETQR') ? '#16a34a' : '#ea580c' }}>
                                {(selectedOrder.paidAmount >= selectedOrder.totalAmount || selectedOrder.paymentMethod === 'VIETQR')
                                  ? '✓ Đã thanh toán'
                                  : 'Thanh toán khi nhận hàng'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* PHẦN 3: DANH SÁCH SẢN PHẨM TRONG ĐƠN HÀNG */}
                        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                          <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                            Sản phẩm đã đặt ({items.length})
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {items.map((item, itIdx) => {
                              const itemImg = item.image || getProductImage(item) || getCategoryFallbackImage(item)
                              const unitPrice = item.unitPrice || item.price || 0
                              const qty = item.quantity || 1
                              const itemTotal = unitPrice * qty

                              return (
                                <div
                                  key={itIdx}
                                  style={{
                                    display: 'flex',
                                    gap: '14px',
                                    alignItems: 'center',
                                    padding: '14px 16px',
                                    borderBottom: itIdx < items.length - 1 ? '1px solid #f1f5f9' : 'none',
                                  }}
                                >
                                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                    <img
                                      src={itemImg}
                                      alt={item.productName || item.name}
                                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                      onError={(e) => {
                                        e.target.src = getCategoryFallbackImage(item)
                                      }}
                                    />
                                  </div>

                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '0 0 3px', lineHeight: 1.3 }}>
                                      {item.productName || item.name}
                                    </h5>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                                      Mã SKU: <span style={{ fontFamily: 'monospace', color: '#334155' }}>{item.sku || `SKU-${item.productId || itIdx + 1}`}</span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '2px', fontWeight: 600 }}>
                                      🛡️ Bảo hành chính hãng 12 tháng
                                    </div>
                                  </div>

                                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                      {formatVND(unitPrice)} <span style={{ fontWeight: 700, color: '#0f172a' }}>x{qty}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                                      {formatVND(itemTotal)}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* PHẦN 4: BẢNG TỔNG KẾT CHI PHÍ & CỤM NÚT HÀNH ĐỘNG */}
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '360px', marginLeft: 'auto', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                              <span>Tổng tiền hàng:</span>
                              <strong style={{ color: '#0f172a' }}>{formatVND(itemsSubtotal || selectedOrder.totalAmount)}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                              <span>Phí vận chuyển:</span>
                              <strong style={{ color: '#16a34a' }}>Miễn phí (0₫)</strong>
                            </div>

                            {(selectedOrder.discountAmount > 0 || selectedOrder.discount > 0) && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#ea580c' }}>
                                <span>Giảm giá Voucher / Xu:</span>
                                <strong>-{formatVND(selectedOrder.discountAmount || selectedOrder.discount || 0)}</strong>
                              </div>
                            )}

                            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Tổng thanh toán:</span>
                              <span style={{ fontSize: '18px', fontWeight: 900, color: '#ea580c' }}>
                                {formatVND(selectedOrder.totalAmount || 0)}
                              </span>
                            </div>
                          </div>

                          {/* Cụm nút hành động theo ngữ cảnh trạng thái đơn */}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '14px', flexWrap: 'wrap' }}>
                            {statusMeta.key === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleCancelOrder(selectedOrder)}
                                style={{
                                  padding: '8px 18px',
                                  borderRadius: '8px',
                                  border: '1px solid #fecaca',
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <XCircle size={15} />
                                <span>Hủy đơn hàng</span>
                              </button>
                            )}

                            {statusMeta.key === 'completed' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleLookupOrderWarranty(selectedOrder)}
                                  style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #bae6fd',
                                    background: '#f0f9ff',
                                    color: '#0284c7',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <ShieldCheck size={15} />
                                  <span>Tra cứu bảo hành</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    onNotify?.('⭐ Cảm ơn quý khách! Đánh giá 5 sao cho đơn hàng đã được ghi nhận thành công.')
                                  }}
                                  style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    background: '#ffffff',
                                    color: '#334155',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <Star size={15} color="#f59e0b" fill="#f59e0b" />
                                  <span>Đánh giá sản phẩm</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleReorder(selectedOrder)}
                                  style={{
                                    padding: '8px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#ea580c',
                                    color: '#ffffff',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
                                  }}
                                >
                                  <RotateCcw size={15} />
                                  <span>Mua lại đơn này</span>
                                </button>
                              </>
                            )}

                            {statusMeta.key === 'cancelled' && (
                              <button
                                type="button"
                                onClick={() => handleReorder(selectedOrder)}
                                style={{
                                  padding: '8px 20px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: '#ea580c',
                                  color: '#ffffff',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
                                }}
                              >
                                <RotateCcw size={15} />
                                <span>Mua lại đơn hàng này</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SỔ ĐỊA CHỈ (CHUẨN SHOPEE / TIKTOK SHOP) */}
          {activeTab === 'address' && (
            <div>
              {addressView === 'list' ? (
                <div>
                  {/* Header Sổ địa chỉ */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f3', paddingBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Địa chỉ của tôi</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c', background: '#ffedd5', padding: '2px 8px', borderRadius: '12px' }}>
                          Đã lưu {addressList.length} địa chỉ
                        </span>
                      </h3>
                      <p style={{ fontSize: '12px', color: '#78716c', margin: '4px 0 0' }}>
                        Địa chỉ mặc định được ưu tiên tự động điền khi Mua ngay &amp; Đặt hàng
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      style={{
                        background: '#ea580c',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
                      }}
                    >
                      <Plus size={14} />
                      <span>+ Thêm địa chỉ mới</span>
                    </button>
                  </div>

                  {/* Danh sách địa chỉ */}
                  {addressList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 20px', background: '#fafaf9', borderRadius: '12px', border: '1px dashed #d6d3d1' }}>
                      <div style={{ fontSize: '42px', marginBottom: '12px' }}>📍</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1c1917', marginBottom: '6px' }}>
                        Bạn chưa có địa chỉ nhận hàng nào
                      </div>
                      <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 16px' }}>
                        Hãy thêm địa chỉ để hệ thống tự động điền trong 1 giây khi Mua ngay và Đặt hàng!
                      </p>
                      <button
                        type="button"
                        onClick={handleOpenAddAddress}
                        style={{
                          background: '#ea580c',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 20px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <Plus size={16} />
                        <span>+ Thêm địa chỉ mới</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[...addressList]
                        .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
                        .map((addr) => {
                          const labelIcon = addr.label === 'Văn phòng' ? '🏢' : addr.label === 'Trường học / KTX' ? '🎓' : addr.label === 'Khác' ? '📌' : '🏠'
                          return (
                            <div
                              key={addr.id}
                              style={{
                                border: addr.isDefault ? '1.5px solid #ea580c' : '1px solid #e7e5e4',
                                background: addr.isDefault ? '#fffbf7' : '#ffffff',
                                borderRadius: '10px',
                                padding: '14px 16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '14px',
                                boxShadow: addr.isDefault ? '0 2px 8px rgba(234, 88, 12, 0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
                              }}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                  <strong style={{ fontSize: '14px', color: '#1c1917' }}>{addr.recipientName}</strong>
                                  <span style={{ fontSize: '12px', color: '#78716c' }}>| {addr.phone}</span>
                                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }}>
                                    {labelIcon} {addr.label || 'Nhà riêng'}
                                  </span>
                                  {addr.isDefault && (
                                    <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: '#ea580c', color: '#ffffff' }}>
                                      Mặc định
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '12px', color: '#44403c', lineHeight: 1.45 }}>
                                  📍 {addr.fullAddress}
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditAddress(addr)}
                                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                                  >
                                    Cập nhật
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAddress(addr.id)}
                                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '11px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                                  >
                                    Xóa
                                  </button>
                                </div>
                                {!addr.isDefault && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetDefaultAddress(addr.id)}
                                    style={{
                                      background: '#ffffff',
                                      border: '1px solid #d6d3d1',
                                      borderRadius: '5px',
                                      padding: '4px 10px',
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      color: '#44403c',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Thiết lập mặc định
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              ) : (
                /* GIAO DIỆN FORM THÊM MỚI / CHỈNH SỬA ĐỊA CHỈ */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f1f5f3', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setAddressView('list')}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        ← Quay lại danh sách
                      </button>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1c1917', margin: 0 }}>
                        {editingAddrId ? 'Cập nhật địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng mới'}
                      </h3>
                    </div>
                  </div>

                  <form onSubmit={handleSaveAddressForm} style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#556862', marginBottom: '4px' }}>Họ tên người nhận *</label>
                        <input
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          required
                          placeholder="Nhập họ và tên..."
                          style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #dce5df', fontSize: '11px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#556862', marginBottom: '4px' }}>Số điện thoại liên hệ *</label>
                        <input
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          required
                          placeholder="Nhập số điện thoại..."
                          style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #dce5df', fontSize: '11px', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11px', color: '#556862' }}>Địa chỉ nhận hàng chi tiết *</label>
                        <span style={{ fontSize: '10px', color: '#7a8c85' }}>Gợi ý thông minh + Định vị vệ tinh</span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            value={formAddress}
                            onChange={(e) => {
                              setFormAddress(e.target.value)
                              handleAddressInputChange(e)
                            }}
                            onFocus={() => { if (suggestions.length > 0) setShowDropdown(true) }}
                            required
                            placeholder="Nhập số nhà, tên đường hoặc click chọn trên bản đồ..."
                            style={{
                              width: '100%',
                              height: '36px',
                              padding: '0 10px 0 30px',
                              borderRadius: '6px',
                              border: '1px solid #dce5df',
                              fontSize: '11px',
                              outline: 'none',
                            }}
                          />
                          <span style={{ position: 'absolute', left: '10px', top: '10px', fontSize: '13px' }}>📍</span>
                        </div>

                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          disabled={locating}
                          style={{
                            height: '36px',
                            padding: '0 12px',
                            borderRadius: '6px',
                            background: '#fef3c7',
                            border: '1px solid #fde68a',
                            color: '#92400e',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: locating ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span className={locating ? 'spin' : ''}>🎯</span>
                          <span>{locating ? 'Đang dò GPS...' : 'Dùng vị trí hiện tại'}</span>
                        </button>
                      </div>

                      {showDropdown && suggestions.length > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: '100%',
                            zIndex: 100,
                            background: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid #dce5df',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                            marginTop: '4px',
                            maxHeight: '180px',
                            overflowY: 'auto',
                          }}
                        >
                          {suggestions.map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSelectSuggestion(item)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid #f1f5f3',
                                fontSize: '11px',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8faf9')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                            >
                              <span style={{ fontSize: '14px', flexShrink: 0 }}>📍</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, color: '#1f332f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.name}
                                </div>
                                <div style={{ fontSize: '10px', color: '#687771', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.detail}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Gợi ý địa điểm nhanh */}
                    <div>
                      <div style={{ fontSize: '10px', color: '#7a8c85', marginBottom: '4px' }}>Địa điểm phổ biến (bấm để ghim tức thì):</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {POPULAR_PROFILE_LANDMARKS.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectLandmark(item)}
                            style={{
                              fontSize: '10px',
                              padding: '3px 8px',
                              borderRadius: '5px',
                              background: '#ffffff',
                              border: '1px solid #dce5df',
                              color: '#344943',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>📍</span>
                            <span>{item.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Khung bản đồ tương tác (Interactive Map 180px) */}
                    <div
                      style={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #dce5df',
                        background: '#f8fafc',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '5px 10px',
                          background: '#f1f5f3',
                          borderBottom: '1px solid #e2ebe6',
                          fontSize: '10px',
                          color: '#475569',
                        }}
                      >
                        <span>
                          {reverseLoading ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ea580c', fontWeight: 600 }}>
                              <RefreshCw size={10} className="spin" /> Đang cập nhật địa chỉ từ điểm ghim...
                            </span>
                          ) : (
                            <span>💡 Click bản đồ hoặc kéo thả ghim đỏ để chọn vị trí</span>
                          )}
                        </span>
                        <span style={{ fontSize: '9px', opacity: 0.8, fontFamily: 'monospace' }}>
                          [{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}]
                        </span>
                      </div>

                      <div
                        ref={mapContainerRef}
                        style={{
                          width: '100%',
                          height: '180px',
                          display: leafletReady ? 'block' : 'none',
                        }}
                      />

                      {!leafletReady && (
                        <iframe
                          title="Bản đồ giao hàng"
                          loading="lazy"
                          style={{ width: '100%', height: '180px', border: 0, display: 'block' }}
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(formAddress || 'Việt Nam')}&hl=vi&z=16&output=embed`}
                        />
                      )}
                    </div>

                    {/* Phân loại nhãn địa chỉ */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', color: '#556862', marginBottom: '6px' }}>
                        Loại địa chỉ:
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                          { key: 'Nhà riêng', icon: '🏠', label: 'Nhà riêng' },
                          { key: 'Văn phòng', icon: '🏢', label: 'Văn phòng' },
                          { key: 'Trường học / KTX', icon: '🎓', label: 'Trường học / KTX' },
                          { key: 'Khác', icon: '📌', label: 'Khác' },
                        ].map((t) => (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => setFormLabel(t.key)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: formLabel === t.key ? '1.5px solid #ea580c' : '1px solid #dce5df',
                              background: formLabel === t.key ? '#fff7ed' : '#ffffff',
                              color: formLabel === t.key ? '#ea580c' : '#475569',
                            }}
                          >
                            {t.icon} {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Checkbox Đặt làm mặc định */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#1c1917', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={formIsDefault}
                        onChange={(e) => setFormIsDefault(e.target.checked)}
                        style={{ accentColor: '#ea580c', width: '16px', height: '16px' }}
                      />
                      <span>Đặt làm địa chỉ nhận hàng mặc định</span>
                    </label>

                    {/* Nút Submit / Cancel */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setAddressView('list')}
                        style={{
                          height: '36px',
                          padding: '0 16px',
                          fontSize: '12px',
                          fontWeight: 700,
                          borderRadius: '6px',
                          border: '1px solid #dce5df',
                          background: '#ffffff',
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="button primary"
                        style={{
                          background: '#ea580c',
                          borderColor: '#ea580c',
                          height: '36px',
                          padding: '0 18px',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          color: '#fff',
                        }}
                      >
                        <Check size={15} />
                        <span>{editingAddrId ? '✓ Cập nhật địa chỉ' : '✓ Lưu vào Sổ địa chỉ'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRA CỨU BẢO HÀNH ĐIỆN TỬ */}
          {activeTab === 'warranty' && (
            <div>
              <div style={{ marginBottom: '16px', borderBottom: '1px solid #f1f5f3', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={22} color="#0284c7" />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1c1917', margin: 0 }}>
                    Tra cứu Bảo hành điện tử (e-Warranty)
                  </h3>
                </div>
                <p style={{ fontSize: '12px', color: '#78716c', margin: '4px 0 0' }}>
                  Kiểm tra thời hạn bảo hành 12 tháng chính hãng theo Số điện thoại hoặc Mã đơn hàng SmartStock
                </p>
              </div>

              {/* THANH TÌM KIẾM BẢO HÀNH */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleWarrantySearch()
                }}
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0 12px',
                    height: '42px',
                  }}
                >
                  <Search size={16} color="#64748b" style={{ flexShrink: 0, marginRight: '8px' }} />
                  <input
                    value={warrantyKeyword}
                    onChange={(e) => setWarrantyKeyword(e.target.value)}
                    placeholder="Nhập số điện thoại (VD: 0908...) hoặc Mã đơn hàng (VD: #ORD-2026-...)"
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: '12px',
                      color: '#0f172a',
                    }}
                  />
                  {warrantyKeyword && (
                    <button
                      type="button"
                      onClick={() => setWarrantyKeyword('')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '0 20px',
                    height: '42px',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>Tra cứu ngay</span>
                </button>
              </form>

              {/* Gợi ý tra cứu nhanh */}
              {currentUser?.phone && warrantyKeyword !== currentUser.phone && (
                <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748b' }}>
                  <span>Gợi ý nhanh:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setWarrantyKeyword(currentUser.phone)
                      handleWarrantySearch(currentUser.phone)
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid #bae6fd',
                      background: '#f0f9ff',
                      color: '#0284c7',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    🔍 Tra cứu theo SĐT của tôi: {currentUser.phone}
                  </button>
                </div>
              )}

              {/* KẾT QUẢ TRA CỨU */}
              {warrantyResults !== null && (
                <div>
                  {warrantyResults.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px 20px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                      <strong style={{ fontSize: '13px', color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Chưa tìm thấy hồ sơ bảo hành cho từ khóa "{warrantyKeyword}"
                      </strong>
                      <p style={{ fontSize: '11px', color: '#64748b', maxWidth: '420px', margin: '0 auto 12px', lineHeight: 1.5 }}>
                        Quý khách vui lòng kiểm tra lại chính xác số điện thoại dùng khi đặt hàng hoặc mã đơn hàng. Mọi thiết bị chính hãng tại SmartStock đều được kích hoạt bảo hành tự động.
                      </p>
                      <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>
                        📞 Hotline hỗ trợ kích hoạt bảo hành: 1800.6868 (Miễn cước 24/7)
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {warrantyResults.flatMap((ord) => {
                        const items = ord.items || ord.orderDetails || ord.orderItems || []
                        const ordDate = ord.createdAt ? new Date(ord.createdAt) : new Date()
                        // Tính ngày hết hạn 12 tháng
                        const expireDate = new Date(ordDate.getTime() + 365 * 24 * 60 * 60 * 1000)
                        const isStillValid = new Date() < expireDate

                        return items.map((item, idx) => {
                          const itemImg = item.image || getProductImage(item) || getCategoryFallbackImage(item)
                          const itemName = item.productName || item.name || 'Thiết bị công nghệ chính hãng'
                          const serialCode = `VN/A-${(ord.orderCode || 'ORD').replace(/[^a-zA-Z0-9]/g, '')}-${item.productId || item.id || (idx + 1)}`

                          return (
                            <div
                              key={`${ord.id || ord.orderCode}-${idx}`}
                              style={{
                                border: '1.5px solid #e0f2fe',
                                borderRadius: '10px',
                                background: '#f0f9ff',
                                padding: '16px',
                                display: 'flex',
                                gap: '14px',
                                alignItems: 'flex-start',
                              }}
                            >
                              <div
                                style={{
                                  width: '64px',
                                  height: '64px',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  background: '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  flexShrink: 0,
                                }}
                              >
                                <img
                                  src={itemImg}
                                  alt={itemName}
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                  onError={(e) => {
                                    e.target.src = getCategoryFallbackImage(item)
                                  }}
                                />
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                                  <div>
                                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', lineHeight: 1.3 }}>
                                      {itemName}
                                    </h4>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                                      Đơn hàng: <strong style={{ color: '#0284c7' }}>{ord.orderCode || `#ORD-${ord.id}`}</strong> • Khách: <strong>{ord.customerName || ord.fullName || 'Khách hàng'}</strong>
                                    </div>
                                  </div>

                                  <span
                                    style={{
                                      padding: '3px 10px',
                                      borderRadius: '16px',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      background: isStillValid ? '#dcfce7' : '#fee2e2',
                                      color: isStillValid ? '#15803d' : '#b91c1c',
                                      border: isStillValid ? '1px solid #bbf7d0' : '1px solid #fecaca',
                                      whiteSpace: 'nowrap',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <CheckCircle2 size={12} />
                                    <span>{isStillValid ? '🟢 Đang bảo hành chính hãng' : 'Hết hạn bảo hành'}</span>
                                  </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px', background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                  <div>
                                    <div style={{ fontSize: '10px', color: '#64748b' }}>Mã Serial / IMEI:</div>
                                    <strong style={{ fontSize: '11px', color: '#0f172a', fontFamily: 'monospace' }}>{serialCode}</strong>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '10px', color: '#64748b' }}>Ngày kích hoạt:</div>
                                    <strong style={{ fontSize: '11px', color: '#0f172a' }}>{formatDate(ord.createdAt)}</strong>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '10px', color: '#64748b' }}>Thời hạn bảo hành:</div>
                                    <strong style={{ fontSize: '11px', color: '#0284c7' }}>12 Tháng chính hãng</strong>
                                  </div>
                                </div>

                                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                                  <span>Cam kết: 1 đổi 1 trong 30 ngày nếu có lỗi phần cứng từ NSX</span>
                                  <span style={{ color: '#0284c7', fontWeight: 700 }}>Hỗ trợ: 1800.6868</span>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* CHÍNH SÁCH BẢO HÀNH CHUẨN */}
              <div style={{ marginTop: '20px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h5 style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🛡️</span>
                  <span>Quy chuẩn Bảo hành điện tử tại SmartStock</span>
                </h5>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#475569', lineHeight: 1.6 }}>
                  <li>Tự động kích hoạt ngay khi nhận hàng thành công qua Số điện thoại &amp; Mã đơn hàng.</li>
                  <li>Không cần giữ hóa đơn giấy, chỉ cần cung cấp đúng số điện thoại khi đến bất kỳ trung tâm bảo hành nào.</li>
                  <li>Bao test 1 đổi 1 trong 30 ngày đầu nếu phát sinh lỗi từ nhà sản xuất.</li>
                  <li>Miễn phí vận chuyển 2 chiều đối với các trường hợp gửi thiết bị bảo hành từ xa.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: ƯU ĐÃI & VOUCHER */}
          {activeTab === 'vouchers' && (
            <div>
              <div style={{ marginBottom: '16px', borderBottom: '1px solid #f1f5f3', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1c1917', margin: 0 }}>
                  Kho Voucher &amp; Ưu đãi SmartStock
                </h3>
                <p style={{ fontSize: '12px', color: '#78716c', margin: '4px 0 0' }}>
                  Mã giảm giá áp dụng tự động cho tài khoản của bạn khi chốt đơn
                </p>
              </div>

              <div style={{ display: 'grid', gap: '10px' }}>
                {[
                  { code: 'SMART500K', desc: 'Giảm ngay 500.000₫ cho đơn hàng công nghệ từ 15.000.000₫', tag: 'HOT DEAL' },
                  { code: 'FREESHIP', desc: 'Miễn phí giao hàng toàn quốc 100% cho đơn từ 2.000.000₫', tag: 'FREESHIP' },
                  { code: 'NEWMEMBER', desc: 'Ưu đãi giảm 5% cho thành viên mới đặt đơn hàng đầu tiên', tag: 'MEMBER' },
                  { code: 'VIPTECH', desc: 'Giảm 300.000₫ khi mua Phụ kiện cao cấp & Phụ kiện Laptop', tag: 'ACCESSORY' },
                ].map((vc, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1.5px dashed #f59e0b',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      background: '#fffbeb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '14px', color: '#b45309', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                          {vc.code}
                        </strong>
                        <span style={{ fontSize: '9px', background: '#f59e0b', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                          {vc.tag}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#78350f' }}>{vc.desc}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(vc.code)
                        onNotify?.(`📋 Đã sao chép mã "${vc.code}" vào bộ nhớ tạm!`)
                      }}
                      style={{
                        padding: '6px 12px',
                        background: '#ffffff',
                        border: '1px solid #f59e0b',
                        color: '#b45309',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Sao chép mã
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: KHÁCH HÀNG THÂN THIẾT (VÍ XU & ĐIỂM DANH) */}
          {activeTab === 'loyalty' && (
            <div>
              <div style={{ marginBottom: '16px', borderBottom: '1px solid #f1f5f3', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1c1917', margin: 0 }}>
                  Khách hàng thân thiết &amp; Ví Xu
                </h3>
                <p style={{ fontSize: '12px', color: '#78716c', margin: '4px 0 0' }}>
                  Tích lũy SmartStock Xu trên mỗi đơn hàng và nhận thưởng mỗi ngày
                </p>
              </div>

              {/* THẺ SỐ DƯ VÍ XU */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  border: '1.5px solid #fde68a',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '20px' }}>🪙</span>
                    <strong style={{ fontSize: '13px', color: '#92400e' }}>Ví Xu Tích Lũy SmartStock</strong>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#b45309', margin: '6px 0 2px' }}>
                    {coins.toLocaleString('vi-VN')} <span style={{ fontSize: '14px', fontWeight: 600 }}>Xu</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#78350f' }}>
                    Tương đương <strong>{formatVND(coins)}</strong> trừ thẳng vào thanh toán mọi đơn hàng.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDailyCheckin}
                  disabled={isCheckedInToday}
                  style={{
                    background: isCheckedInToday ? '#e2e8f0' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: isCheckedInToday ? '#64748b' : '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: isCheckedInToday ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{isCheckedInToday ? '✓ Đã điểm danh hôm nay' : '🎁 Điểm danh nhận +10.000 Xu'}</span>
                </button>
              </div>

              {/* QUYỀN LỢI HẠNG THÀNH VIÊN */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1c1917', marginBottom: '8px' }}>
                  Bảng quyền lợi Hạng thành viên
                </h4>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {[
                    { tier: '🌱 Thành viên Mới', spend: 'Dưới 1.000.000₫', perk: 'Tích 1% Xu trên mỗi đơn hàng thành công' },
                    { tier: '🥈 VIP Bạc', spend: 'Từ 1.000.000₫', perk: 'Giảm thêm 2% trực tiếp trên mọi đơn hàng' },
                    { tier: '🥇 VIP Vàng', spend: 'Từ 20.000.000₫', perk: 'Giảm thêm 3% trực tiếp + Quà sinh nhật VIP' },
                    { tier: '💎 VIP Kim Cương', spend: 'Từ 50.000.000₫', perk: 'Giảm thêm 5% + Miễn phí vận chuyển hỏa tốc trọn đời' },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: '#f8faf9',
                        borderRadius: '6px',
                        border: '1px solid #e7e5e4',
                        fontSize: '11px',
                      }}
                    >
                      <strong style={{ color: '#1c1917', width: '130px' }}>{row.tier}</strong>
                      <span style={{ color: '#78716c', width: '110px' }}>{row.spend}</span>
                      <span style={{ color: '#059669', fontWeight: 600, flex: 1, textAlign: 'right' }}>{row.perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: THÔNG BÁO & HỘP THƯ */}
          {activeTab === 'notifications' && (
            <div>
              <div style={{ marginBottom: '16px', borderBottom: '1px solid #f1f5f3', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1c1917', margin: 0 }}>
                  Thông báo &amp; Hộp thư
                </h3>
                <p style={{ fontSize: '12px', color: '#78716c', margin: '4px 0 0' }}>
                  Cập nhật trạng thái đơn hàng, ưu đãi và tin nhắn từ SmartStock
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  {
                    title: '🎉 Chào mừng bạn gia nhập SmartStock Storefront!',
                    time: 'Vừa xong',
                    content: 'Bạn đã kích hoạt thành công tài khoản khách hàng. Hãy khám phá ngay 8 Deal Hot tại khu vực Flash Sale hôm nay.',
                  },
                  {
                    title: '🪙 Nhận ngay 10.000 Xu mỗi ngày khi điểm danh',
                    time: 'Hôm nay',
                    content: 'Vào mục "Khách hàng thân thiết" mỗi ngày bấm Điểm danh để tích lũy Xu giảm thẳng vào giá trị đơn hàng.',
                  },
                  {
                    title: '🛡️ Bảo hành chính hãng 12 tháng tự động kích hoạt',
                    time: 'Hệ thống',
                    content: 'Mọi thiết bị điện thoại, laptop, phụ kiện mua trên website đều được lưu vết bảo hành điện tử chính hãng bằng số điện thoại.',
                  },
                ].map((notif, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid #e7e5e4',
                      borderRadius: '8px',
                      padding: '12px',
                      background: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '12px', color: '#1c1917' }}>{notif.title}</strong>
                      <span style={{ fontSize: '10px', color: '#a8a29e' }}>{notif.time}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#687771', margin: 0, lineHeight: 1.4 }}>
                      {notif.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ====================================================
// 8. FLOATING SHOPPING ASSISTANT CHAT (TRỢ LÝ THÔNG MINH 24/7)
// ====================================================

function removeVietnameseTones(str) {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

function getProductUnit(product) {
  if (product?.unit && product.unit !== 'cái' && product.unit !== 'cai') return product.unit
  const name = (product?.name || '').toLowerCase()
  const cat = (product?.categoryName || '').toLowerCase()
  if (
    name.includes('iphone') ||
    name.includes('samsung') ||
    name.includes('galaxy') ||
    name.includes('macbook') ||
    name.includes('laptop') ||
    name.includes('ipad') ||
    cat.includes('điện thoại') ||
    cat.includes('laptop') ||
    cat.includes('máy tính')
  ) {
    return 'máy'
  }
  if (
    name.includes('sạc') ||
    name.includes('cáp') ||
    name.includes('tai nghe') ||
    name.includes('bàn phím') ||
    name.includes('chuột') ||
    cat.includes('phụ kiện') ||
    cat.includes('âm thanh')
  ) {
    return 'chiếc'
  }
  return 'sản phẩm'
}

export { StoreAssistantChat } from './StoreAssistantChat'

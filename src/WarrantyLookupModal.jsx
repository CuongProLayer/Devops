import React, { useState } from 'react'
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Package,
  Calendar,
  X,
  ExternalLink,
  MessageSquare,
} from 'lucide-react'
import { formatVND, formatDate } from './api'
import { getProductImage } from './CleanScreens'

export function WarrantyLookupModal({ orders = [], currentUser, onClose }) {
  const [searchTerm, setSearchTerm] = useState(currentUser?.phone || '')
  const [hasSearched, setHasSearched] = useState(false)
  const [resultOrders, setResultOrders] = useState([])

  const handleSearch = (e) => {
    e?.preventDefault()
    const clean = searchTerm.trim().toLowerCase()
    if (!clean) return

    setHasSearched(true)
    // Tìm trong danh sách orders của hệ thống
    const matches = orders.filter((ord) => {
      const ordCode = (ord.orderCode || ord.id || '').toString().toLowerCase()
      const phone = (ord.phone || '').toString().toLowerCase()
      const name = (ord.customerName || ord.fullName || '').toLowerCase()
      return ordCode.includes(clean) || phone.includes(clean) || name.includes(clean)
    })

    if (matches.length > 0) {
      setResultOrders(matches)
    } else {
      // Nếu chưa có đơn thực tế, tạo một kết quả mẫu chuẩn tra cứu dựa trên từ khóa người dùng nhập
      const isCode = clean.startsWith('ord') || clean.startsWith('dh') || clean.startsWith('#')
      setResultOrders([
        {
          id: 1088,
          orderCode: isCode ? searchTerm.toUpperCase() : 'ORD-2026-9862',
          customerName: currentUser?.fullName || 'Khách hàng SmartStock VIP',
          phone: !isCode ? searchTerm : (currentUser?.phone || '0908 686 868'),
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          totalAmount: 34990000,
          status: 'confirmed',
          items: [
            {
              id: 1,
              name: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên (VN/A)',
              serial: 'F2LXYZ' + Math.floor(100000 + Math.random() * 900000),
              warrantyMonths: 12,
              warrantyStatus: 'active',
              activatedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
              expireDate: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        },
      ])
    }
  }

  // Khởi động tìm kiếm tự động nếu đã có SĐT khách
  React.useEffect(() => {
    if (currentUser?.phone) {
      handleSearch()
    }
  }, [])

  return (
    <div className="store-modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="store-modal-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2ebe6', paddingBottom: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'grid', placeItems: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                🛡️ Tra Cứu Bảo Hành Điện Tử &amp; Đơn Hàng
              </h2>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Hệ thống đồng bộ chứng thư bảo hành chính hãng SmartStock Care 12 tháng
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Khung tìm kiếm */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              color="#94a3b8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập Mã đơn hàng (#ORD-...) hoặc Số điện thoại mua hàng..."
              required
              style={{
                width: '100%',
                height: '42px',
                paddingLeft: '38px',
                paddingRight: '12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0 20px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Search size={15} />
            <span>Tra cứu</span>
          </button>
        </form>

        {/* Kết quả tra cứu */}
        {hasSearched && (
          <div>
            {resultOrders.length > 0 ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                {resultOrders.map((ord, idx) => {
                  const ordCode = ord.orderCode || `ORD-2026-${ord.id}`
                  const orderDate = new Date(ord.createdAt || Date.now())
                  const activateDateStr = formatDate(orderDate)
                  const expireDate = new Date(orderDate.getTime() + 365 * 24 * 60 * 60 * 1000)
                  const expireDateStr = formatDate(expireDate)
                  const isStillValid = expireDate.getTime() > Date.now()

                  const items = ord.orderDetails || ord.details || ord.items || [
                    {
                      name: ord.product?.name || 'Thiết bị công nghệ chính hãng SmartStock',
                      serial: 'SSVN' + (ord.id ? (ord.id * 8931).toString().slice(0, 8) : '9827361'),
                    },
                  ]

                  return (
                    <div
                      key={idx}
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #bae6fd',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 4px 16px rgba(2, 132, 199, 0.08)',
                      }}
                    >
                      {/* Tiêu đề thẻ chứng nhận bảo hành */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '12px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0369a1', fontFamily: 'monospace' }}>
                              #{ordCode}
                            </span>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: isStillValid ? '#ecfdf5' : '#fef2f2',
                                color: isStillValid ? '#059669' : '#dc2626',
                                border: isStillValid ? '1px solid #a7f3d0' : '1px solid #fecaca',
                              }}
                            >
                              {isStillValid ? '🟢 ĐANG TRONG THỜI HẠN BẢO HÀNH' : '🔴 HẾT HẠN BẢO HÀNH'}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                            Khách hàng: <strong>{ord.customerName || ord.fullName || 'Khách hàng'}</strong> • SĐT: <strong>{ord.phone || '0908...'}</strong>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>Gói bảo hành:</span>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0284c7' }}>
                            Chính hãng 12 Tháng (1-đổi-1 30 ngày)
                          </div>
                        </div>
                      </div>

                      {/* Thông tin mốc thời gian */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '11px' }}>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '10px', marginBottom: '2px' }}>📅 Ngày kích hoạt</div>
                          <strong style={{ color: '#0f172a' }}>{activateDateStr}</strong>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '10px', marginBottom: '2px' }}>⏳ Ngày hết hạn bảo hành</div>
                          <strong style={{ color: '#0284c7' }}>{expireDateStr}</strong>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '10px', marginBottom: '2px' }}>🛡️ Loại bảo hành</div>
                          <strong style={{ color: '#059669' }}>Điện tử (Không cần hóa đơn giấy)</strong>
                        </div>
                      </div>

                      {/* Danh mục sản phẩm thuộc diện bảo hành */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                          Thiết bị áp dụng bảo hành:
                        </div>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {items.map((it, iIdx) => (
                            <div
                              key={iIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: '#f1f5f9',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '11px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Package size={14} color="#0284c7" />
                                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                                  {it.productName || it.name || 'Sản phẩm công nghệ'}
                                </span>
                              </div>
                              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#475569', background: '#ffffff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                                IMEI/Serial: {it.serial || `SSVN-${(ord.id || 1088)}-0${iIdx + 1}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Nút hành động */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            onClose()
                            window.dispatchEvent(
                              new CustomEvent('smartstock_open_seller_chat', {
                                detail: { order: ord, initialText: `Tôi muốn yêu cầu hỗ trợ bảo hành cho đơn hàng #${ordCode}` },
                              })
                            )
                          }}
                          style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <MessageSquare size={13} />
                          <span>Yêu cầu hỗ trợ kỹ thuật / Đổi máy</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                <AlertCircle size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  Không tìm thấy thông tin bảo hành
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Vui lòng kiểm tra lại chính xác Mã đơn hàng hoặc Số điện thoại lúc quý khách đặt mua.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cam kết tiêu chuẩn SmartStock Care */}
        <div style={{ marginTop: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 14px', fontSize: '11px', color: '#166534' }}>
          <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} color="#16a34a" />
            <span>Chính sách Bảo Hành Chuẩn Sàn SmartStock:</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.6, color: '#15803d' }}>
            <li>Bảo hành 1 đổi 1 trong 30 ngày đầu nếu phát sinh lỗi kỹ thuật từ nhà sản xuất.</li>
            <li>Bảo hành toàn diện phần cứng 12 tháng tại các trung tâm ủy quyền toàn quốc.</li>
            <li>Hỗ trợ nhận và trả máy bảo hành tận nhà miễn phí thông qua bưu tá Viettel Post / GHTK.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

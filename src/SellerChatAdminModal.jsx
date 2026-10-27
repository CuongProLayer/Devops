import { useState, useEffect, useRef } from 'react'
import { X, Send, MessageSquare, Package, ShoppingCart, User, Check, Sparkles } from 'lucide-react'
import { formatVND, formatDate } from './api'
import { getProductImage } from './CleanScreens'

export function SellerChatAdminModal({ isOpen, onClose, currentUser }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('smartstock_seller_chats')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {}
    return []
  })
  const [replyText, setReplyText] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('smartstock_seller_chats')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) setMessages(parsed)
        }
      } catch {}
    }

    const handleStorage = (e) => {
      if (e.key === 'smartstock_seller_chats') handleUpdate()
    }

    window.addEventListener('smartstock_seller_chat_update', handleUpdate)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('smartstock_seller_chat_update', handleUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      // Đánh dấu đã đọc cho Admin
      try {
        const saved = localStorage.getItem('smartstock_seller_chats')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            const marked = parsed.map((m) => ({ ...m, adminRead: true }))
            localStorage.setItem('smartstock_seller_chats', JSON.stringify(marked))
            window.dispatchEvent(new CustomEvent('smartstock_seller_chat_read', { detail: { marked } }))
          }
        }
      } catch {}
    }
  }, [isOpen, messages.length])

  if (!isOpen) return null

  const handleSend = (e) => {
    e?.preventDefault()
    const text = replyText.trim()
    if (!text) return

    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const sellerMsg = {
      id: Date.now(),
      sender: 'seller',
      senderName: '🏪 SmartStock Official - Người bán',
      adminName: currentUser?.fullName || 'Quản trị viên',
      text,
      time: nowTime,
      timestamp: Date.now(),
    }

    const updated = [...messages, sellerMsg]
    setMessages(updated)
    try {
      localStorage.setItem('smartstock_seller_chats', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('smartstock_seller_chat_update', { detail: { messages: updated, newMsg: sellerMsg } }))
    } catch (err) {
      console.warn('Error saving seller message:', err)
    }
    setReplyText('')
  }

  const quickReplies = [
    'Dạ chào bạn! SmartStock xin nghe, shop có thể hỗ trợ gì cho bạn về sản phẩm này ạ?',
    'Dạ mẫu này hiện đang có sẵn hàng tại kho SmartStock, hỗ trợ giao hàng hỏa tốc trong 2 giờ bạn nhé!',
    'Dạ đơn hàng của bạn đã được xuất kho và đang trên đường giao bưu tá Viettel Post rồi ạ.',
    'Dạ sản phẩm được bảo hành chính hãng 12 tháng, đổi mới 1-1 trong 30 ngày nếu có lỗi kỹ thuật ạ.',
  ]

  // Tìm thông tin khách hàng gần nhất
  const lastCustomerMsg = [...messages].reverse().find((m) => m.sender === 'customer')
  const customerName = lastCustomerMsg?.senderName || 'Khách mua hàng'

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="modal-box"
        style={{
          width: '640px',
          maxWidth: '96vw',
          height: '620px',
          maxHeight: '94vh',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'chatPopup 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E3A2F 0%, #172e25 100%)',
            color: '#fff',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#059669',
                display: 'grid',
                placeItems: 'center',
                fontSize: '18px',
                color: '#fff',
              }}
            >
              💬
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '14px' }}>Hộp thoại Khách hàng: {customerName}</strong>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: '#dcfce7',
                    color: '#15803d',
                    fontWeight: 700,
                  }}
                >
                  🟢 Storefront Live
                </span>
              </div>
              <small style={{ color: '#86efac', fontSize: '11px', display: 'block', marginTop: '2px' }}>
                Đồng bộ tin nhắn 2 chiều giữa Khách hàng và Quản trị Admin
              </small>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              padding: '6px',
              display: 'grid',
              placeItems: 'center',
            }}
            title="Đóng cửa sổ"
          >
            <X size={20} />
          </button>
        </div>

        {/* THÂN TIN NHẮN (MESSAGE STREAM) */}
        <div
          style={{
            flex: 1,
            padding: '16px 20px',
            overflowY: 'auto',
            background: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              <MessageSquare size={36} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              Chưa có tin nhắn nào từ khách hàng.
            </div>
          ) : (
            messages.map((m) => {
              const isSeller = m.sender === 'seller'
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isSeller ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isSeller ? '#059669' : '#0284c7',
                      marginBottom: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{isSeller ? '🏪' : '👤'}</span>
                    <span>{m.senderName || (isSeller ? 'SmartStock Official' : 'Khách hàng')}</span>
                  </span>

                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '10px 14px',
                      borderRadius: isSeller ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: isSeller ? '#1E3A2F' : '#ffffff',
                      color: isSeller ? '#ffffff' : '#0f172a',
                      border: isSeller ? 'none' : '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      fontSize: '12px',
                      lineHeight: 1.5,
                    }}
                  >
                    {m.text && <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>}

                    {/* HIỂN THỊ THẺ SẢN PHẨM KHÁCH HÀNG GỬI */}
                    {m.product && (
                      <div
                        style={{
                          background: isSeller ? 'rgba(255,255,255,0.1)' : '#f8fafc',
                          border: isSeller ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          marginTop: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <img
                          src={getProductImage(m.product)}
                          alt={m.product.name}
                          style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <strong style={{ fontSize: '11px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {m.product.name}
                          </strong>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: isSeller ? '#fed7aa' : '#ea580c', margin: '2px 0' }}>
                            {formatVND(m.product.price)}
                          </div>
                          <span style={{ fontSize: '10px', opacity: 0.8 }}>Mã: {m.product.productCode || `PRD-${m.product.id}`}</span>
                        </div>
                      </div>
                    )}

                    {/* HIỂN THỊ THẺ ĐƠN HÀNG KHÁCH HÀNG GỬI */}
                    {m.order && (
                      <div
                        style={{
                          background: isSeller ? 'rgba(255,255,255,0.1)' : '#f8fafc',
                          border: isSeller ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          marginTop: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <strong style={{ fontSize: '11px' }}>Đơn #{m.order.orderCode || m.order.id}</strong>
                          <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: isSeller ? '#059669' : '#dbeafe', color: isSeller ? '#fff' : '#1d4ed8' }}>
                            {m.order.status || 'Đang xử lý'}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px' }}>
                          Tổng thanh toán: <strong>{formatVND(m.order.finalAmount || m.order.totalAmount)}</strong>
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        textAlign: isSeller ? 'right' : 'left',
                        marginTop: '4px',
                        fontSize: '9px',
                        color: isSeller ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                      }}
                    >
                      {m.time || 'Vừa xong'}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* CÂU TRẢ LỜI MẪU 1-CLICK DÀNH CHO ADMIN */}
        <div style={{ padding: '8px 16px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={12} color="#f59e0b" />
            <span>Mẫu câu trả lời nhanh 1-Click:</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {quickReplies.map((qr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setReplyText(qr)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  color: '#334155',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.3,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#059669'
                  e.currentTarget.style.background = '#ecfdf5'
                  e.currentTarget.style.color = '#047857'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1'
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.color = '#334155'
                }}
              >
                {qr.slice(0, 36)}...
              </button>
            ))}
          </div>
        </div>

        {/* FORM NHẬP TRẢ LỜI CỦA ADMIN */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '12px 16px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Nhập câu trả lời phản hồi cho Khách hàng..."
            style={{
              flex: 1,
              height: '40px',
              padding: '0 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              outline: 'none',
            }}
            autoFocus
          />
          <button
            type="submit"
            disabled={!replyText.trim()}
            style={{
              height: '40px',
              padding: '0 18px',
              borderRadius: '8px',
              background: replyText.trim() ? '#059669' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              cursor: replyText.trim() ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Send size={15} />
            <span>Gửi phản hồi</span>
          </button>
        </form>
      </div>
    </div>
  )
}

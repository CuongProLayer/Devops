import { useState, useEffect, useRef } from 'react'
import { X, Send, Phone, Zap, MessageSquare } from 'lucide-react'
import { formatVND, formatDate } from './api'
import { getProductImage } from './CleanScreens'

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

export function StoreAssistantChat({ products = [], orders = [], promotions = [], onAddToCart, onBuyNow, onNotify, currentUser }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('ai') // 'ai' | 'seller'

  // AI Tab Messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ lý SmartStock 24/7. Tôi có thể kiểm tra tồn kho realtime từ SQL Server, tra cứu đơn hàng, tư vấn giá hoặc gợi ý sản phẩm công nghệ phù hợp nhất cho bạn!',
      time: 'Vừa xong',
    },
  ])

  // Seller Tab Messages (Sync with localStorage key: smartstock_seller_chats)
  const [sellerMessages, setSellerMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('smartstock_seller_chats')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return [
      {
        id: 1,
        sender: 'seller',
        senderName: 'SmartStock Official - Người bán',
        text: 'Xin chào quý khách! Cửa hàng SmartStock Official xin nghe ạ. Quý khách cần hỗ trợ tư vấn sản phẩm công nghệ hay kiểm tra tình trạng đơn hàng nào, xin vui lòng gửi tin nhắn hoặc chọn sản phẩm/đơn hàng đính kèm bên dưới nhé! ✨',
        time: 'Vừa xong',
        timestamp: Date.now(),
      },
    ]
  })

  const [inputVal, setInputVal] = useState('')
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [showOrderPicker, setShowOrderPicker] = useState(false)
  const [selectedProductToAsk, setSelectedProductToAsk] = useState(null)
  const [selectedOrderToAsk, setSelectedOrderToAsk] = useState(null)
  const messagesEndRef = useRef(null)

  // Sync seller chat updates from other tabs/windows or Admin replies
  useEffect(() => {
    const handleChatUpdate = () => {
      try {
        const saved = localStorage.getItem('smartstock_seller_chats')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) setSellerMessages(parsed)
        }
      } catch {}
    }

    const handleStorage = (e) => {
      if (e.key === 'smartstock_seller_chats') {
        handleChatUpdate()
      }
    }

    const handleExternalOpen = (e) => {
      setIsOpen(true)
      setActiveTab('seller')
      if (e.detail?.product) {
        setSelectedProductToAsk(e.detail.product)
        sendSellerMessage('', e.detail.product, null)
      } else if (e.detail?.order) {
        setSelectedOrderToAsk(e.detail.order)
        sendSellerMessage('', null, e.detail.order)
      }
    }

    window.addEventListener('smartstock_seller_chat_update', handleChatUpdate)
    window.addEventListener('storage', handleStorage)
    window.addEventListener('smartstock_open_seller_chat', handleExternalOpen)
    return () => {
      window.removeEventListener('smartstock_seller_chat_update', handleChatUpdate)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('smartstock_open_seller_chat', handleExternalOpen)
    }
  }, [sellerMessages, currentUser])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, sellerMessages, isOpen, activeTab])

  // Save seller chats to localStorage and notify system
  const saveSellerChats = (newChatList, userMsg) => {
    try {
      localStorage.setItem('smartstock_seller_chats', JSON.stringify(newChatList))
      window.dispatchEvent(new CustomEvent('smartstock_seller_chat_update', { detail: { messages: newChatList, newMsg: userMsg } }))

      // Đẩy một thông báo mới sang trang Thông báo (/notifications) và Admin
      const notifItem = {
        id: 'notif-chat-' + Date.now(),
        title: '💬 Tin nhắn mới từ ' + (currentUser?.fullName || 'Khách mua hàng'),
        message: userMsg.text || (userMsg.product ? `Hỏi về sản phẩm: ${userMsg.product.name}` : `Hỏi về đơn hàng: #${userMsg.order?.orderCode}`),
        type: 'chat',
        category: 'chat',
        isRead: false,
        createdAt: new Date().toISOString(),
      }
      const existingNotifs = JSON.parse(localStorage.getItem('smartstock_notifications') || '[]')
      localStorage.setItem('smartstock_notifications', JSON.stringify([notifItem, ...existingNotifs]))
      window.dispatchEvent(new CustomEvent('smartstock_notification_update', { detail: notifItem }))
    } catch (err) {
      console.warn('Error saving seller chats:', err)
    }
  }

  // Send message to Seller (Shop / Admin)
  const sendSellerMessage = (textToSend, attachedProduct = null, attachedOrder = null) => {
    const text = (textToSend !== undefined ? textToSend : inputVal).trim()
    if (!text && !attachedProduct && !attachedOrder) return

    const nowTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const userMsg = {
      id: Date.now(),
      sender: 'customer',
      senderName: currentUser?.fullName || 'Khách mua hàng',
      text: text,
      time: nowTime,
      timestamp: Date.now(),
      product: attachedProduct || selectedProductToAsk || null,
      order: attachedOrder || selectedOrderToAsk || null,
    }

    const updated = [...sellerMessages, userMsg]
    setSellerMessages(updated)
    saveSellerChats(updated, userMsg)
    setInputVal('')
    setSelectedProductToAsk(null)
    setSelectedOrderToAsk(null)
    setShowProductPicker(false)
    setShowOrderPicker(false)

    // Tự động phản hồi hỗ trợ của Shop sau 2 giây nếu chưa có phản hồi nào
    const hasAdminReplied = updated.some((m) => m.sender === 'seller' && m.id > 1)
    if (!hasAdminReplied && updated.length <= 3) {
      setTimeout(() => {
        const autoSellerReply = {
          id: Date.now() + 1,
          sender: 'seller',
          senderName: 'SmartStock Official - Người bán',
          text: 'Dạ shop SmartStock xin chào! Nhân viên tư vấn đã nhận được thông tin và đang kiểm tra kho hàng để hỗ trợ bạn ngay ạ. Bạn đợi shop một chút nhé! ✨',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
        }
        setSellerMessages((prev) => {
          const nextList = [...prev, autoSellerReply]
          try {
            localStorage.setItem('smartstock_seller_chats', JSON.stringify(nextList))
            window.dispatchEvent(new CustomEvent('smartstock_seller_chat_update', { detail: { messages: nextList, newMsg: autoSellerReply } }))
          } catch {}
          return nextList
        })
      }, 1800)
    }
  }

  // Send message to AI Bot
  const handleSendAI = (textToSend) => {
    const q = (textToSend || inputVal).trim()
    if (!q) return

    const qNorm = removeVietnameseTones(q)

    // BẮT CÁC TỪ KHÓA LIÊN HỆ NGƯỜI BÁN -> TỰ ĐỘNG CHUYỂN SANG TAB "CHAT VỚI NGƯỜI BÁN"
    const isAskingHuman =
      qNorm.includes('gap nhan vien') ||
      qNorm.includes('gap nguoi ban') ||
      qNorm.includes('lien he shop') ||
      qNorm.includes('lien he nguoi ban') ||
      qNorm.includes('tu van truc tiep') ||
      qNorm.includes('chat voi shop') ||
      qNorm.includes('chat nguoi ban') ||
      qNorm.includes('nhan vien tu van') ||
      qNorm.includes('cskh') ||
      qNorm.includes('tong dai')

    if (isAskingHuman) {
      setActiveTab('seller')
      sendSellerMessage(q)
      setInputVal('')
      return
    }

    const userMsg = { id: Date.now(), sender: 'user', text: q, time: 'Vừa xong' }
    setMessages((prev) => [...prev, userMsg])
    setInputVal('')

    setTimeout(() => {
      let replyText = ''
      let actionProduct = null

      // 1A. Nhận diện model iPhone
      const iphoneMatch = qNorm.match(/iphone\s*(\d+)/i)
      const samsungMatch = qNorm.match(/(?:samsung\s*)?(?:galaxy\s*)?s\s*(\d+)/i)

      if (iphoneMatch) {
        const gen = iphoneMatch[1]
        const isUnreleased = parseInt(gen, 10) >= 17
        const matched = !isUnreleased && products.find((p) => {
          if (p.id === 6 || p.productCode === 'PRD21079') return false
          const n = removeVietnameseTones(p.name)
          const c = removeVietnameseTones(p.productCode || '')
          return (n.includes('iphone') || c.includes('ip')) && (n.includes(gen) || c.includes(gen))
        })

        if (matched) {
          const stock = matched.quantity ?? matched.stock ?? 0
          const unit = getProductUnit(matched)
          actionProduct = matched
          if (stock > 0) {
            replyText = `Dạ sản phẩm **${matched.name}** (Mã: ${matched.productCode || `PRD-${matched.id}`}) hiện đang sẵn hàng tại kho SmartStock với số lượng **${stock} ${unit}**, giá bán **${formatVND(matched.price)}**.\n\n✨ Bạn có thể bấm nút **Mua ngay** bên dưới hoặc chuyển qua tab **"Chat với Người bán"** để nhận giá ưu đãi đặc biệt nhé!`
          } else {
            replyText = `Dạ mẫu **${matched.name}** hiện đang tạm hết hàng trong kho (Tồn kho: 0 ${unit}).\n\n🔔 Bạn hãy bấm nút **"Báo cho tôi khi có hàng"** hoặc bấm tab **"Chat với Người bán"** để shop hỗ trợ đặt trước sớm nhất nhé!`
          }
        } else {
          const simIphone = products.find((p) => {
            if (p.id === 6 || p.productCode === 'PRD21079') return false
            const n = removeVietnameseTones(p.name)
            return n.includes('iphone') && n.includes('15')
          }) || products.find((p) => removeVietnameseTones(p.name).includes('iphone'))

          const stock = simIphone ? (simIphone.quantity ?? simIphone.stock ?? 0) : 17
          const unit = simIphone ? getProductUnit(simIphone) : 'máy'
          actionProduct = simIphone

          replyText = `Dạ hiện tại SmartStock chưa có sẵn mẫu **"iPhone ${gen}"** trong kho (chưa phân phối chính thức). Tuy nhiên shop đang sẵn mẫu tương tự cực hot:\n• **${simIphone ? simIphone.name : 'iPhone 15 Pro Max 256GB'}** (còn ${stock} ${unit}) - Giá tốt ${simIphone ? formatVND(simIphone.price) : '29.990.000₫'}.\n\nBạn có thể tham khảo hoặc bấm tab **"Chat với Người bán"** để gặp nhân viên hỗ trợ nhé!`
        }
      } else if (samsungMatch) {
        const gen = samsungMatch[1]
        const matched = products.find((p) => {
          const n = removeVietnameseTones(p.name)
          const c = removeVietnameseTones(p.productCode || '')
          return (n.includes('samsung') || n.includes('galaxy') || c.includes('ss')) && (n.includes(gen) || c.includes(gen))
        })

        if (matched) {
          const stock = matched.quantity ?? matched.stock ?? 0
          const unit = getProductUnit(matched)
          actionProduct = matched
          if (stock > 0) {
            replyText = `Dạ sản phẩm **${matched.name}** (Mã: ${matched.productCode || `PRD-${matched.id}`}) hiện đang sẵn hàng tại kho SmartStock với số lượng **${stock} ${unit}**, giá bán **${formatVND(matched.price)}**.\n\n✨ Bạn có thể bấm nút **Mua ngay** bên dưới để đặt hàng nhận ngay trong 2h nhé!`
          } else {
            replyText = `Dạ mẫu **${matched.name}** hiện đang tạm hết hàng trong kho (Tồn kho: 0 ${unit}). Bạn có thể chuyển tab **"Chat với Người bán"** để shop báo lịch nhập hàng nhé!`
          }
        } else {
          const simPhone = products.find((p) => removeVietnameseTones(p.name).includes('samsung') || removeVietnameseTones(p.name).includes('iphone'))
          actionProduct = simPhone
          replyText = `Dạ hiện tại shop đang sẵn mẫu flagship đỉnh cao là **${simPhone ? simPhone.name : 'Samsung Galaxy S24 Ultra'}** nhé!`
        }
      } else if (qNorm.includes('con hang') || qNorm.includes('ton kho') || qNorm.includes('san pham') || qNorm.includes('co nhung gi')) {
        const inStockProds = products.filter((p) => (p.quantity ?? p.stock ?? 0) > 0)
        replyText = `📦 Kho hàng SmartStock hiện đang sẵn **${inStockProds.length} sản phẩm chính hãng** (đồng bộ trực tiếp từ SQL Server):\n\n` +
          inStockProds.slice(0, 5).map((p) => `• **${p.name}** - ${formatVND(p.price)} (Còn ${p.quantity ?? p.stock ?? 0} ${getProductUnit(p)})`).join('\n') +
          `\n\n💡 Bạn có thể bấm nút **"Gặp Người bán"** bên dưới nếu muốn tư vấn báo giá riêng nhé!`
      } else if (qNorm.includes('ma') || qNorm.includes('giam gia') || qNorm.includes('voucher') || qNorm.includes('khuyen mai')) {
        replyText = '🎟️ SmartStock đang áp dụng các mã ưu đãi độc quyền hôm nay:\n' +
          '• **SMART500K**: Giảm ngay 500.000₫ cho đơn hàng từ 15.000.000₫\n' +
          '• **FREESHIP**: Miễn phí vận chuyển toàn quốc cho mọi đơn hàng\n' +
          '• **TECH50K**: Giảm 50.000₫ cho phụ kiện công nghệ từ 1.000.000₫\n\n' +
          '👉 Bạn chỉ cần chọn sản phẩm và nhập mã tại bước Thanh toán để nhận ưu đãi!'
      } else if (qNorm.includes('don hang') || qNorm.includes('tra cuu') || qNorm.includes('don mua')) {
        if (orders && orders.length > 0) {
          replyText = `Quý khách có ${orders.length} đơn mua gần nhất:\n` +
            orders.slice(0, 3).map((o) => `• Đơn #${o.orderCode || o.id}: Trạng thái ${o.status || 'Đang xử lý'} (${formatVND(o.totalAmount)})`).join('\n') +
            `\n\nBạn có thể chuyển sang tab **"Chat với Người bán"** và bấm **"Gửi đơn hàng"** để nhân viên hỗ trợ tra cứu chi tiết.`
        } else {
          replyText = 'Quý khách chưa có đơn hàng nào trên hệ thống hoặc đơn hàng đã hoàn tất. Bạn có thể chọn sản phẩm và bấm "Mua ngay" để trải nghiệm dịch vụ giao 2h của shop nhé!'
        }
      } else if (qNorm.includes('bao hanh') || qNorm.includes('doi tra') || qNorm.includes('chinh sach')) {
        replyText = '🛡️ **Chính sách bảo hành & hậu mãi tại SmartStock**:\n' +
          '• 100% sản phẩm chính hãng Apple, Samsung, Sony, Logitech ủy quyền.\n' +
          '• Bảo hành 12 tháng phần cứng tiêu chuẩn nhà sản xuất.\n' +
          '• Đổi mới 1-đổi-1 trong 30 ngày đầu nếu phát sinh lỗi kỹ thuật.\n' +
          '• Hỗ trợ thu hồi và giao đổi bảo hành tận nhà miễn phí.'
      } else if (qNorm.includes('giao hang') || qNorm.includes('dia chi') || qNorm.includes('van chuyen')) {
        replyText = '🚚 **Chính sách giao hàng siêu tốc**:\n' +
          '• Hệ thống kho thông minh tại: Đà Nẵng, TP. Hồ Chí Minh, Hà Nội, Cần Thơ, Hải Phòng.\n' +
          '• Khoảng cách dưới 15km: Giao siêu tốc trong 2 - 4 giờ.\n' +
          '• Khác tỉnh thành: Giao nhanh 1 - 2 ngày qua bưu cục Viettel Post / GHN.'
      } else {
        replyText = 'Cảm ơn quý khách đã nhắn tin cho SmartStock! Bạn có thể bấm các nút hỏi nhanh bên dưới (📦 Còn hàng, 🔍 Đơn mua, 🎟️ Voucher) hoặc bấm nút **"Gặp Người bán / Nhân viên tư vấn"** để được hỗ trợ trực tiếp 1-1 nhé!'
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: replyText, time: 'Vừa xong', product: actionProduct },
      ])
    }, 350)
  }

  const handleGeneralSend = (e) => {
    e?.preventDefault()
    if (activeTab === 'seller') {
      sendSellerMessage()
    } else {
      handleSendAI()
    }
  }

  return (
    <>
      {/* NÚT VIÊN THUỐC MỞ CHATBOX Ở GÓC DƯỚI PHẢI */}
      <button
        type="button"
        className="floating-assistant-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Trợ lý Mua sắm Thông minh & Chat với Người bán SmartStock"
      >
        <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>🤖</span>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.4)' }} />
        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2px' }}>💬 Trợ lý SmartStock</span>
      </button>

      {/* CỬA SỔ CHATBOX - CỐ ĐỊNH VỊ TRÍ GÓC DƯỚI PHẢI, KHÔNG CHE HEADER */}
      {isOpen && (
        <div
          className="floating-chat-window"
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '24px',
            top: 'auto',
            left: 'auto',
            maxHeight: 'calc(100vh - 110px)',
            zIndex: 1000,
          }}
        >
          {/* HEADER CHAT XANH ĐẬM */}
          <div style={{ background: '#1E3A2F', color: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '16px 16px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: activeTab === 'seller' ? '#059669' : '#F06449', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800 }}>
                {activeTab === 'seller' ? '🏪' : '🤖'}
              </div>
              <div>
                <strong style={{ fontSize: '13px', display: 'block' }}>
                  {activeTab === 'seller' ? 'SmartStock Official • Người bán' : 'SmartStock AI Assistant'}
                </strong>
                <span style={{ fontSize: '10px', color: '#86efac' }}>
                  {activeTab === 'seller' ? '🟢 Đang trực tuyến • Sẵn sàng hỗ trợ' : '🟢 Trực tuyến • Live Inventory Database'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'grid', placeItems: 'center' }}
              title="Đóng cửa sổ chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* 2 TAB CHUYỂN ĐỔI: TRỢ LÝ AI & LIÊN HỆ NGƯỜI BÁN */}
          <div className="chat-tabs-header">
            <button
              type="button"
              className={`chat-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              <span>🤖</span>
              <span>Trợ lý AI 24/7</span>
            </button>
            <button
              type="button"
              className={`chat-tab-btn ${activeTab === 'seller' ? 'active' : ''}`}
              onClick={() => setActiveTab('seller')}
            >
              <span>👨‍💼</span>
              <span>Chat với Người bán</span>
            </button>
          </div>

          {/* DÒNG TRẠNG THÁI & HOTLINE KHI Ở TAB "CHAT VỚI NGƯỜI BÁN" */}
          {activeTab === 'seller' && (
            <div className="chat-seller-status-bar">
              <span style={{ color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                Admin đang trực tuyến • Phản hồi trong vài phút
              </span>
              <a
                href="tel:19006868"
                style={{
                  color: '#ea580c',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#ffedd5',
                  padding: '2px 8px',
                  borderRadius: '6px',
                }}
                title="Gọi hotline hỗ trợ ngay"
              >
                <Phone size={11} />
                <span>Hotline: 1900.6868</span>
              </a>
            </div>
          )}

          {/* MESSAGES BODY */}
          <div style={{ flex: 1, padding: '12px 14px', overflowY: 'auto', display: 'grid', gap: '10px' }}>
            {activeTab === 'ai' ? (
              // TAB 1: AI MESSAGES
              messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '10px 12px',
                      borderRadius: m.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: m.sender === 'user' ? '#1E3A2F' : '#f0fdf4',
                      color: m.sender === 'user' ? '#fff' : '#1f332f',
                      border: m.sender === 'user' ? 'none' : '1px solid #dcfce7',
                      fontSize: '11px',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    <div>{m.text}</div>
                    {m.product && (
                      <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                        <button
                          type="button"
                          onClick={() => {
                            onBuyNow?.(m.product)
                            setIsOpen(false)
                          }}
                          style={{ background: '#F06449', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Zap size={12} fill="#fff" />
                          <span>Mua ngay: {formatVND(m.product.price)}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              // TAB 2: SELLER (SHOP) MESSAGES
              sellerMessages.map((m) => {
                const isCust = m.sender === 'customer'
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isCust ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {!isCust && (
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#047857', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>🏪</span>
                        <span>{m.senderName || 'SmartStock Official'}</span>
                      </span>
                    )}

                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '10px 12px',
                        borderRadius: isCust ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        background: isCust ? '#1E3A2F' : '#ffffff',
                        color: isCust ? '#fff' : '#1f2937',
                        border: isCust ? 'none' : '1px solid #e2e8f0',
                        fontSize: '11px',
                        lineHeight: 1.5,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      }}
                    >
                      {m.text && <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>}

                      {/* THẺ SẢN PHẨM THU GỌN ĐÍNH KÈM (CHUẨN SHOPEE) */}
                      {m.product && (
                        <div className="chat-card-product" style={{ color: '#1f2937' }}>
                          <img
                            src={getProductImage(m.product)}
                            alt={m.product.name}
                            style={{ width: '46px', height: '46px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <strong style={{ fontSize: '11px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {m.product.name}
                            </strong>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#ea580c', margin: '2px 0' }}>
                              {formatVND(m.product.price)}
                            </div>
                            <span style={{ fontSize: '9px', color: '#64748b' }}>
                              Mã: {m.product.productCode || `PRD-${m.product.id}`}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* THẺ ĐƠN HÀNG THU GỌN ĐÍNH KÈM */}
                      {m.order && (
                        <div className="chat-card-order" style={{ color: '#1f2937' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '11px', color: '#0f172a' }}>
                              Đơn #{m.order.orderCode || m.order.id}
                            </strong>
                            <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#dbeafe', color: '#1d4ed8' }}>
                              {m.order.status === 'completed' ? 'Hoàn tất' : m.order.status === 'confirmed' ? 'Đã xác nhận' : 'Đang xử lý'}
                            </span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#475569' }}>
                            Tổng thanh toán: <strong style={{ color: '#ea580c' }}>{formatVND(m.order.finalAmount || m.order.totalAmount)}</strong>
                          </div>
                          <small style={{ fontSize: '9px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                            Ngày đặt: {formatDate(m.order.createdAt || new Date())}
                          </small>
                        </div>
                      )}

                      <div style={{ textAlign: isCust ? 'right' : 'left', marginTop: '4px', fontSize: '9px', color: isCust ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>
                        {m.time || 'Vừa xong'}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* KHI Ở TAB "CHAT VỚI NGƯỜI BÁN": 2 NÚT ĐÍNH KÈM NHANH (SẢN PHẨM & ĐƠN HÀNG) */}
          {activeTab === 'seller' && (
            <div>
              {/* Nút bấm mở popover chọn */}
              <div className="chat-attach-bar">
                <button
                  type="button"
                  className="chat-attach-btn"
                  onClick={() => {
                    setShowProductPicker(!showProductPicker)
                    setShowOrderPicker(false)
                  }}
                  title="Gửi sản phẩm đang xem hoặc cần tư vấn cho Shop"
                >
                  <span>📱</span>
                  <span>Gửi sản phẩm cần hỏi</span>
                </button>
                <button
                  type="button"
                  className="chat-attach-btn"
                  onClick={() => {
                    setShowOrderPicker(!showOrderPicker)
                    setShowProductPicker(false)
                  }}
                  title="Gửi mã đơn hàng của bạn để Shop kiểm tra"
                >
                  <span>🧾</span>
                  <span>Gửi đơn hàng cần hỗ trợ</span>
                </button>
              </div>

              {/* Popover chọn sản phẩm */}
              {showProductPicker && (
                <div style={{ maxHeight: '180px', overflowY: 'auto', background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                    Chọn sản phẩm để gửi vào chat:
                  </div>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    {products.slice(0, 10).map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          sendSellerMessage(`Tôi muốn hỏi thông tin về sản phẩm ${p.name}`, p, null)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 8px',
                          background: '#fff',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <img src={getProductImage(p)} alt={p.name} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#ea580c' }}>{formatVND(p.price)}</span>
                        </div>
                        <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>Gửi &rarr;</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popover chọn đơn hàng */}
              {showOrderPicker && (
                <div style={{ maxHeight: '180px', overflowY: 'auto', background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
                    Chọn đơn hàng cần shop kiểm tra:
                  </div>
                  {orders && orders.length > 0 ? (
                    <div style={{ display: 'grid', gap: '6px' }}>
                      {orders.slice(0, 6).map((o) => (
                        <div
                          key={o.id || o.orderCode}
                          onClick={() => {
                            sendSellerMessage(`Shop kiểm tra giúp tôi tiến độ đơn hàng #${o.orderCode || o.id}`, null, o)
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 8px',
                            background: '#fff',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            cursor: 'pointer',
                            fontSize: '11px',
                          }}
                        >
                          <div>
                            <strong>#{o.orderCode || o.id}</strong>
                            <small style={{ display: 'block', color: '#64748b', fontSize: '9px' }}>{formatVND(o.finalAmount || o.totalAmount)}</small>
                          </div>
                          <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 700 }}>Gửi &rarr;</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>
                      Bạn chưa có đơn mua nào gần đây.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* KHI Ở TAB "TRỢ LÝ AI": CÁC NÚT GỢI Ý NHANH VÀ NÚT NỔI BẬT "GẶP NGƯỜI BÁN" */}
          {activeTab === 'ai' && (
            <div className="chat-quick-pills-wrap">
              {/* Nút nổi bật chuyển sang Chat với Người bán */}
              <button
                type="button"
                className="chat-quick-pill highlight-seller"
                onClick={() => {
                  setActiveTab('seller')
                  onNotify?.('Đã kết nối với Người bán (CSKH SmartStock)')
                }}
              >
                <span>👨‍💼</span>
                <span>Gặp Người bán / Nhân viên tư vấn trực tiếp</span>
              </button>

              <button type="button" className="chat-quick-pill" onClick={() => handleSendAI('Kiểm tra sản phẩm còn hàng')}>
                <span>📦</span>
                <span>Còn hàng?</span>
              </button>
              <button type="button" className="chat-quick-pill" onClick={() => handleSendAI('Tra cứu đơn hàng của tôi')}>
                <span>🔍</span>
                <span>Đơn mua</span>
              </button>
              <button type="button" className="chat-quick-pill" onClick={() => handleSendAI('Xin mã giảm giá hôm nay')}>
                <span>🎟️</span>
                <span>Voucher</span>
              </button>
              <button type="button" className="chat-quick-pill" onClick={() => handleSendAI('Chính sách bảo hành & đổi trả')}>
                <span>🛡️</span>
                <span>Bảo hành</span>
              </button>
            </div>
          )}

          {/* INPUT CHAT CHUNG */}
          <form
            onSubmit={handleGeneralSend}
            style={{ padding: '10px 12px', display: 'flex', gap: '8px', borderTop: '1px solid #edf1ef', background: '#fff' }}
          >
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={activeTab === 'seller' ? 'Nhập tin nhắn gửi cho Shop/Admin...' : 'Hỏi AI (iPhone 15, tồn kho, giá, gặp nhân viên...)...'}
              style={{ flex: 1, height: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '11px', outline: 'none' }}
            />
            <button
              type="submit"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: activeTab === 'seller' ? '#059669' : '#F06449',
                border: 'none',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Gửi tin nhắn"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

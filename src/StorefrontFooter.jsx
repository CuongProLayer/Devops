import React from 'react'
import {
  Phone,
  ShieldCheck,
  RotateCcw,
  QrCode,
  CheckCircle2,
  MapPin,
  Truck,
  CreditCard,
  Headphones,
  Award,
} from 'lucide-react'

export function StorefrontFooter({ onOpenWarranty }) {
  return (
    <footer
      style={{
        background: '#0f1d19',
        color: '#e2ebe6',
        marginTop: '60px',
        borderTop: '4px solid #10b981',
        padding: '50px 5% 30px',
        fontSize: '12px',
      }}
    >
      <div
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '36px',
          marginBottom: '40px',
        }}
      >
        {/* CỘT 1: THƯƠNG HIỆU & TỔNG ĐÀI */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                fontSize: '16px',
              }}
            >
              ✦
            </span>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px' }}>
              SmartStock Storefront
            </span>
          </div>

          <p style={{ color: '#94a39d', lineHeight: 1.6, margin: '0 0 16px', fontSize: '12px' }}>
            Hệ thống bán lẻ thiết bị công nghệ chính hãng đồng bộ tồn kho thời gian thực từ nền tảng quản trị
            SQL Server &amp; C# .NET Core. Cam kết 100% hàng mới nguyên seal, xuất hóa đơn đỏ e-VAT minh bạch.
          </p>

          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Phone size={16} color="#10b981" />
              <span style={{ color: '#cbd5e1', fontSize: '11px' }}>Tổng đài tư vấn &amp; Mua hàng:</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#F06449', letterSpacing: '0.5px' }}>
              1800.6868 <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>(Miễn phí 8:00 - 21:30)</span>
            </div>
          </div>
        </div>

        {/* CỘT 2: CHÍNH SÁCH & HỖ TRỢ */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Chính Sách &amp; Hỗ Trợ
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px', color: '#94a39d' }}>
            <li>
              <button
                type="button"
                onClick={onOpenWarranty}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#10b981',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                <ShieldCheck size={14} />
                <span>Chính sách bảo hành chính hãng 12 tháng</span>
              </button>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={14} color="#94a39d" />
              <span>Chính sách đổi trả 1-đổi-1 trong 30 ngày</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <QrCode size={14} color="#94a39d" />
              <span>Hướng dẫn quét mã thanh toán VietQR</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="#94a39d" />
              <span>Kiểm tra hàng chính hãng &amp; Xuất HĐ điện tử</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Headphones size={14} color="#94a39d" />
              <span>Hỗ trợ kỹ thuật &amp; Hướng dẫn chuyển đổi máy cũ</span>
            </li>
          </ul>
        </div>

        {/* CỘT 3: HỆ THỐNG TRUNG TÂM KHO VẬN */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Trung Tâm Kho Vận Real-Time
          </h4>
          <div style={{ display: 'grid', gap: '12px', color: '#94a39d' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <MapPin size={16} color="#F06449" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '12px' }}>Kho Miền Bắc (Hà Nội):</strong>
                <span>Khu E6 Đô thị mới Cầu Giấy, Nam Từ Liêm, TP. Hà Nội</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <MapPin size={16} color="#F06449" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '12px' }}>Kho Miền Trung (Đà Nẵng):</strong>
                <span>Số 155 Nguyễn Văn Linh, Hải Châu, TP. Đà Nẵng</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <MapPin size={16} color="#F06449" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#ffffff', display: 'block', fontSize: '12px' }}>Kho Miền Nam (TP. Hồ Chí Minh):</strong>
                <span>Số 2 Hải Triều, Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT 4: ĐỐI TÁC THANH TOÁN & CHỨNG NHẬN */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Thanh Toán &amp; Vận Chuyển
          </h4>

          {/* Badges Đối tác */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {['VietQR 24/7', 'MB Bank', 'Visa/Mastercard', 'COD Siêu Tốc 2H', 'VNPost / Viettel'].map((partner, pIdx) => (
              <span
                key={pIdx}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {partner}
              </span>
            ))}
          </div>

          {/* Biểu tượng chứng nhận Bộ Công Thương */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#dc2626',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: '12px',
                fontWeight: 900,
              }}
            >
              ✓
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#f87171', textTransform: 'uppercase' }}>
                ĐÃ THÔNG BÁO BỘ CÔNG THƯƠNG
              </div>
              <span style={{ fontSize: '9px', color: '#94a39d' }}>Giấy phép TMĐT số: 031268682026/GP-BCT</span>
            </div>
          </div>
        </div>
      </div>

      {/* DÒNG BẢN QUYỀN CUỐI TRANG */}
      <div
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          color: '#64748b',
          fontSize: '11px',
        }}
      >
        <div>
          © 2026 <strong>SmartStock Inventory OS &amp; E-Commerce</strong>. Đồng bộ trực tiếp MS SQL Server &amp; .NET Core API.
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Điều khoản dịch vụ</span>
          <span>Bảo mật thông tin</span>
          <span>Hệ thống phân phối</span>
        </div>
      </div>
    </footer>
  )
}

// ====================================================
// SHARED STOREFRONT UTILITIES & HELPERS
// (Tách riêng để triệt tiêu hoàn toàn circular dependency)
// ====================================================

export const DEAD_UNSPLASH_IDS = [
  'photo-1625948515291-696130d44b54',
  'photo-1496181133206-80ce9b88a854',
  'photo-1593642702821-c8da6771f0c7',
  'photo-1580910051074-3eb694886506',
  'photo-1531297484001-80022131f5a3',
]

export function getCategoryFallbackImage(product) {
  const name = (product?.name || '').toLowerCase()
  const code = (product?.productCode || '').toLowerCase()
  const cat = (product?.categoryName || '').toLowerCase()

  // 1. Màn hình máy tính / Monitor (phải ưu tiên kiểm tra trước laptop/phone)
  if (name.includes('màn hình') || name.includes('monitor') || cat.includes('màn hình')) {
    if (name.includes('curved') || name.includes('gaming') || name.includes('odyssey')) {
      return 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80'
    }
    return 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
  }

  // 2. Bàn phím cơ & Chuột
  if (name.includes('bàn phím') || name.includes('keyboard') || name.includes('keychron') || code.includes('keychron') || code.includes('k2')) {
    return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
  }
  if (name.includes('chuột') || name.includes('mouse') || name.includes('logitech mx') || name.includes('lift') || code.includes('logi') || code.includes('mx')) {
    return 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'
  }

  // 3. Phụ kiện sạc, cáp, pin, hub, SSD (ưu tiên trước tên hãng như Apple/Samsung)
  if (name.includes('cáp') || name.includes('cable') || name.includes('dây sạc') || name.includes('woven')) {
    return 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80'
  }
  if (name.includes('củ sạc') || name.includes('cốc sạc') || name.includes('charger') || name.includes('ganprime') || name.includes('gan') || code.includes('ank')) {
    return 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
  }
  if (name.includes('pin dự phòng') || name.includes('sạc dự phòng') || name.includes('power bank') || name.includes('maggo') || name.includes('powerbank')) {
    return 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80'
  }
  if (name.includes('hub') || name.includes('chuyển đổi') || name.includes('adapter')) {
    return 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80'
  }
  if (name.includes('ssd') || name.includes('ổ cứng')) {
    return 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80'
  }

  // 4. Tai nghe / AirPods / Âm thanh / Loa
  if (name.includes('airpod') || name.includes('tai nghe') || name.includes('headphone') || name.includes('earbuds') || name.includes('loa') || name.includes('speaker') || name.includes('marshall') || cat.includes('tai nghe') || cat.includes('âm thanh')) {
    if (name.includes('loa') || name.includes('speaker') || name.includes('marshall') || name.includes('emberton')) {
      return 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
    }
    if (name.includes('max')) {
      return 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'
    }
    if (name.includes('airpod') || (name.includes('tai nghe') && name.includes('apple'))) {
      return 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80'
    }
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  }

  // 5. iPad / Máy tính bảng
  if (name.includes('ipad') || name.includes('tablet') || name.includes('tab') || cat.includes('máy tính bảng') || cat.includes('tablet')) {
    return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'
  }

  // 6. Laptop / MacBook / Gaming
  if (name.includes('macbook') || name.includes('laptop') || name.includes('thinkpad') || name.includes('legion') || name.includes('rog') || name.includes('zephyrus') || name.includes('xps') || name.includes('spectre') || name.includes('helios') || name.includes('zenbook') || cat.includes('laptop')) {
    if (name.includes('rog') || name.includes('gaming') || name.includes('legion') || name.includes('predator') || name.includes('helios')) {
      return 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'
    }
    if (name.includes('thinkpad')) {
      return 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
    }
    if (name.includes('dell') || name.includes('xps')) {
      return 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'
    }
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
  }

  // 7. Điện thoại thông minh (iPhone, Samsung Galaxy, Xiaomi, Oppo)
  if (name.includes('iphone') || code.includes('ip1') || code.includes('iphone')) {
    return 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'
  }
  if (name.includes('samsung') || name.includes('galaxy') || name.includes('s24') || name.includes('z fold') || name.includes('z flip') || code.includes('ss-')) {
    return 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80'
  }
  if (name.includes('xiaomi') || name.includes('redmi')) {
    return 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80'
  }
  if (name.includes('oppo') || name.includes('reno') || name.includes('find')) {
    return 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80'
  }
  if (name.includes('điện thoại') || name.includes('phone') || cat.includes('điện thoại')) {
    return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
  }

  // Mặc định công nghệ chung
  return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
}

export function getProductImage(product) {
  const rawUrl = product?.image || product?.imageUrl || ''
  if (rawUrl && typeof rawUrl === 'string') {
    if (rawUrl.startsWith('data:') || rawUrl.startsWith('/')) {
      return rawUrl
    }
    if (rawUrl.startsWith('http')) {
      const isDead = DEAD_UNSPLASH_IDS.some((deadId) => rawUrl.includes(deadId))
      if (!isDead) return rawUrl
    }
  }
  return getCategoryFallbackImage(product)
}

export function getProductImages(product) {
  const main = getProductImage(product)
  const name = (product?.name || '').toLowerCase()
  const cat = (product?.categoryName || '').toLowerCase()

  if (name.includes('màn hình') || name.includes('monitor') || cat.includes('màn hình')) {
    return [
      main,
      'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&w=800&q=80',
    ]
  }

  if (name.includes('keychron') || name.includes('bàn phím')) {
    return [
      main,
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    ]
  }

  if (name.includes('chuột') || name.includes('mouse')) {
    return [
      main,
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    ]
  }

  if (name.includes('cáp') || name.includes('sạc') || name.includes('pin') || name.includes('hub')) {
    return [
      main,
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80',
    ]
  }

  if (name.includes('airpod') || name.includes('tai nghe') || name.includes('headphone') || name.includes('sony')) {
    return [
      main,
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
    ]
  }

  if (name.includes('ipad') || name.includes('tablet')) {
    return [
      main,
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80',
    ]
  }

  if (name.includes('macbook') || name.includes('laptop') || cat.includes('laptop')) {
    return [
      main,
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    ]
  }

  return [
    main,
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
  ]
}

export function getProductSpecs(product) {
  const name = (product?.name || '').toLowerCase()
  const cat = (product?.categoryName || '').toLowerCase()

  if (name.includes('iphone') || name.includes('samsung') || cat.includes('thoại') || cat.includes('phone')) {
    const isApple = name.includes('iphone')
    return {
      category: 'Điện thoại thông minh Flagship',
      display: isApple ? '6.7" Super Retina XDR OLED 120Hz ProMotion (2000 nits)' : '6.8" Dynamic AMOLED 2X 120Hz Vision Booster (2600 nits)',
      chip: isApple ? 'Apple A17 Pro (3nm, 6 nhân CPU & 6 nhân GPU đồ họa)' : 'Snapdragon 8 Gen 3 for Galaxy (4nm, Ray Tracing thời gian thực)',
      memory: isApple ? '8GB RAM • 256GB / 512GB NVMe siêu tốc' : '12GB RAM LPDDR5X • 512GB UFS 4.0',
      camera: isApple ? 'Chính 48MP OIS + 12MP Ultra-wide + 12MP Tele 5x Zoom quang học' : 'Chính 200MP OIS + 50MP Tele 5x + 10MP Tele 3x + 12MP Ultra-wide',
      battery: isApple ? '4.422 mAh, Sạc nhanh PD 27W, MagSafe không dây 15W' : '5.000 mAh, Sạc nhanh 45W, Sạc ngược không dây PowerShare',
      origin: 'Chính hãng VN/A (Nguyên seal 100% bảo hành toàn quốc)',
      warranty: '12 tháng chính hãng ủy quyền tại Việt Nam',
    }
  }

  if (name.includes('macbook') || cat.includes('laptop') || cat.includes('máy tính')) {
    return {
      category: 'Laptop cao cấp & Máy trạm di động',
      display: 'Liquid Retina 15.3 inch 2880x1864 True Tone, độ sáng 500 nits',
      chip: 'Apple M3 Chip thế hệ mới (8-core CPU, 10-core GPU, 16-core Neural Engine)',
      memory: '16GB Unified Memory • 512GB SSD NVMe tốc độ đọc 3.5GB/s',
      camera: 'Camera FaceTime HD 1080p, 3 micro chuẩn studio',
      battery: '66.5Wh Lithium-polymer (Thời lượng xem video 18 giờ liên tục)',
      origin: 'Chính hãng Apple Vietnam (Phân phối chính ngạch SA/A)',
      warranty: '12 tháng chính hãng Apple toàn cầu & ủy quyền VN',
    }
  }

  if (name.includes('sony') || name.includes('tai nghe') || cat.includes('kiện') || cat.includes('âm thanh')) {
    return {
      category: 'Âm thanh không dây cao cấp & Chống ồn',
      display: 'Thiết kế Over-ear công thái học da Soft Fit siêu êm ái',
      chip: 'Dual Chip V1 + HD QN1 chuyên biệt cho khử tiếng ồn AI thông minh',
      memory: 'Hỗ trợ Hi-Res Audio Wireless, LDAC, DSEE Extreme AI Upscaling',
      camera: 'Hệ thống 8 micro beamforming lọc gió và nhận diện giọng nói Precise Voice Pickup',
      battery: '30 giờ nghe liên tục (bật ANC), sạc nhanh 3 phút nghe 3 giờ',
      origin: 'Chính hãng Sony Vietnam (Nguyên hộp phụ kiện cao cấp)',
      warranty: '12 tháng chính hãng Sony Center toàn quốc',
    }
  }

  return {
    category: 'Thiết bị & Phụ kiện công nghệ',
    display: 'Hoàn thiện cao cấp, thiết kế hiện đại',
    chip: 'Chip xử lý thông minh thế hệ mới',
    memory: 'Chuẩn kết nối tốc độ cao',
    camera: 'Tương thích đa nền tảng',
    battery: 'Tiết kiệm năng lượng chuẩn mới',
    origin: 'Chính hãng phân phối tại Việt Nam',
    warranty: '12 tháng chính hãng đổi mới nếu lỗi NSX',
  }
}

export function cleanAddressGlitch(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let cleaned = raw
    .replace(/undefined/gi, '')
    .replace(/null/gi, '')
    .replace(/NaN/gi, '')
    .replace(/,\s*,+/g, ', ')
    .replace(/^[\s,]+|[\s,]+$/g, '')
    .trim()
  return cleaned
}

export function getUserStorageKey(user) {
  if (!user) return 'guest'
  const key = (user.email || user.username || (user.userId ? `user_${user.userId}` : '') || (user.id ? `user_${user.id}` : '') || 'guest').toLowerCase().trim()
  return key || 'guest'
}

export async function reverseGeocodeVietnam(lat, lon, currentAddress = '') {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18&accept-language=vi`, {
      headers: { 'Accept-Language': 'vi,en' },
    })
    if (res.ok) {
      const data = await res.json()
      const addr = data.address || {}
      const houseNumber = addr.house_number ? `Số ${addr.house_number} ` : ''
      const road = addr.road || addr.street || addr.pedestrian || ''
      const quarter = addr.quarter || addr.suburb || addr.neighbourhood || addr.village || ''
      const district = addr.city_district || addr.district || addr.county || ''
      const city = addr.city || addr.state || ''

      const parts = [
        houseNumber ? `${houseNumber}${road}` : road,
        quarter ? (quarter.toLowerCase().startsWith('phường') || quarter.toLowerCase().startsWith('xã') ? quarter : `Phường ${quarter}`) : '',
        district ? (district.toLowerCase().startsWith('quận') || district.toLowerCase().startsWith('huyện') ? district : `Quận ${district}`) : '',
        city ? (city.toLowerCase().startsWith('thành phố') || city.toLowerCase().startsWith('tỉnh') || city.toLowerCase().startsWith('tp') ? city : `TP. ${city}`) : '',
      ].filter(Boolean)

      if (parts.length > 0) {
        return cleanAddressGlitch(parts.join(', '))
      }
      if (data.display_name) {
        return cleanAddressGlitch(data.display_name)
      }
    }
  } catch (err) {
    console.warn('Reverse geocode error:', err)
  }
  return cleanAddressGlitch(currentAddress)
}

export function getUserAddressList(user) {
  const uKey = getUserStorageKey(user)
  if (!uKey || uKey === 'guest') return []
  try {
    const raw = localStorage.getItem(`smartstock_addresses_${uKey}`)
    if (raw) {
      const list = JSON.parse(raw)
      if (Array.isArray(list) && list.length > 0) return list
    }
    const legacy = localStorage.getItem(`smartstock_default_address_${uKey}`)
    if (legacy) {
      const obj = JSON.parse(legacy)
      if (obj && obj.address && obj.address.trim()) {
        const migrated = [{
          id: `addr_${Date.now()}`,
          recipientName: obj.name || user?.fullName || user?.username || 'Khách hàng',
          phone: obj.phone || user?.phone || '',
          fullAddress: cleanAddressGlitch(obj.address),
          lat: obj.coords?.lat || 10.7716,
          lng: obj.coords?.lon || 106.7044,
          label: obj.label || 'Nhà riêng',
          isDefault: true,
          createdAt: new Date().toISOString(),
        }]
        localStorage.setItem(`smartstock_addresses_${uKey}`, JSON.stringify(migrated))
        return migrated
      }
    }
  } catch (e) {
    console.warn('Error reading user address list:', e)
  }
  return []
}

export function saveUserAddressList(user, list) {
  const uKey = getUserStorageKey(user)
  if (!uKey || uKey === 'guest') return
  try {
    localStorage.setItem(`smartstock_addresses_${uKey}`, JSON.stringify(list))
    const def = list.find((a) => a.isDefault) || list[0]
    if (def) {
      localStorage.setItem(`smartstock_default_address_${uKey}`, JSON.stringify({
        id: def.id,
        name: def.recipientName,
        phone: def.phone,
        address: def.fullAddress,
        coords: def.lat && def.lng ? { lat: def.lat, lon: def.lng } : null,
        label: def.label || 'Nhà riêng',
        updatedAt: new Date().toISOString(),
      }))
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('smartstock_addresses_updated', { detail: { userKey: uKey } }))
    }
  } catch (e) {
    console.warn('Error saving user address list:', e)
  }
}

export function getUserSavedAddress(user) {
  const list = getUserAddressList(user)
  if (list && list.length > 0) {
    const def = list.find((a) => a.isDefault) || list[0]
    return {
      name: def.recipientName,
      phone: def.phone,
      address: def.fullAddress,
      label: def.label,
      coords: { lat: def.lat, lon: def.lng },
    }
  }
  const uKey = getUserStorageKey(user)
  try {
    const raw = localStorage.getItem(`smartstock_default_address_${uKey}`)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

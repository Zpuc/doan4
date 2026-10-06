import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { useAuth } from './context/AuthContext.jsx'
import apiClient from './api/client.js'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import './styles.css'
import './login.css'
import './admin.css'
import 'antd/dist/reset.css'

const products = [
  { id: 1, name: 'RX-78-2 Gundam', grade: 'RG 1/144', category: 'Real Grade', price: 1180000, oldPrice: 1350000, badge: 'Best seller', tone: 'red', image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=900&q=85' },
  { id: 2, name: 'MSN-04 Sazabi', grade: 'RG 1/144', category: 'Real Grade', price: 2050000, badge: 'New drop', tone: 'crimson', image: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?auto=format&fit=crop&w=900&q=85' },
  { id: 3, name: 'MS-06S Zaku II', grade: 'HG 1/144', category: 'High Grade', price: 690000, oldPrice: 780000, badge: 'Hot price', tone: 'olive', image: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=900&q=85' },
  { id: 4, name: 'Unicorn Gundam 02 Banshee', grade: 'MG 1/100', category: 'Master Grade', price: 1780000, tone: 'violet', image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=900&q=85' },
  { id: 5, name: 'Gundam Aerial', grade: 'HG 1/144', category: 'High Grade', price: 820000, badge: 'Restocked', tone: 'blue', image: 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=900&q=85' },
  { id: 6, name: 'Freedom Gundam 2.0', grade: 'MG 1/100', category: 'Master Grade', price: 1920000, tone: 'sky', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=900&q=85' },
]

const money = (value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'

function AuthPage({ onBack, onLogin }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')
    const password = formData.get('password')
    const accounts = JSON.parse(localStorage.getItem('autobot_accounts') || '[]')

    if (mode === 'register') {
      const fullName = formData.get('fullName')
      if (password !== formData.get('confirmPassword')) {
        setMessage('Mật khẩu nhập lại chưa khớp.')
        return
      }
      if (accounts.some((account) => account.email === email)) {
        setMessage('Email này đã được đăng ký.')
        return
      }
      try {
        const user = await register({ fullName, email, password, phone: formData.get('phone'), address: formData.get('address') })
        onLogin(user.fullName, user.role)
        return
      } catch (error) {
        setMessage(error.response?.data?.message || 'Chưa kết nối được máy chủ. Hãy kiểm tra backend.')
        return
      }
    }

    try {
      const user = await login({ email, password })
      onLogin(user.fullName, user.role)
      return
    } catch {
      // Keep the local demo account usable while MySQL is not running.
    }
    const account = accounts.find((item) => item.email === email && item.password === password)
    const isDemoAccount = email === 'admin@autobot.local' && password === 'Password123!'
    if (!account && !isDemoAccount) {
      setMessage('Email hoặc mật khẩu chưa đúng.')
      return
    }
    onLogin(account?.fullName || 'Admin', isDemoAccount ? 'admin' : 'user')
  }

  return <div className="auth-page">
    <div className="auth-visual"><button className="auth-back" onClick={onBack}>← Quay lại shop</button><div className="auth-visual-copy"><p className="eyebrow">AUTOBOT / BUILDER'S CLUB</p><h1>Build your<br /><em>legend.</em></h1><p>Một tài khoản để lưu kit yêu thích, theo dõi đơn hàng và tiếp tục hành trình lắp ráp.</p></div><div className="auth-stamp">GH<br /><span>EST. 2024</span></div></div>
    <div className="auth-form-wrap"><a className="brand auth-brand" href="#top" onClick={onBack}><span className="brand-mark">AB</span><span>AUTOBOT</span></a><div className="auth-form"><p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'JOIN THE BUILDERS'}</p><h2>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</h2><p className="auth-note">{mode === 'login' ? 'Chào mừng bạn quay lại AUTOBOT.' : 'Tạo tài khoản riêng để bắt đầu.'}</p><form onSubmit={submit}>{mode === 'register' && <><label>Họ và tên<input name="fullName" required placeholder="Nguyễn Văn A" /></label><label>Số điện thoại<input name="phone" required placeholder="09xx xxx xxx" /></label><label>Địa chỉ<input name="address" required placeholder="Số nhà, đường, quận/huyện" /></label></>}<label>Email<input name="email" required type="email" placeholder="you@example.com" /></label><label>Mật khẩu<input name="password" required type="password" minLength="6" placeholder="••••••••" /></label>{mode === 'register' && <label>Nhập lại mật khẩu<input name="confirmPassword" required type="password" minLength="6" placeholder="••••••••" /></label>}<button className="primary-button full" type="submit">{mode === 'login' ? 'Đăng nhập ↗' : 'Tạo tài khoản ↗'}</button></form>{message && <p className="auth-message">{message}</p>}<p className="auth-switch">{mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage('') }}>{mode === 'login' ? 'Tạo tài khoản' : 'Đăng nhập'}</button></p><p className="auth-demo">Demo admin: admin@autobot.local / Password123!</p></div></div>
  </div>
}

function App() {
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuth()
  const [activeCategory, setActiveCategory] = useState('Tất cả')
  const [catalog, setCatalog] = useState(products)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const currentUser = authUser ? { name: authUser.fullName || authUser.email } : null

  useEffect(() => {
    apiClient.get('/products').then(({ data }) => {
      const remoteProducts = (data.data || []).map((product) => ({ ...product, category: product.category_name, grade: product.category_name, image: product.image_url, tone: 'red' }))
      if (remoteProducts.length) setCatalog(remoteProducts)
    }).catch(() => {})
  }, [])

  const filteredProducts = useMemo(() => {
    const filtered = catalog.filter((product) => {
      const categoryMatch = activeCategory === 'Tất cả' || product.category === activeCategory
      const queryMatch = `${product.name} ${product.grade}`.toLowerCase().includes(query.toLowerCase())
      return categoryMatch && queryMatch
    })
    return [...filtered].sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : a.id - b.id)
  }, [activeCategory, catalog, query, sort])

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  const addToCart = (product) => {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id)
      return found ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }]
    })
    setNotice(`${product.name} đã được thêm vào giỏ`)
    setTimeout(() => setNotice(''), 2500)
  }

  const changeQuantity = (id, amount) => setCart((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0))

  const submitOrder = async (event) => {
    event.preventDefault()
    if (!localStorage.getItem('autobot_token')) {
      setIsCheckoutOpen(false)
      setNotice('Vui lòng đăng nhập trước khi đặt hàng.')
      navigate('/dang-nhap')
      return
    }
    const formData = new FormData(event.currentTarget)
    try {
      await apiClient.post('/orders', { shippingAddress: formData.get('address'), customerNote: `Người nhận: ${formData.get('fullName')} - ${formData.get('phone')}`, items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })) })
      setIsCheckoutOpen(false)
      setCart([])
      setNotice('Đặt hàng thành công! Chúng tôi sẽ liên hệ bạn sớm.')
    } catch (error) {
      setNotice(error.response?.data?.message || 'Không thể tạo đơn hàng.')
    }
  }

  return (
    <div className="app-shell">
      <div className="announcement">MIỄN PHÍ VẬN CHUYỂN ĐƠN TỪ 1.500.000đ <span>·</span> Đổi trả trong 7 ngày</div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="AUTOBOT home"><span className="brand-mark">AB</span><span>AUTOBOT</span></a>
        <nav><a href="#shop">Shop</a><a href="#grades">Chọn theo grade</a><a href="#story">Về chúng tôi</a></nav>
        <div className="header-actions"><button className="icon-button" aria-label="Tìm kiếm" onClick={() => document.querySelector('#search').focus()}>⌕</button>{authUser?.role === 'admin' && <button className="account-button" onClick={() => navigate('/admin')}>Quản trị</button>}{currentUser ? <button className="account-button" onClick={() => { logout(); setNotice('Đã đăng xuất tài khoản.') }}>{currentUser.name} · Đăng xuất</button> : <button className="account-button" onClick={() => navigate('/dang-nhap')}>Đăng nhập</button>}<button className="cart-button" onClick={() => setIsCartOpen(true)}>Giỏ hàng <b>{cartCount}</b></button></div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy"><p className="eyebrow">THE BUILDER'S DEPOT / 01</p><h1>Build your<br /><em>legend.</em></h1><p className="hero-text">Mô hình Gundam chính hãng cho những người thích tạo nên thế giới của riêng mình.</p><a className="primary-button" href="#shop">Khám phá bộ sưu tập <span>↘</span></a></div>
          <div className="hero-art"><div className="sun"></div><div className="hero-grid"></div><div className="hero-label">BANDAI<br /><strong>SPIRITS</strong></div><div className="hero-model">RX<br /><span>78</span></div><div className="hero-spec">MODEL KIT / 1:144<br />EARTH FEDERATION</div></div>
          <div className="hero-index">01 <span>/</span> 03</div>
        </section>

        <section className="trust-row"><div><strong>100%</strong><span>Chính hãng Bandai</span></div><div><strong>7 ngày</strong><span>Đổi trả dễ dàng</span></div><div><strong>Toàn quốc</strong><span>Giao hàng tận nơi</span></div><div><strong>Hỗ trợ</strong><span>Tư vấn chọn kit</span></div></section>

        <section className="shop-section" id="shop">
          <div className="section-heading"><div><p className="eyebrow">CURATED FOR BUILDERS</p><h2>Kit nổi bật <span>↗</span></h2></div><p className="section-note">Những kit được cộng đồng builder<br />chọn nhiều nhất tuần này.</p></div>
          <div className="toolbar"><div className="category-tabs">{['Tất cả', 'High Grade', 'Real Grade', 'Master Grade'].map((category) => <button className={activeCategory === category ? 'active' : ''} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><div className="controls"><label className="search-box"><span>⌕</span><input id="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kit, tên mobile suit..." /></label><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sắp xếp"><option value="featured">Nổi bật</option><option value="low">Giá thấp đến cao</option><option value="high">Giá cao đến thấp</option></select></div></div>
          <div className="product-grid">{filteredProducts.map((product) => <article className="product-card" key={product.id}><div className={`product-image ${product.tone}`}><img src={product.image} alt={product.name} loading="lazy" /><span className="grade-tag">{product.grade}</span>{product.badge && <span className="product-badge">{product.badge}</span>}<button className="quick-add" onClick={() => addToCart(product)} aria-label={`Thêm ${product.name} vào giỏ`}>+</button></div><div className="product-info"><p>{product.category}</p><h3>{product.name}</h3><div className="price-row"><strong>{money(product.price)}</strong>{product.oldPrice && <del>{money(product.oldPrice)}</del>}</div></div></article>)}</div>
          {filteredProducts.length === 0 && <div className="empty-state">Không tìm thấy kit phù hợp. Thử từ khóa khác nhé.</div>}
        </section>

        <section className="grade-section" id="grades"><div><p className="eyebrow">FIND YOUR BUILD</p><h2>Chọn theo<br /><em>grade.</em></h2></div><div className="grade-list"><button onClick={() => { setActiveCategory('High Grade'); document.querySelector('#shop').scrollIntoView() }}><span>01</span><strong>High Grade</strong><small>Dễ bắt đầu · 1/144</small><b>↗</b></button><button onClick={() => { setActiveCategory('Real Grade'); document.querySelector('#shop').scrollIntoView() }}><span>02</span><strong>Real Grade</strong><small>Chi tiết cao · 1/144</small><b>↗</b></button><button onClick={() => { setActiveCategory('Master Grade'); document.querySelector('#shop').scrollIntoView() }}><span>03</span><strong>Master Grade</strong><small>Trải nghiệm đầy đủ · 1/100</small><b>↗</b></button></div></section>

        <section className="story-section" id="story"><div className="story-number">AB<br /><span>EST. 2024</span></div><div><p className="eyebrow">A LITTLE ABOUT US</p><h2>Không chỉ là<br />một chiếc hộp.</h2><p>AUTOBOT là cửa hàng mô hình Gundam dành cho những builder muốn tìm sản phẩm chính hãng và cảm hứng lắp ráp mới.</p><a href="#shop">Khám phá sản phẩm ↗</a></div></section>
      </main>

      <footer><a className="brand" href="#top"><span className="brand-mark">AB</span><span>AUTOBOT</span></a><p>Build something worth keeping.</p><div><a href="#shop">Instagram</a><a href="#shop">Contact</a></div></footer>

      {notice && <div className="toast">✓ {notice}</div>}
      {isCartOpen && <div className="overlay" onClick={() => setIsCartOpen(false)}><aside className="cart-panel" onClick={(event) => event.stopPropagation()}><div className="panel-header"><div><p className="eyebrow">YOUR BUILD LIST</p><h2>Giỏ hàng <span>({cartCount})</span></h2></div><button onClick={() => setIsCartOpen(false)} aria-label="Đóng giỏ hàng">×</button></div>{cart.length === 0 ? <div className="cart-empty"><span>＋</span><p>Giỏ hàng đang trống</p><button className="primary-button" onClick={() => setIsCartOpen(false)}>Tiếp tục mua sắm</button></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image} alt="" /><div><strong>{item.name}</strong><small>{item.grade}</small><p>{money(item.price)}</p><div className="quantity"><button onClick={() => changeQuantity(item.id, -1)}>−</button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)}>+</button></div></div></div>)}</div><div className="cart-summary"><div><span>Tạm tính</span><strong>{money(cartTotal)}</strong></div><small>Phí vận chuyển sẽ được tính ở bước thanh toán.</small><button className="primary-button full" onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true) }}>Tiến hành đặt hàng ↗</button></div></>}</aside></div>}
      {isCheckoutOpen && <div className="overlay" onClick={() => setIsCheckoutOpen(false)}><div className="checkout-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setIsCheckoutOpen(false)}>×</button><p className="eyebrow">ĐẶT HÀNG / AUTOBOT</p><h2>Hoàn tất đơn hàng</h2><p className="modal-note">Bạn sẽ thanh toán khi nhận hàng. Sau khi gửi đủ thông tin, hệ thống hiển thị đặt hàng thành công.</p><p className="cod-note">Thanh toán khi nhận hàng (COD)</p><form onSubmit={submitOrder}><label>Họ và tên<input name="fullName" required placeholder="Nguyễn Văn A" /></label><label>Số điện thoại<input name="phone" required type="tel" placeholder="09xx xxx xxx" /></label><label>Địa chỉ nhận hàng<textarea name="address" required placeholder="Số nhà, đường, phường/xã..." rows="3"></textarea></label><button className="primary-button full" type="submit">Xác nhận đặt hàng ↗</button></form></div></div>}
      {isLoginOpen && <div className="overlay" onClick={() => setIsLoginOpen(false)}><div className="checkout-modal login-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setIsLoginOpen(false)} aria-label="Đóng đăng nhập">×</button><p className="eyebrow">WELCOME BACK / AUTOBOT</p><h2>Đăng nhập</h2><p className="modal-note">Đăng nhập để theo dõi đơn hàng và lưu lại những kit bạn yêu thích.</p><form onSubmit={(event) => { event.preventDefault(); setCurrentUser({ name: 'Builder' }); setIsLoginOpen(false); setNotice('Đăng nhập thành công.') }}><label>Email<input required type="email" placeholder="you@example.com" /></label><label>Mật khẩu<input required type="password" minLength="6" placeholder="••••••••" /></label><div className="login-options"><label className="remember"><input type="checkbox" /> Ghi nhớ đăng nhập</label><a href="#shop" onClick={() => setNotice('Tính năng khôi phục mật khẩu sẽ được nối với API.')}>Quên mật khẩu?</a></div><button className="primary-button full" type="submit">Đăng nhập ↗</button></form><p className="login-register">Chưa có tài khoản? <button onClick={() => setNotice('Đăng ký tài khoản sẽ được thêm cùng API người dùng.')}>Tạo tài khoản</button></p></div></div>}
    </div>
  )
}

function RootRoutes() {
  const navigate = useNavigate()
  return <AppRoutes home={<App />} login={<AuthPage onBack={() => navigate('/')} onLogin={(name, role) => navigate(role === 'admin' ? '/admin' : '/')} />} product={<ProductDetailPage />} admin={<AdminPage />} />
}

createRoot(document.getElementById('root')).render(<StrictMode><BrowserRouter><AuthProvider><CartProvider><RootRoutes /></CartProvider></AuthProvider></BrowserRouter></StrictMode>)
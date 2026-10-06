import { useEffect, useMemo, useState } from 'react'
import { Button as AntButton, Card, Table, Tag } from 'antd'
import { Link } from 'react-router-dom'
import apiClient from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

const emptyProduct = {
  categoryId: '',
  sku: '',
  name: '',
  grade: 'HG',
  scale: '1/144',
  price: '',
  oldPrice: '',
  stockQuantity: 0,
  conditionStatus: 'con_hang',
  warrantyMonths: 12,
  warrantyPolicy: 'Bảo hành chính hãng 12 tháng, áp dụng cho lỗi từ nhà sản xuất.',
  manufacturer: 'Bandai',
  seriesName: 'Mobile Suit Gundam',
  material: 'PS/ABS',
  detailCount: 150,
  accessories: 'Vũ khí, đế đứng, decal',
  assemblyType: 'Lắp ráp cần dụng cụ',
  origin: 'Nhật Bản',
  description: '',
  imageUrl: '',
  galleryImages: '',
  heightCm: '',
  boxWeightG: '',
  boxSize: '28 x 18 x 6 cm',
  releaseYear: 2024
}
const tabs = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'products', label: 'Quản lý sản phẩm' },
  { id: 'orders', label: 'Quản lý đơn hàng' },
  { id: 'users', label: 'Quản lý người dùng' },
  { id: 'revenue', label: 'Quản lý doanh thu' }
]

export default function AdminPage() {
  const { user, logout } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [dashboard, setDashboard] = useState({ summary: { total_revenue: 0, confirmed_orders: 0, total_products: 0, total_users: 0 }, bestSellers: [], lowStock: [] })
  const [activeTab, setActiveTab] = useState('overview')
  const [form, setForm] = useState(emptyProduct)
  const [message, setMessage] = useState('')

  const loadData = async () => {
    const [productResponse, categoryResponse, orderResponse, userResponse, dashboardResponse] = await Promise.all([
      apiClient.get('/products?limit=100'),
      apiClient.get('/categories'),
      apiClient.get('/orders'),
      apiClient.get('/users'),
      apiClient.get('/dashboard')
    ])
    setProducts(productResponse.data.data || [])
    setCategories(categoryResponse.data || [])
    setOrders(orderResponse.data || [])
    setUsers(userResponse.data || [])
    setDashboard(dashboardResponse.data || { summary: { total_revenue: 0, confirmed_orders: 0, total_products: 0, total_users: 0 }, bestSellers: [], lowStock: [] })
  }

  useEffect(() => { if (user?.role === 'admin') loadData().catch(() => setMessage('Không tải được dữ liệu quản trị.')) }, [user])

  const submitProduct = async (event) => {
    event.preventDefault()
    try {
      await apiClient.post('/products', {
        ...form,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        stockQuantity: Number(form.stockQuantity),
        warrantyMonths: Number(form.warrantyMonths),
        detailCount: form.detailCount ? Number(form.detailCount) : null,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        boxWeightG: form.boxWeightG ? Number(form.boxWeightG) : null,
        releaseYear: form.releaseYear ? Number(form.releaseYear) : null,
        galleryImages: form.galleryImages ? form.galleryImages.split('|').map((item) => item.trim()).filter(Boolean) : []
      })
      setForm(emptyProduct)
      setMessage('Đã thêm sản phẩm.')
      await loadData()
    } catch (error) { setMessage(error.response?.data?.message || 'Không thể thêm sản phẩm.') }
  }

  const removeProduct = async (id) => {
    if (!window.confirm('Ẩn sản phẩm này?')) return
    await apiClient.delete(`/products/${id}`)
    await loadData()
  }

  const revenue = useMemo(() => Number(dashboard.summary?.total_revenue || 0), [dashboard])
  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label || 'Tổng quan'
  const productColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (name, product) => <div className="ant-product-name"><strong>{name}</strong><span>{product.category_name} · {product.sku}</span></div>
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price) => `${new Intl.NumberFormat('vi-VN').format(price)}đ`
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      width: 120,
      render: (stock) => <Tag color={stock > 0 ? 'green' : 'red'}>{stock} sản phẩm</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, product) => <AntButton type="link" danger onClick={() => removeProduct(product.id)}>Ẩn</AntButton>
    }
  ]
  const orderColumns = [
    { title: 'Mã đơn', dataIndex: 'order_code', key: 'order_code' },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, order) => <div className="ant-product-name"><strong>{order.customer_name}</strong><span>{order.customer_phone}</span></div>
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `${new Intl.NumberFormat('vi-VN').format(amount)}đ`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, order) => <select className="admin-status-select" value={status} onChange={async (event) => { await apiClient.patch(`/orders/${order.id}/status`, { status: event.target.value }); await loadData() }}><option value="da_dat">Đã đặt</option><option value="da_xac_nhan">Đã xác nhận</option><option value="da_huy">Đã hủy</option></select>
    }
  ]
  const userColumns = [
    { title: 'Họ tên', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Vai trò', dataIndex: 'role', key: 'role', render: (role) => role === 'admin' ? <Tag color="volcano">Quản trị</Tag> : <Tag>Khách hàng</Tag> },
    { title: 'Trạng thái', dataIndex: 'is_active', key: 'is_active', render: (isActive) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Hoạt động' : 'Khóa'}</Tag> }
  ]

  if (!user || user.role !== 'admin') return <main className="simple-page"><Link to="/">← Về trang chủ</Link><h1>Khu vực quản trị</h1><p>Vui lòng đăng nhập bằng tài khoản admin để truy cập.</p></main>

  return <main className="admin-page">
    <header className="admin-topbar"><Link to="/">← AUTOBOT</Link><div><span>{user.fullName || user.email}</span><button onClick={() => { logout(); window.location.href = '/' }}>Đăng xuất</button></div></header>

    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span>AB</span><div><p className="eyebrow">AUTOBOT</p><strong>Admin Panel</strong></div></div>
        <nav className="admin-nav">
          {tabs.map((tab) => (
            <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="admin-content">
        <div className="admin-heading"><p className="eyebrow">AUTOBOT / ADMIN / {activeTabLabel.toUpperCase()}</p><h1>{activeTab === 'overview' ? 'Dashboard quản lý' : activeTabLabel}</h1>{message && <p className="admin-message">{message}</p>}</div>

        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card"><span>Doanh thu</span><strong>{new Intl.NumberFormat('vi-VN').format(revenue)}đ</strong><small>Đơn đã xác nhận</small></div>
              <div className="stat-card"><span>Đơn hàng</span><strong>{dashboard.summary?.confirmed_orders || 0}</strong><small>Đã xác nhận</small></div>
              <div className="stat-card"><span>Sản phẩm</span><strong>{dashboard.summary?.total_products || 0}</strong><small>Đang hiển thị</small></div>
              <div className="stat-card"><span>Khách hàng</span><strong>{dashboard.summary?.total_users || 0}</strong><small>Người dùng</small></div>
            </div>

            <div className="admin-split">
              <div className="admin-table">
                <h2>Sản phẩm bán chạy</h2>
                <table>
                  <thead><tr><th>Sản phẩm</th><th>SL bán</th></tr></thead>
                  <tbody>{(dashboard.bestSellers || []).map((item) => <tr key={item.product_id}><td>{item.product_name}</td><td>{item.quantity_sold}</td></tr>)}</tbody>
                </table>
              </div>
              <div className="admin-table">
                <h2>Sắp hết hàng</h2>
                <table>
                  <thead><tr><th>Sản phẩm</th><th>Tồn</th></tr></thead>
                  <tbody>{(dashboard.lowStock || []).map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.stock_quantity}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <div className="admin-products-page">
            <form className="admin-form product-form" onSubmit={submitProduct}>
              <div className="product-form-heading">
                <div>
                  <p className="form-kicker">QUẢN LÝ SẢN PHẨM</p>
                  <h2>Thêm sản phẩm</h2>
                </div>
                <a className="product-list-link" href="#product-list">Xem danh sách sản phẩm ↓</a>
              </div>
              <input required placeholder="Tên sản phẩm" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              <input required placeholder="SKU" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} />
              <select required value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}><option value="">Chọn danh mục</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
              <div className="admin-inline-fields">
                <input placeholder="Grade" value={form.grade} onChange={(event) => setForm({ ...form, grade: event.target.value })} />
                <input placeholder="Scale" value={form.scale} onChange={(event) => setForm({ ...form, scale: event.target.value })} />
              </div>
              <div className="admin-inline-fields">
                <input required type="number" min="0" placeholder="Giá" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
                <input type="number" min="0" placeholder="Giá gốc" value={form.oldPrice} onChange={(event) => setForm({ ...form, oldPrice: event.target.value })} />
              </div>
              <div className="admin-inline-fields">
                <input required type="number" min="0" placeholder="Tồn kho" value={form.stockQuantity} onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })} />
                <select value={form.conditionStatus} onChange={(event) => setForm({ ...form, conditionStatus: event.target.value })}>
                  <option value="con_hang">Còn hàng</option>
                  <option value="het_hang">Hết hàng</option>
                  <option value="sap_co_hang">Sắp có hàng</option>
                </select>
              </div>
              <div className="admin-inline-fields">
                <input type="number" min="0" placeholder="Bảo hành (tháng)" value={form.warrantyMonths} onChange={(event) => setForm({ ...form, warrantyMonths: event.target.value })} />
                <input placeholder="Chất liệu" value={form.material} onChange={(event) => setForm({ ...form, material: event.target.value })} />
              </div>
              <div className="admin-inline-fields">
                <input placeholder="Nhà sản xuất" value={form.manufacturer} onChange={(event) => setForm({ ...form, manufacturer: event.target.value })} />
                <input placeholder="Series" value={form.seriesName} onChange={(event) => setForm({ ...form, seriesName: event.target.value })} />
              </div>
              <div className="admin-inline-fields">
                <input type="number" min="0" placeholder="Số mảnh" value={form.detailCount} onChange={(event) => setForm({ ...form, detailCount: event.target.value })} />
                <input placeholder="Phụ kiện" value={form.accessories} onChange={(event) => setForm({ ...form, accessories: event.target.value })} />
              </div>
              <div className="admin-inline-fields">
                <input placeholder="Assembly" value={form.assemblyType} onChange={(event) => setForm({ ...form, assemblyType: event.target.value })} />
                <input placeholder="Xuất xứ" value={form.origin} onChange={(event) => setForm({ ...form, origin: event.target.value })} />
              </div>
              <div className="admin-inline-fields">
                <input type="number" min="0" placeholder="Chiều cao (cm)" value={form.heightCm} onChange={(event) => setForm({ ...form, heightCm: event.target.value })} />
                <input type="number" min="0" placeholder="Trọng lượng hộp (g)" value={form.boxWeightG} onChange={(event) => setForm({ ...form, boxWeightG: event.target.value })} />
              </div>
              <div className="admin-inline-fields">
                <input placeholder="Kích thước hộp" value={form.boxSize} onChange={(event) => setForm({ ...form, boxSize: event.target.value })} />
                <input type="number" min="1900" placeholder="Năm phát hành" value={form.releaseYear} onChange={(event) => setForm({ ...form, releaseYear: event.target.value })} />
              </div>
              <textarea placeholder="Chính sách bảo hành" value={form.warrantyPolicy} onChange={(event) => setForm({ ...form, warrantyPolicy: event.target.value })} />
              <textarea placeholder="Mô tả" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              <input placeholder="URL hình ảnh chính" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
              <input placeholder="Ảnh phụ (cách nhau bằng dấu |)" value={form.galleryImages} onChange={(event) => setForm({ ...form, galleryImages: event.target.value })} />
              <button className="primary-button" type="submit">Thêm sản phẩm</button>
            </form>

            <section className="product-list-section" id="product-list">
              <Card
                className="product-list-card"
                title={<div><span className="form-kicker">DỮ LIỆU ĐANG HIỂN THỊ</span><strong>Danh sách sản phẩm ({products.length})</strong></div>}
                extra={<Tag color="volcano">{products.length} sản phẩm</Tag>}
              >
                <Table
                  rowKey="id"
                  columns={productColumns}
                  dataSource={products}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sản phẩm`
                  }}
                  size="middle"
                />
              </Card>
            </section>
          </div>
        )}

        {activeTab === 'orders' && (
          <section className="admin-management-section">
            <Card className="management-card" title={`Danh sách đơn hàng (${orders.length})`} extra={<Tag color="volcano">{orders.length} đơn</Tag>}>
              <Table rowKey="id" columns={orderColumns} dataSource={orders} pagination={{ pageSize: 10, showSizeChanger: false, showQuickJumper: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} đơn` }} size="middle" />
            </Card>
          </section>
        )}

        {activeTab === 'users' && (
          <section className="admin-management-section">
            <Card className="management-card" title={`Danh sách người dùng (${users.length})`} extra={<Tag color="volcano">{users.length} người dùng</Tag>}>
              <Table rowKey="id" columns={userColumns} dataSource={users} pagination={{ pageSize: 10, showSizeChanger: false, showQuickJumper: true, showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} người dùng` }} size="middle" />
            </Card>
          </section>
        )}

        {activeTab === 'revenue' && (
          <div className="admin-split">
            <div className="stat-card large">
              <span>Tổng doanh thu đã xác nhận</span>
              <strong>{new Intl.NumberFormat('vi-VN').format(revenue)}đ</strong>
              <small>{dashboard.summary?.confirmed_orders || 0} đơn đã xử lý</small>
            </div>
            <div className="admin-table">
              <h2>Top bán chạy</h2>
              <table>
                <thead><tr><th>Sản phẩm</th><th>SL</th></tr></thead>
                <tbody>{(dashboard.bestSellers || []).map((item) => <tr key={item.product_id}><td>{item.product_name}</td><td>{item.quantity_sold}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  </main>
}

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../api/client.js'

const money = (value) => new Intl.NumberFormat('vi-VN').format(value) + 'đ'
const getCondition = (product) => {
  if (product.condition_status === 'het_hang') return 'Hết hàng'
  if (product.condition_status === 'sap_co_hang') return 'Sắp có hàng'
  return `Còn hàng (${product.stock_quantity} sản phẩm)`
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get(`/products/${id}`).then(({ data }) => setProduct(data)).catch(() => setError('Không tải được thông tin sản phẩm.'))
  }, [id])

  if (error) return <div className="simple-page"><Link to="/">← Về trang chủ</Link><p>{error}</p></div>
  if (!product) return <div className="simple-page">Đang tải sản phẩm...</div>

  const gallery = [product.image_url, ...(product.gallery_images ? String(product.gallery_images).split('|').filter(Boolean) : [])].filter(Boolean)

  return <main className="simple-page product-detail-page">
    <Link to="/">← Về AUTOBOT</Link>
    <div className="detail-layout">
      <div className="detail-gallery">
        <img className="detail-main-image" src={gallery[0]} alt={product.name} />
        <div className="detail-thumbnail-row">
          {gallery.slice(0, 4).map((image, index) => (
            <img key={`${product.id}-${index}`} src={image} alt={`${product.name} ${index + 1}`} />
          ))}
        </div>
      </div>

      <section className="detail-info">
        <p className="eyebrow">{product.category_name}</p>
        <h1>{product.name}</h1>
        <div className="detail-meta-line">
          <span>{product.grade || 'HG'}</span>
          <span>{product.scale || '1/144'}</span>
          <span>{product.manufacturer || 'Bandai'}</span>
        </div>
        <div className="detail-price-row">
          <strong className="detail-price">{money(product.price)}</strong>
          {product.old_price ? <span className="detail-old-price">{money(product.old_price)}</span> : null}
        </div>
        <p className="detail-status">{getCondition(product)}</p>
        <p className="detail-description">{product.description}</p>

        <div className="detail-actions">
          <div className="qty-box">
            <button type="button">−</button>
            <span>1</span>
            <button type="button">+</button>
          </div>
          <button className="primary-button" disabled={product.stock_quantity <= 0}>Thêm vào giỏ ↗</button>
        </div>

        <div className="detail-badges">
          <span>Bảo hành {product.warranty_months || 12} tháng</span>
          <span>{product.series_name || 'Series Gundam'}</span>
          <span>{product.material || 'PS/ABS'} </span>
        </div>
      </section>
    </div>

    <div className="detail-panels">
      <section className="detail-panel">
        <h2>Thông tin chi tiết</h2>
        <div className="detail-spec-grid">
          <div><label>Xuất xứ</label><strong>{product.origin || 'Nhật Bản'}</strong></div>
          <div><label>Thương hiệu</label><strong>{product.manufacturer || 'Bandai'}</strong></div>
          <div><label>Series</label><strong>{product.series_name || 'Mobile Suit Gundam'}</strong></div>
          <div><label>Grade</label><strong>{product.grade || 'HG'}</strong></div>
          <div><label>Tỷ lệ</label><strong>{product.scale || '1/144'}</strong></div>
          <div><label>Vật liệu</label><strong>{product.material || 'PS/ABS'}</strong></div>
          <div><label>Số mảnh</label><strong>{product.detail_count || 'N/A'}</strong></div>
          <div><label>Phụ kiện</label><strong>{product.accessories || 'Vũ khí, decal, stand'}</strong></div>
          <div><label>Hình thức lắp</label><strong>{product.assembly_type || 'Lắp ráp cần dụng cụ'}</strong></div>
          <div><label>Bảo hành</label><strong>{product.warranty_policy || `Bảo hành chính hãng ${product.warranty_months || 12} tháng`}</strong></div>
        </div>
      </section>

      <section className="detail-panel">
        <h2>Thông số kỹ thuật</h2>
        <table className="spec-table">
          <tbody>
            <tr><th>Chiều cao</th><td>{product.height_cm ? `${product.height_cm} cm` : 'Chưa cập nhật'}</td></tr>
            <tr><th>Trọng lượng hộp</th><td>{product.box_weight_g ? `${product.box_weight_g} g` : 'Chưa cập nhật'}</td></tr>
            <tr><th>Kích thước hộp</th><td>{product.box_size || 'Chưa cập nhật'}</td></tr>
            <tr><th>Năm phát hành</th><td>{product.release_year || 'Chưa cập nhật'}</td></tr>
          </tbody>
        </table>
      </section>
    </div>
  </main>
}

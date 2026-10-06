import { pool } from '../config/db.js'

export async function getDashboard(req, res) {
  const [[revenue]] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total_revenue, COUNT(*) AS confirmed_orders FROM orders WHERE status = 'da_xac_nhan'")
  const [[products]] = await pool.query('SELECT COUNT(*) AS total_products FROM products WHERE is_active = TRUE')
  const [[customers]] = await pool.query("SELECT COUNT(*) AS total_users FROM users WHERE role = 'user'")
  const [bestSellers] = await pool.query("SELECT oi.product_id, oi.product_name, SUM(oi.quantity) AS quantity_sold FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status = 'da_xac_nhan' GROUP BY oi.product_id, oi.product_name ORDER BY quantity_sold DESC LIMIT 5")
  const [lowStock] = await pool.query('SELECT id, sku, name, stock_quantity FROM products WHERE is_active = TRUE AND stock_quantity <= 5 ORDER BY stock_quantity ASC LIMIT 10')
  res.json({ summary: { ...revenue, ...products, ...customers }, bestSellers, lowStock })
}
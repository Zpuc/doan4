import { pool } from '../config/db.js'

export async function listOrders(req, res) {
  const values = []
  let sql = 'SELECT o.*, u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone FROM orders o JOIN users u ON u.id = o.user_id WHERE 1 = 1'
  if (req.query.status) { sql += ' AND o.status = ?'; values.push(req.query.status) }
  sql += ' ORDER BY o.created_at DESC'
  const [rows] = await pool.query(sql, values)
  res.json(rows)
}

export async function listMyOrders(req, res) {
  const [rows] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id])
  res.json(rows)
}

export async function getOrder(req, res) {
  const [orders] = await pool.query('SELECT o.*, u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone, u.address AS customer_address FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ?', [req.params.id])
  if (!orders[0]) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' })
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id])
  res.json({ ...orders[0], items })
}

export async function listMyOrderDetail(req, res) {
  const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
  if (!orders[0]) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' })
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id])
  res.json({ ...orders[0], items })
}

export async function createOrder(req, res) {
  const { shippingAddress, customerNote = null, shippingFee = 0, items } = req.body
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    let subtotal = 0
    const resolvedItems = []
    for (const item of items) {
      const [rows] = await connection.query('SELECT id, name, price, stock_quantity FROM products WHERE id = ? AND is_active = TRUE FOR UPDATE', [item.productId])
      const product = rows[0]
      if (!product) { const error = new Error(`Sản phẩm #${item.productId} không tồn tại.`); error.statusCode = 422; throw error }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || product.stock_quantity < item.quantity) { const error = new Error(`${product.name} không đủ tồn kho.`); error.statusCode = 422; throw error }
      subtotal += product.price * item.quantity
      resolvedItems.push({ ...item, product })
    }
    const total = subtotal + Number(shippingFee)
    const orderCode = `AB${Date.now().toString().slice(-10)}`
    const [orderResult] = await connection.query('INSERT INTO orders (order_code, user_id, status, payment_method, shipping_address, customer_note, subtotal, shipping_fee, total_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [orderCode, req.user.id, 'da_dat', 'cod', shippingAddress, customerNote, subtotal, shippingFee, total])
    for (const item of resolvedItems) {
      await connection.query('INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)', [orderResult.insertId, item.product.id, item.product.name, item.product.price, item.quantity])
      await connection.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.quantity, item.product.id])
    }
    await connection.commit()
    res.status(201).json({ id: orderResult.insertId, orderCode, totalAmount: total, message: 'Đặt hàng thành công.' })
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
}

export async function updateOrderStatus(req, res) {
  const { status } = req.body
  const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id])
  if (!result.affectedRows) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' })
  res.json({ message: 'Đã cập nhật trạng thái đơn hàng.' })
}

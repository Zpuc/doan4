import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'

function signUser(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role, fullName: user.full_name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' })
}

export async function login(req, res) {
  const { email, password } = req.body
  const [rows] = await pool.query('SELECT id, full_name, email, password_hash, role, is_active FROM users WHERE email = ? LIMIT 1', [email])
  const user = rows[0]
  if (!user || !user.is_active || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' })
  res.json({ token: signUser(user), user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role } })
}

export async function register(req, res) {
  const { fullName, email, password, phone = null, address = null } = req.body
  const passwordHash = await bcrypt.hash(password, 12)
  const role = 'user'
  const [result] = await pool.query('INSERT INTO users (full_name, email, password_hash, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)', [fullName, email, passwordHash, phone, address, role])
  const user = { id: result.insertId, full_name: fullName, email, role }
  res.status(201).json({ token: signUser(user), user: { id: user.id, fullName, email, role } })
}
import { Router } from 'express'
import { body, param } from 'express-validator'
import { login, register } from '../controllers/auth.controller.js'
import * as products from '../controllers/products.controller.js'
import * as categories from '../controllers/categories.controller.js'
import * as orders from '../controllers/orders.controller.js'
import * as users from '../controllers/users.controller.js'
import { getDashboard } from '../controllers/dashboard.controller.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = Router()
const idRule = param('id').isInt({ min: 1 }).withMessage('ID không hợp lệ.')
const productRules = [body('categoryId').isInt({ min: 1 }), body('sku').trim().notEmpty().isLength({ max: 50 }), body('name').trim().notEmpty(), body('price').isFloat({ min: 0 }), body('stockQuantity').isInt({ min: 0 }), body('warrantyMonths').optional().isInt({ min: 0 })]

router.get('/health', (req, res) => res.json({ status: 'ok', service: 'autobot-api' }))
router.post('/auth/login', [body('email').isEmail(), body('password').isLength({ min: 6 }), validate], login)
router.post('/auth/register', [body('fullName').trim().notEmpty(), body('email').isEmail(), body('password').isLength({ min: 8 }), body('phone').optional().trim(), body('address').optional().trim(), validate], register)

router.get('/products', products.listProducts)
router.get('/products/:id', [idRule, validate], products.getProduct)
router.post('/products', authenticate, authorize('admin'), [...productRules, validate], products.createProduct)
router.put('/products/:id', authenticate, authorize('admin'), [idRule, ...productRules, validate], products.updateProduct)
router.delete('/products/:id', authenticate, authorize('admin'), [idRule, validate], products.deleteProduct)

router.get('/categories', categories.listCategories)
router.post('/categories', authenticate, authorize('admin'), [body('name').trim().notEmpty(), body('slug').trim().notEmpty(), validate], categories.createCategory)
router.put('/categories/:id', authenticate, authorize('admin'), [idRule, body('name').trim().notEmpty(), body('slug').trim().notEmpty(), validate], categories.updateCategory)
router.delete('/categories/:id', authenticate, authorize('admin'), [idRule, validate], categories.deleteCategory)

router.get('/orders', authenticate, authorize('admin'), orders.listOrders)
router.get('/orders/my', authenticate, authorize('user'), orders.listMyOrders)
router.get('/orders/my/:id', authenticate, authorize('user'), [idRule, validate], orders.listMyOrderDetail)
router.get('/orders/:id', authenticate, authorize('admin'), [idRule, validate], orders.getOrder)
router.post('/orders', authenticate, authorize('user'), [body('shippingAddress').trim().notEmpty(), body('items').isArray({ min: 1 }), validate], orders.createOrder)
router.patch('/orders/:id/status', authenticate, authorize('admin'), [idRule, body('status').isIn(['da_dat', 'da_xac_nhan', 'da_huy']), validate], orders.updateOrderStatus)

router.get('/users', authenticate, authorize('admin'), users.listUsers)
router.post('/users', authenticate, authorize('admin'), [body('fullName').trim().notEmpty(), body('email').isEmail(), body('password').isLength({ min: 8 }), body('role').isIn(['admin', 'user']), validate], users.createUser)
router.put('/users/:id', authenticate, authorize('admin'), [idRule, body('fullName').trim().notEmpty(), body('role').isIn(['admin', 'user']), body('isActive').isBoolean(), validate], users.updateUser)
router.get('/dashboard', authenticate, authorize('admin'), getDashboard)

export default router
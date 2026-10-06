-- AUTOBOT Gundam Store
-- Step 1: MySQL schema and seed data
-- Recommended: MySQL 8.0.16+

CREATE DATABASE IF NOT EXISTS autobot_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE autobot_store;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  address VARCHAR(255) NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_active (is_active)
) ENGINE = InnoDB;

CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;

CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  sku VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  grade VARCHAR(40) NULL,
  scale VARCHAR(20) NULL,
  price DECIMAL(12, 2) NOT NULL,
  old_price DECIMAL(12, 2) NULL,
  stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  condition_status ENUM('con_hang', 'het_hang', 'sap_co_hang') NOT NULL DEFAULT 'con_hang',
  warranty_months INT UNSIGNED NOT NULL DEFAULT 12,
  warranty_policy TEXT NULL,
  manufacturer VARCHAR(120) NULL,
  series_name VARCHAR(120) NULL,
  material VARCHAR(120) NULL,
  detail_count INT UNSIGNED NULL,
  accessories TEXT NULL,
  assembly_type VARCHAR(80) NULL,
  origin VARCHAR(120) NULL,
  description TEXT NULL,
  image_url VARCHAR(500) NULL,
  gallery_images TEXT NULL,
  height_cm DECIMAL(6, 2) NULL,
  box_weight_g INT UNSIGNED NULL,
  box_size VARCHAR(80) NULL,
  release_year INT UNSIGNED NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT chk_products_stock CHECK (stock_quantity >= 0),
  INDEX idx_products_category (category_id),
  INDEX idx_products_name (name),
  INDEX idx_products_stock (stock_quantity),
  INDEX idx_products_active (is_active)
) ENGINE = InnoDB;

CREATE TABLE orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(30) NOT NULL UNIQUE,
  user_id INT UNSIGNED NOT NULL,
  status ENUM('da_dat', 'da_xac_nhan', 'da_huy') NOT NULL DEFAULT 'da_dat',
  payment_method ENUM('cod') NOT NULL DEFAULT 'cod',
  shipping_address VARCHAR(255) NOT NULL,
  customer_note VARCHAR(500) NULL,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  shipping_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_orders_subtotal CHECK (subtotal >= 0),
  CONSTRAINT chk_orders_shipping_fee CHECK (shipping_fee >= 0),
  CONSTRAINT chk_orders_total CHECK (total_amount >= 0),
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_created_at (created_at)
) ENGINE = InnoDB;

CREATE TABLE order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  product_name VARCHAR(180) NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  line_total DECIMAL(12, 2) AS (unit_price * quantity) STORED,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_order_items_price CHECK (unit_price >= 0),
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
  INDEX idx_order_items_order (order_id),
  INDEX idx_order_items_product (product_id)
) ENGINE = InnoDB;

-- Demo password for both accounts: Password123!
-- Replace this password before deploying to production.
INSERT INTO users (full_name, email, password_hash, role) VALUES
  ('AUTOBOT Admin', 'admin@autobot.local', '$2b$12$Zyb3yDUtlcoUmSWjK9/.q.PWoXAlVzI.I/NbdjCZZJjjd4dbcQqdq', 'admin'),
    ('AUTOBOT User', 'user@autobot.local', '$2b$12$Zyb3yDUtlcoUmSWjK9/.q.PWoXAlVzI.I/NbdjCZZJjjd4dbcQqdq', 'user');

INSERT INTO categories (name, slug, description) VALUES
  ('High Grade', 'hg', 'Dễ lắp ráp, kích thước 1/144'),
  ('Real Grade', 'rg', 'Chi tiết cao, kích thước 1/144'),
  ('Master Grade', 'mg', 'Khung trong đầy đủ, kích thước 1/100'),
  ('Perfect Grade', 'pg', 'Dòng cao cấp, kích thước 1/60'),
  ('Super Deformed', 'sd', 'Thiết kế chibi, nhỏ gọn');

INSERT INTO products
  (category_id, sku, name, price, stock_quantity, warranty_months, description, image_url)
VALUES
  (1, 'HG-AERIAL-001', 'Gundam Aerial', 820000, 18, 12, 'HG 1/144 thuộc dòng Mobile Suit Gundam: The Witch from Mercury.', 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=900&q=85'),
  (1, 'HG-ZAKU-001', 'MS-06S Zaku II', 690000, 12, 12, 'HG 1/144 Zaku II màu đỏ của Char Aznable.', 'https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&w=900&q=85'),
  (2, 'RG-RX782-001', 'RX-78-2 Gundam', 1180000, 7, 12, 'RG 1/144 với khung Advanced MS Joint chi tiết.', 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=900&q=85'),
  (2, 'RG-SAZABI-001', 'MSN-04 Sazabi', 2050000, 4, 12, 'RG 1/144 Sazabi với nhiều gimmick và vũ khí.', 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?auto=format&fit=crop&w=900&q=85'),
  (3, 'MG-FREEDOM-001', 'Freedom Gundam 2.0', 1920000, 9, 12, 'MG 1/100 Freedom Gundam Ver. 2.0.', 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=900&q=85'),
  (4, 'PG-UNICORN-001', 'Unicorn Gundam', 5350000, 2, 24, 'PG 1/60 Unicorn Gundam với LED unit tương thích.', 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=900&q=85'),
  (5, 'SD-WING-001', 'SDW World Heroes Wukong', 420000, 25, 6, 'SD ấn tượng, phù hợp làm quà tặng hoặc người mới bắt đầu.', NULL);

INSERT INTO orders
  (order_code, user_id, status, payment_method, shipping_address, customer_note, subtotal, shipping_fee, total_amount)
VALUES
  ('AB2026090001', 2, 'da_xac_nhan', 'cod', '12 Nguyễn Trãi, Quận 1, TP.HCM', NULL, 2360000, 0, 2360000),
  ('AB2026090002', 2, 'da_dat', 'cod', '45 Lê Lợi, Hải Châu, Đà Nẵng', 'Giao giờ hành chính', 820000, 30000, 850000);

INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES
  (1, 3, 'RX-78-2 Gundam', 1180000, 2),
  (2, 1, 'Gundam Aerial', 820000, 1);

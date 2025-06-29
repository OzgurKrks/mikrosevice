-- Order Service Database Schema

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    product_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Insert some sample data
INSERT INTO orders (user_id, total_amount, status) VALUES 
(1, 1299.98, 'confirmed'),
(2, 42.98, 'pending')
ON CONFLICT DO NOTHING;

-- Insert sample order items (assuming the orders above exist)
INSERT INTO order_items (order_id, product_id, quantity, price, product_name)
SELECT 1, 1, 1, 999.99, 'Laptop'
WHERE EXISTS (SELECT 1 FROM orders WHERE id = 1)
UNION ALL
SELECT 1, 5, 10, 29.99, 'Wireless Mouse'
WHERE EXISTS (SELECT 1 FROM orders WHERE id = 1)
UNION ALL
SELECT 2, 3, 1, 12.99, 'Coffee Mug'
WHERE EXISTS (SELECT 1 FROM orders WHERE id = 2)
UNION ALL
SELECT 2, 5, 1, 29.99, 'Wireless Mouse'
WHERE EXISTS (SELECT 1 FROM orders WHERE id = 2); 
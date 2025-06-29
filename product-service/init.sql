-- Product Service Database Schema

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Insert some sample data
INSERT INTO products (name, description, price, stock, category) VALUES 
('Laptop', 'High-performance laptop for gaming and work', 999.99, 10, 'Electronics'),
('Smartphone', 'Latest smartphone with advanced features', 699.99, 25, 'Electronics'),
('Coffee Mug', 'Ceramic coffee mug with company logo', 12.99, 100, 'Office Supplies'),
('Desk Chair', 'Ergonomic office chair for comfort', 299.99, 15, 'Furniture'),
('Wireless Mouse', 'Bluetooth wireless mouse', 29.99, 50, 'Electronics')
ON CONFLICT DO NOTHING; 
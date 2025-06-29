-- User Service Database Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Insert some sample data
INSERT INTO users (email, password, name) VALUES 
('john@example.com', '$2a$10$X6zI3QGQX4d8PfR4K5LYT.4Q5a3N6G0L8iF9K5L4P0K7E1Q6xJ3T.', 'John Doe'),
('jane@example.com', '$2a$10$Y7zI4QGQX5d9PfR5K6LYT.5Q6a4N7G1L9iF0K6L5P1K8E2Q7xJ4T.', 'Jane Smith')
ON CONFLICT (email) DO NOTHING; 
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Pool } from 'pg';
import axios from 'axios';
import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Service URLs
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://product-service:8080';

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'orderdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Validation schemas
const orderSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().positive().required(),
    })
  ).min(1).required(),
});

const updateOrderSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled').required(),
});

// Types
interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  productName?: string;
}

interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  userName?: string;
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Order Service', timestamp: new Date().toISOString() });
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { error, value } = orderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { userId, items } = value;

    // Verify user exists
    try {
      await axios.get(`${userServiceUrl}/api/users/${userId}`);
    } catch (userError) {
      if (axios.isAxiosError(userError) && userError.response?.status === 404) {
        return res.status(400).json({ error: 'User not found' });
      }
      throw userError;
    }

    // Verify products exist and get prices
    const productDetails: { [key: number]: { price: number; name: string; stock: number } } = {};
    for (const item of items) {
      try {
        const productResponse = await axios.get(`${productServiceUrl}/api/products/${item.productId}`);
        const product = productResponse.data.product;
        
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            error: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
          });
        }
        
        productDetails[item.productId] = {
          price: product.price,
          name: product.name,
          stock: product.stock
        };
      } catch (productError) {
        if (axios.isAxiosError(productError) && productError.response?.status === 404) {
          return res.status(400).json({ error: `Product with ID ${item.productId} not found` });
        }
        throw productError;
      }
    }

    // Calculate total amount
    const totalAmount = items.reduce((total: number, item: any) => {
      return total + (productDetails[item.productId].price * item.quantity);
    }, 0);

    // Create order in database
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert order
      const orderResult = await client.query(
        'INSERT INTO orders (user_id, total_amount, status, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, user_id, total_amount, status, created_at, updated_at',
        [userId, totalAmount, 'pending']
      );

      const order = orderResult.rows[0];

      // Insert order items
      const orderItems = [];
      for (const item of items) {
        const itemResult = await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price, product_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [order.id, item.productId, item.quantity, productDetails[item.productId].price, productDetails[item.productId].name]
        );
        orderItems.push(itemResult.rows[0]);
      }

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Order created successfully',
        order: {
          id: order.id,
          userId: order.user_id,
          totalAmount: order.total_amount,
          status: order.status,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          items: orderItems.map(item => ({
            productId: item.product_id,
            quantity: item.quantity,
            price: item.price,
            productName: item.product_name
          }))
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const ordersResult = await pool.query(`
      SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at, o.updated_at
      FROM orders o
      ORDER BY o.created_at DESC
    `);

    const orders = [];
    for (const order of ordersResult.rows) {
      // Get order items
      const itemsResult = await pool.query(
        'SELECT product_id, quantity, price, product_name FROM order_items WHERE order_id = $1',
        [order.id]
      );

      // Get user name
      let userName = 'Unknown User';
      try {
        const userResponse = await axios.get(`${userServiceUrl}/api/users/${order.user_id}`);
        userName = userResponse.data.user.name;
      } catch (error) {
        console.error(`Failed to fetch user ${order.user_id}:`, error);
      }

      orders.push({
        id: order.id,
        userId: order.user_id,
        userName,
        totalAmount: order.total_amount,
        status: order.status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: itemsResult.rows.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
          productName: item.product_name
        }))
      });
    }

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      'SELECT id, user_id, total_amount, status, created_at, updated_at FROM orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await pool.query(
      'SELECT product_id, quantity, price, product_name FROM order_items WHERE order_id = $1',
      [id]
    );

    // Get user name
    let userName = 'Unknown User';
    try {
      const userResponse = await axios.get(`${userServiceUrl}/api/users/${order.user_id}`);
      userName = userResponse.data.user.name;
    } catch (error) {
      console.error(`Failed to fetch user ${order.user_id}:`, error);
    }

    res.json({
      order: {
        id: order.id,
        userId: order.user_id,
        userName,
        totalAmount: order.total_amount,
        status: order.status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: itemsResult.rows.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
          productName: item.product_name
        }))
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status
app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateOrderSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { status } = value;

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, user_id, total_amount, status, created_at, updated_at',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = result.rows[0];
    res.json({
      message: 'Order status updated successfully',
      order: {
        id: order.id,
        userId: order.user_id,
        totalAmount: order.total_amount,
        status: order.status,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      }
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get orders by user ID
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const ordersResult = await pool.query(
      'SELECT id, user_id, total_amount, status, created_at, updated_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const orders = [];
    for (const order of ordersResult.rows) {
      // Get order items
      const itemsResult = await pool.query(
        'SELECT product_id, quantity, price, product_name FROM order_items WHERE order_id = $1',
        [order.id]
      );

      orders.push({
        id: order.id,
        userId: order.user_id,
        totalAmount: order.total_amount,
        status: order.status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: itemsResult.rows.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
          productName: item.product_name
        }))
      });
    }

    res.json({ orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Order Service Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`📦 Order Service running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
}); 
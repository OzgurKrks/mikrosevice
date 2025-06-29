import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Service URLs - Use Docker service names for internal communication
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://product-service:8080';
const orderServiceUrl = process.env.ORDER_SERVICE_URL || 'http://order-service:3002';

// Log service URLs for debugging
console.log('🔗 Service URLs:');
console.log(`   User Service: ${userServiceUrl}`);
console.log(`   Product Service: ${productServiceUrl}`);
console.log(`   Order Service: ${orderServiceUrl}`);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'API Gateway', timestamp: new Date().toISOString() });
});

// API Documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Microservice API Gateway',
    version: '1.0.0',
    services: [
      { name: 'User Service', path: '/api/users', description: 'User management' },
      { name: 'Product Service', path: '/api/products', description: 'Product catalog' },
      { name: 'Order Service', path: '/api/orders', description: 'Order management' }
    ],
    endpoints: {
      health: '/health',
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders'
    }
  });
});

// Proxy routes to microservices
app.use('/api/users', createProxyMiddleware({
  target: userServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users'
  },
  onError: (err, req, res) => {
    console.error('❌ User Service Proxy Error:', err.message);
    console.error(`   Target: ${userServiceUrl}`);
    res.status(503).json({ error: 'User service unavailable', details: err.message });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying to User Service: ${req.method} ${req.path}`);
  }
}));

app.use('/api/products', createProxyMiddleware({
  target: productServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/api/products': '/api/products'
  },
  onError: (err, req, res) => {
    console.error('❌ Product Service Proxy Error:', err.message);
    console.error(`   Target: ${productServiceUrl}`);
    res.status(503).json({ error: 'Product service unavailable', details: err.message });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying to Product Service: ${req.method} ${req.path}`);
  }
}));

app.use('/api/orders', createProxyMiddleware({
  target: orderServiceUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/api/orders': '/api/orders'
  },
  onError: (err, req, res) => {
    console.error('❌ Order Service Proxy Error:', err.message);
    console.error(`   Target: ${orderServiceUrl}`);
    console.error(`   Request: ${req.method} ${req.path}`);
    res.status(503).json({ error: 'Order service unavailable', details: err.message });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying to Order Service: ${req.method} ${req.path}`);
  }
}));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Gateway Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`🚀 API Gateway running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`📖 Documentation: http://localhost:${port}/`);
}); 
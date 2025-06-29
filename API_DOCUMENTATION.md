# 📚 Microservices API Documentation

A comprehensive API documentation for the microservice backend system.

## 🏗️ Architecture Overview

The system consists of 4 main services accessible through an API Gateway:

- **API Gateway**: http://localhost:3000 (Main entry point)
- **User Service**: http://localhost:3001 (Direct access)
- **Product Service**: http://localhost:8080 (Direct access)
- **Order Service**: http://localhost:3002 (Direct access)

> **Note**: All API calls should go through the API Gateway (port 3000) in production. Direct service access is for development/debugging only.

---

## 🔐 Authentication

Some endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get your JWT token by calling the `/api/users/login` endpoint.

---

# 🌐 API Gateway Endpoints

## Health Check

### GET /health

Check if the API Gateway is running.

**Response:**

```json
{
  "status": "OK",
  "service": "API Gateway",
  "timestamp": "2025-06-29T07:24:27.865Z"
}
```

## Service Information

### GET /

Get information about available services and endpoints.

**Response:**

```json
{
  "message": "Microservice API Gateway",
  "version": "1.0.0",
  "services": [
    {
      "name": "User Service",
      "path": "/api/users",
      "description": "User management"
    },
    {
      "name": "Product Service",
      "path": "/api/products",
      "description": "Product catalog"
    },
    {
      "name": "Order Service",
      "path": "/api/orders",
      "description": "Order management"
    }
  ],
  "endpoints": {
    "health": "/health",
    "users": "/api/users",
    "products": "/api/products",
    "orders": "/api/orders"
  }
}
```

---

# 👤 User Service API

## Health Check

### GET /api/users/health

Check if the User Service is running.

**Response:**

```json
{
  "status": "OK",
  "service": "User Service",
  "timestamp": "2025-06-29T07:24:27.865Z"
}
```

## User Registration

### POST /api/users/register

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**

- `name`: Required, minimum 2 characters
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

**Success Response (201):**

```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2025-06-29T07:30:00.000Z"
  }
}
```

**Error Response (400):**

```json
{
  "error": "\"email\" must be a valid email"
}
```

**Error Response (409):**

```json
{
  "error": "User already exists"
}
```

## User Login

### POST /api/users/login

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (401):**

```json
{
  "error": "Invalid credentials"
}
```

## Get All Users

### GET /api/users

Retrieve all users.

**Success Response (200):**

```json
{
  "users": [
    {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "createdAt": "2025-06-29T07:30:00.000Z"
    },
    {
      "id": 2,
      "email": "jane@example.com",
      "name": "Jane Smith",
      "createdAt": "2025-06-29T07:35:00.000Z"
    }
  ]
}
```

## Get User by ID

### GET /api/users/:id

Retrieve a specific user by ID.

**URL Parameters:**

- `id` (integer): User ID

**Success Response (200):**

```json
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2025-06-29T07:30:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "error": "User not found"
}
```

## Update User

### PUT /api/users/:id

Update user information.

**URL Parameters:**

- `id` (integer): User ID

**Request Body:**

```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Success Response (200):**

```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "email": "john.updated@example.com",
    "name": "John Updated",
    "updatedAt": "2025-06-29T08:00:00.000Z"
  }
}
```

## Delete User

### DELETE /api/users/:id

Delete a user account.

**URL Parameters:**

- `id` (integer): User ID

**Success Response (200):**

```json
{
  "message": "User deleted successfully"
}
```

**Error Response (404):**

```json
{
  "error": "User not found"
}
```

---

# 🛍️ Product Service API

## Health Check

### GET /api/products/health

Check if the Product Service is running.

**Response:**

```json
{
  "status": "OK",
  "service": "Product Service",
  "timestamp": "2025-06-29T07:24:27.865Z"
}
```

## Get All Products

### GET /api/products

Retrieve all products.

**Success Response (200):**

```json
{
  "products": [
    {
      "id": 1,
      "name": "Laptop",
      "description": "High-performance laptop for gaming and work",
      "price": 999.99,
      "stock": 10,
      "category": "Electronics",
      "created_at": "2025-06-29T07:30:00.000Z",
      "updated_at": "2025-06-29T07:30:00.000Z"
    },
    {
      "id": 2,
      "name": "Smartphone",
      "description": "Latest smartphone with advanced features",
      "price": 699.99,
      "stock": 25,
      "category": "Electronics",
      "created_at": "2025-06-29T07:35:00.000Z",
      "updated_at": "2025-06-29T07:35:00.000Z"
    }
  ]
}
```

## Get Product by ID

### GET /api/products/:id

Retrieve a specific product by ID.

**URL Parameters:**

- `id` (integer): Product ID

**Success Response (200):**

```json
{
  "product": {
    "id": 1,
    "name": "Laptop",
    "description": "High-performance laptop for gaming and work",
    "price": 999.99,
    "stock": 10,
    "category": "Electronics",
    "created_at": "2025-06-29T07:30:00.000Z",
    "updated_at": "2025-06-29T07:30:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "error": "Product not found"
}
```

## Create Product

### POST /api/products

Create a new product.

**Request Body:**

```json
{
  "name": "Gaming Laptop",
  "description": "High-end gaming laptop with RTX graphics",
  "price": 1299.99,
  "stock": 5,
  "category": "Electronics"
}
```

**Validation Rules:**

- `name`: Required
- `description`: Required
- `price`: Required, must be greater than 0
- `stock`: Required, must be >= 0
- `category`: Required

**Success Response (201):**

```json
{
  "message": "Product created successfully",
  "product": {
    "id": 6,
    "name": "Gaming Laptop",
    "description": "High-end gaming laptop with RTX graphics",
    "price": 1299.99,
    "stock": 5,
    "category": "Electronics",
    "created_at": "2025-06-29T08:00:00.000Z",
    "updated_at": "2025-06-29T08:00:00.000Z"
  }
}
```

**Error Response (400):**

```json
{
  "error": "Key: 'CreateProductRequest.Name' Error:Field validation for 'Name' failed on the 'required' tag"
}
```

## Update Product

### PUT /api/products/:id

Update product information.

**URL Parameters:**

- `id` (integer): Product ID

**Request Body (partial update allowed):**

```json
{
  "name": "Updated Gaming Laptop",
  "price": 1199.99,
  "stock": 8
}
```

**Success Response (200):**

```json
{
  "message": "Product updated successfully",
  "product": {
    "id": 6,
    "name": "Updated Gaming Laptop",
    "description": "High-end gaming laptop with RTX graphics",
    "price": 1199.99,
    "stock": 8,
    "category": "Electronics",
    "created_at": "2025-06-29T08:00:00.000Z",
    "updated_at": "2025-06-29T08:15:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "error": "Product not found"
}
```

## Delete Product

### DELETE /api/products/:id

Delete a product.

**URL Parameters:**

- `id` (integer): Product ID

**Success Response (200):**

```json
{
  "message": "Product deleted successfully"
}
```

**Error Response (404):**

```json
{
  "error": "Product not found"
}
```

---

# 📦 Order Service API

## Health Check

### GET /api/orders/health

Check if the Order Service is running.

**Response:**

```json
{
  "status": "OK",
  "service": "Order Service",
  "timestamp": "2025-06-29T07:24:27.865Z"
}
```

## Create Order

### POST /api/orders

Create a new order with multiple items.

**Request Body:**

```json
{
  "userId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 3,
      "quantity": 1
    }
  ]
}
```

**Validation Rules:**

- `userId`: Required, must be a positive integer
- `items`: Required array with at least 1 item
- `items[].productId`: Required, must be a positive integer
- `items[].quantity`: Required, must be a positive integer

**Business Logic:**

- Validates that the user exists (calls User Service)
- Validates that all products exist (calls Product Service)
- Checks stock availability for each product
- Calculates total amount automatically

**Success Response (201):**

```json
{
  "message": "Order created successfully",
  "order": {
    "id": 3,
    "userId": 1,
    "totalAmount": 2012.98,
    "status": "pending",
    "createdAt": "2025-06-29T08:30:00.000Z",
    "updatedAt": "2025-06-29T08:30:00.000Z",
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "price": 999.99,
        "productName": "Laptop"
      },
      {
        "productId": 3,
        "quantity": 1,
        "price": 12.99,
        "productName": "Coffee Mug"
      }
    ]
  }
}
```

**Error Response (400 - User not found):**

```json
{
  "error": "User not found"
}
```

**Error Response (400 - Product not found):**

```json
{
  "error": "Product with ID 999 not found"
}
```

**Error Response (400 - Insufficient stock):**

```json
{
  "error": "Insufficient stock for product Laptop. Available: 5, Requested: 10"
}
```

## Get All Orders

### GET /api/orders

Retrieve all orders with user and product information.

**Success Response (200):**

```json
{
  "orders": [
    {
      "id": 1,
      "userId": 1,
      "userName": "John Doe",
      "totalAmount": 1299.98,
      "status": "confirmed",
      "createdAt": "2025-06-29T07:45:00.000Z",
      "updatedAt": "2025-06-29T07:50:00.000Z",
      "items": [
        {
          "productId": 1,
          "quantity": 1,
          "price": 999.99,
          "productName": "Laptop"
        },
        {
          "productId": 5,
          "quantity": 10,
          "price": 29.99,
          "productName": "Wireless Mouse"
        }
      ]
    }
  ]
}
```

## Get Order by ID

### GET /api/orders/:id

Retrieve a specific order by ID.

**URL Parameters:**

- `id` (integer): Order ID

**Success Response (200):**

```json
{
  "order": {
    "id": 1,
    "userId": 1,
    "userName": "John Doe",
    "totalAmount": 1299.98,
    "status": "confirmed",
    "createdAt": "2025-06-29T07:45:00.000Z",
    "updatedAt": "2025-06-29T07:50:00.000Z",
    "items": [
      {
        "productId": 1,
        "quantity": 1,
        "price": 999.99,
        "productName": "Laptop"
      },
      {
        "productId": 5,
        "quantity": 10,
        "price": 29.99,
        "productName": "Wireless Mouse"
      }
    ]
  }
}
```

**Error Response (404):**

```json
{
  "error": "Order not found"
}
```

## Update Order Status

### PUT /api/orders/:id

Update order status.

**URL Parameters:**

- `id` (integer): Order ID

**Request Body:**

```json
{
  "status": "shipped"
}
```

**Valid Status Values:**

- `pending`
- `confirmed`
- `shipped`
- `delivered`
- `cancelled`

**Success Response (200):**

```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": 1,
    "userId": 1,
    "totalAmount": 1299.98,
    "status": "shipped",
    "createdAt": "2025-06-29T07:45:00.000Z",
    "updatedAt": "2025-06-29T09:00:00.000Z"
  }
}
```

**Error Response (400):**

```json
{
  "error": "\"status\" must be one of [pending, confirmed, shipped, delivered, cancelled]"
}
```

## Get Orders by User

### GET /api/orders/user/:userId

Retrieve all orders for a specific user.

**URL Parameters:**

- `userId` (integer): User ID

**Success Response (200):**

```json
{
  "orders": [
    {
      "id": 1,
      "userId": 1,
      "totalAmount": 1299.98,
      "status": "confirmed",
      "createdAt": "2025-06-29T07:45:00.000Z",
      "updatedAt": "2025-06-29T07:50:00.000Z",
      "items": [
        {
          "productId": 1,
          "quantity": 1,
          "price": 999.99,
          "productName": "Laptop"
        }
      ]
    }
  ]
}
```

---

# 🚨 Error Handling

## Common HTTP Status Codes

- **200 OK**: Successful GET, PUT requests
- **201 Created**: Successful POST requests (creation)
- **400 Bad Request**: Invalid request data, validation errors
- **401 Unauthorized**: Authentication required or invalid
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists (e.g., duplicate email)
- **500 Internal Server Error**: Server-side error
- **503 Service Unavailable**: Service is down or unreachable

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Descriptive error message"
}
```

---

# 🧪 Testing Examples

## Complete User Flow Example

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "securepass123"
  }'
```

### 2. Login to Get Token

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securepass123"
  }'
```

### 3. Create a Product

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mechanical Keyboard",
    "description": "RGB mechanical gaming keyboard",
    "price": 149.99,
    "stock": 20,
    "category": "Electronics"
  }'
```

### 4. Create an Order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "items": [
      {
        "productId": 1,
        "quantity": 1
      },
      {
        "productId": 6,
        "quantity": 1
      }
    ]
  }'
```

### 5. Update Order Status

```bash
curl -X PUT http://localhost:3000/api/orders/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

---

# 🔧 Development & Testing

## Using PowerShell (Windows)

For Windows users, use `Invoke-RestMethod`:

```powershell
# Register User
Invoke-RestMethod -Uri "http://localhost:3000/api/users/register" -Method POST -ContentType "application/json" -Body '{"name":"Alice Johnson","email":"alice@example.com","password":"securepass123"}'

# Get All Products
Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method GET

# Create Order
Invoke-RestMethod -Uri "http://localhost:3000/api/orders" -Method POST -ContentType "application/json" -Body '{"userId":1,"items":[{"productId":1,"quantity":2}]}'
```

## Using Postman

Import these endpoints into Postman for easier testing:

1. Set base URL to `http://localhost:3000`
2. Create requests for each endpoint
3. Add proper headers and body data
4. Save responses for documentation

---

# 📋 Rate Limits & Best Practices

## General Guidelines

1. **Use the API Gateway**: Always route requests through port 3000
2. **Handle Errors Gracefully**: Check status codes and error messages
3. **Validate Input**: Follow the validation rules for each endpoint
4. **Use Proper HTTP Methods**: GET for retrieval, POST for creation, PUT for updates, DELETE for removal
5. **Include Content-Type**: Always set `Content-Type: application/json` for requests with body data

## Service Dependencies

- **Order Service** depends on **User Service** and **Product Service**
- Orders validate user existence and product availability
- Stock levels are checked but not automatically decremented (business logic can be extended)

---

# 🔍 Monitoring & Health Checks

All services provide health check endpoints:

- API Gateway: `GET /health`
- User Service: `GET /api/users/health` (via gateway) or `GET /health` (direct)
- Product Service: `GET /api/products/health` (via gateway) or `GET /health` (direct)
- Order Service: `GET /api/orders/health` (via gateway) or `GET /health` (direct)

Use these for monitoring and load balancer health checks in production environments.

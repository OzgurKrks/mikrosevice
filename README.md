# Microservices Backend - Learning Project

A comprehensive microservices backend built with **Node.js**, **TypeScript**, **Golang**, **PostgreSQL**, and **Docker** to demonstrate modern microservice architecture patterns.

## 🏗️ Architecture Overview

This project implements a simple e-commerce-like system with the following microservices:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  User Service   │    │Product Service  │    │ Order Service   │
│                 │    │                 │    │                 │    │                 │
│ Node.js/TypeScript │    │ Node.js/TypeScript │    │   Golang/Gin    │    │ Node.js/TypeScript │
│     Port 3000   │    │     Port 3001   │    │     Port 8080   │    │     Port 3002   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         └───────────────────────┼───────────────────────┼───────────────────────┘
                                 │                       │                       │
                    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
                    │   PostgreSQL    │    │   PostgreSQL    │    │   PostgreSQL    │
                    │   (User DB)     │    │  (Product DB)   │    │   (Order DB)    │
                    │   Port 5432     │    │   Port 5433     │    │   Port 5434     │
                    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Services

### 1. API Gateway (Node.js/TypeScript) - Port 3000

- **Purpose**: Single entry point for all client requests
- **Features**: Request routing, load balancing, CORS handling
- **Routes**: Proxies requests to appropriate microservices

### 2. User Service (Node.js/TypeScript + Express) - Port 3001

- **Purpose**: User management and authentication
- **Features**: User registration, login, JWT authentication, CRUD operations
- **Database**: PostgreSQL (userdb)
- **Endpoints**:
  - `POST /api/users/register` - Register new user
  - `POST /api/users/login` - User login
  - `GET /api/users` - Get all users
  - `GET /api/users/:id` - Get user by ID
  - `PUT /api/users/:id` - Update user
  - `DELETE /api/users/:id` - Delete user

### 3. Product Service (Golang + Gin) - Port 8080

- **Purpose**: Product catalog management
- **Features**: Product CRUD operations, inventory management
- **Database**: PostgreSQL (productdb)
- **Endpoints**:
  - `GET /api/products` - Get all products
  - `GET /api/products/:id` - Get product by ID
  - `POST /api/products` - Create new product
  - `PUT /api/products/:id` - Update product
  - `DELETE /api/products/:id` - Delete product

### 4. Order Service (Node.js/TypeScript + Express) - Port 3002

- **Purpose**: Order management with inter-service communication
- **Features**: Order creation, status tracking, service-to-service calls
- **Database**: PostgreSQL (orderdb)
- **Endpoints**:
  - `POST /api/orders` - Create new order
  - `GET /api/orders` - Get all orders
  - `GET /api/orders/:id` - Get order by ID
  - `PUT /api/orders/:id` - Update order status
  - `GET /api/orders/user/:userId` - Get orders by user

## 🛠️ Technology Stack

### Backend Technologies

- **Node.js** with **TypeScript** (API Gateway, User Service, Order Service)
- **Golang** with **Gin** framework (Product Service)
- **Express.js** framework for Node.js services
- **PostgreSQL** databases (separate database per service)

### DevOps & Infrastructure

- **Docker** for containerization
- **Docker Compose** for multi-container orchestration
- **Health checks** for all services
- **CORS** enabled for frontend integration

### Libraries & Dependencies

- **Authentication**: bcryptjs, jsonwebtoken
- **Validation**: Joi
- **HTTP Client**: axios (for inter-service communication)
- **Security**: helmet
- **Logging**: morgan
- **Database**: pg (PostgreSQL driver)

## 🏃‍♂️ Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mikrosevice
```

### 2. Start All Services

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

### 3. Verify Services

Check that all services are running:

```bash
# API Gateway
curl http://localhost:3000/health

# User Service
curl http://localhost:3001/health

# Product Service
curl http://localhost:8080/health

# Order Service
curl http://localhost:3002/health
```

## 📖 API Documentation

### Base URLs

- **API Gateway**: `http://localhost:3000`
- **Direct Service Access** (for development):
  - User Service: `http://localhost:3001`
  - Product Service: `http://localhost:8080`
  - Order Service: `http://localhost:3002`

### Sample API Calls

#### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 2. Create a Product

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High-end gaming laptop",
    "price": 1299.99,
    "stock": 5,
    "category": "Electronics"
  }'
```

#### 3. Create an Order

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "items": [
      {
        "productId": 1,
        "quantity": 2
      }
    ]
  }'
```

#### 4. Get All Orders

```bash
curl http://localhost:3000/api/orders
```

## 🔍 Key Microservice Patterns Demonstrated

### 1. **Database per Service**

Each microservice has its own PostgreSQL database, ensuring data isolation and service independence.

### 2. **API Gateway Pattern**

Single entry point that routes requests to appropriate services, handles CORS, and can implement authentication/authorization.

### 3. **Service-to-Service Communication**

Order Service communicates with User Service and Product Service via HTTP calls to validate data and get additional information.

### 4. **Health Checks**

All services implement health check endpoints for monitoring and orchestration.

### 5. **Containerization**

Each service is containerized with Docker, making deployment and scaling easier.

### 6. **Inter-Service Data Validation**

Order Service validates users and products exist before creating orders, demonstrating service dependencies.

## 🧪 Development

### Running Individual Services

To run services individually for development:

```bash
# User Service
cd user-service
npm install
npm run dev

# Product Service
cd product-service
go mod tidy
go run main.go

# Order Service
cd order-service
npm install
npm run dev

# API Gateway
cd api-gateway
npm install
npm run dev
```

### Database Access

Access databases directly:

```bash
# User Database
docker exec -it mikrosevice-user-db-1 psql -U postgres -d userdb

# Product Database
docker exec -it mikrosevice-product-db-1 psql -U postgres -d productdb

# Order Database
docker exec -it mikrosevice-order-db-1 psql -U postgres -d orderdb
```

## 📊 Monitoring

### Service Health

- API Gateway: http://localhost:3000/health
- User Service: http://localhost:3001/health
- Product Service: http://localhost:8080/health
- Order Service: http://localhost:3002/health

### Logs

```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs user-service
docker-compose logs product-service
docker-compose logs order-service
docker-compose logs api-gateway
```

## 🛡️ Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: JSON Web Tokens for user sessions
- **Input Validation**: Joi schema validation for all endpoints
- **CORS**: Properly configured Cross-Origin Resource Sharing
- **Helmet**: Security headers for Express applications

## 🎯 Learning Objectives

This project demonstrates:

- ✅ Microservice architecture principles
- ✅ Multi-language microservice implementation (Node.js & Go)
- ✅ Database per service pattern
- ✅ Inter-service communication
- ✅ API Gateway pattern
- ✅ Containerization with Docker
- ✅ Service orchestration with Docker Compose
- ✅ Health monitoring and logging
- ✅ RESTful API design
- ✅ Authentication and authorization
- ✅ Input validation and error handling

## 🚪 Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears databases)
docker-compose down -v

# Stop and remove images
docker-compose down --rmi all
```

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000, 3001, 3002, 8080, 5432, 5433, 5434 are available
2. **Docker issues**: Ensure Docker and Docker Compose are installed and running
3. **Database connection errors**: Wait for databases to fully initialize before services start
4. **Service communication errors**: Ensure all services are running and network is properly configured

### Useful Commands

```bash
# Check running containers
docker ps

# View service logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]

# Rebuild specific service
docker-compose up --build [service-name]
```

## 📚 Next Steps

To extend this project, consider adding:

- Message queues (RabbitMQ, Apache Kafka)
- Caching layer (Redis)
- Service mesh (Istio)
- Monitoring and observability (Prometheus, Grafana)
- CI/CD pipeline
- Kubernetes deployment
- Frontend application
- Rate limiting and throttling
- Distributed tracing

# Microservice Backend Management

.PHONY: help build up down logs clean test health

# Default target
help:
	@echo "Microservice Backend Commands:"
	@echo "  make build    - Build all Docker images"
	@echo "  make up       - Start all microservices"
	@echo "  make down     - Stop all microservices"
	@echo "  make logs     - View all service logs"
	@echo "  make clean    - Remove all containers, images, and volumes"
	@echo "  make health   - Check health of all services"
	@echo "  make test     - Run API tests"

# Build all Docker images
build:
	@echo "🔨 Building all microservices..."
	docker-compose build

# Start all services
up:
	@echo "🚀 Starting all microservices..."
	docker-compose up -d
	@echo "✅ All services started!"
	@echo "📊 API Gateway: http://localhost:3000"

# Stop all services
down:
	@echo "🛑 Stopping all microservices..."
	docker-compose down

# View logs
logs:
	@echo "📋 Viewing all service logs..."
	docker-compose logs -f

# Clean everything
clean:
	@echo "🧹 Cleaning up everything..."
	docker-compose down -v --rmi all
	docker system prune -f

# Check service health
health:
	@echo "🏥 Checking service health..."
	@echo "🌐 API Gateway:"
	@curl -s http://localhost:3000/health || echo "❌ API Gateway is down"
	@echo "\n👤 User Service:"
	@curl -s http://localhost:3001/health || echo "❌ User Service is down"
	@echo "\n🛍️ Product Service:"
	@curl -s http://localhost:8080/health || echo "❌ Product Service is down"
	@echo "\n📦 Order Service:"
	@curl -s http://localhost:3002/health || echo "❌ Order Service is down"

# Run basic API tests
test:
	@echo "🧪 Running API tests..."
	@bash ./scripts/test-api.sh 
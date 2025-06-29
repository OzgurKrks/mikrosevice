#!/bin/bash

# API Testing Script for Microservices
# This script tests all the endpoints to ensure they're working correctly

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing Microservice APIs..."
echo "================================"

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    echo -n "Testing: $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$url")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    if [ "$status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${RED}❌ FAIL (Expected: $expected_status, Got: $status)${NC}"
    fi
}

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Test Health Endpoints
echo -e "\n${YELLOW}1. Testing Health Endpoints${NC}"
test_endpoint "GET" "$BASE_URL/health" "" 200 "API Gateway Health"
test_endpoint "GET" "http://localhost:3001/health" "" 200 "User Service Health"
test_endpoint "GET" "http://localhost:8080/health" "" 200 "Product Service Health"
test_endpoint "GET" "http://localhost:3002/health" "" 200 "Order Service Health"

# Test User Service
echo -e "\n${YELLOW}2. Testing User Service${NC}"
test_endpoint "POST" "$BASE_URL/api/users/register" '{"name":"Test User","email":"test@example.com","password":"password123"}' 201 "User Registration"
test_endpoint "POST" "$BASE_URL/api/users/login" '{"email":"test@example.com","password":"password123"}' 200 "User Login"
test_endpoint "GET" "$BASE_URL/api/users" "" 200 "Get All Users"
test_endpoint "GET" "$BASE_URL/api/users/1" "" 200 "Get User by ID"

# Test Product Service
echo -e "\n${YELLOW}3. Testing Product Service${NC}"
test_endpoint "GET" "$BASE_URL/api/products" "" 200 "Get All Products"
test_endpoint "POST" "$BASE_URL/api/products" '{"name":"Test Product","description":"A test product","price":99.99,"stock":10,"category":"Test"}' 201 "Create Product"
test_endpoint "GET" "$BASE_URL/api/products/1" "" 200 "Get Product by ID"

# Test Order Service
echo -e "\n${YELLOW}4. Testing Order Service${NC}"
test_endpoint "GET" "$BASE_URL/api/orders" "" 200 "Get All Orders"
test_endpoint "POST" "$BASE_URL/api/orders" '{"userId":1,"items":[{"productId":1,"quantity":2}]}' 201 "Create Order"
test_endpoint "GET" "$BASE_URL/api/orders/1" "" 200 "Get Order by ID"
test_endpoint "GET" "$BASE_URL/api/orders/user/1" "" 200 "Get Orders by User"

# Test Invalid Endpoints
echo -e "\n${YELLOW}5. Testing Error Handling${NC}"
test_endpoint "GET" "$BASE_URL/api/users/999" "" 404 "Get Non-existent User"
test_endpoint "GET" "$BASE_URL/api/products/999" "" 404 "Get Non-existent Product"
test_endpoint "GET" "$BASE_URL/api/orders/999" "" 404 "Get Non-existent Order"

echo -e "\n${GREEN}🎉 API Testing Complete!${NC}"
echo "================================" 
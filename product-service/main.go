package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

type Product struct {
	ID          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	Price       float64   `json:"price" db:"price"`
	Stock       int       `json:"stock" db:"stock"`
	Category    string    `json:"category" db:"category"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type CreateProductRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description" binding:"required"`
	Price       float64 `json:"price" binding:"required,gt=0"`
	Stock       int     `json:"stock" binding:"required,gte=0"`
	Category    string  `json:"category" binding:"required"`
}

type UpdateProductRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
	Category    string  `json:"category"`
}

var db *sql.DB

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize database
	initDB()
	defer db.Close()

	// Initialize Gin router
	router := gin.Default()

	// Middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Routes
	router.GET("/health", healthCheck)

	api := router.Group("/api/products")
	{
		api.GET("", getProducts)
		api.GET("/:id", getProduct)
		api.POST("", createProduct)
		api.PUT("/:id", updateProduct)
		api.DELETE("/:id", deleteProduct)
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🛍️ Product Service running on port %s", port)
	log.Printf("📊 Health check: http://localhost:%s/health", port)
	log.Fatal(router.Run(":" + port))
}

func initDB() {
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}

	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "productdb"
	}

	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}

	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "password"
	}

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Test connection
	if err = db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	log.Println("✅ Connected to PostgreSQL database")
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "OK",
		"service":   "Product Service",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

func getProducts(c *gin.Context) {
	query := `
		SELECT id, name, description, price, stock, category, created_at, updated_at 
		FROM products 
		ORDER BY created_at DESC
	`

	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Error querying products: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var product Product
		err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.Description,
			&product.Price,
			&product.Stock,
			&product.Category,
			&product.CreatedAt,
			&product.UpdatedAt,
		)
		if err != nil {
			log.Printf("Error scanning product: %v", err)
			continue
		}
		products = append(products, product)
	}

	c.JSON(http.StatusOK, gin.H{"products": products})
}

func getProduct(c *gin.Context) {
	id := c.Param("id")

	query := `
		SELECT id, name, description, price, stock, category, created_at, updated_at 
		FROM products 
		WHERE id = $1
	`

	var product Product
	err := db.QueryRow(query, id).Scan(
		&product.ID,
		&product.Name,
		&product.Description,
		&product.Price,
		&product.Stock,
		&product.Category,
		&product.CreatedAt,
		&product.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	} else if err != nil {
		log.Printf("Error querying product: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"product": product})
}

func createProduct(c *gin.Context) {
	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `
		INSERT INTO products (name, description, price, stock, category, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, name, description, price, stock, category, created_at, updated_at
	`

	var product Product
	err := db.QueryRow(query, req.Name, req.Description, req.Price, req.Stock, req.Category).Scan(
		&product.ID,
		&product.Name,
		&product.Description,
		&product.Price,
		&product.Stock,
		&product.Category,
		&product.CreatedAt,
		&product.UpdatedAt,
	)

	if err != nil {
		log.Printf("Error creating product: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Product created successfully",
		"product": product,
	})
}

func updateProduct(c *gin.Context) {
	id := c.Param("id")

	var req UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Build dynamic update query
	updates := []string{}
	args := []interface{}{}
	argIndex := 1

	if req.Name != "" {
		updates = append(updates, fmt.Sprintf("name = $%d", argIndex))
		args = append(args, req.Name)
		argIndex++
	}

	if req.Description != "" {
		updates = append(updates, fmt.Sprintf("description = $%d", argIndex))
		args = append(args, req.Description)
		argIndex++
	}

	if req.Price > 0 {
		updates = append(updates, fmt.Sprintf("price = $%d", argIndex))
		args = append(args, req.Price)
		argIndex++
	}

	if req.Stock >= 0 {
		updates = append(updates, fmt.Sprintf("stock = $%d", argIndex))
		args = append(args, req.Stock)
		argIndex++
	}

	if req.Category != "" {
		updates = append(updates, fmt.Sprintf("category = $%d", argIndex))
		args = append(args, req.Category)
		argIndex++
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	updates = append(updates, fmt.Sprintf("updated_at = NOW()"))
	args = append(args, id)

	query := fmt.Sprintf(`
		UPDATE products 
		SET %s 
		WHERE id = $%d
		RETURNING id, name, description, price, stock, category, created_at, updated_at
	`, strings.Join(updates, ", "), argIndex)

	var product Product
	err := db.QueryRow(query, args...).Scan(
		&product.ID,
		&product.Name,
		&product.Description,
		&product.Price,
		&product.Stock,
		&product.Category,
		&product.CreatedAt,
		&product.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	} else if err != nil {
		log.Printf("Error updating product: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Product updated successfully",
		"product": product,
	})
}

func deleteProduct(c *gin.Context) {
	id := c.Param("id")

	query := "DELETE FROM products WHERE id = $1"
	result, err := db.Exec(query, id)
	if err != nil {
		log.Printf("Error deleting product: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

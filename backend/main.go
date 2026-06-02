package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/kinetic/hr-backend/config"
	"github.com/kinetic/hr-backend/database"
	"github.com/kinetic/hr-backend/middleware"
	"github.com/kinetic/hr-backend/routes"
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}
}

func main() {
	cfg := config.New()

	db, err := database.Initialize(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	if err := database.Migrate(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	if err := database.SeedData(db); err != nil {
		log.Fatalf("Failed to seed initial data: %v", err)
	}

	gin.SetMode(cfg.GinMode)
	router := gin.Default()

	router.Use(middleware.CORSMiddleware())
	router.Use(middleware.ErrorHandler())

	routes.RegisterRoutes(router, db)

	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on :%s\n", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

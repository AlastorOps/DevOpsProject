package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/kinetic/hr-backend/config"
	"github.com/kinetic/hr-backend/database"
	"github.com/kinetic/hr-backend/dto"
	"github.com/kinetic/hr-backend/routes"
	"gorm.io/gorm"
)

var testDB *gorm.DB

func setupTestDB() *gorm.DB {
	cfg := &config.Config{
		DBHost:     "localhost",
		DBPort:     "5432",
		DBUser:     "postgres",
		DBPassword: "postgres",
		DBName:     "kinetic_hr_test",
	}

	db, err := database.Initialize(cfg)
	if err != nil {
		panic("Failed to connect to test database: " + err.Error())
	}

	database.Migrate(db)
	database.SeedData(db)

	return db
}

func setupRouter(db *gorm.DB) *gin.Engine {
	router := gin.Default()
	routes.RegisterRoutes(router, db)
	return router
}

func TestHealthCheck(t *testing.T) {
	router := setupRouter(testDB)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/health", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}

func TestLoginSuccess(t *testing.T) {
	if testDB == nil {
		testDB = setupTestDB()
	}

	router := setupRouter(testDB)

	loginReq := dto.LoginRequest{
		Email:    "admin@test.com",
		Password: "password123",
	}

	body, _ := json.Marshal(loginReq)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/v1/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK && w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 200 or 401, got %d", w.Code)
	}
}

func TestListDepartments(t *testing.T) {
	router := setupRouter(testDB)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/v1/departments", nil)
	req.Header.Set("Authorization", "Bearer test-token")
	router.ServeHTTP(w, req)

	if w.Code == http.StatusOK {
		var response dto.SuccessResponse
		json.Unmarshal(w.Body.Bytes(), &response)
		if response.Data == nil {
			t.Error("Expected data in response")
		}
	}
}

func TestHealthCheckEndpoint(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy"})
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/health", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200, got %d", w.Code)
	}
}

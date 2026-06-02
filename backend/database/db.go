package database

import (
	"fmt"

	"github.com/kinetic/hr-backend/config"
	"github.com/kinetic/hr-backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Initialize(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	return db, nil
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.Role{},
		&models.Permission{},
		&models.UserRole{},
		&models.Department{},
		&models.Position{},
		&models.Employee{},
		&models.Attendance{},
		&models.LeaveType{},
		&models.LeaveBalance{},
		&models.LeaveRequest{},
		&models.Payroll{},
		&models.PerformanceReview{},
		&models.PerformanceKPI{},
	)
}

func SeedData(db *gorm.DB) error {
	leaveTypes := []models.LeaveType{
		{Name: "Annual Leave", Description: "Annual paid leave", MaxDays: 20, Paid: true},
		{Name: "Sick Leave", Description: "Sick leave for medical reasons", MaxDays: 10, Paid: true},
		{Name: "Personal Leave", Description: "Personal/casual leave", MaxDays: 5, Paid: false},
		{Name: "Maternity Leave", Description: "Maternity leave", MaxDays: 90, Paid: true},
		{Name: "Paternity Leave", Description: "Paternity leave", MaxDays: 14, Paid: true},
	}

	for _, lt := range leaveTypes {
		if err := db.Where("name = ?", lt.Name).FirstOrCreate(&lt).Error; err != nil {
			return err
		}
	}

	return nil
}

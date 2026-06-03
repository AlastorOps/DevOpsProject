package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/kinetic/hr-backend/config"
	"github.com/kinetic/hr-backend/handler"
	"github.com/kinetic/hr-backend/middleware"
	"github.com/kinetic/hr-backend/repository"
	"github.com/kinetic/hr-backend/service"
	"gorm.io/gorm"
)

func RegisterRoutes(router *gin.Engine, db *gorm.DB) {
	cfg := config.New()

	userRepo := repository.NewUserRepository(db)
	empRepo := repository.NewEmployeeRepository(db)
	deptRepo := repository.NewDepartmentRepository(db)
	posRepo := repository.NewPositionRepository(db)
	attRepo := repository.NewAttendanceRepository(db)
	leaveTypeRepo := repository.NewLeaveTypeRepository(db)
	leaveBalRepo := repository.NewLeaveBalanceRepository(db)
	leaveReqRepo := repository.NewLeaveRequestRepository(db)
	payrollRepo := repository.NewPayrollRepository(db)
	perfRepo := repository.NewPerformanceReviewRepository(db)

	authService := service.NewAuthService(userRepo, cfg)
	empService := service.NewEmployeeServiceFull(empRepo, userRepo, leaveBalRepo, leaveTypeRepo, cfg)
	deptService := service.NewDepartmentService(deptRepo)
	posService := service.NewPositionService(posRepo)
	attService := service.NewAttendanceService(attRepo)
	leaveService := service.NewLeaveService(leaveReqRepo, leaveBalRepo, leaveTypeRepo)
	payrollService := service.NewPayrollService(payrollRepo, empRepo)
	perfService := service.NewPerformanceService(perfRepo)

	authHandler := handler.NewAuthHandler(authService)
	empHandler := handler.NewEmployeeHandler(empService)
	deptHandler := handler.NewDepartmentHandler(deptService)
	posHandler := handler.NewPositionHandler(posService)
	attHandler := handler.NewAttendanceHandler(attService)
	leaveHandler := handler.NewLeaveHandler(leaveService)
	payrollHandler := handler.NewPayrollHandler(payrollService)
	perfHandler := handler.NewPerformanceHandler(perfService)
	healthHandler := handler.NewHealthHandler()

	protected := middleware.AuthMiddleware(cfg)

	router.GET("/health", healthHandler.HealthCheck)
	router.POST("/api/v1/auth/login", authHandler.Login)

	api := router.Group("/api/v1")

	employees := api.Group("/employees")
	{
		employees.POST("", protected, empHandler.CreateEmployee)
		employees.GET("", protected, empHandler.ListEmployees)
		employees.GET("/:id", protected, empHandler.GetEmployee)
		employees.PUT("/:id", protected, empHandler.UpdateEmployee)
		employees.DELETE("/:id", protected, empHandler.DeleteEmployee)
	}

	departments := api.Group("/departments")
	{
		departments.POST("", protected, deptHandler.CreateDepartment)
		departments.GET("", protected, deptHandler.ListDepartments)
		departments.GET("/:id", protected, deptHandler.GetDepartment)
		departments.PUT("/:id", protected, deptHandler.UpdateDepartment)
		departments.DELETE("/:id", protected, deptHandler.DeleteDepartment)
	}

	positions := api.Group("/positions")
	{
		positions.POST("", protected, posHandler.CreatePosition)
		positions.GET("", protected, posHandler.ListPositions)
		positions.PUT("/:id", protected, posHandler.UpdatePosition)
		positions.DELETE("/:id", protected, posHandler.DeletePosition)
	}

	attendance := api.Group("/attendance")
	{
		attendance.POST("", protected, attHandler.MarkAttendance)
		attendance.GET("/employee/:employee_id", protected, attHandler.GetEmployeeAttendance)
	}

	leave := api.Group("/leave")
	{
		leave.POST("/request/:employee_id", protected, leaveHandler.RequestLeave)
		leave.GET("/balance/:employee_id", protected, leaveHandler.GetLeaveBalance)
		leave.GET("/pending", protected, leaveHandler.GetPendingRequests)
		leave.PUT("/approve/:request_id", protected, leaveHandler.ApproveLeave)
		leave.PUT("/reject/:request_id", protected, leaveHandler.RejectLeave)
	}

	payroll := api.Group("/payroll")
	{
		payroll.POST("", protected, payrollHandler.RunPayroll)
		payroll.GET("", protected, payrollHandler.ListPayroll)
		payroll.PUT("/approve/:id", protected, payrollHandler.ApprovePayroll)
	}

	performance := api.Group("/performance")
	{
		performance.GET("/reviews/:employee_id", protected, perfHandler.GetPerformanceReviews)
	}

	router.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "route not found"})
	})
}

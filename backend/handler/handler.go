package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/kinetic/hr-backend/dto"
	"github.com/kinetic/hr-backend/service"
	"github.com/kinetic/hr-backend/utils"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(as *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: as}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Message: "Invalid request", Details: err.Error()})
		return
	}

	res, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Data: res, Message: "Login successful"})
}

type EmployeeHandler struct {
	empService *service.EmployeeService
}

func NewEmployeeHandler(es *service.EmployeeService) *EmployeeHandler {
	return &EmployeeHandler{empService: es}
}

func (h *EmployeeHandler) CreateEmployee(c *gin.Context) {
	var req dto.CreateEmployeeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Message: "Invalid request", Details: err.Error()})
		return
	}

	emp, err := h.empService.CreateEmployee(&req)
	if err != nil {
		if err.Error() == "email already exists" {
			c.JSON(http.StatusConflict, dto.ErrorResponse{Message: err.Error()})
			return
		}
		if err.Error() == "password must be at least 8 characters" || err.Error() == "name and email are required" {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{Message: err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: "Failed to create employee"})
		return
	}

	c.JSON(http.StatusCreated, dto.SuccessResponse{Data: emp, Message: "Employee created successfully"})
}

func (h *EmployeeHandler) GetEmployee(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Message: "Invalid employee ID"})
		return
	}

	emp, err := h.empService.GetEmployee(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Message: "Employee not found"})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Data: emp, Message: "Employee retrieved"})
}

func (h *EmployeeHandler) ListEmployees(c *gin.Context) {
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")
	search := c.Query("search")

	p, _ := strconv.Atoi(page)
	ps, _ := strconv.Atoi(pageSize)

	var employees interface{}
	var total int64
	var err error

	if search != "" {
		employees, total, err = h.empService.SearchEmployees(search, p, ps)
	} else {
		employees, total, err = h.empService.ListEmployees(p, ps)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	totalPages := int(total) / ps
	if int(total)%ps > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, dto.ListResponse{
		Data:       employees,
		Total:      total,
		Page:       p,
		PageSize:   ps,
		TotalPages: totalPages,
	})
}

func (h *EmployeeHandler) UpdateEmployee(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Message: "Invalid employee ID"})
		return
	}

	var req dto.UpdateEmployeeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Message: "Invalid request", Details: err.Error()})
		return
	}

	emp, err := h.empService.UpdateEmployee(uint(id), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Data: emp, Message: "Employee updated successfully"})
}

func (h *EmployeeHandler) DeleteEmployee(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Message: "Invalid employee ID"})
		return
	}

	err = h.empService.DeleteEmployee(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Message: "Employee deleted successfully"})
}

type DepartmentHandler struct {
	deptService *service.DepartmentService
}

func NewDepartmentHandler(ds *service.DepartmentService) *DepartmentHandler {
	return &DepartmentHandler{deptService: ds}
}

func (h *DepartmentHandler) CreateDepartment(c *gin.Context) {
	var req dto.CreateDepartmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Message: "Invalid request"})
		return
	}

	dept, err := h.deptService.CreateDepartment(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dto.SuccessResponse{Data: dept, Message: "Department created"})
}

func (h *DepartmentHandler) GetDepartment(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	dept, err := h.deptService.GetDepartment(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Message: "Department not found"})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Data: dept})
}

func (h *DepartmentHandler) ListDepartments(c *gin.Context) {
	depts, err := h.deptService.ListDepartments()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Data: depts})
}

func (h *DepartmentHandler) UpdateDepartment(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var req dto.UpdateDepartmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Message: "Invalid request"})
		return
	}

	dept, err := h.deptService.UpdateDepartment(uint(id), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Data: dept, Message: "Department updated"})
}

func (h *DepartmentHandler) DeleteDepartment(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	err := h.deptService.DeleteDepartment(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Message: "Department deleted"})
}

type PositionHandler struct {
	posService *service.PositionService
}

func NewPositionHandler(ps *service.PositionService) *PositionHandler {
	return &PositionHandler{posService: ps}
}

func (h *PositionHandler) CreatePosition(c *gin.Context) {
	var req dto.CreatePositionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Message: "Invalid request"})
		return
	}

	pos, err := h.posService.CreatePosition(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dto.SuccessResponse{Data: pos, Message: "Position created"})
}

func (h *PositionHandler) ListPositions(c *gin.Context) {
	positions, err := h.posService.ListPositions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Data: positions})
}

func (h *PositionHandler) UpdatePosition(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var req dto.UpdatePositionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Message: "Invalid request"})
		return
	}

	pos, err := h.posService.UpdatePosition(uint(id), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Data: pos})
}

func (h *PositionHandler) DeletePosition(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	err := h.posService.DeletePosition(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Message: "Position deleted"})
}

type AttendanceHandler struct {
	attService *service.AttendanceService
}

func NewAttendanceHandler(as *service.AttendanceService) *AttendanceHandler {
	return &AttendanceHandler{attService: as}
}

func (h *AttendanceHandler) MarkAttendance(c *gin.Context) {
	var req dto.MarkAttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Message: "Invalid request"})
		return
	}

	att, err := h.attService.MarkAttendance(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dto.SuccessResponse{Data: att, Message: "Attendance marked"})
}

func (h *AttendanceHandler) GetEmployeeAttendance(c *gin.Context) {
	empID, _ := strconv.ParseUint(c.Param("employee_id"), 10, 32)
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")

	p, _ := strconv.Atoi(page)
	ps, _ := strconv.Atoi(pageSize)

	records, total, err := h.attService.GetEmployeeAttendance(uint(empID), p, ps)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.ListResponse{Data: records, Total: total, Page: p, PageSize: ps})
}

type LeaveHandler struct {
	leaveService *service.LeaveService
}

func NewLeaveHandler(ls *service.LeaveService) *LeaveHandler {
	return &LeaveHandler{leaveService: ls}
}

func (h *LeaveHandler) RequestLeave(c *gin.Context) {
	empID, _ := strconv.ParseUint(c.Param("employee_id"), 10, 32)

	var req dto.CreateLeaveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Message: "Invalid request"})
		return
	}

	leave, err := h.leaveService.RequestLeave(uint(empID), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dto.SuccessResponse{Data: leave, Message: "Leave request submitted"})
}

func (h *LeaveHandler) GetLeaveBalance(c *gin.Context) {
	empID, _ := strconv.ParseUint(c.Param("employee_id"), 10, 32)

	balances, err := h.leaveService.GetLeaveBalance(uint(empID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Data: balances})
}

func (h *LeaveHandler) GetPendingRequests(c *gin.Context) {
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")

	p, _ := strconv.Atoi(page)
	ps, _ := strconv.Atoi(pageSize)

	leaves, total, err := h.leaveService.GetPendingLeaveRequests(p, ps)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.ListResponse{Data: leaves, Total: total, Page: p, PageSize: ps})
}

func (h *LeaveHandler) ApproveLeave(c *gin.Context) {
	reqID, _ := strconv.ParseUint(c.Param("request_id"), 10, 32)
	approverID := c.GetUint("user_id")

	leave, err := h.leaveService.ApproveLeaveRequest(uint(reqID), approverID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Data: leave, Message: "Leave approved"})
}

func (h *LeaveHandler) RejectLeave(c *gin.Context) {
	reqID, _ := strconv.ParseUint(c.Param("request_id"), 10, 32)
	approverID := c.GetUint("user_id")

	leave, err := h.leaveService.RejectLeaveRequest(uint(reqID), approverID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Data: leave, Message: "Leave rejected"})
}

type PayrollHandler struct {
	payrollService *service.PayrollService
}

func NewPayrollHandler(ps *service.PayrollService) *PayrollHandler {
	return &PayrollHandler{payrollService: ps}
}

func (h *PayrollHandler) RunPayroll(c *gin.Context) {
	var req dto.RunPayrollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Message: "Invalid request"})
		return
	}

	payroll, err := h.payrollService.RunPayroll(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, dto.SuccessResponse{Data: payroll, Message: "Payroll created"})
}

func (h *PayrollHandler) ListPayroll(c *gin.Context) {
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")

	p, _ := strconv.Atoi(page)
	ps, _ := strconv.Atoi(pageSize)

	records, total, err := h.payrollService.ListPayroll(p, ps)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.ListResponse{Data: records, Total: total, Page: p, PageSize: ps})
}

func (h *PayrollHandler) ApprovePayroll(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	payroll, err := h.payrollService.ApprovePayroll(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Data: payroll, Message: "Payroll approved"})
}

type PerformanceHandler struct {
	perfService *service.PerformanceService
}

func NewPerformanceHandler(ps *service.PerformanceService) *PerformanceHandler {
	return &PerformanceHandler{perfService: ps}
}

func (h *PerformanceHandler) GetPerformanceReviews(c *gin.Context) {
	empID, _ := strconv.ParseUint(c.Param("employee_id"), 10, 32)

	reviews, err := h.perfService.GetPerformanceReviews(uint(empID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{Data: reviews})
}

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

func (h *HealthHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "healthy", "message": "Kinetic HR API is running"})
}

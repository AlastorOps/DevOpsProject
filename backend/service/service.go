package service

import (
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/kinetic/hr-backend/config"
	"github.com/kinetic/hr-backend/dto"
	"github.com/kinetic/hr-backend/models"
	"github.com/kinetic/hr-backend/repository"
	"github.com/kinetic/hr-backend/utils"
)

type AuthService struct {
	userRepo *repository.UserRepository
	config   *config.Config
}

func NewAuthService(ur *repository.UserRepository, cfg *config.Config) *AuthService {
	return &AuthService{userRepo: ur, config: cfg}
}

func (s *AuthService) Login(email, password string) (*dto.LoginResponse, error) {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if !utils.CheckPassword(user.Password, password) {
		return nil, errors.New("invalid credentials")
	}

	if !user.Active {
		return nil, errors.New("user account is inactive")
	}

	token, err := utils.GenerateToken(user.ID, user.Email, user.Username, s.config)
	if err != nil {
		return nil, err
	}

	return &dto.LoginResponse{
		Token: token,
		User: dto.UserDTO{
			ID:        user.ID,
			Email:     user.Email,
			Username:  user.Username,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			Active:    user.Active,
		},
	}, nil
}

type EmployeeService struct {
	empRepo      *repository.EmployeeRepository
	userRepo     *repository.UserRepository
	leaveBalRepo *repository.LeaveBalanceRepository
	leaveTypeRepo *repository.LeaveTypeRepository
	config       *config.Config
}

func NewEmployeeService(er *repository.EmployeeRepository, ur *repository.UserRepository, cfg *config.Config) *EmployeeService {
	return &EmployeeService{empRepo: er, userRepo: ur, config: cfg}
}

func NewEmployeeServiceFull(er *repository.EmployeeRepository, ur *repository.UserRepository, lbr *repository.LeaveBalanceRepository, ltr *repository.LeaveTypeRepository, cfg *config.Config) *EmployeeService {
	return &EmployeeService{empRepo: er, userRepo: ur, leaveBalRepo: lbr, leaveTypeRepo: ltr, config: cfg}
}

func (s *EmployeeService) CreateEmployee(req *dto.CreateEmployeeRequest) (*models.Employee, error) {
	if req.Name == "" || req.Email == "" {
		return nil, errors.New("name and email are required")
	}

	if len(req.Password) < 8 {
		return nil, errors.New("password must be at least 8 characters")
	}

	existingUser, _ := s.userRepo.FindByEmail(req.WorkEmail)
	if existingUser.ID != 0 {
		return nil, errors.New("email already exists")
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := &models.User{
		Email:     req.WorkEmail,
		Username:  req.Username,
		Password:  hashedPassword,
		FirstName: req.Name,
		Active:    req.AccountActive,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, errors.New("failed to create user account")
	}

	employee := &models.Employee{
		Name:           req.Name,
		Email:          req.Email,
		Phone:          req.Phone,
		Gender:         req.Gender,
		DOB:            req.DOB,
		Address:        req.Address,
		EmployeeID:     req.EmployeeID,
		HireDate:       req.HireDate,
		EmploymentType: req.EmploymentType,
		Salary:         req.Salary,
		Status:         "Active",
		DepartmentID:   req.DepartmentID,
		PositionID:     req.PositionID,
		UserID:         user.ID,
	}

	if err := s.empRepo.Create(employee); err != nil {
		s.userRepo.DeleteUser(user.ID)
		return nil, errors.New("failed to create employee record")
	}

	if s.leaveTypeRepo != nil && s.leaveBalRepo != nil {
		leaveTypes, _ := s.leaveTypeRepo.FindAll()
		year := time.Now().Year()
		for _, lt := range leaveTypes {
			balance := &models.LeaveBalance{
				EmployeeID:  employee.ID,
				LeaveTypeID: lt.ID,
				Total:       lt.MaxDays,
				Used:        0,
				Year:        year,
			}
			s.leaveBalRepo.Create(balance)
		}
	}

	return employee, nil
}

func (s *EmployeeService) GetEmployee(id uint) (*models.Employee, error) {
	return s.empRepo.FindByID(id)
}

func (s *EmployeeService) ListEmployees(page, pageSize int) ([]models.Employee, int64, error) {
	offset := (page - 1) * pageSize
	return s.empRepo.FindAll(offset, pageSize)
}

func (s *EmployeeService) SearchEmployees(search string, page, pageSize int) ([]models.Employee, int64, error) {
	offset := (page - 1) * pageSize
	return s.empRepo.Search(search, offset, pageSize)
}

func (s *EmployeeService) UpdateEmployee(id uint, req *dto.UpdateEmployeeRequest) (*models.Employee, error) {
	emp, err := s.empRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if req.Name != "" {
		emp.Name = req.Name
	}
	if req.Email != "" {
		emp.Email = req.Email
	}
	if req.Phone != "" {
		emp.Phone = req.Phone
	}
	if req.Gender != "" {
		emp.Gender = req.Gender
	}
	if req.DOB != "" {
		emp.DOB = req.DOB
	}
	if req.Address != "" {
		emp.Address = req.Address
	}
	if req.Status != "" {
		emp.Status = req.Status
	}
	if req.HireDate != "" {
		emp.HireDate = req.HireDate
	}
	if req.EmploymentType != "" {
		emp.EmploymentType = req.EmploymentType
	}
	if req.Salary > 0 {
		emp.Salary = req.Salary
	}
	if req.DepartmentID > 0 {
		emp.DepartmentID = req.DepartmentID
	}
	if req.PositionID > 0 {
		emp.PositionID = req.PositionID
	}

	if err := s.empRepo.Update(emp); err != nil {
		return nil, err
	}

	return emp, nil
}

func (s *EmployeeService) DeleteEmployee(id uint) error {
	return s.empRepo.Delete(id)
}

type DepartmentService struct {
	deptRepo *repository.DepartmentRepository
}

func NewDepartmentService(dr *repository.DepartmentRepository) *DepartmentService {
	return &DepartmentService{deptRepo: dr}
}

func (s *DepartmentService) CreateDepartment(req *dto.CreateDepartmentRequest) (*models.Department, error) {
	dept := &models.Department{
		Name:   req.Name,
		Head:   req.Head,
		Budget: req.Budget,
		Status: "Active",
	}

	if err := s.deptRepo.Create(dept); err != nil {
		return nil, err
	}

	return dept, nil
}

func (s *DepartmentService) GetDepartment(id uint) (*models.Department, error) {
	return s.deptRepo.FindByID(id)
}

func (s *DepartmentService) ListDepartments() ([]models.Department, error) {
	return s.deptRepo.FindAll()
}

func (s *DepartmentService) UpdateDepartment(id uint, req *dto.UpdateDepartmentRequest) (*models.Department, error) {
	dept, err := s.deptRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if req.Name != "" {
		dept.Name = req.Name
	}
	if req.Head != "" {
		dept.Head = req.Head
	}
	if req.Budget != "" {
		dept.Budget = req.Budget
	}
	if req.Status != "" {
		dept.Status = req.Status
	}

	if err := s.deptRepo.Update(dept); err != nil {
		return nil, err
	}

	return dept, nil
}

func (s *DepartmentService) DeleteDepartment(id uint) error {
	return s.deptRepo.Delete(id)
}

type PositionService struct {
	posRepo *repository.PositionRepository
}

func NewPositionService(pr *repository.PositionRepository) *PositionService {
	return &PositionService{posRepo: pr}
}

func (s *PositionService) CreatePosition(req *dto.CreatePositionRequest) (*models.Position, error) {
	pos := &models.Position{
		Title:        req.Title,
		Level:        req.Level,
		Headcount:    req.Headcount,
		Openings:     req.Openings,
		Salary:       req.Salary,
		DepartmentID: req.DepartmentID,
	}

	if err := s.posRepo.Create(pos); err != nil {
		return nil, err
	}

	return pos, nil
}

func (s *PositionService) GetPosition(id uint) (*models.Position, error) {
	return s.posRepo.FindByID(id)
}

func (s *PositionService) ListPositions() ([]models.Position, error) {
	return s.posRepo.FindAll()
}

func (s *PositionService) UpdatePosition(id uint, req *dto.UpdatePositionRequest) (*models.Position, error) {
	pos, err := s.posRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if req.Title != "" {
		pos.Title = req.Title
	}
	if req.Level != "" {
		pos.Level = req.Level
	}
	if req.Headcount > 0 {
		pos.Headcount = req.Headcount
	}
	if req.Openings >= 0 {
		pos.Openings = req.Openings
	}
	if req.Salary != "" {
		pos.Salary = req.Salary
	}

	if err := s.posRepo.Update(pos); err != nil {
		return nil, err
	}

	return pos, nil
}

func (s *PositionService) DeletePosition(id uint) error {
	return s.posRepo.Delete(id)
}

type AttendanceService struct {
	attRepo *repository.AttendanceRepository
}

func NewAttendanceService(ar *repository.AttendanceRepository) *AttendanceService {
	return &AttendanceService{attRepo: ar}
}

func (s *AttendanceService) MarkAttendance(req *dto.MarkAttendanceRequest) (*models.Attendance, error) {
	if req.EmployeeID == 0 {
		return nil, errors.New("employee ID is required")
	}

	if req.Status == "" {
		return nil, errors.New("status is required")
	}

	validStatuses := map[string]bool{"Present": true, "Late": true, "Absent": true, "On Leave": true}
	if !validStatuses[req.Status] {
		return nil, errors.New("invalid status")
	}

	date := time.Now().UTC().Truncate(24 * time.Hour)
	if req.Date != "" {
		parsedDate, err := time.Parse("2006-01-02", req.Date)
		if err != nil {
			return nil, errors.New("invalid date format (use YYYY-MM-DD)")
		}
		date = parsedDate.UTC().Truncate(24 * time.Hour)
	}

	existing, _ := s.attRepo.FindByEmployeeAndDate(req.EmployeeID, date.Format("2006-01-02"))
	if existing.ID != 0 {
		return nil, errors.New("attendance already marked for this date")
	}

	att := &models.Attendance{
		EmployeeID: req.EmployeeID,
		Date:       date,
		Status:     req.Status,
	}

	if req.CheckInTime != nil && *req.CheckInTime != "" {
		t, err := time.Parse("15:04", *req.CheckInTime)
		if err != nil {
			return nil, errors.New("invalid check-in time format (use HH:MM)")
		}
		att.CheckInTime = &t
	}

	if req.CheckOutTime != nil && *req.CheckOutTime != "" {
		t, err := time.Parse("15:04", *req.CheckOutTime)
		if err != nil {
			return nil, errors.New("invalid check-out time format (use HH:MM)")
		}
		att.CheckOutTime = &t
	}

	if att.CheckInTime != nil && att.CheckOutTime != nil {
		duration := att.CheckOutTime.Sub(*att.CheckInTime)
		if duration < 0 {
			return nil, errors.New("check-out time cannot be before check-in time")
		}
		hours := duration.Hours()
		att.Hours = &hours
	}

	if err := s.attRepo.Create(att); err != nil {
		return nil, errors.New("failed to mark attendance")
	}

	return att, nil
}

func (s *AttendanceService) GetEmployeeAttendance(employeeID uint, page, pageSize int) ([]models.Attendance, int64, error) {
	offset := (page - 1) * pageSize
	return s.attRepo.FindByEmployeeID(employeeID, offset, pageSize)
}

type LeaveService struct {
	leaveReqRepo  *repository.LeaveRequestRepository
	leaveBalRepo  *repository.LeaveBalanceRepository
	leaveTypeRepo *repository.LeaveTypeRepository
}

func NewLeaveService(lr *repository.LeaveRequestRepository, lb *repository.LeaveBalanceRepository, lt *repository.LeaveTypeRepository) *LeaveService {
	return &LeaveService{leaveReqRepo: lr, leaveBalRepo: lb, leaveTypeRepo: lt}
}

func (s *LeaveService) RequestLeave(employeeID uint, req *dto.CreateLeaveRequest) (*models.LeaveRequest, error) {
	if employeeID == 0 {
		return nil, errors.New("invalid employee ID")
	}

	if req.LeaveTypeID == 0 {
		return nil, errors.New("leave type is required")
	}

	if req.StartDate == "" || req.EndDate == "" {
		return nil, errors.New("start and end dates are required")
	}

	if req.Reason == "" || len(req.Reason) < 3 {
		return nil, errors.New("reason must be at least 3 characters")
	}

	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return nil, errors.New("invalid start date format (use YYYY-MM-DD)")
	}

	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		return nil, errors.New("invalid end date format (use YYYY-MM-DD)")
	}

	if endDate.Before(startDate) {
		return nil, errors.New("end date cannot be before start date")
	}

	days := int(math.Ceil(endDate.Sub(startDate).Hours() / 24))
	if days == 0 {
		days = 1
	}

	balance, _ := s.leaveBalRepo.FindByEmployeeAndType(employeeID, req.LeaveTypeID)
	if balance != nil && (balance.Total-balance.Used) < days {
		return nil, errors.New("insufficient leave balance")
	}

	leave := &models.LeaveRequest{
		EmployeeID:  employeeID,
		LeaveTypeID: req.LeaveTypeID,
		StartDate:   startDate,
		EndDate:     endDate,
		Days:        days,
		Reason:      req.Reason,
		Status:      "Pending",
	}

	if err := s.leaveReqRepo.Create(leave); err != nil {
		return nil, errors.New("failed to create leave request")
	}

	return leave, nil
}

func (s *LeaveService) GetLeaveBalance(employeeID uint) ([]models.LeaveBalance, error) {
	return s.leaveBalRepo.FindByEmployeeID(employeeID)
}

func (s *LeaveService) GetEmployeeLeaveRequests(employeeID uint, page, pageSize int) ([]models.LeaveRequest, int64, error) {
	offset := (page - 1) * pageSize
	return s.leaveReqRepo.FindByEmployeeID(employeeID, offset, pageSize)
}

func (s *LeaveService) GetPendingLeaveRequests(page, pageSize int) ([]models.LeaveRequest, int64, error) {
	offset := (page - 1) * pageSize
	return s.leaveReqRepo.FindPending(offset, pageSize)
}

func (s *LeaveService) ApproveLeaveRequest(requestID uint, approverID uint) (*models.LeaveRequest, error) {
	leave, err := s.leaveReqRepo.FindByID(requestID)
	if err != nil {
		return nil, err
	}

	leave.Status = "Approved"
	leave.ApprovedBy = &approverID
	now := time.Now()
	leave.ApprovedAt = &now

	balance, _ := s.leaveBalRepo.FindByEmployeeAndType(leave.EmployeeID, leave.LeaveTypeID)
	if balance != nil {
		balance.Used += leave.Days
		s.leaveBalRepo.Update(balance)
	}

	if err := s.leaveReqRepo.Update(leave); err != nil {
		return nil, err
	}

	return leave, nil
}

func (s *LeaveService) RejectLeaveRequest(requestID uint, approverID uint) (*models.LeaveRequest, error) {
	leave, err := s.leaveReqRepo.FindByID(requestID)
	if err != nil {
		return nil, err
	}

	leave.Status = "Rejected"
	leave.ApprovedBy = &approverID
	now := time.Now()
	leave.ApprovedAt = &now

	if err := s.leaveReqRepo.Update(leave); err != nil {
		return nil, err
	}

	return leave, nil
}

type PayrollService struct {
	payrollRepo *repository.PayrollRepository
	empRepo     *repository.EmployeeRepository
}

func NewPayrollService(pr *repository.PayrollRepository, er *repository.EmployeeRepository) *PayrollService {
	return &PayrollService{payrollRepo: pr, empRepo: er}
}

func (s *PayrollService) RunPayroll(req *dto.RunPayrollRequest) (*models.Payroll, error) {
	if req.EmployeeID == 0 {
		return nil, errors.New("employee ID is required")
	}

	if req.BasicSalary <= 0 {
		return nil, errors.New("basic salary must be greater than zero")
	}

	if req.Bonus < 0 {
		return nil, errors.New("bonus cannot be negative")
	}

	if req.Deductions < 0 {
		return nil, errors.New("deductions cannot be negative")
	}

	emp, err := s.empRepo.FindByID(req.EmployeeID)
	if err != nil {
		return nil, errors.New("employee not found")
	}

	if emp == nil {
		return nil, errors.New("employee does not exist")
	}

	month := req.Month
	if month == "" {
		month = time.Now().Format("January 2006")
	}

	tax := req.BasicSalary * 0.14
	netSalary := req.BasicSalary + req.Bonus - req.Deductions - tax

	payroll := &models.Payroll{
		EmployeeID:  req.EmployeeID,
		Month:       month,
		BasicSalary: req.BasicSalary,
		Bonus:       req.Bonus,
		Deductions:  req.Deductions,
		Tax:         tax,
		NetSalary:   netSalary,
		Status:      "Pending",
		PayrollID:   fmt.Sprintf("#PR-2024-%d-%d", req.EmployeeID, time.Now().UnixNano()%100000),
	}

	if err := s.payrollRepo.Create(payroll); err != nil {
		return nil, errors.New("failed to create payroll record")
	}

	return payroll, nil
}

func (s *PayrollService) GetPayroll(id uint) (*models.Payroll, error) {
	return s.payrollRepo.FindByID(id)
}

func (s *PayrollService) ListPayroll(page, pageSize int) ([]models.Payroll, int64, error) {
	offset := (page - 1) * pageSize
	return s.payrollRepo.FindAll(offset, pageSize)
}

func (s *PayrollService) ApprovePayroll(id uint) (*models.Payroll, error) {
	payroll, err := s.payrollRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	payroll.Status = "Paid"
	now := time.Now()
	payroll.PaidDate = &now

	if err := s.payrollRepo.Update(payroll); err != nil {
		return nil, err
	}

	return payroll, nil
}

type PerformanceService struct {
	perfRepo *repository.PerformanceReviewRepository
}

func NewPerformanceService(pr *repository.PerformanceReviewRepository) *PerformanceService {
	return &PerformanceService{perfRepo: pr}
}

func (s *PerformanceService) GetPerformanceReviews(employeeID uint) ([]models.PerformanceReview, error) {
	return s.perfRepo.FindByEmployeeID(employeeID)
}

package repository

import (
	"github.com/kinetic/hr-backend/models"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db}
}

func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).Preload("Roles").First(&user).Error
	return &user, err
}

func (r *UserRepository) FindByUsername(username string) (*models.User, error) {
	var user models.User
	err := r.db.Where("username = ?", username).First(&user).Error
	return &user, err
}

func (r *UserRepository) FindByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	return &user, err
}

func (r *UserRepository) DeleteUser(id uint) error {
	return r.db.Delete(&models.User{}, id).Error
}

type EmployeeRepository struct {
	db *gorm.DB
}

func NewEmployeeRepository(db *gorm.DB) *EmployeeRepository {
	return &EmployeeRepository{db}
}

func (r *EmployeeRepository) Create(employee *models.Employee) error {
	return r.db.Create(employee).Error
}

func (r *EmployeeRepository) FindByID(id uint) (*models.Employee, error) {
	var employee models.Employee
	err := r.db.Preload("Department").Preload("Position").First(&employee, id).Error
	return &employee, err
}

func (r *EmployeeRepository) FindAll(offset, limit int) ([]models.Employee, int64, error) {
	var employees []models.Employee
	var total int64
	err := r.db.Model(&models.Employee{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = r.db.Preload("Department").Preload("Position").Offset(offset).Limit(limit).Find(&employees).Error
	return employees, total, err
}

func (r *EmployeeRepository) Search(search string, offset, limit int) ([]models.Employee, int64, error) {
	var employees []models.Employee
	var total int64
	query := r.db.Where("name ILIKE ? OR email ILIKE ? OR employee_id ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	err := query.Model(&models.Employee{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = query.Preload("Department").Preload("Position").Offset(offset).Limit(limit).Find(&employees).Error
	return employees, total, err
}

func (r *EmployeeRepository) Update(employee *models.Employee) error {
	return r.db.Save(employee).Error
}

func (r *EmployeeRepository) Delete(id uint) error {
	return r.db.Delete(&models.Employee{}, id).Error
}

type DepartmentRepository struct {
	db *gorm.DB
}

func NewDepartmentRepository(db *gorm.DB) *DepartmentRepository {
	return &DepartmentRepository{db}
}

func (r *DepartmentRepository) Create(dept *models.Department) error {
	return r.db.Create(dept).Error
}

func (r *DepartmentRepository) FindByID(id uint) (*models.Department, error) {
	var dept models.Department
	err := r.db.First(&dept, id).Error
	return &dept, err
}

func (r *DepartmentRepository) FindAll() ([]models.Department, error) {
	var depts []models.Department
	err := r.db.Find(&depts).Error
	return depts, err
}

func (r *DepartmentRepository) Update(dept *models.Department) error {
	return r.db.Save(dept).Error
}

func (r *DepartmentRepository) Delete(id uint) error {
	return r.db.Delete(&models.Department{}, id).Error
}

type PositionRepository struct {
	db *gorm.DB
}

func NewPositionRepository(db *gorm.DB) *PositionRepository {
	return &PositionRepository{db}
}

func (r *PositionRepository) Create(pos *models.Position) error {
	return r.db.Create(pos).Error
}

func (r *PositionRepository) FindByID(id uint) (*models.Position, error) {
	var pos models.Position
	err := r.db.First(&pos, id).Error
	return &pos, err
}

func (r *PositionRepository) FindAll() ([]models.Position, error) {
	var positions []models.Position
	err := r.db.Find(&positions).Error
	return positions, err
}

func (r *PositionRepository) Update(pos *models.Position) error {
	return r.db.Save(pos).Error
}

func (r *PositionRepository) Delete(id uint) error {
	return r.db.Delete(&models.Position{}, id).Error
}

type AttendanceRepository struct {
	db *gorm.DB
}

func NewAttendanceRepository(db *gorm.DB) *AttendanceRepository {
	return &AttendanceRepository{db}
}

func (r *AttendanceRepository) Create(att *models.Attendance) error {
	return r.db.Create(att).Error
}

func (r *AttendanceRepository) FindByID(id uint) (*models.Attendance, error) {
	var att models.Attendance
	err := r.db.First(&att, id).Error
	return &att, err
}

func (r *AttendanceRepository) FindByEmployeeAndDate(employeeID uint, date string) (*models.Attendance, error) {
	var att models.Attendance
	err := r.db.Where("employee_id = ? AND DATE(date) = ?", employeeID, date).First(&att).Error
	return &att, err
}

func (r *AttendanceRepository) FindByEmployeeID(employeeID uint, offset, limit int) ([]models.Attendance, int64, error) {
	var attendance []models.Attendance
	var total int64
	err := r.db.Model(&models.Attendance{}).Where("employee_id = ?", employeeID).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = r.db.Where("employee_id = ?", employeeID).Offset(offset).Limit(limit).Order("date DESC").Find(&attendance).Error
	return attendance, total, err
}

func (r *AttendanceRepository) Update(att *models.Attendance) error {
	return r.db.Save(att).Error
}

type LeaveTypeRepository struct {
	db *gorm.DB
}

func NewLeaveTypeRepository(db *gorm.DB) *LeaveTypeRepository {
	return &LeaveTypeRepository{db}
}

func (r *LeaveTypeRepository) Create(lt *models.LeaveType) error {
	return r.db.Create(lt).Error
}

func (r *LeaveTypeRepository) FindByID(id uint) (*models.LeaveType, error) {
	var lt models.LeaveType
	err := r.db.First(&lt, id).Error
	return &lt, err
}

func (r *LeaveTypeRepository) FindAll() ([]models.LeaveType, error) {
	var types []models.LeaveType
	err := r.db.Find(&types).Error
	return types, err
}

type LeaveBalanceRepository struct {
	db *gorm.DB
}

func NewLeaveBalanceRepository(db *gorm.DB) *LeaveBalanceRepository {
	return &LeaveBalanceRepository{db}
}

func (r *LeaveBalanceRepository) Create(lb *models.LeaveBalance) error {
	return r.db.Create(lb).Error
}

func (r *LeaveBalanceRepository) FindByEmployeeID(employeeID uint) ([]models.LeaveBalance, error) {
	var balances []models.LeaveBalance
	err := r.db.Where("employee_id = ?", employeeID).Preload("LeaveType").Find(&balances).Error
	return balances, err
}

func (r *LeaveBalanceRepository) FindByEmployeeAndType(employeeID, leaveTypeID uint) (*models.LeaveBalance, error) {
	var lb models.LeaveBalance
	err := r.db.Where("employee_id = ? AND leave_type_id = ?", employeeID, leaveTypeID).First(&lb).Error
	return &lb, err
}

func (r *LeaveBalanceRepository) Update(lb *models.LeaveBalance) error {
	return r.db.Save(lb).Error
}

type LeaveRequestRepository struct {
	db *gorm.DB
}

func NewLeaveRequestRepository(db *gorm.DB) *LeaveRequestRepository {
	return &LeaveRequestRepository{db}
}

func (r *LeaveRequestRepository) Create(lr *models.LeaveRequest) error {
	return r.db.Create(lr).Error
}

func (r *LeaveRequestRepository) FindByID(id uint) (*models.LeaveRequest, error) {
	var lr models.LeaveRequest
	err := r.db.Preload("Employee").Preload("LeaveType").First(&lr, id).Error
	return &lr, err
}

func (r *LeaveRequestRepository) FindByEmployeeID(employeeID uint, offset, limit int) ([]models.LeaveRequest, int64, error) {
	var reqs []models.LeaveRequest
	var total int64
	err := r.db.Model(&models.LeaveRequest{}).Where("employee_id = ?", employeeID).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = r.db.Where("employee_id = ?", employeeID).Preload("LeaveType").Offset(offset).Limit(limit).Order("created_at DESC").Find(&reqs).Error
	return reqs, total, err
}

func (r *LeaveRequestRepository) FindPending(offset, limit int) ([]models.LeaveRequest, int64, error) {
	var reqs []models.LeaveRequest
	var total int64
	err := r.db.Model(&models.LeaveRequest{}).Where("status = ?", "Pending").Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = r.db.Where("status = ?", "Pending").Preload("Employee").Preload("LeaveType").Offset(offset).Limit(limit).Order("created_at DESC").Find(&reqs).Error
	return reqs, total, err
}

func (r *LeaveRequestRepository) Update(lr *models.LeaveRequest) error {
	return r.db.Save(lr).Error
}

type PayrollRepository struct {
	db *gorm.DB
}

func NewPayrollRepository(db *gorm.DB) *PayrollRepository {
	return &PayrollRepository{db}
}

func (r *PayrollRepository) Create(p *models.Payroll) error {
	return r.db.Create(p).Error
}

func (r *PayrollRepository) FindByID(id uint) (*models.Payroll, error) {
	var p models.Payroll
	err := r.db.Preload("Employee").First(&p, id).Error
	return &p, err
}

func (r *PayrollRepository) FindAll(offset, limit int) ([]models.Payroll, int64, error) {
	var records []models.Payroll
	var total int64
	err := r.db.Model(&models.Payroll{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = r.db.Preload("Employee").Offset(offset).Limit(limit).Order("created_at DESC").Find(&records).Error
	return records, total, err
}

func (r *PayrollRepository) FindByEmployeeID(employeeID uint, offset, limit int) ([]models.Payroll, int64, error) {
	var records []models.Payroll
	var total int64
	err := r.db.Model(&models.Payroll{}).Where("employee_id = ?", employeeID).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = r.db.Where("employee_id = ?", employeeID).Offset(offset).Limit(limit).Order("created_at DESC").Find(&records).Error
	return records, total, err
}

func (r *PayrollRepository) Update(p *models.Payroll) error {
	return r.db.Save(p).Error
}

type PerformanceReviewRepository struct {
	db *gorm.DB
}

func NewPerformanceReviewRepository(db *gorm.DB) *PerformanceReviewRepository {
	return &PerformanceReviewRepository{db}
}

func (r *PerformanceReviewRepository) Create(pr *models.PerformanceReview) error {
	return r.db.Create(pr).Error
}

func (r *PerformanceReviewRepository) FindByID(id uint) (*models.PerformanceReview, error) {
	var pr models.PerformanceReview
	err := r.db.Preload("Employee").Preload("KPIs").First(&pr, id).Error
	return &pr, err
}

func (r *PerformanceReviewRepository) FindByEmployeeID(employeeID uint) ([]models.PerformanceReview, error) {
	var reviews []models.PerformanceReview
	err := r.db.Where("employee_id = ?", employeeID).Preload("KPIs").Order("created_at DESC").Find(&reviews).Error
	return reviews, err
}

func (r *PerformanceReviewRepository) Update(pr *models.PerformanceReview) error {
	return r.db.Save(pr).Error
}

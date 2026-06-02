package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Username  string    `gorm:"uniqueIndex;not null" json:"username"`
	Password  string    `gorm:"not null" json:"-"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Active    bool      `gorm:"default:true" json:"active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Roles []Role `gorm:"many2many:user_roles" json:"roles,omitempty"`
}

type Role struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"uniqueIndex;not null" json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Permissions []Permission `gorm:"many2many:role_permissions" json:"permissions,omitempty"`
}

type Permission struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"uniqueIndex;not null" json:"name"`
	Action    string    `json:"action"`
	Resource  string    `json:"resource"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UserRole struct {
	UserID    uint      `gorm:"primaryKey" json:"user_id"`
	RoleID    uint      `gorm:"primaryKey" json:"role_id"`
	CreatedAt time.Time `json:"created_at"`
}

type Department struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"uniqueIndex;not null" json:"name"`
	Head      string    `json:"head"`
	Budget    string    `json:"budget"`
	Status    string    `gorm:"default:Active" json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Employees []Employee `gorm:"foreignKey:DepartmentID" json:"employees,omitempty"`
	Positions []Position `gorm:"foreignKey:DepartmentID" json:"positions,omitempty"`
}

type Position struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Title     string    `gorm:"not null" json:"title"`
	Level     string    `json:"level"`
	Headcount int       `json:"headcount"`
	Openings  int       `json:"openings"`
	Salary    string    `json:"salary"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	DepartmentID uint `json:"department_id"`
	Employees    []Employee `gorm:"foreignKey:PositionID" json:"employees,omitempty"`
}

type Employee struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Name            string    `gorm:"not null" json:"name"`
	Email           string    `gorm:"uniqueIndex" json:"email"`
	Phone           string    `json:"phone"`
	Gender          string    `json:"gender"`
	DOB             string    `json:"dob"`
	Address         string    `json:"address"`
	EmployeeID      string    `gorm:"uniqueIndex" json:"employee_id"`
	Status          string    `gorm:"default:Active" json:"status"`
	HireDate        string    `json:"hire_date"`
	EmploymentType  string    `json:"employment_type"`
	Salary          float64   `json:"salary"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	DepartmentID uint `json:"department_id"`
	PositionID   uint `json:"position_id"`
	UserID       uint `json:"user_id"`

	Department      *Department      `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	Position        *Position        `gorm:"foreignKey:PositionID" json:"position,omitempty"`
	Attendance      []Attendance     `gorm:"foreignKey:EmployeeID" json:"attendance,omitempty"`
	LeaveRequests   []LeaveRequest   `gorm:"foreignKey:EmployeeID" json:"leave_requests,omitempty"`
	LeaveBalances   []LeaveBalance   `gorm:"foreignKey:EmployeeID" json:"leave_balances,omitempty"`
	Payroll         []Payroll        `gorm:"foreignKey:EmployeeID" json:"payroll,omitempty"`
	PerformanceReviews []PerformanceReview `gorm:"foreignKey:EmployeeID" json:"performance_reviews,omitempty"`
}

type Attendance struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	EmployeeID  uint      `gorm:"not null" json:"employee_id"`
	Date        time.Time `gorm:"not null" json:"date"`
	CheckInTime *time.Time `json:"check_in_time"`
	CheckOutTime *time.Time `json:"check_out_time"`
	Status      string    `gorm:"not null" json:"status"`
	Hours       *float64  `json:"hours"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Employee *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
}

type LeaveType struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"uniqueIndex;not null" json:"name"`
	Description string    `json:"description"`
	MaxDays     int       `json:"max_days"`
	Paid        bool      `json:"paid"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	LeaveRequests []LeaveRequest `gorm:"foreignKey:LeaveTypeID" json:"leave_requests,omitempty"`
	LeaveBalances []LeaveBalance `gorm:"foreignKey:LeaveTypeID" json:"leave_balances,omitempty"`
}

type LeaveBalance struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	EmployeeID uint      `gorm:"not null" json:"employee_id"`
	LeaveTypeID uint     `gorm:"not null" json:"leave_type_id"`
	Total      int       `gorm:"default:0" json:"total"`
	Used       int       `gorm:"default:0" json:"used"`
	Year       int       `json:"year"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	Employee  *Employee  `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	LeaveType *LeaveType `gorm:"foreignKey:LeaveTypeID" json:"leave_type,omitempty"`
}

type LeaveRequest struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	EmployeeID uint      `gorm:"not null" json:"employee_id"`
	LeaveTypeID uint     `gorm:"not null" json:"leave_type_id"`
	StartDate  time.Time `gorm:"not null" json:"start_date"`
	EndDate    time.Time `gorm:"not null" json:"end_date"`
	Days       int       `json:"days"`
	Reason     string    `json:"reason"`
	Status     string    `gorm:"default:Pending" json:"status"`
	ApprovedBy *uint     `json:"approved_by"`
	ApprovedAt *time.Time `json:"approved_at"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	Employee  *Employee  `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	LeaveType *LeaveType `gorm:"foreignKey:LeaveTypeID" json:"leave_type,omitempty"`
}

type Payroll struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	EmployeeID  uint      `gorm:"not null" json:"employee_id"`
	PayrollID   string    `gorm:"uniqueIndex;not null" json:"payroll_id"`
	Month       string    `json:"month"`
	BasicSalary float64   `json:"basic_salary"`
	Bonus       float64   `gorm:"default:0" json:"bonus"`
	Deductions  float64   `gorm:"default:0" json:"deductions"`
	NetSalary   float64   `json:"net_salary"`
	Tax         float64   `gorm:"default:0" json:"tax"`
	Status      string    `gorm:"default:Pending" json:"status"`
	PaidDate    *time.Time `json:"paid_date"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Employee *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
}

type PerformanceReview struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	EmployeeID uint      `gorm:"not null" json:"employee_id"`
	Period     string    `json:"period"`
	Rating     float64   `json:"rating"`
	Comments   string    `json:"comments"`
	Status     string    `gorm:"default:Pending" json:"status"`
	ReviewedBy *uint     `json:"reviewed_by"`
	ReviewedAt *time.Time `json:"reviewed_at"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	Employee *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	KPIs     []PerformanceKPI `gorm:"foreignKey:ReviewID" json:"kpis,omitempty"`
}

type PerformanceKPI struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ReviewID  uint      `gorm:"not null" json:"review_id"`
	KPIName   string    `json:"kpi_name"`
	Target    string    `json:"target"`
	Achieved  string    `json:"achieved"`
	Score     int       `json:"score"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Review *PerformanceReview `gorm:"foreignKey:ReviewID" json:"review,omitempty"`
}

func (User) TableName() string {
	return "users"
}

func (Role) TableName() string {
	return "roles"
}

func (Permission) TableName() string {
	return "permissions"
}

func (UserRole) TableName() string {
	return "user_roles"
}

func (Department) TableName() string {
	return "departments"
}

func (Position) TableName() string {
	return "positions"
}

func (Employee) TableName() string {
	return "employees"
}

func (Attendance) TableName() string {
	return "attendance"
}

func (LeaveType) TableName() string {
	return "leave_types"
}

func (LeaveBalance) TableName() string {
	return "leave_balances"
}

func (LeaveRequest) TableName() string {
	return "leave_requests"
}

func (Payroll) TableName() string {
	return "payroll"
}

func (PerformanceReview) TableName() string {
	return "performance_reviews"
}

func (PerformanceKPI) TableName() string {
	return "performance_kpis"
}

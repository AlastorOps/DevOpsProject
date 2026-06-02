package dto

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  UserDTO     `json:"user"`
}

type UserDTO struct {
	ID        uint      `json:"id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Active    bool      `json:"active"`
}

type CreateEmployeeRequest struct {
	Name            string  `json:"name" binding:"required"`
	Email           string  `json:"email" binding:"required,email"`
	Phone           string  `json:"phone"`
	Gender          string  `json:"gender"`
	DOB             string  `json:"dob"`
	Address         string  `json:"address"`
	EmployeeID      string  `json:"employee_id"`
	HireDate        string  `json:"hire_date"`
	EmploymentType  string  `json:"employment_type"`
	Salary          float64 `json:"salary"`
	DepartmentID    uint    `json:"department_id" binding:"required"`
	PositionID      uint    `json:"position_id"`
	Username        string  `json:"username"`
	WorkEmail       string  `json:"work_email"`
	Password        string  `json:"password"`
	Role            string  `json:"role"`
	AccountActive   bool    `json:"account_active"`
}

type UpdateEmployeeRequest struct {
	Name            string  `json:"name"`
	Email           string  `json:"email"`
	Phone           string  `json:"phone"`
	Gender          string  `json:"gender"`
	DOB             string  `json:"dob"`
	Address         string  `json:"address"`
	Status          string  `json:"status"`
	HireDate        string  `json:"hire_date"`
	EmploymentType  string  `json:"employment_type"`
	Salary          float64 `json:"salary"`
	DepartmentID    uint    `json:"department_id"`
	PositionID      uint    `json:"position_id"`
}

type CreateDepartmentRequest struct {
	Name   string `json:"name" binding:"required"`
	Head   string `json:"head"`
	Budget string `json:"budget"`
}

type UpdateDepartmentRequest struct {
	Name   string `json:"name"`
	Head   string `json:"head"`
	Budget string `json:"budget"`
	Status string `json:"status"`
}

type CreatePositionRequest struct {
	Title        string `json:"title" binding:"required"`
	Level        string `json:"level"`
	Headcount    int    `json:"headcount"`
	Openings     int    `json:"openings"`
	Salary       string `json:"salary"`
	DepartmentID uint   `json:"department_id" binding:"required"`
}

type UpdatePositionRequest struct {
	Title     string `json:"title"`
	Level     string `json:"level"`
	Headcount int    `json:"headcount"`
	Openings  int    `json:"openings"`
	Salary    string `json:"salary"`
}

type MarkAttendanceRequest struct {
	EmployeeID   uint       `json:"employee_id" binding:"required"`
	Date         string     `json:"date"`
	CheckInTime  *string    `json:"check_in_time"`
	CheckOutTime *string    `json:"check_out_time"`
	Status       string     `json:"status" binding:"required"`
}

type CreateLeaveRequest struct {
	LeaveTypeID uint   `json:"leave_type_id" binding:"required"`
	StartDate   string `json:"start_date" binding:"required"`
	EndDate     string `json:"end_date" binding:"required"`
	Reason      string `json:"reason" binding:"required"`
}

type UpdateLeaveRequestRequest struct {
	Status     string `json:"status" binding:"required"`
}

type RunPayrollRequest struct {
	EmployeeID  uint    `json:"employee_id" binding:"required"`
	BasicSalary float64 `json:"basic_salary" binding:"required"`
	Bonus       float64 `json:"bonus"`
	Deductions  float64 `json:"deductions"`
	Month       string  `json:"month"`
}

type PaginationQuery struct {
	Page     int    `form:"page,default=1"`
	PageSize int    `form:"page_size,default=10"`
	Sort     string `form:"sort"`
	Search   string `form:"search"`
}

type ErrorResponse struct {
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

type SuccessResponse struct {
	Data    interface{} `json:"data"`
	Message string      `json:"message"`
}

type ListResponse struct {
	Data       interface{} `json:"data"`
	Total      int64       `json:"total"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalPages int         `json:"total_pages"`
}

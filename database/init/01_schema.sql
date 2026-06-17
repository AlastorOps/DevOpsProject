-- ============================================================
-- EMS Operations — PostgreSQL Schema
-- Mirrors backend/app/models.py exactly.
-- Executed automatically by the postgres container on first boot
-- because it is mounted at /docker-entrypoint-initdb.d/.
-- ============================================================

-- ── roles ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(255),
    is_system   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── departments ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
    id         SERIAL          PRIMARY KEY,
    name       VARCHAR(100)    NOT NULL UNIQUE,
    head       VARCHAR(100),
    budget     NUMERIC(15, 2),
    status     VARCHAR(20)     NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ── positions ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS positions (
    id            SERIAL          PRIMARY KEY,
    title         VARCHAR(100)    NOT NULL,
    department_id INTEGER         REFERENCES departments(id) ON DELETE SET NULL,
    level         VARCHAR(20),
    max_slots     INTEGER         NOT NULL DEFAULT 0,
    salary_min    NUMERIC(15, 2),
    salary_max    NUMERIC(15, 2),
    created_at    TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ── employees ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
    id              VARCHAR(36)    PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    emp_id          VARCHAR(20)    NOT NULL UNIQUE,
    name            VARCHAR(100)   NOT NULL,
    personal_email  VARCHAR(255),
    work_email      VARCHAR(255)   UNIQUE,
    gender          VARCHAR(10),
    dob             DATE,
    phone           VARCHAR(30),
    address         TEXT,
    department_id   INTEGER        REFERENCES departments(id) ON DELETE SET NULL,
    position_id     INTEGER        REFERENCES positions(id)   ON DELETE SET NULL,
    hire_date       DATE,
    employment_type VARCHAR(20),
    salary          NUMERIC(15, 2),
    photo_path      VARCHAR(500),
    status          VARCHAR(20)    NOT NULL DEFAULT 'Active',
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- ── users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            VARCHAR(36)  PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(30)  NOT NULL DEFAULT 'Employee',
    status        VARCHAR(20)  NOT NULL DEFAULT 'Active',
    employee_id   VARCHAR(36)  REFERENCES employees(id) ON DELETE SET NULL,
    last_login          TIMESTAMP,
    reset_token         VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── attendance ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
    id          VARCHAR(36)  PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    employee_id VARCHAR(36)  NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date        DATE         NOT NULL,
    check_in    VARCHAR(10),
    check_out   VARCHAR(10),
    status      VARCHAR(20)  NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uix_attendance_employee_date UNIQUE (employee_id, date)
);

-- ── leave_requests ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_requests (
    id            VARCHAR(36)  PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    leave_id      VARCHAR(20)  NOT NULL UNIQUE,
    employee_id   VARCHAR(36)  NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type    VARCHAR(50)  NOT NULL,
    from_date     DATE         NOT NULL,
    to_date       DATE         NOT NULL,
    days          INTEGER      NOT NULL,
    reason        TEXT         NOT NULL,
    document_path VARCHAR(500),
    status        VARCHAR(20)  NOT NULL DEFAULT 'Pending',
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── leave_balances ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_balances (
    id          SERIAL      PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type  VARCHAR(50) NOT NULL,
    used        INTEGER     NOT NULL DEFAULT 0,
    total       INTEGER     NOT NULL DEFAULT 0,
    CONSTRAINT uix_leave_balance_emp_type UNIQUE (employee_id, leave_type)
);

-- ── payroll ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payroll (
    id          VARCHAR(36)    PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    payroll_id  VARCHAR(20)    NOT NULL UNIQUE,
    employee_id VARCHAR(36)    NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    basic       NUMERIC(15, 2) NOT NULL,
    bonus       NUMERIC(15, 2) NOT NULL DEFAULT 0,
    deductions  NUMERIC(15, 2) NOT NULL DEFAULT 0,
    net         NUMERIC(15, 2) NOT NULL,
    status      VARCHAR(20)    NOT NULL DEFAULT 'Pending',
    month       VARCHAR(20)    NOT NULL,
    paid_on     DATE,
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- ── payslip_items ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payslip_items (
    id         SERIAL         PRIMARY KEY,
    payroll_id VARCHAR(36)    NOT NULL REFERENCES payroll(id) ON DELETE CASCADE,
    item_type  VARCHAR(20)    NOT NULL,
    label      VARCHAR(100)   NOT NULL,
    amount     NUMERIC(15, 2) NOT NULL
);

-- ── performance_reviews ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS performance_reviews (
    id            VARCHAR(36)  PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    employee_id   VARCHAR(36)  NOT NULL REFERENCES employees(id)  ON DELETE CASCADE,
    reviewer_id   VARCHAR(36)           REFERENCES users(id)      ON DELETE SET NULL,
    reviewer_name VARCHAR(100),
    cycle         VARCHAR(100) NOT NULL,
    rating        VARCHAR(20)  NOT NULL,
    stars         INTEGER      NOT NULL,
    comments      TEXT,
    review_date   DATE         NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── role_permissions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS role_permissions (
    id         SERIAL       PRIMARY KEY,
    role_id    INTEGER      NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module     VARCHAR(100) NOT NULL,
    permission VARCHAR(100) NOT NULL,
    enabled    BOOLEAN      NOT NULL DEFAULT FALSE
);

-- ── system_settings (single row, id = 1) ─────────────────────
CREATE TABLE IF NOT EXISTS system_settings (
    id                  INTEGER      PRIMARY KEY DEFAULT 1,
    org_name            VARCHAR(200),
    reg_number          VARCHAR(100),
    headquarters        TEXT,
    logo_path           VARCHAR(500),
    language            VARCHAR(5)   NOT NULL DEFAULT 'en',
    theme               VARCHAR(10)  NOT NULL DEFAULT 'light',
    email_notifications BOOLEAN      NOT NULL DEFAULT TRUE,
    sms_notifications   BOOLEAN      NOT NULL DEFAULT FALSE,
    push_notifications  BOOLEAN      NOT NULL DEFAULT TRUE,
    two_fa_enabled      BOOLEAN      NOT NULL DEFAULT FALSE,
    backups_enabled     BOOLEAN      NOT NULL DEFAULT TRUE,
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── notifications ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id         SERIAL       PRIMARY KEY,
    user_id    VARCHAR(36)  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      VARCHAR(200) NOT NULL,
    body       TEXT         NOT NULL,
    icon       VARCHAR(50)  NOT NULL DEFAULT 'notifications',
    color      VARCHAR(20)  NOT NULL DEFAULT 'primary',
    read       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_employees_department       ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_position         ON employees(position_id);
CREATE INDEX IF NOT EXISTS idx_employees_status           ON employees(status);

CREATE INDEX IF NOT EXISTS idx_attendance_date            ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status          ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_employee        ON attendance(employee_id);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee    ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status      ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_type        ON leave_requests(leave_type);

CREATE INDEX IF NOT EXISTS idx_payroll_employee           ON payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_status             ON payroll(status);
CREATE INDEX IF NOT EXISTS idx_payroll_month              ON payroll(month);

CREATE INDEX IF NOT EXISTS idx_performance_reviews_emp    ON performance_reviews(employee_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user         ON notifications(user_id);
-- Partial index: only unread rows — used by the unread-count query
CREATE INDEX IF NOT EXISTS idx_notifications_unread       ON notifications(user_id) WHERE read = FALSE;

CREATE INDEX IF NOT EXISTS idx_users_role                 ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status               ON users(status);

-- ============================================================
-- EMS Operations — Demo / Test Data
-- All demo user accounts share password: Employee@123
-- Admin account is seeded separately by the backend on startup.
-- Safe to run multiple times (idempotent).
-- ============================================================

-- ── Departments ──────────────────────────────────────────────
INSERT INTO departments (name, head, budget, status) VALUES
    ('Engineering',     'Alice Johnson',  850000.00, 'Active'),
    ('Human Resources', 'David Brown',    350000.00, 'Active'),
    ('Finance',         'Frank Miller',   600000.00, 'Active'),
    ('Marketing',       'Henry Moore',    500000.00, 'Active'),
    ('Operations',      'James Anderson', 750000.00, 'Active')
ON CONFLICT (name) DO NOTHING;

-- ── Positions (skip if title already exists) ──────────────────
INSERT INTO positions (title, department_id, level, headcount, openings, salary_min, salary_max)
SELECT v.title, d.id, v.level, v.headcount::INT, v.openings::INT, v.sal_min::NUMERIC, v.sal_max::NUMERIC
FROM (VALUES
    ('Senior Software Engineer',     'Engineering',     'Senior', '5', '1', '90000', '130000'),
    ('Software Engineer',            'Engineering',     'Mid',    '8', '2', '70000', '100000'),
    ('DevOps Engineer',              'Engineering',     'Mid',    '3', '0', '80000', '115000'),
    ('Product Manager',              'Engineering',     'Senior', '2', '0', '95000', '140000'),
    ('HR Manager',                   'Human Resources', 'Senior', '1', '0', '75000', '100000'),
    ('HR Specialist',                'Human Resources', 'Junior', '3', '1', '50000',  '70000'),
    ('Finance Manager',              'Finance',         'Senior', '1', '0', '85000', '120000'),
    ('Financial Analyst',            'Finance',         'Mid',    '4', '1', '60000',  '85000'),
    ('Marketing Manager',            'Marketing',       'Senior', '1', '0', '80000', '110000'),
    ('Digital Marketing Specialist', 'Marketing',       'Mid',    '3', '0', '55000',  '75000'),
    ('Operations Manager',           'Operations',      'Senior', '1', '0', '80000', '115000'),
    ('Operations Analyst',           'Operations',      'Mid',    '4', '1', '55000',  '80000')
) AS v(title, dept_name, level, headcount, openings, sal_min, sal_max)
JOIN departments d ON d.name = v.dept_name
WHERE NOT EXISTS (SELECT 1 FROM positions WHERE title = v.title);

-- ── Employees ─────────────────────────────────────────────────
INSERT INTO employees (id, emp_id, name, personal_email, work_email, gender, dob, phone, hire_date, employment_type, salary, status, department_id, position_id)
SELECT
    v.id, v.emp_id, v.name, v.personal_email, v.work_email, v.gender,
    v.dob::DATE, v.phone, v.hire_date::DATE, v.employment_type,
    v.salary::NUMERIC(15,2), v.status, d.id, p.id
FROM (VALUES
    ('aaaaaaaa-0001-0000-0000-aaaaaaaaaaaa','EMP-001','Alice Johnson', 'alice.j@gmail.com',  'alice.johnson@kinetichr.com', 'Female','1990-03-15','+1-555-0101','2021-01-10','Full-time','95000', 'Active',  'Engineering',     'Senior Software Engineer'),
    ('aaaaaaaa-0002-0000-0000-aaaaaaaaaaaa','EMP-002','Bob Williams',  'bob.w@gmail.com',    'bob.williams@kinetichr.com',  'Male',  '1993-07-22','+1-555-0102','2022-03-14','Full-time','75000', 'Active',  'Engineering',     'Software Engineer'),
    ('aaaaaaaa-0003-0000-0000-aaaaaaaaaaaa','EMP-003','Carol Smith',   'carol.s@gmail.com',  'carol.smith@kinetichr.com',   'Female','1991-11-08','+1-555-0103','2021-06-01','Full-time','82000', 'Active',  'Engineering',     'DevOps Engineer'),
    ('aaaaaaaa-0004-0000-0000-aaaaaaaaaaaa','EMP-004','David Brown',   'david.b@gmail.com',  'david.brown@kinetichr.com',   'Male',  '1985-04-30','+1-555-0104','2019-05-15','Full-time','88000', 'Active',  'Human Resources', 'HR Manager'),
    ('aaaaaaaa-0005-0000-0000-aaaaaaaaaaaa','EMP-005','Emma Davis',    'emma.d@gmail.com',   'emma.davis@kinetichr.com',    'Female','1995-09-12','+1-555-0105','2023-02-20','Full-time','58000', 'Active',  'Human Resources', 'HR Specialist'),
    ('aaaaaaaa-0006-0000-0000-aaaaaaaaaaaa','EMP-006','Frank Miller',  'frank.m@gmail.com',  'frank.miller@kinetichr.com',  'Male',  '1982-12-05','+1-555-0106','2018-11-01','Full-time','105000','Active',  'Finance',         'Finance Manager'),
    ('aaaaaaaa-0007-0000-0000-aaaaaaaaaaaa','EMP-007','Grace Wilson',  'grace.w@gmail.com',  'grace.wilson@kinetichr.com',  'Female','1994-06-18','+1-555-0107','2022-08-08','Full-time','65000', 'Active',  'Finance',         'Financial Analyst'),
    ('aaaaaaaa-0008-0000-0000-aaaaaaaaaaaa','EMP-008','Henry Moore',   'henry.m@gmail.com',  'henry.moore@kinetichr.com',   'Male',  '1987-02-25','+1-555-0108','2020-04-12','Full-time','92000', 'Active',  'Marketing',       'Marketing Manager'),
    ('aaaaaaaa-0009-0000-0000-aaaaaaaaaaaa','EMP-009','Isla Taylor',   'isla.t@gmail.com',   'isla.taylor@kinetichr.com',   'Female','1996-08-03','+1-555-0109','2023-07-17','Full-time','60000', 'Active',  'Marketing',       'Digital Marketing Specialist'),
    ('aaaaaaaa-0010-0000-0000-aaaaaaaaaaaa','EMP-010','James Anderson','james.a@gmail.com',  'james.anderson@kinetichr.com','Male',  '1983-01-14','+1-555-0110','2017-09-03','Full-time','98000', 'Active',  'Operations',      'Operations Manager'),
    ('aaaaaaaa-0011-0000-0000-aaaaaaaaaaaa','EMP-011','Kate Martinez', 'kate.m@gmail.com',   'kate.martinez@kinetichr.com', 'Female','1997-05-27','+1-555-0111','2024-01-08','Full-time','57000', 'Active',  'Operations',      'Operations Analyst'),
    ('aaaaaaaa-0012-0000-0000-aaaaaaaaaaaa','EMP-012','Liam Garcia',   'liam.g@gmail.com',   'liam.garcia@kinetichr.com',   'Male',  '1998-10-19','+1-555-0112','2024-06-01','Full-time','70000', 'Active',  'Engineering',     'Software Engineer'),
    ('aaaaaaaa-0013-0000-0000-aaaaaaaaaaaa','EMP-013','Mia Robinson',  'mia.r@gmail.com',    'mia.robinson@kinetichr.com',  'Female','1989-03-07','+1-555-0113','2020-10-15','Full-time','110000','Active',  'Engineering',     'Product Manager'),
    ('aaaaaaaa-0014-0000-0000-aaaaaaaaaaaa','EMP-014','Noah Clark',    'noah.c@gmail.com',   'noah.clark@kinetichr.com',    'Male',  '1992-07-31','+1-555-0114','2021-11-22','Full-time','67000', 'Active',  'Finance',         'Financial Analyst'),
    ('aaaaaaaa-0015-0000-0000-aaaaaaaaaaaa','EMP-015','Olivia Lewis',  'olivia.l@gmail.com', 'olivia.lewis@kinetichr.com',  'Female','1999-12-24','+1-555-0115','2024-03-11','Full-time','55000', 'Inactive','Human Resources', 'HR Specialist')
) AS v(id, emp_id, name, personal_email, work_email, gender, dob, phone, hire_date, employment_type, salary, status, dept_name, pos_title)
JOIN departments d ON d.name = v.dept_name
JOIN positions   p ON p.title = v.pos_title
ON CONFLICT (emp_id) DO NOTHING;

-- ── Users (password for all: Employee@123) ────────────────────
INSERT INTO users (id, name, email, password_hash, role, status, employee_id) VALUES
    ('bbbbbbbb-0001-0000-0000-bbbbbbbbbbbb','Alice Johnson', 'alice.johnson@kinetichr.com', '$2b$12$rze6vLUmzI56Z7HXMKR80Oi83ebHCr75FOqrkA44/dfPjckb918zC','HR Manager','Active',  'aaaaaaaa-0001-0000-0000-aaaaaaaaaaaa'),
    ('bbbbbbbb-0002-0000-0000-bbbbbbbbbbbb','Bob Williams',  'bob.williams@kinetichr.com',  '$2b$12$rze6vLUmzI56Z7HXMKR80Oi83ebHCr75FOqrkA44/dfPjckb918zC','Employee', 'Active',  'aaaaaaaa-0002-0000-0000-aaaaaaaaaaaa'),
    ('bbbbbbbb-0003-0000-0000-bbbbbbbbbbbb','Carol Smith',   'carol.smith@kinetichr.com',   '$2b$12$rze6vLUmzI56Z7HXMKR80Oi83ebHCr75FOqrkA44/dfPjckb918zC','Employee', 'Active',  'aaaaaaaa-0003-0000-0000-aaaaaaaaaaaa'),
    ('bbbbbbbb-0004-0000-0000-bbbbbbbbbbbb','David Brown',   'david.brown@kinetichr.com',   '$2b$12$rze6vLUmzI56Z7HXMKR80Oi83ebHCr75FOqrkA44/dfPjckb918zC','HR Manager','Active', 'aaaaaaaa-0004-0000-0000-aaaaaaaaaaaa'),
    ('bbbbbbbb-0005-0000-0000-bbbbbbbbbbbb','Emma Davis',    'emma.davis@kinetichr.com',    '$2b$12$rze6vLUmzI56Z7HXMKR80Oi83ebHCr75FOqrkA44/dfPjckb918zC','Employee', 'Active',  'aaaaaaaa-0005-0000-0000-aaaaaaaaaaaa'),
    ('bbbbbbbb-0006-0000-0000-bbbbbbbbbbbb','Frank Miller',  'frank.miller@kinetichr.com',  '$2b$12$rze6vLUmzI56Z7HXMKR80Oi83ebHCr75FOqrkA44/dfPjckb918zC','Manager',  'Active',  'aaaaaaaa-0006-0000-0000-aaaaaaaaaaaa'),
    ('bbbbbbbb-0007-0000-0000-bbbbbbbbbbbb','Grace Wilson',  'grace.wilson@kinetichr.com',  '$2b$12$rze6vLUmzI56Z7HXMKR80Oi83ebHCr75FOqrkA44/dfPjckb918zC','Employee', 'Active',  'aaaaaaaa-0007-0000-0000-aaaaaaaaaaaa'),
    ('bbbbbbbb-0008-0000-0000-bbbbbbbbbbbb','Henry Moore',   'henry.moore@kinetichr.com',   '$2b$12$rze6vLUmzI56Z7HXMKR80Oi83ebHCr75FOqrkA44/dfPjckb918zC','Manager',  'Active',  'aaaaaaaa-0008-0000-0000-aaaaaaaaaaaa'),
    ('bbbbbbbb-0009-0000-0000-bbbbbbbbbbbb','Isla Taylor',   'isla.taylor@kinetichr.com',   '$2b$12$rze6vLUmzI56Z7HXMKR80Oi83ebHCr75FOqrkA44/dfPjckb918zC','Employee', 'Active',  'aaaaaaaa-0009-0000-0000-aaaaaaaaaaaa'),
    ('bbbbbbbb-0010-0000-0000-bbbbbbbbbbbb','James Anderson','james.anderson@kinetichr.com','$2b$12$rze6vLUmzI56Z7HXMKR80Oi83ebHCr75FOqrkA44/dfPjckb918zC','Manager',  'Active',  'aaaaaaaa-0010-0000-0000-aaaaaaaaaaaa'),
    ('bbbbbbbb-0011-0000-0000-bbbbbbbbbbbb','Kate Martinez', 'kate.martinez@kinetichr.com', '$2b$12$rze6vLUmzI56Z7HXMKR80Oi83ebHCr75FOqrkA44/dfPjckb918zC','Employee', 'Active',  'aaaaaaaa-0011-0000-0000-aaaaaaaaaaaa'),
    ('bbbbbbbb-0012-0000-0000-bbbbbbbbbbbb','Liam Garcia',   'liam.garcia@kinetichr.com',   '$2b$12$rze6vLUmzI56Z7HXMKR80Oi83ebHCr75FOqrkA44/dfPjckb918zC','Employee', 'Active',  'aaaaaaaa-0012-0000-0000-aaaaaaaaaaaa'),
    ('bbbbbbbb-0013-0000-0000-bbbbbbbbbbbb','Mia Robinson',  'mia.robinson@kinetichr.com',  '$2b$12$rze6vLUmzI56Z7HXMKR80Oi83ebHCr75FOqrkA44/dfPjckb918zC','Manager',  'Active',  'aaaaaaaa-0013-0000-0000-aaaaaaaaaaaa'),
    ('bbbbbbbb-0014-0000-0000-bbbbbbbbbbbb','Noah Clark',    'noah.clark@kinetichr.com',    '$2b$12$rze6vLUmzI56Z7HXMKR80Oi83ebHCr75FOqrkA44/dfPjckb918zC','Employee', 'Active',  'aaaaaaaa-0014-0000-0000-aaaaaaaaaaaa'),
    ('bbbbbbbb-0015-0000-0000-bbbbbbbbbbbb','Olivia Lewis',  'olivia.lewis@kinetichr.com',  '$2b$12$rze6vLUmzI56Z7HXMKR80Oi83ebHCr75FOqrkA44/dfPjckb918zC','Employee', 'Inactive','aaaaaaaa-0015-0000-0000-aaaaaaaaaaaa')
ON CONFLICT (email) DO NOTHING;

-- ── Leave Balances ────────────────────────────────────────────
INSERT INTO leave_balances (employee_id, leave_type, total, used) VALUES
    ('aaaaaaaa-0001-0000-0000-aaaaaaaaaaaa','Annual Leave',20,2), ('aaaaaaaa-0001-0000-0000-aaaaaaaaaaaa','Sick Leave',10,0), ('aaaaaaaa-0001-0000-0000-aaaaaaaaaaaa','Personal Leave',5,1),
    ('aaaaaaaa-0002-0000-0000-aaaaaaaaaaaa','Annual Leave',20,3), ('aaaaaaaa-0002-0000-0000-aaaaaaaaaaaa','Sick Leave',10,0), ('aaaaaaaa-0002-0000-0000-aaaaaaaaaaaa','Personal Leave',5,0),
    ('aaaaaaaa-0003-0000-0000-aaaaaaaaaaaa','Annual Leave',20,5), ('aaaaaaaa-0003-0000-0000-aaaaaaaaaaaa','Sick Leave',10,2), ('aaaaaaaa-0003-0000-0000-aaaaaaaaaaaa','Personal Leave',5,0),
    ('aaaaaaaa-0004-0000-0000-aaaaaaaaaaaa','Annual Leave',20,4), ('aaaaaaaa-0004-0000-0000-aaaaaaaaaaaa','Sick Leave',10,1), ('aaaaaaaa-0004-0000-0000-aaaaaaaaaaaa','Personal Leave',5,2),
    ('aaaaaaaa-0005-0000-0000-aaaaaaaaaaaa','Annual Leave',20,0), ('aaaaaaaa-0005-0000-0000-aaaaaaaaaaaa','Sick Leave',10,2), ('aaaaaaaa-0005-0000-0000-aaaaaaaaaaaa','Personal Leave',5,0),
    ('aaaaaaaa-0006-0000-0000-aaaaaaaaaaaa','Annual Leave',20,6), ('aaaaaaaa-0006-0000-0000-aaaaaaaaaaaa','Sick Leave',10,0), ('aaaaaaaa-0006-0000-0000-aaaaaaaaaaaa','Personal Leave',5,1),
    ('aaaaaaaa-0007-0000-0000-aaaaaaaaaaaa','Annual Leave',20,3), ('aaaaaaaa-0007-0000-0000-aaaaaaaaaaaa','Sick Leave',10,1), ('aaaaaaaa-0007-0000-0000-aaaaaaaaaaaa','Personal Leave',5,0),
    ('aaaaaaaa-0008-0000-0000-aaaaaaaaaaaa','Annual Leave',20,8), ('aaaaaaaa-0008-0000-0000-aaaaaaaaaaaa','Sick Leave',10,0), ('aaaaaaaa-0008-0000-0000-aaaaaaaaaaaa','Personal Leave',5,2),
    ('aaaaaaaa-0009-0000-0000-aaaaaaaaaaaa','Annual Leave',20,1), ('aaaaaaaa-0009-0000-0000-aaaaaaaaaaaa','Sick Leave',10,0), ('aaaaaaaa-0009-0000-0000-aaaaaaaaaaaa','Personal Leave',5,1),
    ('aaaaaaaa-0010-0000-0000-aaaaaaaaaaaa','Annual Leave',20,7), ('aaaaaaaa-0010-0000-0000-aaaaaaaaaaaa','Sick Leave',10,2), ('aaaaaaaa-0010-0000-0000-aaaaaaaaaaaa','Personal Leave',5,0),
    ('aaaaaaaa-0011-0000-0000-aaaaaaaaaaaa','Annual Leave',20,1), ('aaaaaaaa-0011-0000-0000-aaaaaaaaaaaa','Sick Leave',10,1), ('aaaaaaaa-0011-0000-0000-aaaaaaaaaaaa','Personal Leave',5,0),
    ('aaaaaaaa-0012-0000-0000-aaaaaaaaaaaa','Annual Leave',20,0), ('aaaaaaaa-0012-0000-0000-aaaaaaaaaaaa','Sick Leave',10,0), ('aaaaaaaa-0012-0000-0000-aaaaaaaaaaaa','Personal Leave',5,0),
    ('aaaaaaaa-0013-0000-0000-aaaaaaaaaaaa','Annual Leave',20,5), ('aaaaaaaa-0013-0000-0000-aaaaaaaaaaaa','Sick Leave',10,0), ('aaaaaaaa-0013-0000-0000-aaaaaaaaaaaa','Personal Leave',5,1),
    ('aaaaaaaa-0014-0000-0000-aaaaaaaaaaaa','Annual Leave',20,3), ('aaaaaaaa-0014-0000-0000-aaaaaaaaaaaa','Sick Leave',10,0), ('aaaaaaaa-0014-0000-0000-aaaaaaaaaaaa','Personal Leave',5,0),
    ('aaaaaaaa-0015-0000-0000-aaaaaaaaaaaa','Annual Leave',20,2), ('aaaaaaaa-0015-0000-0000-aaaaaaaaaaaa','Sick Leave',10,1), ('aaaaaaaa-0015-0000-0000-aaaaaaaaaaaa','Personal Leave',5,0)
ON CONFLICT (employee_id, leave_type) DO NOTHING;

-- ── Leave Requests ────────────────────────────────────────────
INSERT INTO leave_requests (id, leave_id, employee_id, leave_type, from_date, to_date, days, reason, status) VALUES
    ('eeeeeeee-0001-0000-0000-eeeeeeeeeeee','LV-2026-001','aaaaaaaa-0002-0000-0000-aaaaaaaaaaaa','Annual Leave',  '2026-05-19','2026-05-21',3,'Family vacation trip',    'Approved'),
    ('eeeeeeee-0002-0000-0000-eeeeeeeeeeee','LV-2026-002','aaaaaaaa-0005-0000-0000-aaaaaaaaaaaa','Sick Leave',    '2026-05-08','2026-05-09',2,'Flu and fever',            'Approved'),
    ('eeeeeeee-0003-0000-0000-eeeeeeeeeeee','LV-2026-003','aaaaaaaa-0003-0000-0000-aaaaaaaaaaaa','Personal Leave','2026-06-10','2026-06-10',1,'Personal errand',          'Pending'),
    ('eeeeeeee-0004-0000-0000-eeeeeeeeeeee','LV-2026-004','aaaaaaaa-0007-0000-0000-aaaaaaaaaaaa','Annual Leave',  '2026-06-15','2026-06-19',5,'Summer holiday',           'Pending'),
    ('eeeeeeee-0005-0000-0000-eeeeeeeeeeee','LV-2026-005','aaaaaaaa-0011-0000-0000-aaaaaaaaaaaa','Sick Leave',    '2026-05-15','2026-05-15',1,'Dentist appointment',      'Approved'),
    ('eeeeeeee-0006-0000-0000-eeeeeeeeeeee','LV-2026-006','aaaaaaaa-0012-0000-0000-aaaaaaaaaaaa','Annual Leave',  '2026-07-01','2026-07-05',5,'Summer vacation',          'Pending'),
    ('eeeeeeee-0007-0000-0000-eeeeeeeeeeee','LV-2026-007','aaaaaaaa-0014-0000-0000-aaaaaaaaaaaa','Annual Leave',  '2026-05-26','2026-05-28',3,'Travel plans',             'Rejected'),
    ('eeeeeeee-0008-0000-0000-eeeeeeeeeeee','LV-2026-008','aaaaaaaa-0009-0000-0000-aaaaaaaaaaaa','Personal Leave','2026-04-28','2026-04-28',1,'Moving day',               'Approved')
ON CONFLICT (leave_id) DO NOTHING;

-- ── Attendance (May 6 – June 4, 2026, all active employees) ───
INSERT INTO attendance (id, employee_id, date, check_in, check_out, status)
SELECT
    gen_random_uuid()::TEXT,
    e.id,
    d::DATE,
    CASE WHEN EXTRACT(DOW FROM d) IN (0,6) THEN NULL ELSE '09:00' END,
    CASE WHEN EXTRACT(DOW FROM d) IN (0,6) THEN NULL ELSE '17:30' END,
    CASE WHEN EXTRACT(DOW FROM d) IN (0,6) THEN 'Weekend' ELSE 'Present' END
FROM employees e
CROSS JOIN generate_series('2026-05-06'::DATE, '2026-06-04'::DATE, '1 day'::INTERVAL) d
WHERE e.status = 'Active'
ON CONFLICT (employee_id, date) DO NOTHING;

-- Mark approved leave days as Absent
UPDATE attendance SET status='Absent', check_in=NULL, check_out=NULL
WHERE employee_id='aaaaaaaa-0002-0000-0000-aaaaaaaaaaaa' AND date IN ('2026-05-19','2026-05-20','2026-05-21');
UPDATE attendance SET status='Absent', check_in=NULL, check_out=NULL
WHERE employee_id='aaaaaaaa-0005-0000-0000-aaaaaaaaaaaa' AND date IN ('2026-05-08','2026-05-09');
UPDATE attendance SET status='Absent', check_in=NULL, check_out=NULL
WHERE employee_id='aaaaaaaa-0011-0000-0000-aaaaaaaaaaaa' AND date='2026-05-15';
-- A few Late arrivals for variety
UPDATE attendance SET status='Late', check_in='09:48', check_out='17:30'
WHERE employee_id='aaaaaaaa-0003-0000-0000-aaaaaaaaaaaa' AND date='2026-05-12';
UPDATE attendance SET status='Late', check_in='10:15', check_out='18:00'
WHERE employee_id='aaaaaaaa-0007-0000-0000-aaaaaaaaaaaa' AND date='2026-05-27';
UPDATE attendance SET status='Late', check_in='09:52', check_out='17:45'
WHERE employee_id='aaaaaaaa-0010-0000-0000-aaaaaaaaaaaa' AND date='2026-05-20';

-- ── Payroll ───────────────────────────────────────────────────
-- April 2026 – Paid on 2026-05-01
-- May 2026   – Paid on 2026-06-01
-- June 2026  – Pending (in progress)
INSERT INTO payroll (id, payroll_id, employee_id, basic, bonus, deductions, net, status, month, paid_on) VALUES
    ('cccccccc-0001-0000-0000-cccccccccccc','PAY-2026-001','aaaaaaaa-0001-0000-0000-aaaaaaaaaaaa', 7916.67,    0.00,  750.00,  7166.67,'Paid',   '2026-04','2026-05-01'),
    ('cccccccc-0002-0000-0000-cccccccccccc','PAY-2026-002','aaaaaaaa-0002-0000-0000-aaaaaaaaaaaa', 6250.00,  500.00,  620.00,  6130.00,'Paid',   '2026-04','2026-05-01'),
    ('cccccccc-0003-0000-0000-cccccccccccc','PAY-2026-003','aaaaaaaa-0003-0000-0000-aaaaaaaaaaaa', 6833.33,    0.00,  680.00,  6153.33,'Paid',   '2026-04','2026-05-01'),
    ('cccccccc-0004-0000-0000-cccccccccccc','PAY-2026-004','aaaaaaaa-0004-0000-0000-aaaaaaaaaaaa', 7333.33,  300.00,  720.00,  6913.33,'Paid',   '2026-04','2026-05-01'),
    ('cccccccc-0005-0000-0000-cccccccccccc','PAY-2026-005','aaaaaaaa-0005-0000-0000-aaaaaaaaaaaa', 4833.33,    0.00,  460.00,  4373.33,'Paid',   '2026-04','2026-05-01'),
    ('cccccccc-0006-0000-0000-cccccccccccc','PAY-2026-006','aaaaaaaa-0006-0000-0000-aaaaaaaaaaaa', 8750.00, 2000.00, 1200.00,  9550.00,'Paid',   '2026-04','2026-05-01'),
    ('cccccccc-0007-0000-0000-cccccccccccc','PAY-2026-007','aaaaaaaa-0007-0000-0000-aaaaaaaaaaaa', 5416.67,    0.00,  520.00,  4896.67,'Paid',   '2026-04','2026-05-01'),
    ('cccccccc-0008-0000-0000-cccccccccccc','PAY-2026-008','aaaaaaaa-0008-0000-0000-aaaaaaaaaaaa', 7666.67, 1000.00,  860.00,  7806.67,'Paid',   '2026-04','2026-05-01'),
    ('cccccccc-0009-0000-0000-cccccccccccc','PAY-2026-009','aaaaaaaa-0009-0000-0000-aaaaaaaaaaaa', 5000.00,    0.00,  480.00,  4520.00,'Paid',   '2026-04','2026-05-01'),
    ('cccccccc-0010-0000-0000-cccccccccccc','PAY-2026-010','aaaaaaaa-0010-0000-0000-aaaaaaaaaaaa', 8166.67,  500.00,  880.00,  7786.67,'Paid',   '2026-04','2026-05-01'),
    ('cccccccc-0011-0000-0000-cccccccccccc','PAY-2026-011','aaaaaaaa-0001-0000-0000-aaaaaaaaaaaa', 7916.67,    0.00,  750.00,  7166.67,'Paid',   '2026-05','2026-06-01'),
    ('cccccccc-0012-0000-0000-cccccccccccc','PAY-2026-012','aaaaaaaa-0002-0000-0000-aaaaaaaaaaaa', 6250.00,    0.00,  600.00,  5650.00,'Paid',   '2026-05','2026-06-01'),
    ('cccccccc-0013-0000-0000-cccccccccccc','PAY-2026-013','aaaaaaaa-0003-0000-0000-aaaaaaaaaaaa', 6833.33,    0.00,  680.00,  6153.33,'Paid',   '2026-05','2026-06-01'),
    ('cccccccc-0014-0000-0000-cccccccccccc','PAY-2026-014','aaaaaaaa-0004-0000-0000-aaaaaaaaaaaa', 7333.33,    0.00,  700.00,  6633.33,'Paid',   '2026-05','2026-06-01'),
    ('cccccccc-0015-0000-0000-cccccccccccc','PAY-2026-015','aaaaaaaa-0005-0000-0000-aaaaaaaaaaaa', 4833.33,    0.00,  460.00,  4373.33,'Paid',   '2026-05','2026-06-01'),
    ('cccccccc-0016-0000-0000-cccccccccccc','PAY-2026-016','aaaaaaaa-0006-0000-0000-aaaaaaaaaaaa', 8750.00,    0.00, 1050.00,  7700.00,'Paid',   '2026-05','2026-06-01'),
    ('cccccccc-0017-0000-0000-cccccccccccc','PAY-2026-017','aaaaaaaa-0007-0000-0000-aaaaaaaaaaaa', 5416.67,    0.00,  520.00,  4896.67,'Paid',   '2026-05','2026-06-01'),
    ('cccccccc-0018-0000-0000-cccccccccccc','PAY-2026-018','aaaaaaaa-0008-0000-0000-aaaaaaaaaaaa', 7666.67,    0.00,  730.00,  6936.67,'Paid',   '2026-05','2026-06-01'),
    ('cccccccc-0019-0000-0000-cccccccccccc','PAY-2026-019','aaaaaaaa-0009-0000-0000-aaaaaaaaaaaa', 5000.00,    0.00,  480.00,  4520.00,'Paid',   '2026-05','2026-06-01'),
    ('cccccccc-0020-0000-0000-cccccccccccc','PAY-2026-020','aaaaaaaa-0010-0000-0000-aaaaaaaaaaaa', 8166.67,    0.00,  820.00,  7346.67,'Paid',   '2026-05','2026-06-01'),
    ('cccccccc-0021-0000-0000-cccccccccccc','PAY-2026-021','aaaaaaaa-0001-0000-0000-aaaaaaaaaaaa', 7916.67,    0.00,  750.00,  7166.67,'Pending','2026-06', NULL),
    ('cccccccc-0022-0000-0000-cccccccccccc','PAY-2026-022','aaaaaaaa-0006-0000-0000-aaaaaaaaaaaa', 8750.00, 1500.00, 1150.00,  9100.00,'Pending','2026-06', NULL),
    ('cccccccc-0023-0000-0000-cccccccccccc','PAY-2026-023','aaaaaaaa-0008-0000-0000-aaaaaaaaaaaa', 7666.67,  500.00,  780.00,  7386.67,'Pending','2026-06', NULL)
ON CONFLICT (payroll_id) DO NOTHING;

-- ── Payslip Items ─────────────────────────────────────────────
INSERT INTO payslip_items (payroll_id, item_type, label, amount)
SELECT v.payroll_id, v.item_type, v.label, v.amount::NUMERIC
FROM (VALUES
    ('cccccccc-0001-0000-0000-cccccccccccc','earning',   'Basic Salary',      '7916.67'),
    ('cccccccc-0001-0000-0000-cccccccccccc','deduction', 'Health Insurance',   '250.00'),
    ('cccccccc-0001-0000-0000-cccccccccccc','deduction', 'Tax Withholding',    '500.00'),
    ('cccccccc-0002-0000-0000-cccccccccccc','earning',   'Basic Salary',      '6250.00'),
    ('cccccccc-0002-0000-0000-cccccccccccc','earning',   'Performance Bonus',  '500.00'),
    ('cccccccc-0002-0000-0000-cccccccccccc','deduction', 'Health Insurance',   '220.00'),
    ('cccccccc-0002-0000-0000-cccccccccccc','deduction', 'Tax Withholding',    '400.00'),
    ('cccccccc-0006-0000-0000-cccccccccccc','earning',   'Basic Salary',      '8750.00'),
    ('cccccccc-0006-0000-0000-cccccccccccc','earning',   'Performance Bonus', '2000.00'),
    ('cccccccc-0006-0000-0000-cccccccccccc','deduction', 'Health Insurance',   '350.00'),
    ('cccccccc-0006-0000-0000-cccccccccccc','deduction', 'Tax Withholding',    '850.00'),
    ('cccccccc-0008-0000-0000-cccccccccccc','earning',   'Basic Salary',      '7666.67'),
    ('cccccccc-0008-0000-0000-cccccccccccc','earning',   'Performance Bonus', '1000.00'),
    ('cccccccc-0008-0000-0000-cccccccccccc','deduction', 'Health Insurance',   '310.00'),
    ('cccccccc-0008-0000-0000-cccccccccccc','deduction', 'Tax Withholding',    '550.00'),
    ('cccccccc-0011-0000-0000-cccccccccccc','earning',   'Basic Salary',      '7916.67'),
    ('cccccccc-0011-0000-0000-cccccccccccc','deduction', 'Health Insurance',   '250.00'),
    ('cccccccc-0011-0000-0000-cccccccccccc','deduction', 'Tax Withholding',    '500.00'),
    ('cccccccc-0016-0000-0000-cccccccccccc','earning',   'Basic Salary',      '8750.00'),
    ('cccccccc-0016-0000-0000-cccccccccccc','deduction', 'Health Insurance',   '350.00'),
    ('cccccccc-0016-0000-0000-cccccccccccc','deduction', 'Tax Withholding',    '700.00')
) AS v(payroll_id, item_type, label, amount)
WHERE NOT EXISTS (
    SELECT 1 FROM payslip_items
    WHERE payroll_id = v.payroll_id AND label = v.label
);

-- ── Performance Reviews ───────────────────────────────────────
INSERT INTO performance_reviews (id, employee_id, reviewer_id, reviewer_name, cycle, rating, stars, comments, review_date) VALUES
    ('dddddddd-0001-0000-0000-dddddddddddd','aaaaaaaa-0002-0000-0000-aaaaaaaaaaaa','bbbbbbbb-0001-0000-0000-bbbbbbbbbbbb','Alice Johnson','Annual Review 2025','Excellent',5,'Bob consistently delivers outstanding results and proactively takes on complex problems.','2025-12-10'),
    ('dddddddd-0002-0000-0000-dddddddddddd','aaaaaaaa-0003-0000-0000-aaaaaaaaaaaa','bbbbbbbb-0001-0000-0000-bbbbbbbbbbbb','Alice Johnson','Annual Review 2025','Good',     4,'Carol has excellent CI/CD skills and improved deployment reliability by 30%.','2025-12-11'),
    ('dddddddd-0003-0000-0000-dddddddddddd','aaaaaaaa-0005-0000-0000-aaaaaaaaaaaa','bbbbbbbb-0004-0000-0000-bbbbbbbbbbbb','David Brown', 'Annual Review 2025','Good',     4,'Emma handles employee queries professionally and keeps all records accurate.','2025-12-12'),
    ('dddddddd-0004-0000-0000-dddddddddddd','aaaaaaaa-0007-0000-0000-aaaaaaaaaaaa','bbbbbbbb-0006-0000-0000-bbbbbbbbbbbb','Frank Miller','Annual Review 2025','Excellent',5,'Grace produced highly accurate financial reports and identified a key cost saving.','2025-12-13'),
    ('dddddddd-0005-0000-0000-dddddddddddd','aaaaaaaa-0009-0000-0000-aaaaaaaaaaaa','bbbbbbbb-0008-0000-0000-bbbbbbbbbbbb','Henry Moore', 'Annual Review 2025','Good',     4,'Isla delivered strong campaigns that boosted social media engagement by 40%.','2025-12-14'),
    ('dddddddd-0006-0000-0000-dddddddddddd','aaaaaaaa-0011-0000-0000-aaaaaaaaaaaa','bbbbbbbb-0010-0000-0000-bbbbbbbbbbbb','James Anderson','Annual Review 2025','Average',3,'Kate is developing well but needs more experience with logistics coordination.','2025-12-15'),
    ('dddddddd-0007-0000-0000-dddddddddddd','aaaaaaaa-0012-0000-0000-aaaaaaaaaaaa','bbbbbbbb-0001-0000-0000-bbbbbbbbbbbb','Alice Johnson','Annual Review 2025','Good',     4,'Liam is a fast learner who adapted quickly to the tech stack in his first year.','2025-12-16'),
    ('dddddddd-0008-0000-0000-dddddddddddd','aaaaaaaa-0014-0000-0000-aaaaaaaaaaaa','bbbbbbbb-0006-0000-0000-bbbbbbbbbbbb','Frank Miller','Annual Review 2025','Average',  3,'Noah needs to improve deadline management. Technical skills are solid.','2025-12-17'),
    ('dddddddd-0009-0000-0000-dddddddddddd','aaaaaaaa-0002-0000-0000-aaaaaaaaaaaa','bbbbbbbb-0013-0000-0000-bbbbbbbbbbbb','Mia Robinson','Mid-Year Review 2026','Excellent',5,'Bob delivered the Q1 feature release 2 weeks ahead of schedule. Exceptional.','2026-06-01'),
    ('dddddddd-0010-0000-0000-dddddddddddd','aaaaaaaa-0003-0000-0000-aaaaaaaaaaaa','bbbbbbbb-0013-0000-0000-bbbbbbbbbbbb','Mia Robinson','Mid-Year Review 2026','Good',     4,'Carol has been instrumental in stabilising the Kubernetes deployment pipeline.','2026-06-01'),
    ('dddddddd-0011-0000-0000-dddddddddddd','aaaaaaaa-0012-0000-0000-aaaaaaaaaaaa','bbbbbbbb-0013-0000-0000-bbbbbbbbbbbb','Mia Robinson','Mid-Year Review 2026','Good',     4,'Liam shipped 3 independent features in H1 with high code quality.','2026-06-02'),
    ('dddddddd-0012-0000-0000-dddddddddddd','aaaaaaaa-0007-0000-0000-aaaaaaaaaaaa','bbbbbbbb-0006-0000-0000-bbbbbbbbbbbb','Frank Miller','Mid-Year Review 2026','Excellent',5,'Grace led the Q1 audit with zero discrepancies. Exceptional contribution.','2026-06-03')
ON CONFLICT (id) DO NOTHING;

-- ── Notifications ─────────────────────────────────────────────
INSERT INTO notifications (user_id, title, body, icon, color, read)
SELECT v.user_id, v.title, v.body, v.icon, v.color, v.read::BOOLEAN
FROM (VALUES
    ('bbbbbbbb-0001-0000-0000-bbbbbbbbbbbb','Welcome to Kinetic HR',       'Your account is ready. Explore the HR dashboard to get started.',                   'waving_hand',    'primary',   'false'),
    ('bbbbbbbb-0001-0000-0000-bbbbbbbbbbbb','Pending Leave Requests',      '2 leave requests are awaiting your approval.',                                        'pending_actions','tertiary',  'false'),
    ('bbbbbbbb-0002-0000-0000-bbbbbbbbbbbb','Welcome to Kinetic HR',       'Your employee account has been set up successfully.',                                 'waving_hand',    'primary',   'true'),
    ('bbbbbbbb-0002-0000-0000-bbbbbbbbbbbb','Leave Approved',              'Your Annual Leave (LV-2026-001) for May 19-21 has been approved.',                    'check_circle',   'secondary', 'false'),
    ('bbbbbbbb-0002-0000-0000-bbbbbbbbbbbb','Payslip Ready',               'Your April 2026 payslip is now available to view.',                                   'receipt_long',   'primary',   'false'),
    ('bbbbbbbb-0003-0000-0000-bbbbbbbbbbbb','Welcome to Kinetic HR',       'Your employee account has been set up successfully.',                                 'waving_hand',    'primary',   'false'),
    ('bbbbbbbb-0004-0000-0000-bbbbbbbbbbbb','Welcome to Kinetic HR',       'Your HR Manager account is ready. You can now manage employee operations.',           'waving_hand',    'primary',   'true'),
    ('bbbbbbbb-0004-0000-0000-bbbbbbbbbbbb','New Leave Request',           'Carol Smith submitted a Personal Leave request for Jun 10.',                          'mail',           'tertiary',  'false'),
    ('bbbbbbbb-0004-0000-0000-bbbbbbbbbbbb','New Leave Request',           'Grace Wilson submitted an Annual Leave request for Jun 15-19.',                       'mail',           'tertiary',  'false'),
    ('bbbbbbbb-0005-0000-0000-bbbbbbbbbbbb','Leave Approved',              'Your Sick Leave (LV-2026-002) for May 8-9 has been approved.',                        'check_circle',   'secondary', 'true'),
    ('bbbbbbbb-0006-0000-0000-bbbbbbbbbbbb','Payroll Pending Approval',    'June 2026 payroll for your team has been submitted for review.',                      'payments',       'primary',   'false'),
    ('bbbbbbbb-0006-0000-0000-bbbbbbbbbbbb','Mid-Year Reviews',            'You have 1 team member pending mid-year review.',                                     'rate_review',    'tertiary',  'false'),
    ('bbbbbbbb-0008-0000-0000-bbbbbbbbbbbb','Payroll Pending Approval',    'June 2026 payroll for your team has been submitted for review.',                      'payments',       'primary',   'false'),
    ('bbbbbbbb-0010-0000-0000-bbbbbbbbbbbb','Welcome to Kinetic HR',       'Your Manager account is ready.',                                                      'waving_hand',    'primary',   'true'),
    ('bbbbbbbb-0013-0000-0000-bbbbbbbbbbbb','Mid-Year Reviews Complete',   'You have completed mid-year reviews for all Engineering team members.',               'task_alt',       'secondary', 'false')
) AS v(user_id, title, body, icon, color, read)
WHERE NOT EXISTS (
    SELECT 1 FROM notifications WHERE user_id = v.user_id AND title = v.title
);

-- ============================================================
-- EMS Operations — Seed Data
-- Runs after 01_schema.sql on first container boot.
-- The admin USER is seeded by the FastAPI lifespan on startup
-- (see backend/app/main.py _seed function) because its
-- password must be hashed at runtime from the ADMIN_PASSWORD
-- environment variable.
-- ============================================================

-- ── System Roles ─────────────────────────────────────────────
INSERT INTO roles (name, description, is_system) VALUES
    ('Admin',      'Full system access',                TRUE),
    ('HR Manager', 'HR and employee management',        TRUE),
    ('Manager',    'Team and performance management',   TRUE),
    ('Employee',   'Personal profile and attendance',   TRUE)
ON CONFLICT (name) DO NOTHING;

-- ── Role Permissions ─────────────────────────────────────────
-- Admin gets every permission enabled; all others start disabled.
INSERT INTO role_permissions (role_id, module, permission, enabled)
SELECT
    r.id,
    m.module,
    m.permission,
    (r.name = 'Admin') AS enabled
FROM roles r
CROSS JOIN (VALUES
    ('Dashboard Module',   'View Analytics'),
    ('Dashboard Module',   'Edit Widgets'),
    ('Employee Module',    'View Directory'),
    ('Employee Module',    'Add/Delete'),
    ('Employee Module',    'Modify Records'),
    ('Employee Module',    'Document Access'),
    ('Payroll Module',     'Process Salaries'),
    ('Payroll Module',     'Tax Reporting'),
    ('Payroll Module',     'Bonus Management'),
    ('Attendance & Leave', 'View Attendance'),
    ('Attendance & Leave', 'Approve Leaves'),
    ('Attendance & Leave', 'Overtime Control')
) AS m(module, permission)
ON CONFLICT DO NOTHING;

-- ── System Settings (singleton row) ──────────────────────────
INSERT INTO system_settings (id, org_name)
VALUES (1, 'EMS Operations')
ON CONFLICT (id) DO NOTHING;

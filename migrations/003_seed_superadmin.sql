
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO admin_department_users (
  username, email, password, role, is_active, email_verified, department_type, company_name
)
VALUES (
  'superadmin',
  'admin@anocab.com',
  crypt('Admin123!', gen_salt('bf', 12)),
  'superadmin',
  true,
  true,
  NULL,
  NULL
)
ON CONFLICT (email) DO UPDATE
SET 
  password = EXCLUDED.password,
  role = 'superadmin',
  is_active = true,
  email_verified = true,
  department_type = NULL,
  company_name = NULL;



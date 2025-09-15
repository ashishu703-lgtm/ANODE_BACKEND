-- Ensure non-null fields for department users and disallow superadmin role here
ALTER TABLE admin_department_users 
  DROP CONSTRAINT IF EXISTS admin_department_users_role_check;

ALTER TABLE admin_department_users 
  ADD CONSTRAINT admin_department_users_role_check 
  CHECK (role IN ('department_user', 'department_head'));

ALTER TABLE admin_department_users DROP CONSTRAINT IF EXISTS admin_dept_users_department_type_nn;
ALTER TABLE admin_department_users ADD CONSTRAINT admin_dept_users_department_type_nn CHECK (department_type IS NOT NULL);

ALTER TABLE admin_department_users DROP CONSTRAINT IF EXISTS admin_dept_users_company_name_nn;
ALTER TABLE admin_department_users ADD CONSTRAINT admin_dept_users_company_name_nn CHECK (company_name IS NOT NULL);

ALTER TABLE admin_department_users DROP CONSTRAINT IF EXISTS admin_dept_users_username_nn;
ALTER TABLE admin_department_users ADD CONSTRAINT admin_dept_users_username_nn CHECK (username IS NOT NULL);

ALTER TABLE admin_department_users DROP CONSTRAINT IF EXISTS admin_dept_users_email_nn;
ALTER TABLE admin_department_users ADD CONSTRAINT admin_dept_users_email_nn CHECK (email IS NOT NULL);

ALTER TABLE admin_department_users DROP CONSTRAINT IF EXISTS admin_dept_users_password_nn;
ALTER TABLE admin_department_users ADD CONSTRAINT admin_dept_users_password_nn CHECK (password IS NOT NULL);

-- Drop any prior constraint that allowed nulls for superadmin
ALTER TABLE admin_department_users 
  DROP CONSTRAINT IF EXISTS check_superadmin_fields;



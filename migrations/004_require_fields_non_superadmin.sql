
ALTER TABLE admin_department_users 
DROP CONSTRAINT IF EXISTS check_superadmin_fields;

ALTER TABLE admin_department_users 
ADD CONSTRAINT check_superadmin_fields 
CHECK (
  (role = 'superadmin' AND department_type IS NULL AND company_name IS NULL) OR
  (role != 'superadmin' AND department_type IS NOT NULL AND company_name IS NOT NULL)
);



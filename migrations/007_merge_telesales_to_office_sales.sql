-- Migration to merge telesales department into office_sales
-- This migration updates all telesales users to office_sales department

BEGIN;

-- Update all telesales users to office_sales
UPDATE admin_department_users 
SET department_type = 'office_sales' 
WHERE department_type = 'telesales';

-- Add a comment to track the migration
COMMENT ON TABLE admin_department_users IS 'Updated: Merged telesales department into office_sales department - ' || CURRENT_TIMESTAMP;

COMMIT;

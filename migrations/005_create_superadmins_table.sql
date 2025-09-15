CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a dedicated table for super admin users to avoid null mismatches
CREATE TABLE IF NOT EXISTS superadmins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL DEFAULT 'superadmin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_superadmins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_superadmins_updated_at ON superadmins;
CREATE TRIGGER trigger_update_superadmins_updated_at
  BEFORE UPDATE ON superadmins
  FOR EACH ROW
  EXECUTE FUNCTION update_superadmins_updated_at();

-- Seed or migrate existing superadmin from admin_department_users if exists
INSERT INTO superadmins (email, password, username, is_active, email_verified)
SELECT email, password, COALESCE(username, 'superadmin'), COALESCE(is_active, true), COALESCE(email_verified, true)
FROM admin_department_users
WHERE role = 'superadmin'
ON CONFLICT (email) DO NOTHING;

-- Remove migrated superadmin rows from admin_department_users to avoid duplicates
DELETE FROM admin_department_users WHERE role = 'superadmin';



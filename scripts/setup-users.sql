-- ============================================================================
-- USER SETUP SCRIPT
-- ============================================================================
-- This script helps you create memberships and link users to database records
-- 
-- PREREQUISITES:
-- 1. Create users in Supabase Dashboard (Auth → Users):
--    - admin@drivercloud.com (password: Admin123!)
--    - juan.perez@example.com (password: Student123!)
--    - maria.gonzalez@example.com (password: Instructor123!)
-- 2. Mark "Auto Confirm Email" when creating each user
-- 3. Run this script in Supabase SQL Editor

-- ============================================================================
-- STEP 1: Check existing users
-- ============================================================================
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users
ORDER BY created_at DESC;

-- ============================================================================
-- STEP 2: Link users to database records
-- ============================================================================

-- Link student user to student record
UPDATE students 
SET user_id = (SELECT id FROM auth.users WHERE email = 'juan.perez@example.com')
WHERE email = 'juan.perez@example.com'
  AND user_id IS NULL;

-- Link instructor user to instructor record
UPDATE instructors 
SET user_id = (SELECT id FROM auth.users WHERE email = 'maria.gonzalez@example.com')
WHERE email = 'maria.gonzalez@example.com'
  AND user_id IS NULL;

-- ============================================================================
-- STEP 3: Create memberships for all users
-- ============================================================================

-- Admin membership
INSERT INTO memberships (user_id, owner_id, school_id, location_id, role)
SELECT 
  id,
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000003'::uuid,
  'admin'
FROM auth.users
WHERE email = 'admin@drivercloud.com'
  AND NOT EXISTS (
    SELECT 1 FROM memberships 
    WHERE user_id = auth.users.id 
      AND role = 'admin'
  );

-- Student membership
INSERT INTO memberships (user_id, owner_id, school_id, location_id, role)
SELECT 
  id,
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000003'::uuid,
  'student'
FROM auth.users
WHERE email = 'juan.perez@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM memberships 
    WHERE user_id = auth.users.id 
      AND role = 'student'
  );

-- Instructor membership
INSERT INTO memberships (user_id, owner_id, school_id, location_id, role)
SELECT 
  id,
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000003'::uuid,
  'instructor'
FROM auth.users
WHERE email = 'maria.gonzalez@example.com'
  AND NOT EXISTS (
    SELECT 1 FROM memberships 
    WHERE user_id = auth.users.id 
      AND role = 'instructor'
  );

-- ============================================================================
-- STEP 4: Verify memberships created
-- ============================================================================
SELECT 
  u.email,
  m.role,
  s.name as school_name,
  l.name as location_name
FROM memberships m
JOIN auth.users u ON u.id = m.user_id
JOIN schools s ON s.id = m.school_id
LEFT JOIN locations l ON l.id = m.location_id
WHERE m.deleted_at IS NULL
ORDER BY u.email, m.role;

-- ============================================================================
-- STEP 5: Verify student/instructor linkage
-- ============================================================================
SELECT 
  'Student' as type,
  s.first_name || ' ' || s.last_name as name,
  s.email,
  u.email as auth_email,
  CASE WHEN s.user_id IS NOT NULL THEN 'Linked ✅' ELSE 'Not linked ❌' END as status
FROM students s
LEFT JOIN auth.users u ON u.id = s.user_id
WHERE s.deleted_at IS NULL

UNION ALL

SELECT 
  'Instructor' as type,
  i.first_name || ' ' || i.last_name as name,
  i.email,
  u.email as auth_email,
  CASE WHEN i.user_id IS NOT NULL THEN 'Linked ✅' ELSE 'Not linked ❌' END as status
FROM instructors i
LEFT JOIN auth.users u ON u.id = i.user_id
WHERE i.deleted_at IS NULL;

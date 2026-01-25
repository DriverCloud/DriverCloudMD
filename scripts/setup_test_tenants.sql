-- ============================================================================
-- SETUP TEST TENANTS (CORRECTED)
-- Creates 2 Schools and 2 Admins to verify Data Isolation
-- ============================================================================

-- 1. Create Schools (Without slug column)
INSERT INTO public.schools (id, name)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Test School A'),
    ('22222222-2222-2222-2222-222222222222', 'Test School B')
ON CONFLICT (id) DO NOTHING;

-- 2. Configure Memberships

-- Admin A (admin@drivercloud.com) -> School A
UPDATE public.memberships 
SET school_id = '11111111-1111-1111-1111-111111111111', role = 'admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@drivercloud.com');

-- Admin B (maria.gonzalez@example.com) -> School B
-- Update existing membership if exists, or insert new one. 
-- Assuming location_id is not strictly required or reusing generic one if constraint exists.
INSERT INTO public.memberships (user_id, school_id, role, owner_id, location_id)
SELECT id, '22222222-2222-2222-2222-222222222222', 'admin', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'
FROM auth.users WHERE email = 'maria.gonzalez@example.com'
ON CONFLICT (user_id) DO UPDATE 
SET school_id = '22222222-2222-2222-2222-222222222222', role = 'admin';

-- 3. Clean Data for clarity
DELETE FROM public.students WHERE email LIKE '%@test-isolation.com';
DELETE FROM public.expenses WHERE description LIKE 'Test Isolation%';

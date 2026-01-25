-- ============================================================================
-- SECURITY HARDENING MIGRATION
-- Fixes critical RLS vulnerabilities identified in audit
-- ============================================================================

-- 1. EXPENSES
-- Enable RLS and restrict to school members
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view expenses of their school" ON public.expenses;
CREATE POLICY "Users can view expenses of their school"
ON public.expenses FOR SELECT
TO authenticated
USING (
  school_id IN (
    SELECT school_id FROM public.memberships
    WHERE user_id = auth.uid()
    AND deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "Users can manage expenses of their school" ON public.expenses;
CREATE POLICY "Users can manage expenses of their school"
ON public.expenses FOR ALL
TO authenticated
USING (
  school_id IN (
    SELECT school_id FROM public.memberships
    WHERE user_id = auth.uid()
    AND deleted_at IS NULL
  )
)
WITH CHECK (
  school_id IN (
    SELECT school_id FROM public.memberships
    WHERE user_id = auth.uid()
    AND deleted_at IS NULL
  )
);

-- 2. VEHICLE DOCUMENTS
-- Restrict based on vehicle's ownership
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view documents of their school vehicles" ON public.vehicle_documents;
CREATE POLICY "Users can view documents of their school vehicles"
ON public.vehicle_documents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.memberships m ON v.school_id = m.school_id
    WHERE v.id = vehicle_documents.vehicle_id
    AND m.user_id = auth.uid()
    AND m.deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "Users can manage documents of their school vehicles" ON public.vehicle_documents;
CREATE POLICY "Users can manage documents of their school vehicles"
ON public.vehicle_documents FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.memberships m ON v.school_id = m.school_id
    WHERE v.id = vehicle_documents.vehicle_id
    AND m.user_id = auth.uid()
    AND m.deleted_at IS NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.memberships m ON v.school_id = m.school_id
    WHERE v.id = vehicle_documents.vehicle_id
    AND m.user_id = auth.uid()
    AND m.deleted_at IS NULL
  )
);

-- 3. VEHICLE SERVICE RECORDS
-- Restrict based on vehicle's ownership
ALTER TABLE public.vehicle_service_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view service records of their school vehicles" ON public.vehicle_service_records;
CREATE POLICY "Users can view service records of their school vehicles"
ON public.vehicle_service_records FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.memberships m ON v.school_id = m.school_id
    WHERE v.id = vehicle_service_records.vehicle_id
    AND m.user_id = auth.uid()
    AND m.deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "Users can manage service records of their school vehicles" ON public.vehicle_service_records;
CREATE POLICY "Users can manage service records of their school vehicles"
ON public.vehicle_service_records FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.memberships m ON v.school_id = m.school_id
    WHERE v.id = vehicle_service_records.vehicle_id
    AND m.user_id = auth.uid()
    AND m.deleted_at IS NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.memberships m ON v.school_id = m.school_id
    WHERE v.id = vehicle_service_records.vehicle_id
    AND m.user_id = auth.uid()
    AND m.deleted_at IS NULL
  )
);

-- 4. FIX INSTRUCTOR PAYMENTS
-- Drop permissive policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.instructor_payments;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.instructor_payments;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.instructor_payments;

-- Add strict policies
CREATE POLICY "Users can view instructor payments of their school"
ON public.instructor_payments FOR SELECT
TO authenticated
USING (
  school_id IN (
    SELECT school_id FROM public.memberships
    WHERE user_id = auth.uid()
    AND deleted_at IS NULL
  )
);

CREATE POLICY "Users can manage instructor payments of their school"
ON public.instructor_payments FOR ALL
TO authenticated
USING (
  school_id IN (
    SELECT school_id FROM public.memberships
    WHERE user_id = auth.uid()
    AND deleted_at IS NULL
  )
)
WITH CHECK (
  school_id IN (
    SELECT school_id FROM public.memberships
    WHERE user_id = auth.uid()
    AND deleted_at IS NULL
  )
);

-- 5. FIX INSTRUCTOR RATES
-- Drop permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.instructor_rates;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.instructor_rates;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.instructor_rates;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.instructor_rates;

-- Add strict policies
CREATE POLICY "Users can view rates of their school instructors"
ON public.instructor_rates FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.instructors i
    JOIN public.memberships m ON i.school_id = m.school_id
    WHERE i.id = instructor_rates.instructor_id
    AND m.user_id = auth.uid()
    AND m.deleted_at IS NULL
  )
);

CREATE POLICY "Users can manage rates of their school instructors"
ON public.instructor_rates FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.instructors i
    JOIN public.memberships m ON i.school_id = m.school_id
    WHERE i.id = instructor_rates.instructor_id
    AND m.user_id = auth.uid()
    AND m.deleted_at IS NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.instructors i
    JOIN public.memberships m ON i.school_id = m.school_id
    WHERE i.id = instructor_rates.instructor_id
    AND m.user_id = auth.uid()
    AND m.deleted_at IS NULL
  )
);

-- 6. FIX STUDENT PACKAGES
-- Drop permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.student_packages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.student_packages;

-- Add strict policies
CREATE POLICY "Users can view packages of their school students"
ON public.student_packages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.memberships m ON s.school_id = m.school_id
    WHERE s.id = student_packages.student_id
    AND m.user_id = auth.uid()
    AND m.deleted_at IS NULL
  )
);

CREATE POLICY "Users can manage packages of their school students"
ON public.student_packages FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.memberships m ON s.school_id = m.school_id
    WHERE s.id = student_packages.student_id
    AND m.user_id = auth.uid()
    AND m.deleted_at IS NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.memberships m ON s.school_id = m.school_id
    WHERE s.id = student_packages.student_id
    AND m.user_id = auth.uid()
    AND m.deleted_at IS NULL
  )
);

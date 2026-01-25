-- ============================================================================
-- PERFORMANCE HARDENING MIGRATION
-- Adds missing indexes on school_id for critical tables
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_instructors_school_id ON public.instructors(school_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_school_id ON public.vehicles(school_id);
CREATE INDEX IF NOT EXISTS idx_appointments_school_id ON public.appointments(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_school_id ON public.payments(school_id);

-- Also add index on deleted_at for soft delete performance
CREATE INDEX IF NOT EXISTS idx_students_deleted_at ON public.students(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_instructors_deleted_at ON public.instructors(deleted_at) WHERE deleted_at IS NULL;

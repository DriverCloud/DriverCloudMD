-- 1. Add 'end_mileage' column to appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS end_mileage INTEGER;

-- 2. Ensure Instructors have user_id (Add column if missing)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instructors' AND column_name = 'user_id') THEN 
        ALTER TABLE instructors ADD COLUMN user_id uuid REFERENCES auth.users(id);
    END IF; 
END $$;

-- 3. Allow Instructors to UPDATE their own appointments (e.g. status, notes, end_mileage)
-- Drop existing policy if it exists to avoid conflict
DROP POLICY IF EXISTS "Instructors can update their own classes" ON public.appointments;

CREATE POLICY "Instructors can update their own classes"
ON public.appointments
FOR UPDATE
TO authenticated
USING (
  instructor_id IN (
    SELECT id FROM public.instructors
    WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email'
  )
)
WITH CHECK (
  instructor_id IN (
    SELECT id FROM public.instructors
    WHERE user_id = auth.uid() OR email = auth.jwt() ->> 'email'
  )
);

-- 4. Trigger to Update Vehicle Mileage
CREATE OR REPLACE FUNCTION update_vehicle_mileage_on_class_finish()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_mileage IS DISTINCT FROM OLD.end_mileage AND NEW.end_mileage IS NOT NULL THEN
        UPDATE public.vehicles
        SET current_mileage = NEW.end_mileage, updated_at = now()
        WHERE id = NEW.vehicle_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_vehicle_mileage_trigger ON public.appointments;
CREATE TRIGGER update_vehicle_mileage_trigger
AFTER UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION update_vehicle_mileage_on_class_finish();

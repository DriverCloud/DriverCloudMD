-- 1. Ensure Instructors have user_id (Add column if missing)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instructors' AND column_name = 'user_id') THEN 
        ALTER TABLE instructors ADD COLUMN user_id uuid REFERENCES auth.users(id);
    END IF; 
END $$;

-- 2. Allow Instructors to UPDATE their own appointments (e.g. status, notes, end_mileage)
CREATE POLICY "Instructors can update their own classes"
ON public.appointments
FOR UPDATE
TO authenticated
USING (
  instructor_id IN (
    SELECT id FROM public.instructors
    WHERE user_id = auth.uid()
    OR email = auth.jwt() ->> 'email' -- Fallback via email if user_id not set
  )
)
WITH CHECK (
  instructor_id IN (
    SELECT id FROM public.instructors
    WHERE user_id = auth.uid()
    OR email = auth.jwt() ->> 'email'
  )
);

-- 3. Create Trigger Function to Update Vehicle Mileage
CREATE OR REPLACE FUNCTION update_vehicle_mileage_on_class_finish()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run if end_mileage changed and is not null
    IF NEW.end_mileage IS DISTINCT FROM OLD.end_mileage AND NEW.end_mileage IS NOT NULL THEN
        UPDATE public.vehicles
        SET current_mileage = NEW.end_mileage,
            updated_at = now()
        WHERE id = NEW.vehicle_id
        AND (current_mileage IS NULL OR current_mileage < NEW.end_mileage); -- Prevent decreasing mileage errors
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER allows bypassing RLS on vehicles table

-- 4. Attach Trigger to Appointments
DROP TRIGGER IF EXISTS update_vehicle_mileage_trigger ON public.appointments;
CREATE TRIGGER update_vehicle_mileage_trigger
AFTER UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION update_vehicle_mileage_on_class_finish();

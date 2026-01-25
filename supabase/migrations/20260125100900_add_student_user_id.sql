-- Add user_id to students table to link with auth.users
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable RLS on students table (if not already enabled)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy: Admins have full access (Assuming existing policies might cover this, but ensuring clarity)
-- Note: You might already have a policy for this, if so, this might conflict or be redundant. 
-- Adjusting to be safe/granular.

-- Policy: Students can view their OWN profile
CREATE POLICY "Students can view own profile" 
ON students 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update Appointments Policy so students can see their own classes
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own appointments" 
ON appointments 
FOR SELECT 
USING (
    student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    )
);

-- Note: We might need policies for viewing related data (vehicles, instructors) if we want to show details.
-- For now, basic access.

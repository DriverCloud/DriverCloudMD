-- Create course_packages table
CREATE TABLE IF NOT EXISTS public.course_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) NOT NULL,
    owner_id UUID REFERENCES public.owners(id) NOT NULL,
    name TEXT NOT NULL,
    class_count INTEGER NOT NULL DEFAULT 1,
    price NUMERIC NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.course_packages ENABLE ROW LEVEL SECURITY;

-- Create Policies (mirroring class_types or generic tenant access)
-- Assuming memberships link users to schools

CREATE POLICY "Users can view course_packages for their school" ON public.course_packages
    FOR SELECT USING (
        school_id IN (
            SELECT school_id FROM public.memberships WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Instructors/Admins can insert course_packages" ON public.course_packages
    FOR INSERT WITH CHECK (
        school_id IN (
            SELECT school_id FROM public.memberships 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner') -- restricting to admin/owner usually
        )
    );

CREATE POLICY "Instructors/Admins can update course_packages" ON public.course_packages
    FOR UPDATE USING (
        school_id IN (
            SELECT school_id FROM public.memberships 
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'owner')
        )
    );

-- Add updated_at trigger if generic trigger exists, otherwise simple default is fine for now

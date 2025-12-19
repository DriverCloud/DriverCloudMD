CREATE TABLE IF NOT EXISTS public.student_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    credits INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies if needed, for now allow all for testing or basic auth
ALTER TABLE public.student_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.student_packages FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.student_packages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

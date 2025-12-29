-- Agregar total_credits para saber el tamaño original del paquete en student_packages
ALTER TABLE public.student_packages ADD COLUMN IF NOT EXISTS total_credits INTEGER;

-- Inicializar total_credits con el valor actual de credits para datos existentes
UPDATE public.student_packages SET total_credits = credits WHERE total_credits IS NULL;

-- Agregar package_id y class_number a appointments
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES public.student_packages(id);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS class_number INTEGER;

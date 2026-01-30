-- Add created_by column to expenses table
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Create function to get user display name from auth.users
CREATE OR REPLACE FUNCTION public.get_user_name(uid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  u_email text;
  u_meta jsonb;
BEGIN
  -- Check if uid is null
  IF uid IS NULL THEN
    RETURN 'Sistema';
  END IF;

  SELECT email, raw_user_meta_data INTO u_email, u_meta FROM auth.users WHERE id = uid;
  
  -- Try to get name from metadata, fall back to email, then 'Usuario desconocido'
  IF u_meta->>'first_name' IS NOT NULL AND u_meta->>'last_name' IS NOT NULL THEN
    RETURN (u_meta->>'first_name') || ' ' || (u_meta->>'last_name');
  ELSIF u_meta->>'name' IS NOT NULL THEN
    RETURN u_meta->>'name';
  ELSIF u_meta->>'full_name' IS NOT NULL THEN
    RETURN u_meta->>'full_name';
  ELSIF u_email IS NOT NULL THEN
    RETURN u_email;
  ELSE
    RETURN 'Usuario desconocido';
  END IF;
END;
$$;

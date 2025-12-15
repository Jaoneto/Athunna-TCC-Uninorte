-- Fix role storage violation: Update security functions to check user_roles table
-- This prevents privilege escalation by ensuring roles are checked from the protected user_roles table

-- Update get_user_role function to check user_roles table instead of usuarios
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Update is_admin function to use has_role function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- The tipo_perfil column in usuarios table remains for display purposes only
-- All authorization checks now use the protected user_roles table via security definer functions
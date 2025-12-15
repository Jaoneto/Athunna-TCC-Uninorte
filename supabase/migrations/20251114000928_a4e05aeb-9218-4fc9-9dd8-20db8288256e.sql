-- Fix critical security issue: Replace public access policy with user-scoped access
DROP POLICY IF EXISTS "Users can view all profiles" ON public.usuarios;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.usuarios
FOR SELECT 
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.usuarios
FOR SELECT 
USING (is_admin(auth.uid()));
-- Fix infinite recursion in leases policies and assign user role
-- First, drop duplicate and problematic policies
DROP POLICY IF EXISTS "secure_leases_select" ON public.leases;
DROP POLICY IF EXISTS "secure_leases_insert" ON public.leases;
DROP POLICY IF EXISTS "secure_leases_update" ON public.leases;
DROP POLICY IF EXISTS "secure_leases_delete" ON public.leases;

-- Keep only the main policies with clear names
-- The policies "secure_leases_read", "secure_leases_create", "secure_leases_modify", "secure_leases_remove" will remain

-- Also ensure user has a role assigned
-- Insert owner role for the current user if not exists
INSERT INTO public.user_roles (user_id, role)
SELECT '60224fed-bbed-420c-88d4-9beb93fa3523', 'owner'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '60224fed-bbed-420c-88d4-9beb93fa3523'
);
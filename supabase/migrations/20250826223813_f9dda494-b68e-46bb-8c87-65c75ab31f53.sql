-- Fix the infinite recursion in leases policies once and for all

-- First, drop ALL leases policies to start fresh
DROP POLICY IF EXISTS "Tenants can view their own leases" ON public.leases;
DROP POLICY IF EXISTS "secure_leases_create" ON public.leases;
DROP POLICY IF EXISTS "secure_leases_modify" ON public.leases;
DROP POLICY IF EXISTS "secure_leases_read" ON public.leases;
DROP POLICY IF EXISTS "secure_leases_remove" ON public.leases;

-- Create simple, non-recursive policies for leases
CREATE POLICY "leases_owners_full_access" ON public.leases
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "leases_tenants_view_only" ON public.leases
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenants t 
    WHERE t.id = leases.tenant_id 
    AND t.user_id = auth.uid()
  )
);
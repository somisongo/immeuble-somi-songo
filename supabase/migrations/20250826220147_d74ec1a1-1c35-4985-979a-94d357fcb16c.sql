-- Fix security vulnerability in tenants table RLS policies
-- Remove the overly permissive policy that allows owners to see all tenant data
DROP POLICY IF EXISTS "tenants_select_own" ON public.tenants;

-- Create a secure policy that only allows owners to see tenants of their own properties
-- This is done by checking if there exists a lease that connects the tenant to a property owned by the current user
CREATE POLICY "secure_tenants_select_own_properties" 
ON public.tenants 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL) AND (
    -- Allow owners to see tenants only if they have a lease on the owner's property
    EXISTS (
      SELECT 1 
      FROM public.leases l
      WHERE l.tenant_id = tenants.id 
        AND l.owner_id = auth.uid()
    )
  )
);

-- Update the insert policy to be more restrictive as well
DROP POLICY IF EXISTS "tenants_insert_own" ON public.tenants;
CREATE POLICY "secure_tenants_insert_own" 
ON public.tenants 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL) AND (auth.uid() = owner_id)
);

-- Update the update policy to ensure owners can only update tenants of their own properties
DROP POLICY IF EXISTS "tenants_update_own" ON public.tenants;
CREATE POLICY "secure_tenants_update_own_properties" 
ON public.tenants 
FOR UPDATE 
USING (
  (auth.uid() IS NOT NULL) AND (
    EXISTS (
      SELECT 1 
      FROM public.leases l
      WHERE l.tenant_id = tenants.id 
        AND l.owner_id = auth.uid()
    )
  )
)
WITH CHECK (
  (auth.uid() IS NOT NULL) AND (
    EXISTS (
      SELECT 1 
      FROM public.leases l
      WHERE l.tenant_id = tenants.id 
        AND l.owner_id = auth.uid()
    )
  )
);

-- Update the delete policy to ensure owners can only delete tenants of their own properties
DROP POLICY IF EXISTS "tenants_delete_own" ON public.tenants;
CREATE POLICY "secure_tenants_delete_own_properties" 
ON public.tenants 
FOR DELETE 
USING (
  (auth.uid() IS NOT NULL) AND (
    EXISTS (
      SELECT 1 
      FROM public.leases l
      WHERE l.tenant_id = tenants.id 
        AND l.owner_id = auth.uid()
    )
  )
);
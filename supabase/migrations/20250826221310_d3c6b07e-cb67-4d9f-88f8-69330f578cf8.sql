-- Fix remaining policy issues and ensure user has proper role

-- First check and fix tenants policies to avoid recursion
-- Drop problematic tenant policies and recreate them properly
DROP POLICY IF EXISTS "secure_tenants_update_own_properties" ON public.tenants;
DROP POLICY IF EXISTS "secure_tenants_delete_own_properties" ON public.tenants;

-- Create simpler, non-recursive policies for tenants
CREATE POLICY "tenants_update_own" ON public.tenants
FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "tenants_delete_own" ON public.tenants  
FOR DELETE
USING (auth.uid() = owner_id);

-- Ensure the user role exists and fix the useUserRole query issue
-- The issue is that .single() fails when no row exists, we need the row to exist
INSERT INTO public.user_roles (user_id, role)
VALUES ('60224fed-bbed-420c-88d4-9beb93fa3523', 'owner'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
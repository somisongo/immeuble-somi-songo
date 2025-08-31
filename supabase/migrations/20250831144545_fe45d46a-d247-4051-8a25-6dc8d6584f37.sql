-- First drop the problematic policies that create circular references
DROP POLICY IF EXISTS "Tenants can view their rented properties" ON properties;
DROP POLICY IF EXISTS "leases_tenants_view_only" ON leases;

-- Create a security definer function to check if user is tenant of a property
CREATE OR REPLACE FUNCTION public.is_property_tenant(_property_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM leases l
    JOIN tenants t ON t.id = l.tenant_id
    WHERE l.property_id = _property_id
      AND t.user_id = _user_id
      AND l.status = 'active'
  );
$$;

-- Create a security definer function to check if user is tenant of a lease
CREATE OR REPLACE FUNCTION public.is_lease_tenant(_lease_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM leases l
    JOIN tenants t ON t.id = l.tenant_id
    WHERE l.id = _lease_id
      AND t.user_id = _user_id
  );
$$;

-- Recreate the properties policy using the security definer function
CREATE POLICY "Tenants can view their rented properties"
ON properties
FOR SELECT
USING (public.is_property_tenant(id, auth.uid()));

-- Recreate the leases policy using the security definer function
CREATE POLICY "leases_tenants_view_only"
ON leases
FOR SELECT
USING (public.is_lease_tenant(id, auth.uid()));
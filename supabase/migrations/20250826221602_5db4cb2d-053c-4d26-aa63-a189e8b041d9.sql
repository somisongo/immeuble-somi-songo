-- Clean up duplicate policies that might be causing conflicts

-- Remove duplicate property policies (keep only the main ones)
DROP POLICY IF EXISTS "secure_properties_delete" ON public.properties;
DROP POLICY IF EXISTS "secure_properties_insert" ON public.properties;
DROP POLICY IF EXISTS "secure_properties_select" ON public.properties;
DROP POLICY IF EXISTS "secure_properties_update" ON public.properties;

-- These will remain: secure_properties_read, secure_properties_create, secure_properties_modify, secure_properties_remove

-- Also make sure we have some sample data for testing
-- Insert a test property for the current user if none exists
INSERT INTO public.properties (unit_number, bedrooms, bathrooms, rent_amount, owner_id, status)
SELECT 'Test Unit 1', 2, 1, 1000, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e', 'vacant'
WHERE NOT EXISTS (
  SELECT 1 FROM public.properties 
  WHERE owner_id = '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'
);
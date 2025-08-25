-- PART 2: Create comprehensive RLS policies and triggers for all tables

-- Step 1: Create triggers to auto-set owner_id for all tables
CREATE OR REPLACE FUNCTION public.set_record_owner()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  NEW.owner_id = auth.uid();
  RETURN NEW;
END;
$$;

-- Step 2: Create triggers for properties, leases, and payments
DROP TRIGGER IF EXISTS set_property_owner_trigger ON public.properties;
CREATE TRIGGER set_property_owner_trigger
  BEFORE INSERT ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.set_record_owner();

DROP TRIGGER IF EXISTS set_lease_owner_trigger ON public.leases;
CREATE TRIGGER set_lease_owner_trigger
  BEFORE INSERT ON public.leases
  FOR EACH ROW
  EXECUTE FUNCTION public.set_record_owner();

DROP TRIGGER IF EXISTS set_payment_owner_trigger ON public.payments;
CREATE TRIGGER set_payment_owner_trigger
  BEFORE INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_record_owner();

-- Step 3: Drop ALL existing permissive policies on all tables
-- Properties policies
DROP POLICY IF EXISTS "Authenticated users can manage properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can view properties" ON public.properties;

-- Leases policies  
DROP POLICY IF EXISTS "Authenticated users can manage leases" ON public.leases;
DROP POLICY IF EXISTS "Authenticated users can view leases" ON public.leases;

-- Payments policies
DROP POLICY IF EXISTS "Authenticated users can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can view payments" ON public.payments;
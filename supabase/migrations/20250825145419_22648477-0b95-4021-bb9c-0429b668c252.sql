-- Fix tenant security by recreating all policies cleanly

-- Step 1: Drop ALL existing policies on tenants table
DROP POLICY IF EXISTS "Authenticated users can manage tenants" ON public.tenants;
DROP POLICY IF EXISTS "Authenticated users can view tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can view their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can insert their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can update their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can delete their own tenants" ON public.tenants;

-- Step 2: Create fresh secure, owner-based RLS policies
CREATE POLICY "tenants_select_own"
  ON public.tenants
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "tenants_insert_own"
  ON public.tenants
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "tenants_update_own"
  ON public.tenants
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "tenants_delete_own"
  ON public.tenants
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Step 3: Ensure trigger function exists
CREATE OR REPLACE FUNCTION public.set_tenant_owner()
RETURNS TRIGGER AS $$
BEGIN
  NEW.owner_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Ensure trigger exists
DROP TRIGGER IF EXISTS set_tenant_owner_trigger ON public.tenants;
CREATE TRIGGER set_tenant_owner_trigger
  BEFORE INSERT ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tenant_owner();
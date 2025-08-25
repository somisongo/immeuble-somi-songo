-- Complete the tenant security fix by updating policies only
-- The owner_id column already exists from previous migration

-- Step 1: Drop the overly permissive policies if they still exist
DROP POLICY IF EXISTS "Authenticated users can manage tenants" ON public.tenants;
DROP POLICY IF EXISTS "Authenticated users can view tenants" ON public.tenants;

-- Step 2: Create secure, owner-based RLS policies
CREATE POLICY "Users can view their own tenants"
  ON public.tenants
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own tenants"
  ON public.tenants
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own tenants"
  ON public.tenants
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own tenants"
  ON public.tenants
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Step 3: Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_tenant_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Set the owner_id to the current authenticated user
  NEW.owner_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS set_tenant_owner_trigger ON public.tenants;
CREATE TRIGGER set_tenant_owner_trigger
  BEFORE INSERT ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tenant_owner();

-- Step 5: Create index for performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON public.tenants(owner_id);
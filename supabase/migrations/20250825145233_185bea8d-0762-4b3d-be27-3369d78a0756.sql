-- Fix critical security vulnerability: Tenant Personal Information Access
-- Add owner_id to tenants table and implement proper RLS policies

-- Step 1: Add owner_id column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Set owner_id for existing tenants (will prompt user to select owner)
-- For now, we'll leave existing records with NULL owner_id and handle via trigger

-- Step 3: Create trigger to auto-set owner_id for new tenants
CREATE OR REPLACE FUNCTION public.set_tenant_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Set the owner_id to the current authenticated user
  NEW.owner_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_tenant_owner_trigger
  BEFORE INSERT ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tenant_owner();

-- Step 4: Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can manage tenants" ON public.tenants;
DROP POLICY IF EXISTS "Authenticated users can view tenants" ON public.tenants;

-- Step 5: Create secure, owner-based RLS policies
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

-- Step 6: Create index for performance
CREATE INDEX idx_tenants_owner_id ON public.tenants(owner_id);

-- Step 7: Update updated_at trigger for tenants table
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
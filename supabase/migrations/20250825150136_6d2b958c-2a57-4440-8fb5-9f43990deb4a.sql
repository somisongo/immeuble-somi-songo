-- FINAL SECURITY FIX: Drop existing policies and create comprehensive secure ones

-- Step 1: Drop ALL existing policies on all tables to ensure clean slate
-- Properties - drop any existing policies
DROP POLICY IF EXISTS "properties_select_own" ON public.properties;
DROP POLICY IF EXISTS "properties_insert_own" ON public.properties;
DROP POLICY IF EXISTS "properties_update_own" ON public.properties;
DROP POLICY IF EXISTS "properties_delete_own" ON public.properties;

-- Leases - drop any existing policies  
DROP POLICY IF EXISTS "leases_select_own" ON public.leases;
DROP POLICY IF EXISTS "leases_insert_own" ON public.leases;
DROP POLICY IF EXISTS "leases_update_own" ON public.leases;
DROP POLICY IF EXISTS "leases_delete_own" ON public.leases;

-- Payments - drop any existing policies
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
DROP POLICY IF EXISTS "payments_update_own" ON public.payments;
DROP POLICY IF EXISTS "payments_delete_own" ON public.payments;

-- Step 2: Create ULTRA-SECURE RLS policies with double authentication checks
-- PROPERTIES - Only authenticated owners can access their properties
CREATE POLICY "secure_properties_read"
  ON public.properties
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

CREATE POLICY "secure_properties_create"
  ON public.properties
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

CREATE POLICY "secure_properties_modify"
  ON public.properties
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

CREATE POLICY "secure_properties_remove"
  ON public.properties
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

-- LEASES - Only authenticated owners can access their leases
CREATE POLICY "secure_leases_read"
  ON public.leases
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

CREATE POLICY "secure_leases_create"
  ON public.leases
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

CREATE POLICY "secure_leases_modify"
  ON public.leases
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

CREATE POLICY "secure_leases_remove"
  ON public.leases
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

-- PAYMENTS - Only authenticated owners can access their payments  
CREATE POLICY "secure_payments_read"
  ON public.payments
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

CREATE POLICY "secure_payments_create"
  ON public.payments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

CREATE POLICY "secure_payments_modify"
  ON public.payments
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

CREATE POLICY "secure_payments_remove"
  ON public.payments
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

-- Step 3: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner_secure ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_leases_owner_secure ON public.leases(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_owner_secure ON public.payments(owner_id);
-- PART 3: Create strict owner-based RLS policies for all tables

-- Step 1: Create secure RLS policies for PROPERTIES
CREATE POLICY "properties_select_own"
  ON public.properties
  FOR SELECT
  USING (auth.uid() = owner_id AND auth.uid() IS NOT NULL);

CREATE POLICY "properties_insert_own"
  ON public.properties
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND auth.uid() IS NOT NULL);

CREATE POLICY "properties_update_own"
  ON public.properties
  FOR UPDATE
  USING (auth.uid() = owner_id AND auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() = owner_id AND auth.uid() IS NOT NULL);

CREATE POLICY "properties_delete_own"
  ON public.properties
  FOR DELETE
  USING (auth.uid() = owner_id AND auth.uid() IS NOT NULL);

-- Step 2: Create secure RLS policies for LEASES
CREATE POLICY "leases_select_own"
  ON public.leases
  FOR SELECT
  USING (auth.uid() = owner_id AND auth.uid() IS NOT NULL);

CREATE POLICY "leases_insert_own"
  ON public.leases
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND auth.uid() IS NOT NULL);

CREATE POLICY "leases_update_own"
  ON public.leases
  FOR UPDATE
  USING (auth.uid() = owner_id AND auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() = owner_id AND auth.uid() IS NOT NULL);

CREATE POLICY "leases_delete_own"
  ON public.leases
  FOR DELETE
  USING (auth.uid() = owner_id AND auth.uid() IS NOT NULL);

-- Step 3: Create secure RLS policies for PAYMENTS
CREATE POLICY "payments_select_own"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = owner_id AND auth.uid() IS NOT NULL);

CREATE POLICY "payments_insert_own"
  ON public.payments
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND auth.uid() IS NOT NULL);

CREATE POLICY "payments_update_own"
  ON public.payments
  FOR UPDATE
  USING (auth.uid() = owner_id AND auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() = owner_id AND auth.uid() IS NOT NULL);

CREATE POLICY "payments_delete_own"
  ON public.payments
  FOR DELETE
  USING (auth.uid() = owner_id AND auth.uid() IS NOT NULL);

-- Step 4: Create performance indexes for all owner_id columns
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_leases_owner_id ON public.leases(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_owner_id ON public.payments(owner_id);
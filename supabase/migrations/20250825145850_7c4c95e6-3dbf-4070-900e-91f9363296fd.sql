-- PART 3: Create secure RLS policies (with policy cleanup first)

-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "properties_select_own" ON public.properties;
DROP POLICY IF EXISTS "properties_insert_own" ON public.properties;
DROP POLICY IF EXISTS "properties_update_own" ON public.properties;
DROP POLICY IF EXISTS "properties_delete_own" ON public.properties;

DROP POLICY IF EXISTS "leases_select_own" ON public.leases;
DROP POLICY IF EXISTS "leases_insert_own" ON public.leases;
DROP POLICY IF EXISTS "leases_update_own" ON public.leases;
DROP POLICY IF EXISTS "leases_delete_own" ON public.leases;

DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
DROP POLICY IF EXISTS "payments_update_own" ON public.payments;
DROP POLICY IF EXISTS "payments_delete_own" ON public.payments;

-- PROPERTIES TABLE - Ultra-secure owner-based access
CREATE POLICY "secure_properties_select"
  ON public.properties
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  );

CREATE POLICY "secure_properties_insert"
  ON public.properties
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  );

CREATE POLICY "secure_properties_update"
  ON public.properties
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  );

CREATE POLICY "secure_properties_delete"
  ON public.properties
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  );

-- LEASES TABLE - Ultra-secure owner-based access
CREATE POLICY "secure_leases_select"
  ON public.leases
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  );

CREATE POLICY "secure_leases_insert"
  ON public.leases
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  );

CREATE POLICY "secure_leases_update"
  ON public.leases
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  );

CREATE POLICY "secure_leases_delete"
  ON public.leases
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  );

-- PAYMENTS TABLE - Ultra-secure owner-based access
CREATE POLICY "secure_payments_select"
  ON public.payments
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  );

CREATE POLICY "secure_payments_insert"
  ON public.payments
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  );

CREATE POLICY "secure_payments_update"
  ON public.payments
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  );

CREATE POLICY "secure_payments_delete"
  ON public.payments
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = owner_id
  );
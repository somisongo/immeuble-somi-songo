-- PART 3: Create secure RLS policies for all tables

-- PROPERTIES TABLE - Secure owner-based access
CREATE POLICY "properties_select_own"
  ON public.properties
  FOR SELECT
  USING (
    auth.uid() = owner_id AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "properties_insert_own"
  ON public.properties
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "properties_update_own"
  ON public.properties
  FOR UPDATE
  USING (
    auth.uid() = owner_id AND 
    auth.uid() IS NOT NULL
  )
  WITH CHECK (
    auth.uid() = owner_id AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "properties_delete_own"
  ON public.properties
  FOR DELETE
  USING (
    auth.uid() = owner_id AND 
    auth.uid() IS NOT NULL
  );

-- LEASES TABLE - Secure owner-based access
CREATE POLICY "leases_select_own"
  ON public.leases
  FOR SELECT
  USING (
    auth.uid() = owner_id AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "leases_insert_own"
  ON public.leases
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "leases_update_own"
  ON public.leases
  FOR UPDATE
  USING (
    auth.uid() = owner_id AND 
    auth.uid() IS NOT NULL
  )
  WITH CHECK (
    auth.uid() = owner_id AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "leases_delete_own"
  ON public.leases
  FOR DELETE
  USING (
    auth.uid() = owner_id AND 
    auth.uid() IS NOT NULL
  );

-- PAYMENTS TABLE - Secure owner-based access  
CREATE POLICY "payments_select_own"
  ON public.payments
  FOR SELECT
  USING (
    auth.uid() = owner_id AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "payments_insert_own"
  ON public.payments
  FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "payments_update_own"
  ON public.payments
  FOR UPDATE
  USING (
    auth.uid() = owner_id AND 
    auth.uid() IS NOT NULL
  )
  WITH CHECK (
    auth.uid() = owner_id AND 
    auth.uid() IS NOT NULL
  );

CREATE POLICY "payments_delete_own"
  ON public.payments
  FOR DELETE
  USING (
    auth.uid() = owner_id AND 
    auth.uid() IS NOT NULL
  );
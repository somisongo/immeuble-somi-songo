-- FINAL SECURITY ENHANCEMENT: Add explicit authentication checks to tenant policies

-- Drop existing tenant policies
DROP POLICY IF EXISTS "tenants_select_own" ON public.tenants;
DROP POLICY IF EXISTS "tenants_insert_own" ON public.tenants;
DROP POLICY IF EXISTS "tenants_update_own" ON public.tenants;
DROP POLICY IF EXISTS "tenants_delete_own" ON public.tenants;

-- Recreate tenant policies with explicit authentication checks
CREATE POLICY "tenants_select_own"
  ON public.tenants
  FOR SELECT
  USING (auth.uid() = owner_id AND auth.uid() IS NOT NULL);

CREATE POLICY "tenants_insert_own"
  ON public.tenants
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND auth.uid() IS NOT NULL);

CREATE POLICY "tenants_update_own"
  ON public.tenants
  FOR UPDATE
  USING (auth.uid() = owner_id AND auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() = owner_id AND auth.uid() IS NOT NULL);

CREATE POLICY "tenants_delete_own"
  ON public.tenants
  FOR DELETE
  USING (auth.uid() = owner_id AND auth.uid() IS NOT NULL);
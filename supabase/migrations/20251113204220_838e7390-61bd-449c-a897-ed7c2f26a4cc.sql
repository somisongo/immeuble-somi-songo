-- Drop existing owner policies and create new ones based on role
-- This allows all users with 'owner' role to access all data

-- Properties policies
DROP POLICY IF EXISTS "secure_properties_read" ON public.properties;
DROP POLICY IF EXISTS "secure_properties_create" ON public.properties;
DROP POLICY IF EXISTS "secure_properties_modify" ON public.properties;
DROP POLICY IF EXISTS "secure_properties_remove" ON public.properties;

CREATE POLICY "Owners can view all properties"
ON public.properties FOR SELECT
USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can create properties"
ON public.properties FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can update properties"
ON public.properties FOR UPDATE
USING (public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can delete properties"
ON public.properties FOR DELETE
USING (public.has_role(auth.uid(), 'owner'));

-- Leases policies
DROP POLICY IF EXISTS "leases_owners_full_access" ON public.leases;

CREATE POLICY "Owners can manage all leases"
ON public.leases FOR ALL
USING (public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'owner'));

-- Tenants policies
DROP POLICY IF EXISTS "Owners can view tenants in their properties" ON public.tenants;
DROP POLICY IF EXISTS "Owners can insert tenants" ON public.tenants;
DROP POLICY IF EXISTS "Owners can update tenant data" ON public.tenants;
DROP POLICY IF EXISTS "Owners can delete tenants" ON public.tenants;

CREATE POLICY "Owners can view all tenants"
ON public.tenants FOR SELECT
USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can create tenants"
ON public.tenants FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can update tenants"
ON public.tenants FOR UPDATE
USING (public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can delete tenants"
ON public.tenants FOR DELETE
USING (public.has_role(auth.uid(), 'owner'));

-- Payments policies
DROP POLICY IF EXISTS "secure_payments_read" ON public.payments;
DROP POLICY IF EXISTS "secure_payments_select" ON public.payments;
DROP POLICY IF EXISTS "secure_payments_create" ON public.payments;
DROP POLICY IF EXISTS "secure_payments_insert" ON public.payments;
DROP POLICY IF EXISTS "secure_payments_modify" ON public.payments;
DROP POLICY IF EXISTS "secure_payments_update" ON public.payments;
DROP POLICY IF EXISTS "secure_payments_remove" ON public.payments;
DROP POLICY IF EXISTS "secure_payments_delete" ON public.payments;

CREATE POLICY "Owners can view all payments"
ON public.payments FOR SELECT
USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can create payments"
ON public.payments FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can update payments"
ON public.payments FOR UPDATE
USING (public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can delete payments"
ON public.payments FOR DELETE
USING (public.has_role(auth.uid(), 'owner'));

-- Contract clauses policies
DROP POLICY IF EXISTS "Owners can view their contract clauses" ON public.contract_clauses;
DROP POLICY IF EXISTS "Owners can create contract clauses" ON public.contract_clauses;
DROP POLICY IF EXISTS "Owners can update their contract clauses" ON public.contract_clauses;
DROP POLICY IF EXISTS "Owners can delete their contract clauses" ON public.contract_clauses;

CREATE POLICY "Owners can view all contract clauses"
ON public.contract_clauses FOR SELECT
USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can create contract clauses"
ON public.contract_clauses FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can update contract clauses"
ON public.contract_clauses FOR UPDATE
USING (public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can delete contract clauses"
ON public.contract_clauses FOR DELETE
USING (public.has_role(auth.uid(), 'owner'));

-- Landlord info policies
DROP POLICY IF EXISTS "Owners can view their landlord info" ON public.landlord_info;
DROP POLICY IF EXISTS "Owners can create their landlord info" ON public.landlord_info;
DROP POLICY IF EXISTS "Owners can update their landlord info" ON public.landlord_info;

CREATE POLICY "Owners can view all landlord info"
ON public.landlord_info FOR SELECT
USING (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can create landlord info"
ON public.landlord_info FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owners can update landlord info"
ON public.landlord_info FOR UPDATE
USING (public.has_role(auth.uid(), 'owner'))
WITH CHECK (public.has_role(auth.uid(), 'owner'));
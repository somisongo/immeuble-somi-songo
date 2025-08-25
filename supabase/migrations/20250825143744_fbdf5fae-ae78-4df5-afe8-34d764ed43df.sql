-- CORRECTION CRITIQUE DE SÉCURITÉ : Restriction de l'accès aux données des locataires
-- Les anciennes policies permettaient un accès public total aux données sensibles

-- 1. Supprimer les policies non sécurisées existantes
DROP POLICY IF EXISTS "Allow all operations on tenants" ON public.tenants;
DROP POLICY IF EXISTS "Allow all operations on properties" ON public.properties;
DROP POLICY IF EXISTS "Allow all operations on leases" ON public.leases;
DROP POLICY IF EXISTS "Allow all operations on payments" ON public.payments;

-- 2. Créer des policies sécurisées pour les locataires
-- Les données des locataires ne sont accessibles qu'aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can view tenants"
ON public.tenants
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage tenants"
ON public.tenants
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Créer des policies sécurisées pour les propriétés
CREATE POLICY "Authenticated users can view properties"
ON public.properties
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage properties"
ON public.properties
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Créer des policies sécurisées pour les baux
CREATE POLICY "Authenticated users can view leases"
ON public.leases
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage leases"
ON public.leases
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Créer des policies sécurisées pour les paiements
CREATE POLICY "Authenticated users can view payments"
ON public.payments
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage payments"
ON public.payments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Empêcher complètement l'accès anonyme
-- Aucune policy pour les utilisateurs anonymes = accès refusé par défaut
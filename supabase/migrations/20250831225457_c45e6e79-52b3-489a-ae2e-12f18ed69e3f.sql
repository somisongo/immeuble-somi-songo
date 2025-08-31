-- Corriger les politiques RLS pour la table tenants afin de prévenir l'accès non autorisé aux données personnelles

-- Supprimer la politique problématique qui pourrait permettre l'accès croisé
DROP POLICY IF EXISTS "secure_tenants_select_own_properties" ON public.tenants;

-- Créer une politique plus restrictive pour les propriétaires
-- Les propriétaires peuvent voir les locataires uniquement dans leurs propriétés
CREATE POLICY "Owners can view tenants in their properties" 
ON public.tenants 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = owner_id
);

-- Créer une politique pour que les locataires ne puissent voir que leurs propres données
-- Cette politique remplace/renforce la politique existante
DROP POLICY IF EXISTS "Tenants can view their own data" ON public.tenants;

CREATE POLICY "Tenants can view only their own data" 
ON public.tenants 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- S'assurer que les politiques d'insertion et de mise à jour sont sécurisées
-- Seuls les propriétaires peuvent insérer des locataires
DROP POLICY IF EXISTS "secure_tenants_insert_own" ON public.tenants;

CREATE POLICY "Owners can insert tenants" 
ON public.tenants 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = owner_id
);

-- Seuls les propriétaires peuvent modifier les données des locataires
DROP POLICY IF EXISTS "tenants_update_own" ON public.tenants;

CREATE POLICY "Owners can update tenant data" 
ON public.tenants 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

-- Seuls les propriétaires peuvent supprimer des locataires
DROP POLICY IF EXISTS "tenants_delete_own" ON public.tenants;

CREATE POLICY "Owners can delete tenants" 
ON public.tenants 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND auth.uid() = owner_id);

-- Ajouter un commentaire pour documenter la sécurité
COMMENT ON TABLE public.tenants IS 'Table des locataires avec RLS sécurisée - les locataires ne peuvent voir que leurs propres données, les propriétaires peuvent gérer les locataires de leurs propriétés uniquement';
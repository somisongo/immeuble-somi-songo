-- Permettre aux propriétaires de mettre à jour tous les profils
CREATE POLICY "Owners can update all profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'owner'))
WITH CHECK (has_role(auth.uid(), 'owner'));
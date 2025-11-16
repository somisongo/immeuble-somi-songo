-- Mettre à jour tous les profils existants avec l'email depuis auth.users
UPDATE public.profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.user_id = auth.users.id
AND profiles.email IS NULL;

-- Rendre le champ email non-nullable pour éviter ce problème à l'avenir
ALTER TABLE public.profiles
ALTER COLUMN email SET NOT NULL;
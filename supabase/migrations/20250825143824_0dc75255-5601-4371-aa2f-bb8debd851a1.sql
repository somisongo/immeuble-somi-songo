-- Correction du problème de sécurité : Function Search Path Mutable
-- Mettre à jour la fonction pour avoir un search_path fixe et sécurisé

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;
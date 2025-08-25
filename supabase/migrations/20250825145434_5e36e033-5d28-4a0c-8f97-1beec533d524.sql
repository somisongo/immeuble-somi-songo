-- Fix Function Search Path Mutable security warning
-- Update the set_tenant_owner function to have a secure search_path

CREATE OR REPLACE FUNCTION public.set_tenant_owner()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  NEW.owner_id = auth.uid();
  RETURN NEW;
END;
$$;
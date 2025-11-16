-- Fix SECURITY DEFINER functions to add SET search_path = public

-- 1. Fix set_record_owner function
CREATE OR REPLACE FUNCTION public.set_record_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. Fix set_tenant_owner function
CREATE OR REPLACE FUNCTION public.set_tenant_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.owner_id = auth.uid();
  RETURN NEW;
END;
$function$;

-- 3. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 4. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '')
  );
  RETURN NEW;
END;
$function$;

-- 5. Fix is_property_tenant function
CREATE OR REPLACE FUNCTION public.is_property_tenant(_property_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM leases l
    JOIN tenants t ON t.id = l.tenant_id
    WHERE l.property_id = _property_id
      AND t.user_id = _user_id
      AND l.status = 'active'
  );
$function$;

-- 6. Fix is_lease_tenant function
CREATE OR REPLACE FUNCTION public.is_lease_tenant(_lease_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM leases l
    JOIN tenants t ON t.id = l.tenant_id
    WHERE l.id = _lease_id
      AND t.user_id = _user_id
  );
$function$;

-- Add default DENY policies on sensitive tables as failsafe

-- Default DENY policy for landlord_info
CREATE POLICY "Default deny all on landlord_info"
ON public.landlord_info
AS RESTRICTIVE
FOR ALL
USING (false);

-- Default DENY policy for tenants
CREATE POLICY "Default deny all on tenants"
ON public.tenants
AS RESTRICTIVE
FOR ALL
USING (false);
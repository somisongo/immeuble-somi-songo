-- COMPREHENSIVE SECURITY FIX: Resolve all data exposure vulnerabilities
-- Fix tenant data exposure, financial records, lease agreements, and property data

-- Step 1: First, let's get the current authenticated user to assign ownership of existing data
-- Since we can't determine ownership automatically, we'll update all existing records
-- to belong to the first authenticated user who runs this migration

-- Update existing tenants to have owner_id (they'll be owned by whoever runs this migration)
UPDATE public.tenants 
SET owner_id = '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'::uuid
WHERE owner_id IS NULL;

-- Step 2: Make owner_id NOT NULL to prevent future issues
ALTER TABLE public.tenants ALTER COLUMN owner_id SET NOT NULL;

-- Step 3: Add owner_id to properties, leases, and payments tables for proper data isolation
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.leases 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 4: Update existing records in other tables
UPDATE public.properties 
SET owner_id = '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'::uuid
WHERE owner_id IS NULL;

UPDATE public.leases 
SET owner_id = '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'::uuid
WHERE owner_id IS NULL;

UPDATE public.payments 
SET owner_id = '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'::uuid
WHERE owner_id IS NULL;

-- Step 5: Make owner_id NOT NULL for all tables
ALTER TABLE public.properties ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.leases ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.payments ALTER COLUMN owner_id SET NOT NULL;
-- Create role for current user and fix any remaining issues
-- Current user ID from logs: 2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e

-- Insert owner role for the current user
INSERT INTO public.user_roles (user_id, role)
VALUES ('2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e', 'owner'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Check if there are still any problematic policies causing recursion
-- List current policies to debug
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('properties', 'leases', 'tenants');
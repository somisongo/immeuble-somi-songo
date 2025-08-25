-- PART 4: Add performance indexes for owner_id columns

-- Create indexes for fast owner-based queries
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_leases_owner_id ON public.leases(owner_id);  
CREATE INDEX IF NOT EXISTS idx_payments_owner_id ON public.payments(owner_id);

-- Verify tenant index exists
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON public.tenants(owner_id);
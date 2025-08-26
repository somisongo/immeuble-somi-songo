-- Create some test data for the current user to see content immediately

-- First, ensure we have a tenant for testing
INSERT INTO public.tenants (first_name, last_name, email, phone, owner_id)
VALUES ('Jean', 'Dupont', 'jean.dupont@example.com', '0123456789', '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e')
ON CONFLICT DO NOTHING;

-- Get the tenant ID for the lease
DO $$
DECLARE
    tenant_uuid UUID;
    property_uuid UUID;
    lease_uuid UUID;
BEGIN
    -- Get tenant ID
    SELECT id INTO tenant_uuid FROM public.tenants 
    WHERE owner_id = '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e' 
    AND first_name = 'Jean' 
    LIMIT 1;
    
    -- Get property ID
    SELECT id INTO property_uuid FROM public.properties 
    WHERE owner_id = '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e' 
    LIMIT 1;
    
    -- Create a lease if we have both tenant and property
    IF tenant_uuid IS NOT NULL AND property_uuid IS NOT NULL THEN
        INSERT INTO public.leases (
            tenant_id, 
            property_id, 
            owner_id, 
            rent_amount, 
            deposit_amount, 
            start_date, 
            end_date, 
            status
        )
        VALUES (
            tenant_uuid,
            property_uuid,
            '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e',
            1000,
            2000,
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '1 year',
            'active'
        )
        ON CONFLICT DO NOTHING
        RETURNING id INTO lease_uuid;
        
        -- Create some sample payments if lease was created
        IF lease_uuid IS NOT NULL THEN
            INSERT INTO public.payments (
                lease_id,
                owner_id,
                amount,
                due_date,
                status
            )
            VALUES 
            (lease_uuid, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e', 1000, CURRENT_DATE + INTERVAL '1 month', 'pending'),
            (lease_uuid, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e', 1000, CURRENT_DATE, 'paid'),
            (lease_uuid, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e', 1000, CURRENT_DATE - INTERVAL '1 month', 'paid')
            ON CONFLICT DO NOTHING;
            
            -- Update payment status for the current month payment
            UPDATE public.payments 
            SET paid_date = CURRENT_DATE 
            WHERE lease_id = lease_uuid 
            AND status = 'paid' 
            AND paid_date IS NULL;
        END IF;
    END IF;
END $$;
-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_number TEXT NOT NULL UNIQUE,
  bedrooms INTEGER NOT NULL DEFAULT 3,
  bathrooms INTEGER NOT NULL DEFAULT 2,
  rent_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('occupied', 'vacant', 'maintenance')) DEFAULT 'vacant',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tenants table
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leases table
CREATE TABLE public.leases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rent_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'terminated')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lease_id UUID NOT NULL REFERENCES public.leases(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue')) DEFAULT 'pending',
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies (for now allowing all operations - adjust based on authentication needs)
CREATE POLICY "Allow all operations on properties" ON public.properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tenants" ON public.tenants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on leases" ON public.leases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leases_updated_at
  BEFORE UPDATE ON public.leases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.properties (unit_number, bedrooms, bathrooms, rent_amount, status) VALUES 
('A1', 3, 2, 2200.00, 'occupied'),
('A2', 3, 2, 2100.00, 'occupied'),
('A3', 3, 2, 2300.00, 'occupied'),
('A4', 3, 2, 2000.00, 'occupied'),
('A5', 3, 2, 2200.00, 'vacant');

INSERT INTO public.tenants (first_name, last_name, email, phone) VALUES 
('Jean', 'Dupont', 'jean.dupont@email.com', '+33 1 23 45 67 89'),
('Marie', 'Martin', 'marie.martin@email.com', '+33 1 23 45 67 90'),
('Pierre', 'Bernard', 'pierre.bernard@email.com', '+33 1 23 45 67 91'),
('Sophie', 'Dubois', 'sophie.dubois@email.com', '+33 1 23 45 67 92');
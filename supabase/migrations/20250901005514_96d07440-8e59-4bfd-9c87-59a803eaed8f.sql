-- Créer une table pour les clauses de contrat
CREATE TABLE public.contract_clauses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  article_number INTEGER,
  is_annex BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.contract_clauses ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour contract_clauses
CREATE POLICY "Owners can view their contract clauses" 
ON public.contract_clauses 
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create contract clauses" 
ON public.contract_clauses 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their contract clauses" 
ON public.contract_clauses 
FOR UPDATE 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their contract clauses" 
ON public.contract_clauses 
FOR DELETE 
USING (auth.uid() = owner_id);

-- Trigger pour updated_at
CREATE TRIGGER update_contract_clauses_updated_at
BEFORE UPDATE ON public.contract_clauses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Créer une table pour les informations du bailleur
CREATE TABLE public.landlord_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  nationality TEXT NOT NULL DEFAULT 'Congolaise',
  passport_number TEXT,
  address TEXT NOT NULL,
  bank_account TEXT,
  bank_name TEXT DEFAULT 'ECOBANK',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS pour landlord_info
ALTER TABLE public.landlord_info ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour landlord_info
CREATE POLICY "Owners can view their landlord info" 
ON public.landlord_info 
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create their landlord info" 
ON public.landlord_info 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their landlord info" 
ON public.landlord_info 
FOR UPDATE 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Trigger pour updated_at
CREATE TRIGGER update_landlord_info_updated_at
BEFORE UPDATE ON public.landlord_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
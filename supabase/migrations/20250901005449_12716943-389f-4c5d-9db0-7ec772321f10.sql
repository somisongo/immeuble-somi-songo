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

-- Insérer les clauses par défaut pour les nouveaux propriétaires
INSERT INTO public.contract_clauses (owner_id, title, content, article_number, order_index) VALUES
(auth.uid(), 'Objet', 'Le (la) bailleur (resse) donne en location au locataire qui accepte son appartement dans l''immeuble résidentiel sis Avenue Saka n° 14, Quartier Kinsuka, Commune de Ngaliema', 1, 1),
(auth.uid(), 'Loyer', 'Le taux mensuel du loyer est fixé à la somme de {{rent_amount}} USD (Chiffres)\n{{rent_amount_words}} dollars Américains (Montant en lettre) payable à la banque ({{bank_name}}), au numéro bancaire que voici :\n{{bank_account}}\nLe locataire tâchera à présenter son bordereau/ reçu au bailleur ou à son mandataire.', 2, 2),
(auth.uid(), 'Garantie locative', 'À la signature du présent contrat, une garantie locative équivaut à {{deposit_amount}} USD (Chiffres) {{deposit_amount_words}} dollars Américains (Montant en lettre) et {{rent_amount}} USD (Chiffres) {{rent_amount_words}} dollars Américains (Montant en lettre)\n3 Mois plus un mois anticipatif, sera perçu indépendamment du paiement du premier terme du loyer. Le locataire ne pourra se prévaloir de ce versement pour refuser le paiement du loyer, même le dernier. Cette garantie ne pourra être réajustée en cours de bail ni produire d''intérêt.', 3, 3),
(auth.uid(), 'Consommation d''eau, d''électricité etc.', 'Les frais résultant de la consommation d''eau, d''électricité et de l''assainissement du milieu sont compris dans le loyer et seront à charge du bailleur en l''état actuel. Cependant dès que l''introduction des compteurs à électricité prépayé devient effective, les frais de la consommation d''électricité seront à charge du locataire.', 4, 4),
(auth.uid(), 'Utilisation du générateur', 'L''immeuble possède un générateur de 25 KVA et dont les frais d''utilisation et d''entretien ne sont pas inclus dans le loyer. Le locateur souhaitant utiliser les services de ce générateur payera un montant de 100 USD Mensuellement comme contribution à l''entretien et l''approvisionnement en carburant. Étant donnée que ce générateur n''a pas la capacité de supporter tous les appareils pour tous les 5 appartements de l''immeuble simultanément, seuls les appareils suivants sont autorisés : Le frigo, la télévision, les ampoules (la lumière).', 5, 5),
(auth.uid(), 'Destination et occupation du lieu loué', 'L''appartement loué est uniquement à usage du locataire ; il est interdit au locataire de changer la destination des lieux loués sans l''accord préalable et écrit du bailleur. Il est interdit de sous-louer tout ou partie du bien loué, de céder son bail à une tierce personne, sans l''accord écrit et préalable du bailleur.', 6, 6);

-- Insérer l'annexe par défaut
INSERT INTO public.contract_clauses (owner_id, title, content, is_annex, order_index) VALUES
(auth.uid(), 'Biens qui sont dans l''appartement', 'Meubles cuisine, deux lustres cuisine,\nTrois salles de bain avec trois miroirs, trois cuves RAK/ céramique de WC, trois plafonniers, deux colonnes de douche et trois lavabos,\nDeux lustres au salon, deux appliques,\nDeux appliques chambre parents, un plafonnier,\nUn plafonnier dans chaque chambre enfant,\nTrois plafonniers dans les deux vérandas de l''appartement\nCinq appliques de colonne,\nDeux plafonniers dans les deux couloirs,\n32 Prises électriques, 4 interrupteurs doubles, 12 interrupteurs simple, et 5 JVD pour split du type SCHNUDER,\nDeux climatiseurs de capacité 12BTU (marque Hisense) au salon et 9BTU (marque Jacobs) dans la chambre des parents.', true, 1);
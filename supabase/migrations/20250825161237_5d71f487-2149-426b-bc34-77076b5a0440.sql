-- Désactiver temporairement le trigger pour les insertions
DROP TRIGGER IF EXISTS set_record_owner_trigger ON leases;

-- Créer des baux pour lier les propriétés aux locataires
INSERT INTO public.leases (
  property_id, 
  tenant_id, 
  rent_amount, 
  deposit_amount, 
  start_date, 
  end_date, 
  status,
  owner_id
) VALUES 
-- Bail pour Appartement A1 - Jean Dupont
(
  '4061aa6c-370b-4d6f-8073-085fd67f7aeb',
  'afc7a3ca-17eb-4bdd-a03b-8e16dd827560',
  650.00,
  1300.00,
  '2024-01-01',
  '2024-12-31',
  'active',
  '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'
),
-- Bail pour Appartement A2 - Marie Martin
(
  'a834dba5-b013-4fe9-a280-c4810c3a68f0',
  'f4f97966-5fd3-4db0-8fb0-bf4b0893e00a',
  650.00,
  1300.00,
  '2024-06-01',
  '2025-05-31',
  'active',
  '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'
),
-- Bail pour Appartement A3 - Pierre Bernard
(
  '830f7ca3-97ac-40cb-96ea-5513d4b91afb',
  'b9a01fa5-73c2-410d-9d89-2c58b6626c13',
  650.00,
  1300.00,
  '2024-03-01',
  '2025-02-28',
  'active',
  '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'
),
-- Bail pour Appartement A4 - Sophie Dubois
(
  '60572b08-dc0e-4408-9851-b5eae606473c',
  '38586843-5847-439d-8ea2-3cde82badab6',
  650.00,
  1300.00,
  '2024-09-01',
  '2025-08-31',
  'active',
  '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'
);

-- Recréer le trigger
CREATE TRIGGER set_record_owner_trigger
  BEFORE INSERT ON public.leases
  FOR EACH ROW
  EXECUTE FUNCTION public.set_record_owner();
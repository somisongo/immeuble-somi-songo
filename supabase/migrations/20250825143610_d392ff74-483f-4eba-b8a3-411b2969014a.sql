-- Mise à jour des loyers mensuels
-- Appartements A1 à A4 : 650$
UPDATE properties 
SET rent_amount = 650, updated_at = now()
WHERE unit_number IN ('A1', 'A2', 'A3', 'A4');

-- Appartement A5 : 1000$
UPDATE properties 
SET rent_amount = 1000, updated_at = now()
WHERE unit_number = 'A5';

-- Mise à jour des baux correspondants pour maintenir la cohérence
UPDATE leases 
SET rent_amount = 650, updated_at = now()
WHERE property_id IN (
    SELECT id FROM properties WHERE unit_number IN ('A1', 'A2', 'A3', 'A4')
);

UPDATE leases 
SET rent_amount = 1000, updated_at = now()
WHERE property_id IN (
    SELECT id FROM properties WHERE unit_number = 'A5'
);
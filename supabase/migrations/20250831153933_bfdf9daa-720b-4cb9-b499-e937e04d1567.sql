-- Corriger le user_id manquant pour Samuel SOMI SONGO
UPDATE tenants 
SET user_id = '60224fed-bbed-420c-88d4-9beb93fa3523'
WHERE email = 'somisongo@gmail.com' AND user_id IS NULL;
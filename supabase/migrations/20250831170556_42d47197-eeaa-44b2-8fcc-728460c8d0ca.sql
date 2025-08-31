-- Corriger le rôle de Samuel SOMI SONGO de 'owner' à 'tenant'
UPDATE user_roles 
SET role = 'tenant' 
WHERE user_id = '60224fed-bbed-420c-88d4-9beb93fa3523' AND role = 'owner';
-- Insérer les clauses de contrat par défaut
INSERT INTO public.contract_clauses (title, content, order_index, is_annex, article_number, owner_id) VALUES 
-- Clauses principales du contrat
('OBJET DU BAIL', 'Monsieur {{landlord_name}} donne en location à Monsieur {{tenant_name}} qui accepte, l''appartement n° {{unit_number}} de {{bedrooms}} chambres, {{bathrooms}} salles de bain situé au {{property_address}}.', 1, false, 1, '00000000-0000-0000-0000-000000000000'),

('DESTINATION DES LIEUX', 'Les lieux loués ne pourront servir qu''à l''usage d''habitation du preneur et de sa famille.', 2, false, 2, '00000000-0000-0000-0000-000000000000'),

('DURÉE DU BAIL', 'Le présent bail est consenti et accepté pour une durée déterminée qui ne pourra être inférieure à trois ans, à partir du {{start_date}} au {{end_date}}.', 3, false, 3, '00000000-0000-0000-0000-000000000000'),

('LOYER', 'Le loyer est fixé à la somme de {{rent_amount}} USD ({{rent_amount_words}} dollars américains) par mois, payable d''avance le 1er de chaque mois.', 4, false, 4, '00000000-0000-0000-0000-000000000000'),

('GARANTIE LOCATIVE', 'Le locataire verse au bailleur à la signature du présent bail, à titre de garantie locative, une somme équivalente à {{deposit_amount}} USD ({{deposit_amount_words}} dollars américains).', 5, false, 5, '00000000-0000-0000-0000-000000000000'),

('CHARGES', 'Les charges d''entretien courant et les réparations locatives sont à la charge du locataire. Les grosses réparations restent à la charge du bailleur.', 6, false, 6, '00000000-0000-0000-0000-000000000000'),

('MODALITÉS DE PAIEMENT', 'Le paiement du loyer s''effectue par virement bancaire sur le compte {{bank_name}} n° {{bank_account}} ou en espèces contre reçu.', 7, false, 7, '00000000-0000-0000-0000-000000000000'),

('RÉSILIATION', 'Chacune des parties peut résilier le bail en respectant un préavis de trois mois donné par lettre recommandée avec accusé de réception.', 8, false, 8, '00000000-0000-0000-0000-000000000000'),

('CLAUSE RÉSOLUTOIRE', 'À défaut de paiement d''un seul terme de loyer, le bail sera résilié de plein droit quinze jours après commandement demeuré infructueux.', 9, false, 9, '00000000-0000-0000-0000-000000000000'),

('ÉTAT DES LIEUX', 'L''état des lieux d''entrée sera établi contradictoirement entre les parties dans les huit jours de la remise des clés.', 10, false, 10, '00000000-0000-0000-0000-000000000000'),

-- Annexes
('Règlement intérieur de l''immeuble', 'Article 1 : Les locataires doivent respecter la tranquillité de l''immeuble.\n\nArticle 2 : Il est interdit de faire du bruit après 22h00.\n\nArticle 3 : Les parties communes doivent être maintenues propres.\n\nArticle 4 : Les animaux domestiques sont autorisés sous conditions.\n\nArticle 5 : Le stationnement est réglementé selon les places attribuées.', 1, true, null, '00000000-0000-0000-0000-000000000000'),

('Inventaire du mobilier', 'SALON :\n- 1 canapé 3 places\n- 2 fauteuils\n- 1 table basse\n- 1 télévision\n\nCHAMBRE PRINCIPALE :\n- 1 lit double avec matelas\n- 1 armoire 3 portes\n- 1 commode\n\nCUISINE :\n- 1 réfrigérateur\n- 1 cuisinière 4 feux\n- 1 four micro-ondes\n- Vaisselle complète pour 6 personnes', 2, true, null, '00000000-0000-0000-0000-000000000000');

-- Insérer les informations du bailleur par défaut
INSERT INTO public.landlord_info (full_name, address, passport_number, nationality, bank_name, bank_account, owner_id) VALUES 
('PAUL SONGO MIZIRO', 'au n° 14 de l''Avenue (Rue) Saka, Quartier Kinsuka-Pecheur, Commune de Ngaliema', 'OP1205813', 'Congolaise', 'ECOBANK', '35080005368', '00000000-0000-0000-0000-000000000000');
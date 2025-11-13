-- Supprimer les anciennes clauses pour les remplacer par le nouveau template
DELETE FROM public.contract_clauses WHERE owner_id = '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e';

-- Insérer les nouvelles clauses basées sur le template PDF
INSERT INTO public.contract_clauses (title, content, order_index, is_annex, article_number, owner_id) VALUES 
-- Articles du contrat
('Objet', 'Le (la) bailleur (resse) donne en location au locataire qui accepte son appartement dans l''immeuble résidentiel sis {{property_address}}', 1, false, 1, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'),

('Loyer', 'Le taux mensuel du loyer est fixé à la somme de {{rent_amount}} USD (Chiffres) {{rent_amount_words}} dollars Américains (Montant en lettre) payable à la banque ({{bank_name}}), au numéro bancaire que voici : {{bank_account}}

Le locataire tachera à présenter son bordereau/ reçu au bailleur ou à son mandataire.', 2, false, 2, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'),

('Garantie locative', 'A la signature du présent contrat, une garantie locative de {{deposit_amount}} USD (Chiffres) {{deposit_amount_words}} dollars Américains (Montant en lettre) équivalent à 3 Mois de loyer sera perçu. Le locataire ne pourra se prévaloir de ce versement pour refuser le paiement du loyer. Cette garantie ne pourra être réajustée en cours de bail ni produire d''intérêt.

En cas de cession de bail pour quelque cause que ce soit après paiement intégral des frais éventuels de remise, le solde de la garantie sera tenu à la disposition du locataire.', 3, false, 3, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'),

('Consommation d''eau, d''électricité et autres services', 'Les frais liés à la consommation d''eau (REGIDESO) et d''électricité (prépayée SNEL) sont entièrement à la charge du locataire. Les coûts d''électricité relatifs aux espaces communs, notamment le parking, les couloirs et les escaliers, sont répartis entre l''ensemble des occupants de l''immeuble. Toutefois, les dépenses liées à l''assainissement et à l''entretien des espaces communs restent à la charge du bailleur.', 4, false, 4, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'),

('Destination et occupation du lieu loué', 'L''appartement loué est uniquement à usage du locataire ; il est interdit au locataire de changer la destination des lieux loués sans l''accord préalable et écrit du bailleur. Il est interdit de sous-louer tout ou partie du bien loué, de céder son bail à une tierce personne, sans l''accord écrit et préalable du bailleur.', 5, false, 5, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'),

('Modification des lieux loués', 'Il est interdit au locataire d''apporter une quelconque modification aux biens loués sans l''autorisation préalable et écrite du bailleur. Lorsque la modification aura été faite sans l''accord du bailleur, ce dernier a la faculté de demander soit la remise des lieux dans leur état initial aux frais du locataire, soit de l''acquérir sans que le locataire puisse prétendre à une quelconque indemnisation.', 6, false, 6, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'),

('Dégâts et clause de réparation', 'Tous les biens listés dans l''annexe ci-bas sont en très bon état et ne nécessitent pas une modification. De ce fait, le Locataire n''est pas responsable des dégâts occasionnés par un éventuel vice de construction. Le Locataire est tenu d''informer le Bailleur sans tarder pour toutes les réparations qui incombent à celui-ci. Les dégâts éventuels imputables au Locataire sont réparés sans délai par les techniciens choisis par le bailleur. L''entretien des climatiseurs sera tenu par un technicien que le bailleur se réserve le droit de choisir, chaque 2 mois. Les frais résultants de l''entretien seront à charge du locataire.', 7, false, 7, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'),

('Entretien des lieux loués', 'Le locataire s''engage à utiliser les lieux loués en bon père de famille et à les restituer à la fin du bail dans l''état où il les a trouvés sauf usure normale.', 8, false, 8, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'),

('Inspection les lieux loués', 'Le locataire laissera inspecter les lieux loués deux fois l''an, par le bailleur ou son mandataire et c''est à la période où le bailleur jugera convenable, à condition toutefois, d''en prévenir le locataire 7 jours avant.', 9, false, 9, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'),

('Avenant', 'Toute modification au présent contrat fera l''objet d''un avenant.', 10, false, 10, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'),

('Résiliation', 'La partie qui désire résilier le contrat doit donner à l''autre un préavis de 3 mois, conformément à l''usage des lieux. Le bailleur peut donc donner un préavis au locataire si celui-ci s''est acquitté de son loyer pendant 3 mois successifs.', 11, false, 11, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'),

('Contestation', 'Pour toute litige à l''exécution du présent contrat, les parties s''adresseront à l''Autorité Municipale des lieux loués pour une conciliation. En cas d''échec de conciliation, le litige sera soumis aux Cours et tribunaux de la ville de Kinshasa.', 12, false, 12, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'),

('Remise des clés', 'Le jour de l''expiration du présent bail, le Locataire devra remettre au bailleur ou à son Mandataire toutes les clés des locaux et de la porte d''entrée de la maison. Le Bailleur ne pourra pas prendre la libre disposition des lieux au jour de l''expiration du bail, ce dernier aura droit en cas de force majeure, à une compensation pour le manque à gagner, calculée proportionnellement au loyer équivalent au nombre de jours concernés.', 13, false, 13, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'),

('Résolution des litiges', 'Tout litige éventuel survenu au cours de l''application du présent bail sera d''abord réglé à l''amiable, faute de quoi, il sera porté devant les instances judiciaires compétentes de la République Démocratique du Congo.', 14, false, 14, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'),

('Entrée en vigueur', 'Le présent contrat est établi en Deux exemplaires et ne pourra souffrir d''aucune rature ou surcharge quelconque. Il entre vigueur dès sa signature.', 15, false, 15, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e'),

-- Annexe
('Éléments et équipements présents dans l''appartement', '1. Meubles cuisine, deux lustres cuisine,
2. Trois salles de bain avec trois miroirs, trois cuves RAK/ céramique de WC, trois plafonniers, deux colonnes de douche et trois lavabos,
3. Deux lustres au salon, deux appliques,
4. Deux appliques chambre parents, un plafonnier,
5. Un plafonnier dans chaque chambre enfant,
6. Trois plafonniers dans les deux vérandas de l''appartement,
7. Cinq appliques de colonne dans les vérandas,
8. Deux plafonniers dans les deux couloirs,
9. 32 Prises électriques, 4 interrupteurs doubles, 12 interrupteurs simple, et 5 JVD pour split du type SCHNUDER,
10. Deux climatiseurs de capacité 12BTU (marque Hisense) au salon et 9BTU (marque Jacobs) dans la chambre des parents.', 1, true, null, '2064d8d3-120b-4ddd-a2b0-8bc71ef7d00e');
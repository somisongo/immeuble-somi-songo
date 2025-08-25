import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContractData {
  tenant: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
  lease: {
    start_date: string;
    end_date: string;
    rent_amount: number;
    deposit_amount?: number;
    property: {
      unit_number: string;
      bedrooms: number;
      bathrooms: number;
    };
  };
}

const generateContractHTML = (data: ContractData): string => {
  const startDate = new Date(data.lease.start_date).toLocaleDateString('fr-FR');
  const endDate = new Date(data.lease.end_date).toLocaleDateString('fr-FR');
  const currentDate = new Date().toLocaleDateString('fr-FR');
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Contrat de Bail</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            margin: 0;
            padding: 40px;
            max-width: 210mm;
            box-sizing: border-box;
        }
        .header { 
            text-align: center; 
            margin-bottom: 40px; 
        }
        .title { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 10px; 
        }
        .subtitle { 
            font-size: 18px; 
            margin-bottom: 20px; 
        }
        .section { 
            margin-bottom: 25px; 
            padding: 0 20px;
        }
        .article { 
            margin-bottom: 20px; 
            padding-left: 10px;
        }
        .article-title { 
            font-weight: bold; 
            margin-bottom: 10px; 
        }
        .signature-section { 
            margin-top: 60px; 
            display: flex; 
            justify-content: space-between;
            padding: 0 20px;
        }
        .signature-box { 
            text-align: center; 
            width: 45%; 
        }
        .date { 
            text-align: right; 
            margin-top: 40px;
            padding-right: 20px;
        }
        .amount { 
            font-weight: bold; 
        }
        .bank-account { 
            font-size: 18px; 
            font-weight: bold; 
            text-align: center; 
            margin: 20px 0;
            padding: 10px;
            border: 2px solid #000;
            display: inline-block;
        }
        h3 {
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 16px;
        }
        h4 {
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 14px;
        }
        p {
            margin-bottom: 10px;
            text-align: justify;
        }
        ol {
            padding-left: 30px;
        }
        li {
            margin-bottom: 8px;
        }
        .page-break {
            page-break-before: always;
            padding-top: 40px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">CONTRAT DE BAIL</div>
        <div class="subtitle">IMMEUBLE RÉSIDENTIEL FAMILLE SONGO</div>
    </div>

    <div class="section">
        <h3>ENTRE</h3>
        <p>1. Madame, Mademoiselle, Monsieur <strong>Paul Songo Miziro</strong> de nationalité <strong>Congolaise</strong><br>
        Passeport n° OP1205813, demeurant au n° 14 de l'Avenue (Rue) Saka, Quartier Kinsuka-Pecheur, Commune de Ngaliema ci-après dénommé(e) « bailleur » d'une part</p>
        
        <p>ET</p>
        
        <p>2. Monsieur, Madame, Mademoiselle, <strong>${data.tenant.first_name.toUpperCase()} ${data.tenant.last_name.toUpperCase()}</strong><br>
        de nationalité Congolaise Passeport n° .................................<br>
        demeurant au ................................................................................................................................<br>
        ci-après dénommé(e) « locataire » d'autre part</p>
    </div>

    <div class="section">
        <h3>IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT</h3>

        <div class="article">
            <div class="article-title">Article 1er - Objet :</div>
            <p>Le (la) bailleur (resse) donne en location au locataire qui accepte son appartement dans l'immeuble résidentiel sis Avenue Saka n° 14, Quartier Kinsuka, Commune de Ngaliema</p>
            <p><strong>Appartement ${data.lease.property.unit_number} - ${data.lease.property.bedrooms} chambres, ${data.lease.property.bathrooms} salle(s) de bain</strong></p>
        </div>

        <div class="article">
            <div class="article-title">Article 2° - Loyer :</div>
            <p>Le taux mensuel du loyer est fixé à la somme de <span class="amount">${data.lease.rent_amount} USD</span> (Chiffres)<br>
            <strong>${numberToFrenchWords(data.lease.rent_amount)} dollars Américains</strong> (Montant en lettre) payable à la banque (ECOBANK), au numéro bancaire que voici :</p>
            <div class="bank-account">35080005368</div>
            <p>Le locataire tâchera à présenter son bordereau/ reçu au bailleur ou à son mandataire.</p>
        </div>

        <div class="article">
            <div class="article-title">Article 3° -</div>
            <p>À la signature du présent contrat, une garantie locative équivaut à <span class="amount">${data.lease.deposit_amount || data.lease.rent_amount * 3} USD</span><br>
            (Chiffres) <strong>${numberToFrenchWords(data.lease.deposit_amount || data.lease.rent_amount * 3)} dollars Américains</strong> (Montant en lettre) et <span class="amount">${data.lease.rent_amount} USD</span><br>
            (Chiffres) <strong>${numberToFrenchWords(data.lease.rent_amount)} dollars Américains</strong> (Montant en lettre)</p>
            <p>3 Mois plus un mois anticipatif, sera perçu indépendamment du paiement du premier terme du loyer. Le locataire ne pourra se prévaloir de ce versement pour refuser le paiement du loyer, même le dernier. Cette garantie ne pourra être réajustée en cours de bail ni produire d'intérêt.</p>
        </div>

        <div class="article">
            <p>En cas de cession de bail pour quelque cause que ce soit après paiement intégral des frais éventuels de remise, le solde de la garantie sera tenu à la disposition du locataire.</p>
        </div>

        <div class="article">
            <div class="article-title">Article 4° - Consommation d'eau, d'électricité etc. :</div>
            <p>Les frais résultant de la consommation d'eau, d'électricité et de l'assainissement du milieu sont compris dans le loyer et seront à charge du bailleur en l'état actuel. Cependant dès que l'introduction des compteurs à électricité prépayé devient effective, les frais de la consommation d'électricité seront à charge du locataire.</p>
        </div>

        <div class="article">
            <div class="article-title">Article 5e – Utilisation du générateur.</div>
            <p>L'immeuble possède un générateur de 25 KVA et dont les frais d'utilisation et d'entretien ne sont pas inclus dans le loyer. Le locateur souhaitant utiliser les services de ce générateur payera un montant de <strong>100 USD</strong> Mensuellement comme contribution à l'entretien et l'approvisionnement en carburant. Étant donnée que ce générateur n'a pas la capacité de supporter tous les appareils pour tous les 5 appartements de l'immeuble simultanément, seuls les appareils suivants sont autorisés : Le frigo, la télévision, les ampoules (la lumière).</p>
        </div>

        <div class="article">
            <div class="article-title">Article 6° - Destination et occupation du lieu loué :</div>
            <p>L'appartement loué est uniquement à usage du locataire ; il est interdit au locataire de changer la destination des lieux loués sans l'accord préalable et écrit du bailleur. Il est interdit de sous-louer tout ou partie du bien loué, de céder son bail à une tierce personne, sans l'accord écrit et préalable du bailleur.</p>
        </div>

        <div class="article">
            <div class="article-title">Article 7° - Modification des lieux loués :</div>
            <p>Il est interdit au locataire d'apporter une quelconque modification aux biens loués sans l'autorisation préalable et écrit du bailleur. Lorsque la modification aura été faite sans l'accord du bailleur, ce dernier a la faculté de demander soit la remise des lieux dans leur état initial aux frais du locataire, soit de l'acquérir sans que le locataire puisse prétendre à une quelconque indemnisation.</p>
        </div>

        <div class="article">
            <div class="article-title">Article 9° - Dégâts et clause de réparation</div>
            <p>Tous les biens liste dans l'annexe ci-bas sont en très bon état et ne nécessitent pas une modification. De ce fait, le Locataire n'est pas responsable des dégâts occasionnés par un éventuel vice de construction. Le Locataire est tenu d'informer le Bailleur sans tarder pour toutes les réparations qui incombent à celui-ci.</p>
        </div>

        <div class="article">
            <p>Les dégâts éventuels imputables au Locataire sont réparés sans délai par les techniciens choisis par le bailleur.<br>
            L'entretien des climatiseurs sera tenu par un technicien que le bailleur se réserve le droit de choisir, chaque 2 mois. Les frais résultants de l'entretien seront à charge du locataire.</p>
        </div>

        <div class="article">
            <div class="article-title">Article 10° - Entretien des lieux loués :</div>
            <p>Le locataire s'engage à utiliser les lieux loués en bon père de famille et à les restituer à la fin du bail dans l'état où il les a trouvés sauf usure normale.</p>
        </div>

        <div class="article">
            <div class="article-title">Article 11° - inspection les lieux loués :</div>
            <p>Le locataire laissera inspecter les lieux loués deux fois l'an, par le bailleur ou son mandataire et c'est à la période où le bailleur jugera convenable, à condition toutefois, d'en prévenir le locataire 7 jours avant.</p>
        </div>

        <div class="article">
            <div class="article-title">Article 12° – Avenant :</div>
            <p>Toute modification au présent contrat fera l'objet d'un avenant.</p>
        </div>

        <div class="article">
            <div class="article-title">Article 13° - Résiliation :</div>
            <p>La partie qui désire résilier le contrat doit donner à l'autre un préavis de 3 mois, conformément à l'usage des lieux. Le bailleur peut donc donner un préavis au locataire si celui-ci s'est acquitté de son loyer pendant 3 mois successifs.</p>
        </div>

        <div class="article">
            <div class="article-title">Article 14° - Contestation :</div>
            <p>Pour toute litige à l'exécution du présent contrat, les parties s'adresseront à l'Autorité Municipale des lieux loués pour une conciliation. En cas d'échec de conciliation, le litige sera soumis aux Cours et tribunaux de la ville de Kinshasa.</p>
        </div>

        <div class="article">
            <div class="article-title">Article 15 : Remise des clés</div>
            <p>Le jour de l'expiration du présent bail, le Locataire devra remettre au bailleur ou à son Mandataire toutes les clés des locaux et de la porte d'entrée de la maison.<br>
            Le Bailleur ne pourra pas prendre la libre disposition des lieux au jour de l'expiration du bail, ce dernier aura droit en cas de force majeure, à une compensation pour le manque à gagner, calculée proportionnellement au loyer équivalent au nombre de jours concernés.</p>
        </div>

        <div class="article">
            <div class="article-title">Article 16 : Résolution des litiges</div>
            <p>Tout litige éventuel survenu au cours de l'application du présent bail sera d'abord réglé à l'amiable, faute de quoi, il sera porté devant les instances judiciaires compétentes de la République Démocratique du Congo.</p>
        </div>

        <div class="article">
            <div class="article-title">Article 17° - :</div>
            <p>Le présent contrat est établi en Deux exemplaires et ne pourra souffrir d'aucune rature ou surcharge quelconque. Il entre vigueur dès sa signature.</p>
        </div>
    </div>

    <div class="date">
        <p>Fait à Kinshasa, le ${currentDate}</p>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <h4>LE LOCATAIRE</h4>
            <div style="height: 80px; border-bottom: 1px solid #000; margin-top: 20px;"></div>
        </div>
        <div class="signature-box">
            <h4>LE (LA) BAILLEUR (RESSE)</h4>
            <div style="height: 80px; border-bottom: 1px solid #000; margin-top: 20px;"></div>
        </div>
    </div>

    <div style="text-align: center; margin-top: 40px;">
        <h4>TÉMOIN</h4>
        <div style="height: 80px; border-bottom: 1px solid #000; margin-top: 20px; width: 300px; display: inline-block;"></div>
    </div>

    <div style="page-break-before: always; padding-top: 40px;">
        <h3 style="text-decoration: underline; margin-bottom: 30px;">ANNEXE</h3>
        <h4 style="font-style: italic; margin-bottom: 20px;">Biens qui sont dans l'appartement</h4>
        
        <ol style="line-height: 2;">
            <li>Meubles cuisine, deux lustres cuisine,</li>
            <li>Trois salles de bain avec trois miroirs, trois cuves RAK/ céramique de WC, trois plafonniers, deux colonnes de douche et trois lavabos,</li>
            <li>Deux lustres au salon, deux appliques,</li>
            <li>Deux appliques chambre parents, un plafonnier,</li>
            <li>Un plafonnier dans chaque chambre enfant,</li>
            <li>Trois plafonniers dans les deux vérandas de l'appartement</li>
            <li>Cinq appliques de colonne,</li>
            <li>Deux plafonniers dans les deux couloirs,</li>
            <li><strong>32 Prises électriques, 4 interrupteurs doubles, 12 interrupteurs simple, et 5 JVD pour split du type SCHNUDER,</strong></li>
            <li>Deux climatiseurs de capacité <strong>12BTU</strong> (marque Hisense) au salon et <strong>9BTU</strong> (marque Jacobs) dans la chambre des parents.</li>
        </ol>
    </div>
</body>
</html>
  `;
};

// Helper function to convert numbers to French words (simplified version)
function numberToFrenchWords(num: number): string {
  const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  const thousands = ['', 'mille', 'million', 'milliard'];

  if (num === 0) return 'zéro';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    if (ten === 7) return 'soixante-' + teens[one];
    if (ten === 9) return 'quatre-vingt-' + teens[one];
    return tens[ten] + (one ? '-' + ones[one] : '');
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    const hundredStr = hundred === 1 ? 'cent' : ones[hundred] + ' cent';
    return hundredStr + (rest ? ' ' + numberToFrenchWords(rest) : '');
  }
  
  // Simplified for larger numbers
  return num.toString();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tenant, lease }: ContractData = await req.json();

    if (!tenant || !lease) {
      return new Response(
        JSON.stringify({ error: "Données du contrat manquantes" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const htmlContent = generateContractHTML({ tenant, lease });

    // In a real implementation, you would use a library like Puppeteer or jsPDF
    // For now, we'll return the HTML content that can be printed as PDF
    return new Response(
      JSON.stringify({ 
        success: true, 
        html: htmlContent,
        filename: `Contrat_Bail_${tenant.first_name}_${tenant.last_name}.html`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error generating contract:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
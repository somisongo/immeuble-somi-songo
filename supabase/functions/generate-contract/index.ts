import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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
  owner_id: string;
}

const generateContractHTML = (data: ContractData, landlordInfo: any, clauses: any[], annexes: any[]): string => {
  const startDate = new Date(data.lease.start_date).toLocaleDateString('fr-FR');
  const endDate = new Date(data.lease.end_date).toLocaleDateString('fr-FR');
  const currentDate = new Date().toLocaleDateString('fr-FR');
  
  // Fonction pour remplacer les variables dans le contenu
  const replaceVariables = (content: string): string => {
    return content
      .replace(/\{\{rent_amount\}\}/g, data.lease.rent_amount.toString())
      .replace(/\{\{rent_amount_words\}\}/g, numberToFrenchWords(data.lease.rent_amount))
      .replace(/\{\{deposit_amount\}\}/g, (data.lease.deposit_amount || data.lease.rent_amount * 3).toString())
      .replace(/\{\{deposit_amount_words\}\}/g, numberToFrenchWords(data.lease.deposit_amount || data.lease.rent_amount * 3))
      .replace(/\{\{bank_name\}\}/g, landlordInfo?.bank_name || 'ECOBANK')
      .replace(/\{\{bank_account\}\}/g, landlordInfo?.bank_account || '35080005368')
      .replace(/\{\{unit_number\}\}/g, data.lease.property.unit_number)
      .replace(/\{\{bedrooms\}\}/g, data.lease.property.bedrooms.toString())
      .replace(/\{\{bathrooms\}\}/g, data.lease.property.bathrooms.toString());
  };
  
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
            padding: 48px 96px 96px 96px; /* 0.5" top, 1" right, 1" bottom, 1" left */
            max-width: 210mm;
            box-sizing: border-box;
        }
        .header { 
            text-align: center; 
            margin-bottom: 40px; 
        }
        .logo {
            display: block;
            margin: 0 auto 20px auto;
            max-width: 150px;
            height: auto;
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
        <img src="https://lovable.dev/placeholder.svg" alt="Immeuble SOMI SONGO Logo" class="logo">
        <div class="title">CONTRAT DE BAIL</div>
        <div class="subtitle">IMMEUBLE RÉSIDENTIEL FAMILLE SONGO</div>
    </div>

    <div class="section">
        <h3>ENTRE</h3>
        <p>1. Madame, Mademoiselle, Monsieur <strong>${landlordInfo?.full_name?.toUpperCase() || 'PAUL SONGO MIZIRO'}</strong> de nationalité <strong>${landlordInfo?.nationality || 'Congolaise'}</strong><br>
        Passeport n° ${landlordInfo?.passport_number || 'OP1205813'}, demeurant ${landlordInfo?.address || 'au n° 14 de l\'Avenue (Rue) Saka, Quartier Kinsuka-Pecheur, Commune de Ngaliema'} ci-après dénommé(e) « bailleur » d'une part</p>
        
        <p>ET</p>
        
        <p>2. Monsieur, Madame, Mademoiselle, <strong>${data.tenant.first_name.toUpperCase()} ${data.tenant.last_name.toUpperCase()}</strong><br>
        de nationalité Congolaise Passeport n° .................................<br>
        demeurant au ................................................................................................................................<br>
        ci-après dénommé(e) « locataire » d'autre part</p>
    </div>

    <div class="section">
        <h3>IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT</h3>

        ${clauses.map((clause, index) => `
        <div class="article">
            <div class="article-title">${clause.article_number ? `Article ${clause.article_number}° - ` : ''}${clause.title}</div>
            <p>${replaceVariables(clause.content).replace(/\n/g, '<br>')}</p>
        </div>
        `).join('')}
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

    ${annexes.length > 0 ? `
    <div style="page-break-before: always; padding-top: 40px;">
        <h3 style="text-decoration: underline; margin-bottom: 30px;">ANNEXE</h3>
        ${annexes.map(annex => `
        <h4 style="font-style: italic; margin-bottom: 20px;">${annex.title}</h4>
        <div style="line-height: 1.8; white-space: pre-wrap;">${replaceVariables(annex.content)}</div>
        `).join('')}
    </div>
    ` : ''}
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
    const { tenant, lease, owner_id }: ContractData = await req.json();

    if (!tenant || !lease || !owner_id) {
      return new Response(
        JSON.stringify({ error: "Données du contrat manquantes" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Récupérer les informations du bailleur
    const { data: landlordInfo, error: landlordError } = await supabase
      .from('landlord_info')
      .select('*')
      .eq('owner_id', owner_id)
      .single();

    if (landlordError && landlordError.code !== 'PGRST116') {
      console.error('Error fetching landlord info:', landlordError);
    }

    // Récupérer les clauses du contrat (non-annexes)
    const { data: clauses, error: clausesError } = await supabase
      .from('contract_clauses')
      .select('*')
      .eq('owner_id', owner_id)
      .eq('is_annex', false)
      .order('order_index');

    if (clausesError) {
      console.error('Error fetching clauses:', clausesError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la récupération des clauses" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Récupérer les annexes
    const { data: annexes, error: annexesError } = await supabase
      .from('contract_clauses')
      .select('*')
      .eq('owner_id', owner_id)
      .eq('is_annex', true)
      .order('order_index');

    if (annexesError) {
      console.error('Error fetching annexes:', annexesError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la récupération des annexes" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const htmlContent = generateContractHTML({ tenant, lease, owner_id }, landlordInfo, clauses || [], annexes || []);

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
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

const generateContractHTML = async (data: ContractData, landlordInfo: any, clauses: any[], annexes: any[]): Promise<string> => {
  const startDate = new Date(data.lease.start_date).toLocaleDateString('fr-FR');
  const endDate = new Date(data.lease.end_date).toLocaleDateString('fr-FR');
  const currentDate = new Date().toLocaleDateString('fr-FR');
  
  // Télécharger le logo et le convertir en base64
  let logoBase64 = '';
  try {
    // Essayer d'abord l'URL publique Lovable
    const logoUrl = 'https://c2321dd6-5975-4c59-9d7b-a161014b1c60.lovableproject.com/lovable-uploads/logo-header.png';
    const logoResponse = await fetch(logoUrl);
    if (logoResponse.ok) {
      const logoBlob = await logoResponse.arrayBuffer();
      const logoBytes = new Uint8Array(logoBlob);
      logoBase64 = btoa(String.fromCharCode(...logoBytes));
    }
  } catch (error) {
    console.error("Error fetching logo:", error);
  }
  
  const logoSrc = logoBase64 
    ? `data:image/png;base64,${logoBase64}`
    : 'https://c2321dd6-5975-4c59-9d7b-a161014b1c60.lovableproject.com/lovable-uploads/logo-header.png';
  
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
        @page {
            size: A4;
            margin: 1in;
        }
        
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.7; 
            margin: 0;
            padding: 0;
            color: #2c3e50;
            background: #ffffff;
        }
        
        .page-header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 20px 30px 15px 30px;
            border-bottom: 4px solid #1d4ed8;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 10px;
            padding: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .company-info h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        
        .company-info p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        
        .header-right {
            text-align: right;
        }
        
        .header-right .contract-number {
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        
        .header-right .contract-date {
            font-size: 14px;
            font-weight: 600;
        }
        
        .document-title {
            text-align: center;
            background: rgba(255, 255, 255, 0.15);
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .document-title h2 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .content-wrapper {
            padding: 30px 0;
            max-width: 100%;
            margin: 0;
        }
        
        .info-card {
            background: #f8fafc;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .info-card h3 {
            margin: 0 0 15px 0;
            color: #1e40af;
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
        }
        
        .info-label {
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
        }
        
        .info-value {
            font-size: 14px;
            color: #1e293b;
            font-weight: 600;
        }
        
        .section { 
            margin-bottom: 30px;
        }
        
        .section-title {
            background: #eff6ff;
            color: #1e40af;
            padding: 12px 20px;
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 20px;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
        }
        
        .article { 
            margin-bottom: 25px;
            padding: 20px;
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .article-title { 
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 12px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        .article-content {
            color: #475569;
            font-size: 13px;
            line-height: 1.8;
        }
        
        .annex-section {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 30px 0;
            border-radius: 8px;
        }
        
        .annex-title {
            color: #92400e;
            font-weight: 700;
            margin-bottom: 12px;
            font-size: 14px;
            text-transform: uppercase;
        }
        
        .highlight-box {
            background: #dbeafe;
            border: 2px solid #3b82f6;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
            text-align: center;
        }
        
        .amount { 
            font-weight: 700;
            color: #1e40af;
            font-size: 16px;
        }
        
        .bank-info {
            background: #f0fdf4;
            border: 2px solid #22c55e;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
            text-align: center;
        }
        
        .bank-info h4 {
            margin: 0 0 10px 0;
            color: #166534;
            font-size: 14px;
            font-weight: 700;
        }
        
        .bank-account { 
            font-size: 20px; 
            font-weight: 700;
            color: #15803d;
            letter-spacing: 2px;
        }
        
        .signature-section { 
            margin-top: 60px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            padding: 30px 0;
            border-top: 2px solid #e2e8f0;
        }
        
        .signature-box { 
            text-align: center;
            padding: 20px;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            background: #f8fafc;
        }
        
        .signature-label {
            font-weight: 700;
            color: #475569;
            margin-bottom: 60px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .signature-name {
            color: #1e293b;
            font-weight: 600;
            margin-top: 10px;
        }
        
        .page-footer {
            background: #f1f5f9;
            padding: 15px 30px;
            text-align: center;
            border-top: 3px solid #3b82f6;
            margin-top: 40px;
        }
        
        .footer-content {
            font-size: 11px;
            color: #64748b;
            line-height: 1.6;
        }
        
        .date { 
            text-align: right;
            color: #64748b;
            font-size: 13px;
            margin-top: 30px;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .page-break {
                page-break-before: always;
            }
        }
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
    <!-- En-tête moderne avec logo et informations -->
    <div class="page-header">
        <div class="header-content">
            <div class="logo-section">
                <img src="${logoSrc}" 
                     alt="Logo IMMEUBLE SOMI SONGO" class="logo">
                <div class="company-info">
                    <h1>IMMEUBLE SOMI SONGO</h1>
                    <p>Gestion Immobilière Professionnelle</p>
                </div>
            </div>
            <div class="header-right">
                <div class="contract-number">N° Contrat: ${data.lease.property.unit_number}-${new Date().getFullYear()}</div>
                <div class="contract-date">Date: ${currentDate}</div>
            </div>
        </div>
        <div class="document-title">
            <h2>Contrat de Bail d'Habitation</h2>
        </div>
    </div>

    <div class="content-wrapper">
        <!-- Informations des parties -->
        <div class="info-card">
            <h3>🏢 Le Bailleur</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Nom Complet</span>
                    <span class="info-value">${landlordInfo?.full_name?.toUpperCase() || 'PAUL SONGO MIZIRO'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nationalité</span>
                    <span class="info-value">${landlordInfo?.nationality || 'Congolaise'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Passeport N°</span>
                    <span class="info-value">${landlordInfo?.passport_number || 'OP1205813'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Adresse</span>
                    <span class="info-value">${landlordInfo?.address || 'N° 14 Avenue Saka, Quartier Kinsuka-Pecheur, Ngaliema'}</span>
                </div>
            </div>
        </div>

        <div class="info-card">
            <h3>👤 Le Locataire</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Nom Complet</span>
                    <span class="info-value">${data.tenant.first_name.toUpperCase()} ${data.tenant.last_name.toUpperCase()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email</span>
                    <span class="info-value">${data.tenant.email || 'Non renseigné'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Téléphone</span>
                    <span class="info-value">${data.tenant.phone || 'Non renseigné'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nationalité</span>
                    <span class="info-value">Congolaise</span>
                </div>
            </div>
        </div>

        <div class="info-card">
            <h3>🏠 Bien Loué</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Appartement N°</span>
                    <span class="info-value">${data.lease.property.unit_number}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Configuration</span>
                    <span class="info-value">${data.lease.property.bedrooms} chambres, ${data.lease.property.bathrooms} salles de bain</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Date de début</span>
                    <span class="info-value">${startDate}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Date de fin</span>
                    <span class="info-value">${endDate}</span>
                </div>
            </div>
        </div>

        <!-- Montants financiers mis en évidence -->
        <div class="highlight-box">
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #64748b; font-weight: 600;">LOYER MENSUEL</p>
            <p class="amount" style="font-size: 32px; margin: 0;">${data.lease.rent_amount.toFixed(2)} USD</p>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #64748b;">(${replaceVariables('{{rent_amount_words}}')} dollars américains)</p>
        </div>

        <div class="highlight-box">
            <p style="margin: 0 0 15px 0; font-size: 14px; color: #64748b; font-weight: 600;">GARANTIE LOCATIVE</p>
            <p class="amount" style="font-size: 28px; margin: 0;">${(data.lease.deposit_amount || data.lease.rent_amount * 3).toFixed(2)} USD</p>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #64748b;">(${replaceVariables('{{deposit_amount_words}}')} dollars américains)</p>
        </div>

        <div class="bank-info">
            <h4>💳 Coordonnées Bancaires pour les Paiements</h4>
            <p style="margin: 5px 0; color: #166534;">Banque: <strong>${landlordInfo?.bank_name || 'ECOBANK'}</strong></p>
            <p class="bank-account">${landlordInfo?.bank_account || '35080005368'}</p>
        </div>

        <!-- Articles du contrat -->
        <div class="section">
            <div class="section-title">📋 Clauses Contractuelles</div>
            
            ${clauses.map((clause, index) => `
            <div class="article">
                <div class="article-title">
                    ${clause.article_number ? `Article ${clause.article_number}° — ` : ''}${clause.title}
                </div>
                <div class="article-content">
                    ${replaceVariables(clause.content).replace(/\n/g, '<br>')}
                </div>
            </div>
            `).join('')}
        </div>

        ${annexes.length > 0 ? `
        <div class="page-break"></div>
        <div class="section">
            <div class="section-title">📎 Annexes</div>
            
            ${annexes.map(annex => `
            <div class="annex-section">
                <div class="annex-title">${annex.title}</div>
                <div style="line-height: 1.8; white-space: pre-wrap; color: #78350f; font-size: 13px;">
                    ${replaceVariables(annex.content)}
                </div>
            </div>
            `).join('')}
        </div>
        ` : ''}

        <!-- Date et signatures -->
        <div class="date">
            <p>Fait à Kinshasa, le ${currentDate}</p>
        </div>

        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-label">Le Locataire</div>
                <div style="height: 60px;"></div>
                <div class="signature-name">${data.tenant.first_name.toUpperCase()} ${data.tenant.last_name.toUpperCase()}</div>
            </div>
            <div class="signature-box">
                <div class="signature-label">Le Bailleur</div>
                <div style="height: 60px;"></div>
                <div class="signature-name">${landlordInfo?.full_name?.toUpperCase() || 'PAUL SONGO MIZIRO'}</div>
            </div>
        </div>

        <div style="text-align: center; margin-top: 40px;">
            <div class="signature-box" style="display: inline-block; width: 300px;">
                <div class="signature-label">Témoin</div>
                <div style="height: 60px;"></div>
                <div class="signature-name">_________________</div>
            </div>
        </div>
    </div>

    <!-- Pied de page -->
    <div class="page-footer">
        <div class="footer-content">
            <strong>IMMEUBLE SOMI SONGO</strong><br>
            Adresse: ${landlordInfo?.address || 'N° 14 Avenue Saka, Quartier Kinsuka-Pecheur, Ngaliema, Kinshasa'}<br>
            Banque: ${landlordInfo?.bank_name || 'ECOBANK'} | Compte: ${landlordInfo?.bank_account || '35080005368'}<br>
            Document généré le ${currentDate}
        </div>
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

    const htmlContent = await generateContractHTML({ tenant, lease, owner_id }, landlordInfo, clauses || [], annexes || []);

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
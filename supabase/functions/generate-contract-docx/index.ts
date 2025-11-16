import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DocxRequest {
  html: string;
  filename: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { html, filename }: DocxRequest = await req.json();

    // Télécharger le logo et le convertir en base64
    let logoBase64 = '';
    try {
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

    // Nettoyer le HTML et remplacer l'URL du logo par le base64
    let cleanHtml = html.replace(/class="[^"]*"/gi, ''); // Supprimer les classes CSS
    
    // Remplacer l'URL du logo par la version base64
    if (logoBase64) {
      cleanHtml = cleanHtml.replace(
        /src="[^"]*logo-header\.png"/gi,
        `src="data:image/png;base64,${logoBase64}"`
      );
      // Également remplacer les URLs base64 déjà présentes
      cleanHtml = cleanHtml.replace(
        /src="data:image\/png;base64,[^"]*"/gi,
        `src="data:image/png;base64,${logoBase64}"`
      );
    }

    // Créer un document MHTML (format supporté par Word)
    const boundary = "----=_NextPart_" + Date.now();
    const mhtmlDocument = `MIME-Version: 1.0
Content-Type: multipart/related; boundary="${boundary}"

--${boundary}
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: quoted-printable
Content-Location: file:///C:/contract.html

<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="ProgId" content="Word.Document">
  <meta name="Generator" content="Microsoft Word">
  <meta name="Originator" content="Microsoft Word">
  <title>Contrat de Bail</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 8.5in 11.0in;
      margin: 1.0in 1.0in 1.0in 1.0in;
      mso-header-margin: 0.5in;
      mso-footer-margin: 0.5in;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      margin: 0;
    }
    h1 {
      font-size: 18pt;
      font-weight: bold;
      color: #1e40af;
      margin-top: 12pt;
      margin-bottom: 6pt;
    }
    h2 {
      font-size: 16pt;
      font-weight: bold;
      color: #1e40af;
      margin-top: 10pt;
      margin-bottom: 6pt;
    }
    h3 {
      font-size: 14pt;
      font-weight: bold;
      color: #1e40af;
      margin-top: 8pt;
      margin-bottom: 4pt;
    }
    p {
      margin-bottom: 10pt;
      text-align: justify;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10pt 0;
      border: 1pt solid #000;
    }
    td, th {
      padding: 8pt;
      border: 1pt solid #000;
      vertical-align: top;
    }
    .info-card {
      margin-bottom: 20pt;
      padding: 15pt;
      background-color: #f8fafc;
      border-left: 4pt solid #3b82f6;
    }
    .highlight-box {
      margin: 20pt 0;
      padding: 20pt;
      background-color: #dbeafe;
      text-align: center;
      border: 2pt solid #3b82f6;
    }
    .bank-info {
      margin: 20pt 0;
      padding: 20pt;
      background-color: #f0fdf4;
      text-align: center;
      border: 2pt solid #22c55e;
    }
    .signature-section {
      margin-top: 40pt;
    }
  </style>
</head>
<body>
  <div class="Section1">
    ${cleanHtml}
  </div>
</body>
</html>

--${boundary}--`;

    // Convertir en Blob
    const blob = new TextEncoder().encode(mhtmlDocument);

    return new Response(blob, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/msword",
        "Content-Disposition": `attachment; filename="${filename.replace('.docx', '.doc')}"`,
      },
    });

  } catch (error: any) {
    console.error("Error generating DOCX:", error);
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

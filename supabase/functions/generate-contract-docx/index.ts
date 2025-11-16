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

    // Nettoyer le HTML pour le format Word
    const cleanHtml = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Supprimer les styles inline
      .replace(/class="[^"]*"/gi, '') // Supprimer les classes
      .replace(/<img[^>]*>/gi, '') // Supprimer les images pour l'instant
      .replace(/background:[^;]*;/gi, ''); // Supprimer les backgrounds

    // Créer un document Word simple en utilisant le format Open XML
    const wordDocument = `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<html xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <title>Contrat de Bail</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: A4;
      margin: 1in;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
    }
    h1 { font-size: 18pt; font-weight: bold; color: #1e40af; }
    h2 { font-size: 16pt; font-weight: bold; color: #1e40af; }
    h3 { font-size: 14pt; font-weight: bold; color: #1e40af; }
    p { margin-bottom: 10pt; text-align: justify; }
    table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
    td { padding: 8pt; border: 1pt solid #e2e8f0; }
  </style>
</head>
<body>
  ${cleanHtml}
</body>
</html>`;

    // Convertir en Blob
    const blob = new TextEncoder().encode(wordDocument);

    return new Response(blob, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
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

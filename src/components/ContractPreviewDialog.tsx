import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileText } from "lucide-react";
import { useState } from "react";

interface ContractPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  htmlContent: string;
  onDownload: () => Promise<void>;
  contractTitle: string;
}

export const ContractPreviewDialog = ({ 
  open, 
  onOpenChange, 
  htmlContent, 
  onDownload,
  contractTitle 
}: ContractPreviewDialogProps) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await onDownload();
      onOpenChange(false);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadWord = async () => {
    setDownloadingWord(true);
    try {
      // Dynamically import html-docx-js
      const htmlDocx = await import('html-docx-js/dist/html-docx');
      
      // Create a complete HTML document with proper styling
      const completeHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; }
              h1 { font-size: 18pt; font-weight: bold; color: #1e40af; }
              h2 { font-size: 16pt; font-weight: bold; color: #1e40af; }
              h3 { font-size: 14pt; font-weight: bold; color: #1e40af; }
              .info-card { margin-bottom: 20px; padding: 15px; background-color: #f8fafc; }
              .highlight-box { margin: 20px 0; padding: 20px; background-color: #dbeafe; text-align: center; }
              .bank-info { margin: 20px 0; padding: 20px; background-color: #f0fdf4; text-align: center; }
              table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              td { padding: 8px; border: 1px solid #e2e8f0; }
              .signature-section { margin-top: 40px; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `;

      // Convert HTML to DOCX
      const converted = htmlDocx.asBlob(completeHtml);
      
      // Create download link
      const url = URL.createObjectURL(converted);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Contrat_${contractTitle.replace(/[^a-z0-9]/gi, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la génération du fichier Word:', error);
    } finally {
      setDownloadingWord(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Aperçu du contrat - {contractTitle}</span>
            <div className="flex gap-2 ml-4">
              <Button 
                onClick={handleDownloadWord} 
                disabled={downloadingWord}
                variant="outline"
              >
                {downloadingWord ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération Word...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Télécharger Word
                  </>
                )}
              </Button>
              <Button 
                onClick={handleDownload} 
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger PDF
                  </>
                )}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden border rounded-lg bg-background">
          <iframe
            srcDoc={htmlContent}
            className="w-full h-full"
            title="Aperçu du contrat"
            style={{
              border: 'none',
              backgroundColor: '#ffffff'
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

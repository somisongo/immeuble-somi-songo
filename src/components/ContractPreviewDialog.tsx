import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileText } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      const { data, error } = await supabase.functions.invoke('generate-contract-docx', {
        body: {
          html: htmlContent,
          filename: `Contrat_${contractTitle.replace(/[^a-z0-9]/gi, '_')}.docx`
        }
      });

      if (error) throw error;

      // Créer un blob et télécharger
      const blob = new Blob([data], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Contrat_${contractTitle.replace(/[^a-z0-9]/gi, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Document Word téléchargé avec succès');
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la génération du fichier Word:', error);
      toast.error('Erreur lors de la génération du fichier Word');
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

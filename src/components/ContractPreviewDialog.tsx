import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
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

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await onDownload();
      onOpenChange(false);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Aperçu du contrat - {contractTitle}</span>
            <Button 
              onClick={handleDownload} 
              disabled={downloading}
              className="ml-4"
            >
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger PDF
                </>
              )}
            </Button>
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

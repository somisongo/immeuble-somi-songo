import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, FileText, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { CreateLeaseDialog } from "./CreateLeaseDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Lease {
  id: string;
  unit: string;
  tenant: string;
  startDate: string;
  endDate: string;
  rent: number;
  status: "active" | "expiring" | "expired";
  propertyId: string;
}

export const LeaseManagement = () => {
  const [selectedLease, setSelectedLease] = useState<string | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<any>({});
  const { user } = useAuth();

  useEffect(() => {
    fetchLeases();
  }, [user]);

  const fetchLeases = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          property_id,
          rent_amount,
          start_date,
          end_date,
          status,
          properties:property_id (
            unit_number
          ),
          tenants:tenant_id (
            first_name,
            last_name
          )
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedLeases: Lease[] = (data || []).map((lease: any) => ({
        id: lease.id,
        unit: lease.properties?.unit_number || 'N/A',
        tenant: lease.tenants ? `${lease.tenants.first_name} ${lease.tenants.last_name}` : 'N/A',
        startDate: lease.start_date,
        endDate: lease.end_date,
        rent: lease.rent_amount,
        status: lease.status as "active" | "expiring" | "expired",
        propertyId: lease.property_id
      }));

      setLeases(formattedLeases);
    } catch (error) {
      console.error('Erreur lors du chargement des baux:', error);
      toast.error('Erreur lors du chargement des baux');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success text-success-foreground";
      case "expiring":
        return "bg-warning text-warning-foreground";
      case "expired":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "expiring":
        return "Expire bientôt";
      case "expired":
        return "Expiré";
      default:
        return status;
    }
  };

  const downloadContract = async (lease: Lease) => {
    try {
      toast.promise(
        (async () => {
          // Récupérer les données complètes du bail avec les relations
          const { data: leaseData, error: leaseError } = await supabase
            .from('leases')
            .select(`
              *,
              tenants:tenant_id (
                id,
                first_name,
                last_name,
                email,
                phone
              ),
              properties:property_id (
                id,
                unit_number,
                rent_amount,
                bedrooms,
                bathrooms
              )
            `)
            .eq('id', lease.id)
            .single();

          if (leaseError) {
            console.error('Erreur lors de la récupération du bail:', leaseError);
            throw leaseError;
          }

          console.log('Données du bail récupérées:', leaseData);

          // Appel de la fonction Edge pour générer le HTML
          const { data, error } = await supabase.functions.invoke('generate-contract', {
            body: {
              tenant: leaseData.tenants,
              lease: {
                id: leaseData.id,
                rent_amount: leaseData.rent_amount,
                deposit_amount: leaseData.deposit_amount,
                start_date: leaseData.start_date,
                end_date: leaseData.end_date,
                status: leaseData.status,
                property: leaseData.properties
              }
            }
          });

          if (error) {
            console.error('Erreur lors de l\'appel à generate-contract:', error);
            throw error;
          }

          console.log('Contrat HTML généré');

          // Créer un élément temporaire pour le rendu
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = data.html;
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.top = '0';
          tempDiv.style.width = '794px'; // Largeur A4 en pixels (approximative)
          tempDiv.style.backgroundColor = '#ffffff';
          document.body.appendChild(tempDiv);

          // Capturer le contenu en canvas
          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            width: 794,
            height: 1123 // Hauteur A4 approximative
          });

          // Supprimer l'élément temporaire
          document.body.removeChild(tempDiv);

          // Créer le PDF
          const pdf = new jsPDF('p', 'mm', 'a4');
          const imgData = canvas.toDataURL('image/png');
          
          // Calculer les dimensions pour s'adapter à la page A4
          const imgWidth = 210; // Largeur A4 en mm
          const pageHeight = 297; // Hauteur A4 en mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          // Ajouter la première page
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          // Ajouter des pages supplémentaires si nécessaire
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          // Télécharger le PDF
          const filename = `Contrat_Bail_${lease.tenant.replace(/\s+/g, '_')}.pdf`;
          pdf.save(filename);

          return "Contrat PDF téléchargé avec succès";
        })(),
        {
          loading: 'Génération du contrat PDF en cours...',
          success: (message) => message,
          error: 'Erreur lors de la génération du contrat PDF'
        }
      );
    } catch (error) {
      console.error('Erreur lors du téléchargement du contrat:', error);
    }
  };

  const handleEditLease = (lease: Lease) => {
    setSelectedLease(lease.id);
    setEditData({
      rent_amount: lease.rent,
      start_date: lease.startDate,
      end_date: lease.endDate,
      status: lease.status
    });
  };

  const saveLeaseChanges = async (leaseId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('leases')
        .update({
          rent_amount: parseFloat(editData.rent_amount),
          start_date: editData.start_date,
          end_date: editData.end_date,
          status: editData.status
        })
        .eq('id', leaseId)
        .eq('owner_id', user.id);

      if (error) throw error;

      toast.success('Bail modifié avec succès');
      setSelectedLease(null);
      fetchLeases();
    } catch (error) {
      console.error('Erreur lors de la modification du bail:', error);
      toast.error('Erreur lors de la modification du bail');
    }
  };

  const terminateLease = async (leaseId: string, propertyId: string) => {
    if (!user?.id) return;

    try {
      // Mettre à jour le statut du bail
      const { error: leaseError } = await supabase
        .from('leases')
        .update({ status: 'expired' })
        .eq('id', leaseId)
        .eq('owner_id', user.id);

      if (leaseError) throw leaseError;

      // Libérer l'appartement
      const { error: propertyError } = await supabase
        .from('properties')
        .update({ status: 'vacant' })
        .eq('id', propertyId)
        .eq('owner_id', user.id);

      if (propertyError) throw propertyError;

      toast.success('Bail terminé et appartement libéré');
      fetchLeases();
    } catch (error) {
      console.error('Erreur lors de la terminaison du bail:', error);
      toast.error('Erreur lors de la terminaison du bail');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des Baux</h2>
        <CreateLeaseDialog onLeaseCreated={fetchLeases} />
      </div>
      
      <div className="grid gap-4">
        {leases.map((lease) => (
          <Card key={lease.id} className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{lease.tenant}</h3>
                      <p className="text-sm text-muted-foreground">Appartement {lease.unit}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lease.startDate} - {lease.endDate}</span>
                  </div>
                  
                  <div className="font-semibold">${lease.rent}/mois</div>
                  
                  <Badge className={getStatusColor(lease.status)}>
                    {getStatusText(lease.status)}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadContract(lease)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Voir Contrat
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditLease(lease)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                  {lease.status === 'active' && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir terminer ce bail ? L\'appartement sera libéré.')) {
                          terminateLease(lease.id, lease.propertyId);
                        }
                      }}
                    >
                      Terminer Bail
                    </Button>
                  )}
                </div>
              </div>
              
              {selectedLease === lease.id && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-3">Modifier les Détails du Bail</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rent">Loyer Mensuel ($)</Label>
                        <Input 
                          id="rent" 
                          type="number" 
                          value={editData.rent_amount || ''} 
                          onChange={(e) => setEditData(prev => ({ ...prev, rent_amount: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="status">Statut</Label>
                        <Select 
                          value={editData.status || ''} 
                          onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir le statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Actif</SelectItem>
                            <SelectItem value="expiring">Expire bientôt</SelectItem>
                            <SelectItem value="expired">Expiré</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="start">Date de Début</Label>
                        <Input 
                          id="start" 
                          type="date" 
                          value={editData.start_date || ''} 
                          onChange={(e) => setEditData(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end">Date de Fin</Label>
                        <Input 
                          id="end" 
                          type="date" 
                          value={editData.end_date || ''} 
                          onChange={(e) => setEditData(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        className="bg-gradient-success"
                        onClick={() => saveLeaseChanges(lease.id)}
                      >
                        Sauvegarder
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedLease(null)}>Annuler</Button>
                    </div>
                  </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
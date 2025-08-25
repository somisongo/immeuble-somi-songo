import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, User, FileText, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { CreateLeaseDialog } from "./CreateLeaseDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Lease {
  id: string;
  unit: string;
  tenant: string;
  startDate: string;
  endDate: string;
  rent: number;
  status: "active" | "expiring" | "expired";
}

export const LeaseManagement = () => {
  const [selectedLease, setSelectedLease] = useState<string | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
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
        status: lease.status as "active" | "expiring" | "expired"
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
                  
                  <div className="font-semibold">{lease.rent}€/mois</div>
                  
                  <Badge className={getStatusColor(lease.status)}>
                    {getStatusText(lease.status)}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Voir Contrat
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedLease(lease.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                </div>
              </div>
              
              {selectedLease === lease.id && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-3">Modifier les Détails du Bail</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tenant">Nom du Locataire</Label>
                      <Input id="tenant" defaultValue={lease.tenant} />
                    </div>
                    <div>
                      <Label htmlFor="rent">Loyer Mensuel</Label>
                      <Input id="rent" type="number" defaultValue={lease.rent} />
                    </div>
                    <div>
                      <Label htmlFor="start">Date de Début</Label>
                      <Input id="start" type="date" defaultValue={lease.startDate} />
                    </div>
                    <div>
                      <Label htmlFor="end">Date de Fin</Label>
                      <Input id="end" type="date" defaultValue={lease.endDate} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="bg-gradient-success">Sauvegarder</Button>
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
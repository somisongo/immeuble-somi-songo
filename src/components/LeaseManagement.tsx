import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, User, FileText, Edit, Plus } from "lucide-react";
import { useState } from "react";

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
  
  const leases: Lease[] = [
    {
      id: "1",
      unit: "A1",
      tenant: "Jean Dupont",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      rent: 2200,
      status: "active"
    },
    {
      id: "2",
      unit: "A2",
      tenant: "Marie Martin",
      startDate: "2023-06-01",
      endDate: "2024-05-31",
      rent: 2100,
      status: "expiring"
    },
    {
      id: "3",
      unit: "A3",
      tenant: "Pierre Bernard",
      startDate: "2024-03-01",
      endDate: "2025-02-28",
      rent: 2300,
      status: "active"
    },
    {
      id: "4",
      unit: "A4",
      tenant: "Sophie Dubois",
      startDate: "2023-09-01",
      endDate: "2024-08-31",
      rent: 2000,
      status: "active"
    }
  ];

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des Baux</h2>
        <Button className="bg-gradient-primary hover:bg-primary-dark">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Bail
        </Button>
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
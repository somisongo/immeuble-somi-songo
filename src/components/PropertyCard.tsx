import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, Bath, Users, DollarSign, Calendar, UserPlus } from "lucide-react";

interface PropertyCardProps {
  id: string;
  unit: string;
  bedrooms: number;
  bathrooms: number;
  tenant?: string;
  rent: number;
  status: "occupied" | "vacant" | "maintenance";
  leaseEnd?: string;
  onManageLease: () => void;
  onManagePayment: () => void;
  onAssignTenant?: () => void;
}

export const PropertyCard = ({
  unit,
  bedrooms,
  bathrooms,
  tenant,
  rent,
  status,
  leaseEnd,
  onManageLease,
  onManagePayment,
  onAssignTenant
}: PropertyCardProps) => {
  console.log('PropertyCard props:', { unit, tenant, status, leaseEnd });
  const getStatusColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "bg-success text-success-foreground";
      case "vacant":
        return "bg-warning text-warning-foreground";
      case "maintenance":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "occupied":
        return "Occupé";
      case "vacant":
        return "Vacant";
      case "maintenance":
        return "Maintenance";
      default:
        return status;
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Appartement {unit}</CardTitle>
          <Badge className={getStatusColor(status)}>
            {getStatusText(status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{bedrooms} ch</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{bathrooms} sdb</span>
          </div>
        </div>
        
        {tenant && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{tenant}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-lg">${rent.toLocaleString()}/mois</span>
        </div>
        
        {leaseEnd && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Bail expire : {leaseEnd}</span>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          {status === 'vacant' && onAssignTenant ? (
            <Button onClick={onAssignTenant} className="flex-1 bg-gradient-success hover:bg-success-dark">
              <UserPlus className="mr-2 h-4 w-4" />
              Assigner Locataire
            </Button>
          ) : (
            <>
              <Button onClick={onManageLease} variant="outline" className="flex-1">
                Gérer le Bail
              </Button>
              <Button onClick={onManagePayment} className="flex-1 bg-gradient-primary hover:bg-primary-dark">
                Paiement
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
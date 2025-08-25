import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, Bath, Users, DollarSign, Calendar } from "lucide-react";

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
  onManagePayment
}: PropertyCardProps) => {
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

  return (
    <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Unit {unit}</CardTitle>
          <Badge className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{bathrooms} bath</span>
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
          <span className="font-semibold text-lg">${rent.toLocaleString()}/month</span>
        </div>
        
        {leaseEnd && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Lease ends: {leaseEnd}</span>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button onClick={onManageLease} variant="outline" className="flex-1">
            Manage Lease
          </Button>
          <Button onClick={onManagePayment} className="flex-1 bg-gradient-primary hover:bg-primary-dark">
            Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
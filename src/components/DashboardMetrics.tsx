import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, DollarSign, TrendingUp } from "lucide-react";

interface Property {
  id: string;
  unit: string;
  bedrooms: number;
  bathrooms: number;
  tenant?: string;
  rent: number;
  status: "occupied" | "vacant" | "maintenance";
  leaseEnd?: string;
}

interface DashboardMetricsProps {
  properties: Property[];
}

export const DashboardMetrics = ({ properties }: DashboardMetricsProps) => {
  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(p => p.status === "occupied");
  const occupiedCount = occupiedProperties.length;
  const monthlyRevenue = occupiedProperties.reduce((sum, property) => sum + property.rent, 0);
  const occupancyRate = totalProperties > 0 ? Math.round((occupiedCount / totalProperties) * 100) : 0;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Appartements</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProperties}</div>
          <p className="text-xs text-muted-foreground">Appartements 3 chambres</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Appartements Occupés</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{occupiedCount}</div>
          <p className="text-xs text-muted-foreground">{occupancyRate}% taux d'occupation</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenus Mensuels</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{monthlyRevenue.toLocaleString('fr-FR')}</div>
          <p className="text-xs text-muted-foreground">De {occupiedCount} appartements occupés</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">+12%</div>
          <p className="text-xs text-muted-foreground">vs mois dernier</p>
        </CardContent>
      </Card>
    </div>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, DollarSign, TrendingUp } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

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
  const { t } = useLanguage();
  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(p => p.status === "occupied");
  const occupiedCount = occupiedProperties.length;
  const monthlyRevenue = occupiedProperties.reduce((sum, property) => sum + property.rent, 0);
  const occupancyRate = totalProperties > 0 ? Math.round((occupiedCount / totalProperties) * 100) : 0;
  
  // Calcul de la performance basé sur les revenus réels vs potentiels
  const potentialRevenue = properties.reduce((sum, property) => sum + property.rent, 0);
  const revenuePerformance = potentialRevenue > 0 
    ? Math.round((monthlyRevenue / potentialRevenue) * 100) 
    : 0;
  
  // Calcul de la différence par rapport à l'objectif (100%)
  const performanceGap = revenuePerformance - 100;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('metrics.totalProperties')}</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProperties}</div>
          <p className="text-xs text-muted-foreground">{t('metrics.threeBedroomApartments')}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('metrics.occupiedProperties')}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{occupiedCount}</div>
          <p className="text-xs text-muted-foreground">{occupancyRate}% {t('metrics.occupancyRate')}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('metrics.monthlyRevenue')}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">${monthlyRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{t('metrics.from')} {occupiedCount} {t('metrics.occupiedApartments')}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('metrics.globalPerformance')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${revenuePerformance >= 80 ? 'text-success' : revenuePerformance >= 60 ? 'text-warning' : 'text-destructive'}`}>
            {revenuePerformance}%
          </div>
          <p className="text-xs text-muted-foreground">
            {potentialRevenue > 0 
              ? `${performanceGap >= 0 ? '+' : ''}${performanceGap}% ${t('metrics.potentialRevenue')}`
              : t('metrics.noData')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
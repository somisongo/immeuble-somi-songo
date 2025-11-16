import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, Bath, Users, DollarSign, Calendar, UserPlus } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

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
  const { t } = useLanguage();
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
        return t('properties.occupied');
      case "vacant":
        return t('properties.vacant');
      case "maintenance":
        return t('properties.maintenance');
      default:
        return status;
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base md:text-xl font-semibold truncate">{t('properties.apartment')} {unit}</CardTitle>
          <Badge className={`${getStatusColor(status)} text-xs whitespace-nowrap`}>
            {getStatusText(status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-3 w-3 md:h-4 md:w-4" />
            <span>{bedrooms} {bedrooms > 1 ? t('common.bedrooms') : t('common.bedroom')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-3 w-3 md:h-4 md:w-4" />
            <span>{bathrooms} {bathrooms > 1 ? t('common.bathrooms') : t('common.bathroom')}</span>
          </div>
        </div>
        
        {tenant && (
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-sm md:text-base truncate">{tenant}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          <span className="font-semibold text-base md:text-lg">${rent.toLocaleString()}{t('common.perMonth')}</span>
        </div>
        
        {leaseEnd && (
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="truncate">{t('properties.leaseExpires')} {leaseEnd}</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {status === 'vacant' && onAssignTenant ? (
            <Button onClick={onAssignTenant} className="flex-1 bg-gradient-success hover:bg-success-dark text-sm" size="sm">
              <UserPlus className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
              {t('properties.assignTenant')}
            </Button>
          ) : (
            <>
              <Button onClick={onManageLease} variant="outline" className="flex-1 text-xs md:text-sm" size="sm">
                {t('properties.manageLease')}
              </Button>
              <Button onClick={onManagePayment} className="flex-1 bg-gradient-primary hover:bg-primary-dark text-xs md:text-sm" size="sm">
                {t('properties.trackPayment')}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Property {
  id: string;
  unit: string;
  bedrooms: number;
  bathrooms: number;
  tenant?: string;
  rent: number;
  status: "occupied" | "vacant" | "maintenance";
  leaseEnd?: string;
}

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProperties = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Récupérer les propriétés avec les informations des locataires
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id);

      if (propertiesError) throw propertiesError;

      // Pour chaque propriété, récupérer les informations du bail actif et du locataire
      const propertiesWithTenants: Property[] = [];

      for (const property of propertiesData || []) {
        // Récupérer le bail actif pour cette propriété
        const { data: leaseData } = await supabase
          .from('leases')
          .select(`
            *,
            tenants (
              first_name,
              last_name
            )
          `)
          .eq('property_id', property.id)
          .eq('status', 'active')
          .maybeSingle();

        const propertyWithTenant: Property = {
          id: property.id,
          unit: property.unit_number,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          rent: Number(property.rent_amount),
          status: property.status as "occupied" | "vacant" | "maintenance",
          tenant: leaseData?.tenants 
            ? `${leaseData.tenants.first_name} ${leaseData.tenants.last_name}`
            : undefined,
          leaseEnd: leaseData?.end_date 
            ? new Date(leaseData.end_date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            : undefined
        };

        propertiesWithTenants.push(propertyWithTenant);
      }

      setProperties(propertiesWithTenants);
    } catch (error) {
      console.error('Erreur lors du chargement des propriétés:', error);
      toast.error('Erreur lors du chargement des propriétés');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [user]);

  return {
    properties,
    loading,
    refetch: fetchProperties
  };
};
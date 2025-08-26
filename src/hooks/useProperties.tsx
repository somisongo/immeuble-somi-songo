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
      console.log('Fetching properties for user:', user.id);
      
      // Récupérer les propriétés avec les informations des locataires
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id);

      if (propertiesError) throw propertiesError;
      console.log('Properties data:', propertiesData);

      // Pour chaque propriété, récupérer les informations du bail actif et du locataire
      const propertiesWithTenants: Property[] = [];

      for (const property of propertiesData || []) {
        console.log('Processing property:', property.unit_number);
        
        // Récupérer les informations du bail actif pour cette propriété - ÉVITER LA RÉCURSION
        // Ne pas faire de jointure complexe, récupérer séparément
        const { data: leaseData, error: leaseError } = await supabase
          .from('leases')
          .select('end_date, tenant_id')
          .eq('property_id', property.id)
          .eq('status', 'active')
          .maybeSingle();

        console.log('Lease data for', property.unit_number, ':', leaseData);
        if (leaseError) console.error('Lease error:', leaseError);

        let tenantName = undefined;
        if (leaseData?.tenant_id) {
          // Récupérer le nom du locataire séparément pour éviter la récursion
          const { data: tenantData } = await supabase
            .from('tenants')
            .select('first_name, last_name')
            .eq('id', leaseData.tenant_id)
            .maybeSingle();
          
          if (tenantData) {
            tenantName = `${tenantData.first_name} ${tenantData.last_name}`;
          }
        }

        const propertyWithTenant: Property = {
          id: property.id,
          unit: property.unit_number,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          rent: Number(property.rent_amount),
          status: property.status as "occupied" | "vacant" | "maintenance",
          tenant: tenantName,
          leaseEnd: leaseData?.end_date 
            ? new Date(leaseData.end_date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            : undefined
        };

        console.log('Property with tenant:', propertyWithTenant);
        propertiesWithTenants.push(propertyWithTenant);
      }

      console.log('Final properties with tenants:', propertiesWithTenants);
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
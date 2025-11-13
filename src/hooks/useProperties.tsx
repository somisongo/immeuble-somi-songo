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
      
      // Fetch properties with current lease and tenant information
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          *,
          leases!inner(
            id,
            status,
            end_date,
            tenants(
              first_name,
              last_name
            )
          )
        `)
        .eq('leases.status', 'active');

      if (propertiesError) throw propertiesError;

      // Also fetch properties without active leases
      const occupiedIds = (propertiesData || []).map(p => p.id);
      const vacantQuery = supabase
        .from('properties')
        .select('*');
      
      // Only add the not.in filter if there are occupied properties
      const { data: vacantPropertiesData, error: vacantError } = occupiedIds.length > 0
        ? await vacantQuery.not('id', 'in', `(${occupiedIds.join(',')})`)
        : await vacantQuery;

      if (vacantError) throw vacantError;

      console.log('Properties with leases:', propertiesData);
      console.log('Vacant properties:', vacantPropertiesData);

      // Convert occupied properties to expected format
      const occupiedProperties: Property[] = (propertiesData || []).map(property => {
        const lease = property.leases[0]; // Get first active lease
        const tenant = lease?.tenants;
        const tenantName = tenant ? `${tenant.first_name} ${tenant.last_name}` : undefined;
        
        return {
          id: property.id,
          unit: property.unit_number,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          rent: Number(property.rent_amount),
          status: property.status as "occupied" | "vacant" | "maintenance",
          tenant: tenantName,
          leaseEnd: lease?.end_date ? new Date(lease.end_date).toLocaleDateString('fr-FR') : undefined
        };
      });

      // Convert vacant properties to expected format
      const vacantProperties: Property[] = (vacantPropertiesData || []).map(property => ({
        id: property.id,
        unit: property.unit_number,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        rent: Number(property.rent_amount),
        status: property.status as "occupied" | "vacant" | "maintenance",
        tenant: undefined,
        leaseEnd: undefined
      }));

      const allProperties = [...occupiedProperties, ...vacantProperties];
      console.log('Final properties:', allProperties);
      setProperties(allProperties);
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
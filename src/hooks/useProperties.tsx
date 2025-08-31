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
      
      // Fetch properties only
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id);

      if (propertiesError) throw propertiesError;
      console.log('Properties data:', propertiesData);

      // Convert to expected format without tenant information for now
      const propertiesFormatted: Property[] = (propertiesData || []).map(property => ({
        id: property.id,
        unit: property.unit_number,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        rent: Number(property.rent_amount),
        status: property.status as "occupied" | "vacant" | "maintenance",
        tenant: undefined, // Will be updated separately if needed
        leaseEnd: undefined
      }));

      console.log('Final properties:', propertiesFormatted);
      setProperties(propertiesFormatted);
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
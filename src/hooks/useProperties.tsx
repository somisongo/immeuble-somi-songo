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
      
      // Récupérer uniquement les propriétés pour éviter les problèmes de RLS
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, unit_number, bedrooms, bathrooms, rent_amount, status')
        .eq('owner_id', user.id);

      if (propertiesError) {
        console.error('Properties error:', propertiesError);
        throw propertiesError;
      }

      console.log('Properties data:', propertiesData);

      // Transformer les données des propriétés
      const transformedProperties: Property[] = (propertiesData || []).map(property => {
        return {
          id: property.id,
          unit: property.unit_number,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          rent: Number(property.rent_amount),
          status: property.status as "occupied" | "vacant" | "maintenance",
          tenant: undefined, // Pour l'instant, on ignore les locataires pour éviter les problèmes
          leaseEnd: undefined
        };
      });

      console.log('Transformed properties:', transformedProperties);
      setProperties(transformedProperties);
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
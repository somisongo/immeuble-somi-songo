import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Property {
  id: string;
  unit_number: string;
  rent_amount: number;
  status: string;
}

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
}

interface CreateLeaseDialogProps {
  onLeaseCreated?: () => void;
}

export const CreateLeaseDialog = ({ onLeaseCreated }: CreateLeaseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    property_id: "",
    tenant_id: "",
    rent_amount: "",
    deposit_amount: "",
    start_date: "",
    end_date: "",
  });
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      fetchProperties();
      fetchTenants();
    }
  }, [open]);

  const fetchProperties = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, unit_number, rent_amount, status')
        .eq('owner_id', user.id)
        .eq('status', 'vacant'); // Seulement les appartements vacants

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des propriétés:', error);
      toast.error('Erreur lors du chargement des propriétés');
    }
  };

  const fetchTenants = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, first_name, last_name, email')
        .eq('owner_id', user.id);

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des locataires:', error);
      toast.error('Erreur lors du chargement des locataires');
    }
  };

  const handlePropertyChange = (propertyId: string) => {
    const selectedProperty = properties.find(p => p.id === propertyId);
    setFormData(prev => ({
      ...prev,
      property_id: propertyId,
      rent_amount: selectedProperty?.rent_amount.toString() || ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      // Créer le bail
      const { error: leaseError } = await supabase
        .from('leases')
        .insert({
          property_id: formData.property_id,
          tenant_id: formData.tenant_id,
          rent_amount: parseFloat(formData.rent_amount),
          deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
          start_date: formData.start_date,
          end_date: formData.end_date,
          status: 'active',
          owner_id: user.id
        });

      if (leaseError) throw leaseError;

      // Mettre à jour le statut de la propriété
      const { error: propertyError } = await supabase
        .from('properties')
        .update({ status: 'occupied' })
        .eq('id', formData.property_id);

      if (propertyError) throw propertyError;

      toast.success('Bail créé avec succès');
      setOpen(false);
      setFormData({
        property_id: "",
        tenant_id: "",
        rent_amount: "",
        deposit_amount: "",
        start_date: "",
        end_date: "",
      });
      onLeaseCreated?.();
    } catch (error) {
      console.error('Erreur lors de la création du bail:', error);
      toast.error('Erreur lors de la création du bail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:bg-primary-dark">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Bail
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un Nouveau Bail</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="property">Appartement</Label>
            <Select value={formData.property_id} onValueChange={handlePropertyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un appartement" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    Appartement {property.unit_number} - ${property.rent_amount}/mois
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tenant">Locataire</Label>
            <Select value={formData.tenant_id} onValueChange={(value) => setFormData(prev => ({ ...prev, tenant_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un locataire" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.first_name} {tenant.last_name} {tenant.email && `(${tenant.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rent_amount">Loyer mensuel ($)</Label>
              <Input
                id="rent_amount"
                type="number"
                step="0.01"
                value={formData.rent_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, rent_amount: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="deposit_amount">Dépôt de garantie ($)</Label>
              <Input
                id="deposit_amount"
                type="number"
                step="0.01"
                value={formData.deposit_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, deposit_amount: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Date de début</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">Date de fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.property_id || !formData.tenant_id}
              className="bg-gradient-success hover:bg-success-dark"
            >
              {loading ? "Création..." : "Créer le Bail"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
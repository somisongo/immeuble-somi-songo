import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Users, Plus, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Property {
  id: string;
  unit_number: string;
  rent_amount: number;
  status: string;
  bedrooms: number;
  bathrooms: number;
}

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

interface Assignment {
  id: string;
  property: Property;
  tenant: Tenant;
  start_date: string;
  end_date: string;
  rent_amount: number;
  status: string;
}

export const PropertyAssignment = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [assignmentForm, setAssignmentForm] = useState({
    tenant_id: "",
    start_date: "",
    end_date: "",
    rent_amount: "",
    deposit_amount: ""
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProperties(),
        fetchTenants(),
        fetchAssignments()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', user.id)
      .order('unit_number');

    if (error) throw error;
    setProperties(data || []);
  };

  const fetchTenants = async () => {
    if (!user?.id) return;

    // Récupérer uniquement les locataires avec des contrats actifs
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        *,
        leases!inner(
          id,
          status
        )
      `)
      .eq('owner_id', user.id)
      .eq('leases.status', 'active')
      .order('first_name');

    if (error) throw error;
    setTenants(data || []);
  };

  const fetchAssignments = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('leases')
      .select(`
        id,
        start_date,
        end_date,
        rent_amount,
        status,
        properties:property_id (
          id,
          unit_number,
          rent_amount,
          bedrooms,
          bathrooms,
          status
        ),
        tenants:tenant_id (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('owner_id', user.id)
      .eq('status', 'active');

    if (error) throw error;

    const formattedAssignments = (data || []).map((assignment: any) => ({
      id: assignment.id,
      property: assignment.properties,
      tenant: assignment.tenants,
      start_date: assignment.start_date,
      end_date: assignment.end_date,
      rent_amount: assignment.rent_amount,
      status: assignment.status
    }));

    setAssignments(formattedAssignments);
  };

  const handleAssign = async (propertyId: string) => {
    setSelectedProperty(propertyId);
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setAssignmentForm(prev => ({
        ...prev,
        rent_amount: property.rent_amount.toString()
      }));
    }
    setAssignDialogOpen(true);
  };

  const submitAssignment = async () => {
    if (!user?.id || !selectedProperty || !assignmentForm.tenant_id) return;

    try {
      // Créer le bail
      const { error: leaseError } = await supabase
        .from('leases')
        .insert({
          property_id: selectedProperty,
          tenant_id: assignmentForm.tenant_id,
          rent_amount: parseFloat(assignmentForm.rent_amount),
          deposit_amount: assignmentForm.deposit_amount ? parseFloat(assignmentForm.deposit_amount) : null,
          start_date: assignmentForm.start_date,
          end_date: assignmentForm.end_date,
          status: 'active',
          owner_id: user.id
        });

      if (leaseError) throw leaseError;

      // Mettre à jour le statut de la propriété
      const { error: propertyError } = await supabase
        .from('properties')
        .update({ status: 'occupied' })
        .eq('id', selectedProperty);

      if (propertyError) throw propertyError;

      toast.success('Appartement assigné avec succès');
      setAssignDialogOpen(false);
      setAssignmentForm({
        tenant_id: "",
        start_date: "",
        end_date: "",
        rent_amount: "",
        deposit_amount: ""
      });
      fetchData();
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      toast.error('Erreur lors de l\'assignation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vacant":
        return "bg-success text-success-foreground";
      case "occupied":
        return "bg-warning text-warning-foreground";
      case "maintenance":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "vacant":
        return "Vacant";
      case "occupied":
        return "Occupé";
      case "maintenance":
        return "Maintenance";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const vacantProperties = properties.filter(p => p.status === 'vacant');
  const occupiedProperties = properties.filter(p => p.status === 'occupied');

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold">Assignation d'Appartements</h2>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <Card className="bg-gradient-card">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 md:h-5 md:w-5 text-success" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Appartements Vacants</p>
                <p className="text-xl md:text-2xl font-bold text-success">{vacantProperties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 md:h-5 md:w-5 text-warning" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Appartements Occupés</p>
                <p className="text-xl md:text-2xl font-bold text-warning">{occupiedProperties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Locataires Disponibles</p>
                <p className="text-xl md:text-2xl font-bold text-primary">{tenants.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appartements Vacants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Appartements Disponibles pour Assignation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vacantProperties.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun appartement vacant disponible
            </p>
          ) : (
            <div className="grid gap-3">
              {vacantProperties.map((property) => (
                <div key={property.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                  <div className="flex items-start sm:items-center gap-3 flex-1">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm md:text-base">Appartement {property.unit_number}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {property.bedrooms} ch. • {property.bathrooms} sdb • ${property.rent_amount}/mois
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(property.status)} text-xs whitespace-nowrap`}>
                      {getStatusText(property.status)}
                    </Badge>
                  </div>
                  <Button 
                    onClick={() => handleAssign(property.id)}
                    className="bg-gradient-primary w-full sm:w-auto text-sm"
                    size="sm"
                    disabled={tenants.length === 0}
                  >
                    <Plus className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                    Assigner
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignations Actuelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assignations Actuelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucune assignation active
            </p>
          ) : (
            <div className="grid gap-3">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-2">
                  <div className="flex items-start sm:items-center gap-3 flex-1">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm md:text-base">
                        {assignment.tenant?.first_name || 'N/A'} {assignment.tenant?.last_name || ''}
                      </h4>
                      <p className="text-xs md:text-sm text-muted-foreground break-words">
                        Apt {assignment.property?.unit_number || 'N/A'} • 
                        ${assignment.rent_amount}/mois • 
                        Du {assignment.start_date} au {assignment.end_date}
                      </p>
                    </div>
                    <Badge className="bg-success text-success-foreground text-xs whitespace-nowrap">
                      Actif
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'assignation */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assigner un Appartement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tenant">Locataire</Label>
              <Select 
                value={assignmentForm.tenant_id} 
                onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, tenant_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un locataire" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant?.first_name || 'N/A'} {tenant?.last_name || ''}
                      {tenant?.email && ` (${tenant.email})`}
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
                  value={assignmentForm.rent_amount}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, rent_amount: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="deposit_amount">Dépôt de garantie ($)</Label>
                <Input
                  id="deposit_amount"
                  type="number"
                  step="0.01"
                  value={assignmentForm.deposit_amount}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, deposit_amount: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Date de début</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={assignmentForm.start_date}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">Date de fin</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={assignmentForm.end_date}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, end_date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAssignDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={submitAssignment}
                disabled={!assignmentForm.tenant_id || !assignmentForm.start_date || !assignmentForm.end_date}
                className="bg-gradient-success"
              >
                Assigner l'Appartement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
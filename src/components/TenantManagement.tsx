import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Mail, Phone, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export const TenantManagement = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: ""
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTenants();
    }
  }, [user]);

  const fetchTenants = async () => {
    if (!user) return;
    
    try {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Erreur lors du chargement des locataires');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (selectedTenant) {
        // Update existing tenant
        const { error } = await supabase
          .from('tenants')
          .update(formData)
          .eq('id', selectedTenant.id);

        if (error) throw error;
        toast.success('Locataire modifié avec succès');
      } else {
        // Create new tenant
        const { error } = await supabase
          .from('tenants')
          .insert([{ ...formData, owner_id: user.id }]);

        if (error) throw error;
        toast.success('Locataire ajouté avec succès');
      }

      fetchTenants();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving tenant:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      email: tenant.email || "",
      phone: tenant.phone || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (tenantId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce locataire ?')) return;

    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId);

      if (error) throw error;
      toast.success('Locataire supprimé avec succès');
      fetchTenants();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTenant(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Locataires</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Locataire
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedTenant ? 'Modifier le Locataire' : 'Nouveau Locataire'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-primary hover:bg-primary-dark">
                  {selectedTenant ? 'Modifier' : 'Ajouter'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {tenant.first_name} {tenant.last_name}
                </CardTitle>
                <Badge variant="secondary">Locataire</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {tenant.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{tenant.email}</span>
                </div>
              )}
              
              {tenant.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{tenant.phone}</span>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Ajouté le {new Date(tenant.created_at).toLocaleDateString('fr-FR')}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleEdit(tenant)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  onClick={() => handleDelete(tenant.id)}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tenants.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun locataire</h3>
          <p className="text-muted-foreground mb-4">
            Commencez par ajouter vos premiers locataires
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un Locataire
          </Button>
        </Card>
      )}
    </div>
  );
};
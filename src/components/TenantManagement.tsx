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
import { useLanguage } from "@/hooks/useLanguage";
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
  const { t, language } = useLanguage();

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
      toast.error(t('tenants.errorLoading'));
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
        toast.success(t('tenants.successEdit'));
      } else {
        // Create new tenant
        const { error } = await supabase
          .from('tenants')
          .insert([{ ...formData, owner_id: user.id }]);

        if (error) throw error;
        toast.success(t('tenants.successAdd'));
      }

      fetchTenants();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving tenant:', error);
      toast.error(t('tenants.errorSaving'));
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
    if (!confirm(t('tenants.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId);

      if (error) throw error;
      toast.success(t('tenants.successDelete'));
      fetchTenants();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast.error(t('tenants.errorDeleting'));
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
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl md:text-2xl font-bold">{t('tenants.title')}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-primary-dark w-full sm:w-auto text-sm md:text-base">
              <Plus className="h-4 w-4 mr-2" />
              {t('tenants.addTenant')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedTenant ? t('tenants.editTenant') : t('tenants.addTenant')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">{t('tenants.firstName')} *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">{t('tenants.lastName')} *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('tenants.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('tenants.phone')}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-primary hover:bg-primary-dark">
                  {selectedTenant ? t('common.edit') : t('common.add')}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1">
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2 flex-1 min-w-0">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <span className="truncate">{tenant.first_name} {tenant.last_name}</span>
                </CardTitle>
                <Badge variant="secondary" className="text-xs flex-shrink-0">{t('common.tenant')}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3">
              {tenant.email && (
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Mail className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{tenant.email}</span>
                </div>
              )}
              
              {tenant.phone && (
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Phone className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{tenant.phone}</span>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                {t('tenants.addedOn')} {new Date(tenant.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleEdit(tenant)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs md:text-sm"
                >
                  <Edit className="h-3 w-3 mr-1 md:h-4 md:w-4 md:mr-1" />
                  {t('common.edit')}
                </Button>
                <Button
                  onClick={() => handleDelete(tenant.id)}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive text-xs md:text-sm"
                >
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tenants.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('tenants.noTenants')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('tenants.addFirstTenant')}
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-primary hover:bg-primary-dark">
            <Plus className="h-4 w-4 mr-2" />
            {t('tenants.addTenant')}
          </Button>
        </Card>
      )}
    </div>
  );
};
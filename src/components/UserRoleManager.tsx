import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from "@/hooks/use-toast";
import { User, UserPlus, Shield } from 'lucide-react';

interface UserRole {
  id: string;
  user_id: string;
  role: 'owner' | 'tenant';
  created_at: string;
}

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  user_id?: string;
}

export const UserRoleManager = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'owner' | 'tenant'>('tenant');
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch tenants without user accounts
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .is('user_id', null);

      if (tenantsError) throw tenantsError;

      setUserRoles(rolesData || []);
      setTenants(tenantsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUserAccount = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast({
        title: "Erreur", 
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create user account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (signUpError) throw signUpError;

      if (!signUpData.user) {
        throw new Error('User creation failed');
      }

      // Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: signUpData.user.id,
          role: newUserRole,
        });

      if (roleError) throw roleError;

      // If it's a tenant role and a tenant is selected, link them
      if (newUserRole === 'tenant' && selectedTenant) {
        const { error: linkError } = await supabase
          .from('tenants')
          .update({ user_id: signUpData.user.id })
          .eq('id', selectedTenant);

        if (linkError) throw linkError;
      }

      toast({
        title: "Succès",
        description: "Compte utilisateur créé avec succès.",
      });

      // Reset form
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('tenant');
      setSelectedTenant('');
      fetchData();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le compte.",
        variant: "destructive",
      });
    }
  };

  const removeUserRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Rôle supprimé avec succès.",
      });

      fetchData();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le rôle.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Gestion des Utilisateurs</h2>
        <p className="text-muted-foreground">Créer et gérer les comptes utilisateur avec leurs rôles</p>
      </div>

      {/* Create User Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Créer un Nouveau Compte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select value={newUserRole} onValueChange={(value: 'owner' | 'tenant') => setNewUserRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Propriétaire</SelectItem>
                  <SelectItem value="tenant">Locataire</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newUserRole === 'tenant' && (
              <div>
                <Label htmlFor="tenant">Lier à un locataire existant (optionnel)</Label>
                <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un locataire" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.first_name} {tenant.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button onClick={createUserAccount} className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Créer le Compte
          </Button>
        </CardContent>
      </Card>

      {/* User Roles List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Utilisateurs et Rôles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRoles.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userRoles.map((userRole) => (
                <div
                  key={userRole.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <User className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      Utilisateur #{userRole.user_id.slice(0, 8)}...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Créé le: {new Date(userRole.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={userRole.role === 'owner' ? 'default' : 'secondary'}>
                      {userRole.role === 'owner' ? 'Propriétaire' : 'Locataire'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeUserRole(userRole.id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
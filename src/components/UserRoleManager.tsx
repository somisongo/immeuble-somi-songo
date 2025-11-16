import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { User, UserPlus, Shield, Edit, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface UserRole {
  id: string;
  user_id: string;
  role: 'owner' | 'tenant';
  created_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
}

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  user_id?: string;
}

interface Profile {
  id?: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export const UserRoleManager = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'owner' | 'tenant'>('tenant');
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'tenant'>('tenant');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRole | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  const [initialForm, setInitialForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

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

      // Fetch all profiles to match with user roles
      const { data: allProfilesData, error: allProfilesError } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, email, phone');

      if (allProfilesError) throw allProfilesError;

      // Create a map for quick profile lookup
      const profilesMap = new Map(
        (allProfilesData || []).map(p => [p.user_id, p])
      );

      // Combine roles with profile data
      const rolesWithProfiles = (rolesData || []).map(role => ({
        ...role,
        profiles: profilesMap.get(role.user_id)
      }));

      // Fetch tenants without user accounts
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .is('user_id', null);

      if (tenantsError) throw tenantsError;

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;


      // Filter profiles that don't have a role yet
      const userRoleIds = rolesWithProfiles.map(r => r.user_id);
      const profilesWithoutRole = (allProfilesData || []).filter(
        p => !userRoleIds.includes(p.user_id)
      );

      setUserRoles(rolesWithProfiles);
      setTenants(tenantsData || []);
      setProfiles(profilesWithoutRole);
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
    if (!newUserEmail || !newUserPassword || !newUserFirstName || !newUserLastName) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create user account with metadata
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: newUserFirstName,
            last_name: newUserLastName,
            email: newUserEmail
          }
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
      setNewUserFirstName('');
      setNewUserLastName('');
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

  const assignRoleToExistingUser = async () => {
    if (!selectedProfile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un utilisateur.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedProfile,
          role: selectedRole,
        });

      if (roleError) throw roleError;

      toast({
        title: "Succès",
        description: "Rôle assigné avec succès.",
      });

      // Reset form
      setSelectedProfile('');
      setSelectedRole('tenant');
      fetchData();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'assigner le rôle.",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (userRole: UserRole) => {
    setUserToDelete(userRole);
    setDeleteDialogOpen(true);
  };

  const deleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Delete user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', userToDelete.id);

      if (roleError) throw roleError;

      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès.",
      });

      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (userRole: UserRole) => {
    if (!userRole.profiles) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations de l'utilisateur.",
        variant: "destructive",
      });
      return;
    }

    const profileData = {
      user_id: userRole.user_id,
      first_name: userRole.profiles.first_name || '',
      last_name: userRole.profiles.last_name || '',
      email: userRole.profiles.email || ''
    };
    const formData = {
      first_name: userRole.profiles.first_name || '',
      last_name: userRole.profiles.last_name || '',
      email: userRole.profiles.email || '',
      phone: userRole.profiles.phone || ''
    };
    
    setEditingUser(profileData);
    setEditForm(formData);
    setInitialForm(formData);
    setEditDialogOpen(true);
  };

  const isFieldModified = (fieldName: keyof typeof editForm) => {
    return editForm[fieldName] !== initialForm[fieldName];
  };

  const updateUserProfile = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          email: editForm.email,
          phone: editForm.phone || null
        })
        .eq('user_id', editingUser.user_id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Profil mis à jour avec succès.",
      });

      setEditDialogOpen(false);
      setEditingUser(null);
      await fetchData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le profil.",
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
        <p className="text-muted-foreground">Assigner des rôles aux comptes existants ou créer de nouveaux comptes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gestion des rôles utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assign" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assign">Assigner un rôle</TabsTrigger>
              <TabsTrigger value="create">Créer nouveau compte</TabsTrigger>
            </TabsList>

            <TabsContent value="assign" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="select-user">Sélectionner un utilisateur</Label>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger id="select-user">
                    <SelectValue placeholder="Choisir un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Aucun utilisateur sans rôle disponible
                      </SelectItem>
                    ) : (
                      profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.user_id}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {profile.first_name && profile.last_name
                                ? `${profile.first_name} ${profile.last_name}`
                                : `Utilisateur ${profile.user_id.substring(0, 8)}`}
                            </span>
                            {profile.email && (
                              <span className="text-sm text-muted-foreground">{profile.email}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assign-role">Rôle à assigner</Label>
                <Select value={selectedRole} onValueChange={(value: 'owner' | 'tenant') => setSelectedRole(value)}>
                  <SelectTrigger id="assign-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Propriétaire</SelectItem>
                    <SelectItem value="tenant">Locataire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={assignRoleToExistingUser} className="w-full" disabled={!selectedProfile}>
                <Shield className="h-4 w-4 mr-2" />
                Assigner le rôle
              </Button>
            </TabsContent>

            <TabsContent value="create" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name">Prénom</Label>
                  <Input
                    id="first-name"
                    type="text"
                    value={newUserFirstName}
                    onChange={(e) => setNewUserFirstName(e.target.value)}
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <Label htmlFor="last-name">Nom</Label>
                  <Input
                    id="last-name"
                    type="text"
                    value={newUserLastName}
                    onChange={(e) => setNewUserLastName(e.target.value)}
                    placeholder="Nom"
                  />
                </div>
              </div>

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
                {newUserRole === 'tenant' && tenants.length > 0 && (
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* User Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Utilisateurs avec rôles ({userRoles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRoles.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Aucun utilisateur avec un rôle assigné
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRoles.map((userRole) => (
                    <TableRow key={userRole.id}>
                      <TableCell className="font-medium">
                        {userRole.profiles?.first_name && userRole.profiles?.last_name
                          ? `${userRole.profiles.first_name} ${userRole.profiles.last_name}`
                          : `Utilisateur ${userRole.user_id.substring(0, 8)}...`}
                      </TableCell>
                      <TableCell>
                        {userRole.profiles?.email || 'Email non disponible'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={userRole.role === 'owner' ? 'default' : 'secondary'}>
                          {userRole.role === 'owner' ? 'Propriétaire' : 'Locataire'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(userRole.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(userRole)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(userRole)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          {(!initialForm.first_name && !initialForm.last_name && !initialForm.email) && (
            <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
              ℹ️ Ce profil n'a pas encore d'informations. Veuillez les remplir ci-dessous.
            </div>
          )}
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-first-name" className="flex items-center gap-2">
                  Prénom
                  {isFieldModified('first_name') && (
                    <Badge variant="secondary" className="text-xs">Modifié</Badge>
                  )}
                </Label>
                <Input
                  id="edit-first-name"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  className={isFieldModified('first_name') ? 'border-primary' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-last-name" className="flex items-center gap-2">
                  Nom
                  {isFieldModified('last_name') && (
                    <Badge variant="secondary" className="text-xs">Modifié</Badge>
                  )}
                </Label>
                <Input
                  id="edit-last-name"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  className={isFieldModified('last_name') ? 'border-primary' : ''}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="flex items-center gap-2">
                Email
                {isFieldModified('email') && (
                  <Badge variant="secondary" className="text-xs">Modifié</Badge>
                )}
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className={isFieldModified('email') ? 'border-primary' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="flex items-center gap-2">
                Téléphone
                {isFieldModified('phone') && (
                  <Badge variant="secondary" className="text-xs">Modifié</Badge>
                )}
              </Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className={isFieldModified('phone') ? 'border-primary' : ''}
              />
            </div>
            <Button onClick={updateUserProfile} className="w-full">
              Enregistrer les modifications
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera l'utilisateur{' '}
              <strong>
                {userToDelete?.profiles?.first_name && userToDelete?.profiles?.last_name
                  ? `${userToDelete.profiles.first_name} ${userToDelete.profiles.last_name}`
                  : 'cet utilisateur'}
              </strong>
              . Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
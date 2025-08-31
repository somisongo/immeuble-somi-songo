import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/PropertyCard";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { LeaseManagement } from "@/components/LeaseManagement";
import { PaymentTracking } from "@/components/PaymentTracking";
import { TenantManagement } from "@/components/TenantManagement";
import { PropertyAssignment } from "@/components/PropertyAssignment";
import { UserRoleManager } from "@/components/UserRoleManager";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useProperties } from "@/hooks/useProperties";
import { Building2, BarChart3, FileText, CreditCard, Users, LogOut, Settings, UserPlus } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { signOut, user } = useAuth();
  const { role, loading } = useUserRole();
  const { properties, loading: propertiesLoading } = useProperties();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're completely sure the user is a tenant
    // Avoid redirecting during loading states to prevent loops
    if (!loading && user && role === 'tenant') {
      window.location.href = '/tenant';
    }
  }, [user, role, loading]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Déconnexion réussie');
    navigate('/auth', { replace: true });
  };


  const handleAssignment = () => {
    setActiveTab("assignments");
  };

  const handleLease = () => {
    setActiveTab("leases");
  };

  const handlePayment = () => {
    setActiveTab("payments");
  };

  if (loading || propertiesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        {/* Header */}
        <header className="bg-gradient-primary shadow-elevated">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/853c19f0-d043-4f34-89a3-eeed4fa269d9.png" 
                  alt="Immeuble SOMI SONGO Logo" 
                  className="h-16 w-auto"
                />
                <div>
                  <h1 className="text-2xl font-bold text-primary-foreground">Gestionnaire Immobilier - Immeuble SOMI SONGO</h1>
                  <p className="text-primary-foreground/80">Immeuble de 5 Appartements</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary-foreground/80">
                  {user?.email}
                </span>
                <Button 
                  variant="secondary" 
                  className="shadow-md"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7 bg-card shadow-card">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Tableau de bord
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Propriétés
              </TabsTrigger>
              <TabsTrigger value="tenants" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Locataires
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Assignations
              </TabsTrigger>
              <TabsTrigger value="leases" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Baux
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Paiements
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Utilisateurs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <DashboardMetrics properties={properties} />
              
              <div>
                <h2 className="text-2xl font-bold mb-6">Aperçu des Propriétés</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      {...property}
                      onManageLease={handleLease}
                      onManagePayment={handlePayment}
                      onAssignTenant={handleAssignment}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="properties">
              <div>
                <h2 className="text-2xl font-bold mb-6">Toutes les Propriétés</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      {...property}
                      onManageLease={handleLease}
                      onManagePayment={handlePayment}
                      onAssignTenant={handleAssignment}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tenants">
              <TenantManagement />
            </TabsContent>

            <TabsContent value="assignments">
              <PropertyAssignment />
            </TabsContent>

            <TabsContent value="leases">
              <LeaseManagement />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentTracking />
            </TabsContent>

            <TabsContent value="users">
              <UserRoleManager />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="bg-card border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-muted-foreground">
              <p>&copy; 2024 Gestionnaire Immobilier. Gestion efficace de votre immeuble de 5 appartements.</p>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
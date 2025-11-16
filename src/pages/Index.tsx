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
import { ContractManager } from "@/components/ContractManager";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useProperties } from "@/hooks/useProperties";
import { useLanguage } from "@/hooks/useLanguage";
import { Building2, BarChart3, FileText, CreditCard, Users, LogOut, Settings, UserPlus, FileEdit, BookOpen, FileCode } from "lucide-react";
import { toast } from "sonner";
import { RevenueChart } from "@/components/RevenueChart";
import { RevenueExport } from "@/components/RevenueExport";
import { DocumentationHub } from "@/components/DocumentationHub";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { signOut, user } = useAuth();
  const { role, loading } = useUserRole();
  const { properties, loading: propertiesLoading } = useProperties();
  const { t } = useLanguage();
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
    toast.success(t('common.signOut'));
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <img 
                  src="/lovable-uploads/fac5cb0d-2b04-4cba-81e5-079a75bbf8a8.png" 
                  alt="Immeuble SOMI SONGO Logo" 
                  className="h-12 sm:h-16 lg:h-20 w-auto flex-shrink-0"
                />
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-lg lg:text-2xl font-bold text-primary-foreground truncate">Gestionnaire Immobilier - Immeuble SOMI SONGO</h1>
                  <p className="text-xs sm:text-sm text-primary-foreground/80 hidden sm:block">Immeuble de 5 Appartements</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
                <span className="text-primary-foreground/80 text-xs sm:text-sm hidden md:block truncate max-w-[150px]">
                  {user?.email}
                </span>
                <LanguageSelector />
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="shadow-md"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('common.signOut')}</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex min-w-full sm:grid sm:grid-cols-5 lg:grid-cols-9 gap-1 bg-card shadow-card p-1">
                <TabsTrigger value="dashboard" className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('dashboard.tabs.dashboard')}</span>
                </TabsTrigger>
                <TabsTrigger value="properties" className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('dashboard.tabs.properties')}</span>
                </TabsTrigger>
                <TabsTrigger value="tenants" className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('dashboard.tabs.tenants')}</span>
                </TabsTrigger>
                <TabsTrigger value="assignments" className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('dashboard.tabs.assignments')}</span>
                </TabsTrigger>
                <TabsTrigger value="leases" className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('dashboard.tabs.leases')}</span>
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('dashboard.tabs.payments')}</span>
                </TabsTrigger>
                <TabsTrigger value="contracts" className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                  <FileEdit className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('dashboard.tabs.contracts')}</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('dashboard.tabs.users')}</span>
                </TabsTrigger>
                <TabsTrigger value="documentation" className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('dashboard.tabs.documentation')}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="space-y-6">
              <DashboardMetrics properties={properties} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RevenueChart />
                </div>
                <div>
                  <RevenueExport />
                </div>
              </div>
              
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6">Aperçu des Propriétés</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6">Toutes les Propriétés</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

            <TabsContent value="contracts">
              <ContractManager />
            </TabsContent>

            <TabsContent value="users">
              <UserRoleManager />
            </TabsContent>

            <TabsContent value="documentation">
              <DocumentationHub />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="bg-card border-t mt-8 sm:mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="text-center text-muted-foreground text-xs sm:text-sm">
              <p>&copy; 2024 Gestionnaire Immobilier. Gestion efficace de votre immeuble de 5 appartements.</p>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
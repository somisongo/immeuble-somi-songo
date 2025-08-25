import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/PropertyCard";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { LeaseManagement } from "@/components/LeaseManagement";
import { PaymentTracking } from "@/components/PaymentTracking";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { Building2, BarChart3, FileText, CreditCard, LogOut } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erreur lors de la déconnexion');
    } else {
      toast.success('Déconnexion réussie');
    }
  };

  const properties = [
    {
      id: "1",
      unit: "A1",
      bedrooms: 3,
      bathrooms: 2,
      tenant: "Jean Dupont",
      rent: 2200,
      status: "occupied" as const,
      leaseEnd: "31 Déc 2024"
    },
    {
      id: "2",
      unit: "A2",
      bedrooms: 3,
      bathrooms: 2,
      tenant: "Marie Martin",
      rent: 2100,
      status: "occupied" as const,
      leaseEnd: "31 Mai 2024"
    },
    {
      id: "3",
      unit: "A3",
      bedrooms: 3,
      bathrooms: 2,
      tenant: "Pierre Bernard",
      rent: 2300,
      status: "occupied" as const,
      leaseEnd: "28 Fév 2025"
    },
    {
      id: "4",
      unit: "A4",
      bedrooms: 3,
      bathrooms: 2,
      tenant: "Sophie Dubois",
      rent: 2000,
      status: "occupied" as const,
      leaseEnd: "31 Août 2024"
    },
    {
      id: "5",
      unit: "A5",
      bedrooms: 3,
      bathrooms: 2,
      rent: 2200,
      status: "vacant" as const
    }
  ];

  const handleLease = () => {
    setActiveTab("leases");
  };

  const handlePayment = () => {
    setActiveTab("payments");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        {/* Header */}
        <header className="bg-gradient-primary shadow-elevated">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary-foreground" />
                <div>
                  <h1 className="text-2xl font-bold text-primary-foreground">Gestionnaire Immobilier</h1>
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
            <TabsList className="grid w-full grid-cols-4 bg-card shadow-card">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Tableau de bord
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Propriétés
              </TabsTrigger>
              <TabsTrigger value="leases" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Baux
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Paiements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <DashboardMetrics />
              
              <div>
                <h2 className="text-2xl font-bold mb-6">Aperçu des Propriétés</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      {...property}
                      onManageLease={handleLease}
                      onManagePayment={handlePayment}
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
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="leases">
              <LeaseManagement />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentTracking />
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
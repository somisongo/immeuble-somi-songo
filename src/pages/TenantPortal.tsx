import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { TenantDashboard } from '@/components/TenantDashboard';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function TenantPortal() {
  const { user, signOut } = useAuth();
  const { role, loading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're sure the user is authenticated but not a tenant
    // Avoid redirecting during loading states to prevent loops
    if (!loading && user && role !== null && role !== 'tenant') {
      navigate('/');
    }
  }, [user, role, loading, navigate]);

  const handleSignOut = async () => {
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès",
    });
    // La fonction signOut gère déjà la redirection
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || role !== 'tenant') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="bg-primary/95 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">
                Portail Locataire - Immeuble SOMI SONGO
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-primary-foreground/80 text-sm">
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <TenantDashboard />
      </main>
    </div>
  );
}
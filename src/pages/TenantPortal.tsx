import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/hooks/useLanguage';
import { TenantDashboard } from '@/components/TenantDashboard';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function TenantPortal() {
  const { user, signOut } = useAuth();
  const { role, loading } = useUserRole();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're sure the user is authenticated but not a tenant
    // Avoid redirecting during loading states to prevent loops
    if (!loading && user && role !== null && role !== 'tenant') {
      navigate('/');
    }
  }, [user, role, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success(t('tenantPortal.signOutSuccess'));
    navigate('/auth', { replace: true });
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-bold text-primary-foreground truncate">
                {t('tenantPortal.title')}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <span className="text-primary-foreground/80 text-xs sm:text-sm hidden md:block truncate max-w-[150px]">
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('tenantPortal.signOut')}</span>
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
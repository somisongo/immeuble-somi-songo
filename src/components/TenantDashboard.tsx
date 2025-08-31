import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, CreditCard, FileText, User, Receipt } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TenantData {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

interface LeaseData {
  id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  deposit_amount?: number;
  status: string;
  properties: {
    unit_number: string;
    bedrooms: number;
    bathrooms: number;
  };
}

interface PaymentData {
  id: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: string;
  payment_method?: string;
}

export const TenantDashboard = () => {
  const { user } = useAuth();
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [leaseData, setLeaseData] = useState<LeaseData | null>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenantData();
  }, [user]);

  const fetchTenantData = async () => {
    if (!user) return;

    try {
      // Fetch tenant data
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (tenantError) throw tenantError;
      if (!tenant) {
        console.log('No tenant found for user:', user.id);
        setLoading(false);
        return;
      }

      setTenantData(tenant);

      // Fetch all leases for this tenant (active and expired)
      const { data: leases, error: leasesError } = await supabase
        .from('leases')
        .select(`
          *,
          properties (
            unit_number,
            bedrooms,
            bathrooms
          )
        `)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (leasesError) {
        console.error('Error fetching leases:', leasesError);
      } else {
        // Set the most recent lease as the primary lease for display
        const activeLease = leases?.find(l => l.status === 'active') || leases?.[0];
        setLeaseData(activeLease);

        // Fetch payments for ALL leases of this tenant
        if (leases && leases.length > 0) {
          const leaseIds = leases.map(l => l.id);
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .in('lease_id', leaseIds)
            .order('due_date', { ascending: false });

          if (paymentsError) {
            console.error('Error fetching payments:', paymentsError);
          } else {
            console.log('Payments found:', paymentsData);
            setPayments(paymentsData || []);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos données.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadContract = async () => {
    if (!tenantData || !leaseData) {
      toast({
        title: "Erreur",
        description: "Données du contrat non disponibles.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await supabase.functions.invoke('generate-contract', {
        body: {
          tenant: tenantData,
          lease: leaseData,
        },
      });

      if (response.error) throw response.error;

      // Create and download PDF
      const { data } = response;
      const blob = new Blob([data.pdfBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Contrat_Bail_${tenantData.first_name}_${tenantData.last_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Succès",
        description: "Contrat téléchargé avec succès.",
      });
    } catch (error) {
      console.error('Error downloading contract:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le contrat.",
        variant: "destructive",
      });
    }
  };

  const generatePaymentReport = async () => {
    if (!tenantData || !payments.length) {
      toast({
        title: "Erreur",
        description: "Aucun paiement à inclure dans le rapport.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculer les totaux
      const totalPaid = payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      
      const totalPending = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const totalOverdue = payments
        .filter(p => p.status === 'overdue')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      // Créer le contenu HTML du rapport
      const reportContent = `
        <html>
          <head>
            <title>Rapport de Paiements - ${tenantData.first_name} ${tenantData.last_name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px; }
              .payment { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
              .paid { border-left: 5px solid #22c55e; }
              .pending { border-left: 5px solid #f59e0b; }
              .overdue { border-left: 5px solid #ef4444; }
              .total { font-weight: bold; font-size: 1.1em; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Rapport de Paiements</h1>
              <h2>Immeuble SOMI SONGO</h2>
              <p><strong>Locataire:</strong> ${tenantData.first_name} ${tenantData.last_name}</p>
              <p><strong>Appartement:</strong> ${leaseData?.properties?.unit_number || 'N/A'}</p>
              <p><strong>Généré le:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            
            <div class="summary">
              <h3>Résumé des Paiements</h3>
              <p><strong>Total payé:</strong> $${totalPaid.toFixed(2)}</p>
              <p><strong>Total en attente:</strong> $${totalPending.toFixed(2)}</p>
              <p><strong>Total en retard:</strong> $${totalOverdue.toFixed(2)}</p>
              <p class="total"><strong>Total général:</strong> $${(totalPaid + totalPending + totalOverdue).toFixed(2)}</p>
            </div>

            <h3>Détail des Paiements</h3>
            ${payments.map(payment => `
              <div class="payment ${payment.status}">
                <p><strong>Montant:</strong> $${Number(payment.amount).toFixed(2)}</p>
                <p><strong>Date d'échéance:</strong> ${new Date(payment.due_date).toLocaleDateString('fr-FR')}</p>
                ${payment.paid_date ? `<p><strong>Date de paiement:</strong> ${new Date(payment.paid_date).toLocaleDateString('fr-FR')}</p>` : ''}
                <p><strong>Statut:</strong> ${getStatusText(payment.status)}</p>
                ${payment.payment_method ? `<p><strong>Méthode:</strong> ${payment.payment_method}</p>` : ''}
              </div>
            `).join('')}
          </body>
        </html>
      `;

      // Créer et télécharger le fichier HTML
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rapport_Paiements_${tenantData.first_name}_${tenantData.last_name}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Succès",
        description: "Rapport de paiements généré avec succès.",
      });
    } catch (error) {
      console.error('Error generating payment report:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      case 'overdue':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payé';
      case 'pending':
        return 'En attente';
      case 'overdue':
        return 'En retard';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tenantData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Aucun profil locataire trouvé</h2>
              <p className="text-muted-foreground">
                Votre compte n'est pas encore lié à un profil de locataire. 
                Veuillez contacter l'administrateur.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Espace Locataire</h1>
            <p className="text-muted-foreground">
              Bonjour {tenantData.first_name} {tenantData.last_name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Immeuble SOMI SONGO</p>
            <p className="font-medium">{leaseData?.properties?.unit_number || 'N/A'}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            onClick={downloadContract} 
            className="h-16 flex flex-col gap-2"
            disabled={!leaseData}
          >
            <Download className="h-5 w-5" />
            Télécharger le Contrat
          </Button>
          <Button variant="outline" className="h-16 flex flex-col gap-2">
            <CreditCard className="h-5 w-5" />
            Effectuer un Paiement
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex flex-col gap-2"
            onClick={generatePaymentReport}
            disabled={!payments.length}
          >
            <Receipt className="h-5 w-5" />
            Rapport de Paiements
          </Button>
          <Button variant="outline" className="h-16 flex flex-col gap-2">
            <FileText className="h-5 w-5" />
            Historique des Paiements
          </Button>
        </div>

        {/* Lease Information */}
        {leaseData && (
          <Card>
            <CardHeader>
              <CardTitle>Informations du Bail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Logement</h4>
                  <p>Appartement {leaseData.properties.unit_number}</p>
                  <p>{leaseData.properties.bedrooms} chambres, {leaseData.properties.bathrooms} SDB</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Période de Location</h4>
                  <p>Du {new Date(leaseData.start_date).toLocaleDateString('fr-FR')}</p>
                  <p>Au {new Date(leaseData.end_date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Montants</h4>
                  <p>Loyer: ${leaseData.rent_amount}</p>
                  {leaseData.deposit_amount && (
                    <p>Caution: ${leaseData.deposit_amount}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des Paiements</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun paiement enregistré
              </p>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">${payment.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        Échéance: {new Date(payment.due_date).toLocaleDateString('fr-FR')}
                      </p>
                      {payment.paid_date && (
                        <p className="text-sm text-muted-foreground">
                          Payé le: {new Date(payment.paid_date).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </p>
                      {payment.payment_method && (
                        <p className="text-sm text-muted-foreground">
                          {payment.payment_method}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
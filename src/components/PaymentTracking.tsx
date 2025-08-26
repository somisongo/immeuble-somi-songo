import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Payment {
  id: string;
  unit: string;
  tenant: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "paid" | "pending" | "overdue";
}

export const PaymentTracking = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          leases:lease_id (
            tenants:tenant_id (
              first_name,
              last_name
            ),
            properties:property_id (
              unit_number
            )
          )
        `)
        .eq('owner_id', user.id)
        .order('due_date', { ascending: false });

      if (error) throw error;

      const formattedPayments: Payment[] = (data || []).map((payment: any) => ({
        id: payment.id,
        unit: payment.leases?.properties?.unit_number || 'N/A',
        tenant: payment.leases?.tenants 
          ? `${payment.leases.tenants.first_name} ${payment.leases.tenants.last_name}`
          : 'N/A',
        amount: Number(payment.amount),
        dueDate: new Date(payment.due_date).toLocaleDateString('fr-FR'),
        paidDate: payment.paid_date ? new Date(payment.paid_date).toLocaleDateString('fr-FR') : undefined,
        status: payment.status as "paid" | "pending" | "overdue"
      }));

      setPayments(formattedPayments);
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast.success('Paiement marqué comme payé');
      fetchPayments();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "overdue":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Payé";
      case "pending":
        return "En attente";
      case "overdue":
        return "En retard";
      default:
        return status;
    }
  };

  const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Suivi des Paiements</h2>
        <Button className="bg-gradient-primary hover:bg-primary-dark">
          Générer Rapport
        </Button>
      </div>
      
      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-success-light border-success">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-success">Payé ce Mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalPaid.toLocaleString()}€</div>
          </CardContent>
        </Card>
        
        <Card className="bg-warning-light border-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-warning">En Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{totalPending.toLocaleString()}€</div>
          </CardContent>
        </Card>
        
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-destructive">En Retard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalOverdue.toLocaleString()}€</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Payment List */}
      <div className="grid gap-4">
        {payments.length === 0 ? (
          <Card className="p-8 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun paiement</h3>
            <p className="text-muted-foreground">
              Les paiements apparaîtront ici une fois que vous aurez créé des baux
            </p>
          </Card>
        ) : (
          payments.map((payment) => (
            <Card key={payment.id} className="bg-gradient-card shadow-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      <div>
                        <h3 className="font-semibold">{payment.tenant}</h3>
                        <p className="text-sm text-muted-foreground">Appartement {payment.unit}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-lg">{payment.amount.toLocaleString()}€</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div>Échéance: {payment.dueDate}</div>
                        {payment.paidDate && <div className="text-success">Payé: {payment.paidDate}</div>}
                      </div>
                    </div>
                    
                    <Badge className={getStatusColor(payment.status)}>
                      {getStatusText(payment.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    {payment.status === "pending" && (
                      <Button 
                        size="sm" 
                        className="bg-gradient-success"
                        onClick={() => markAsPaid(payment.id)}
                      >
                        Marquer comme Payé
                      </Button>
                    )}
                    {payment.status === "overdue" && (
                      <Button size="sm" variant="destructive">
                        Envoyer Rappel
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Voir Détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
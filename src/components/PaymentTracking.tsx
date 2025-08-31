import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Calendar, AlertCircle, CheckCircle, Clock, Plus, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Payment {
  id: string;
  lease_id: string;
  unit: string;
  tenant: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: "paid" | "pending" | "overdue";
  payment_method?: string;
  notes?: string;
}

interface Lease {
  id: string;
  properties: {
    unit_number: string;
  };
  tenants: {
    first_name: string;
    last_name: string;
  };
}

export const PaymentTracking = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    lease_id: "",
    amount: "",
    due_date: "",
    payment_method: "",
    notes: ""
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchPayments();
      fetchLeases();
    }
  }, [user]);

  const fetchPayments = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          lease_id,
          amount,
          due_date,
          paid_date,
          status,
          payment_method,
          notes,
          leases:lease_id (
            id,
            properties:property_id (
              unit_number
            ),
            tenants:tenant_id (
              first_name,
              last_name
            )
          )
        `)
        .eq('owner_id', user.id)
        .order('due_date', { ascending: false });

      if (error) throw error;

      const formattedPayments: Payment[] = (data || []).map((payment: any) => ({
        id: payment.id,
        lease_id: payment.lease_id,
        unit: payment.leases?.properties?.unit_number || 'N/A',
        tenant: payment.leases?.tenants 
          ? `${payment.leases.tenants.first_name} ${payment.leases.tenants.last_name}` 
          : 'N/A',
        amount: payment.amount,
        due_date: payment.due_date,
        paid_date: payment.paid_date,
        status: payment.status,
        payment_method: payment.payment_method,
        notes: payment.notes
      }));

      setPayments(formattedPayments);
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeases = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          properties:property_id (
            unit_number
          ),
          tenants:tenant_id (
            first_name,
            last_name
          )
        `)
        .eq('owner_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      setLeases(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des baux:', error);
    }
  };

  const createPayment = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          lease_id: formData.lease_id,
          amount: parseFloat(formData.amount),
          due_date: formData.due_date,
          payment_method: formData.payment_method || null,
          notes: formData.notes || null,
          status: 'pending',
          owner_id: user.id
        });

      if (error) throw error;

      toast.success('Paiement créé avec succès');
      setCreateDialogOpen(false);
      setFormData({
        lease_id: "",
        amount: "",
        due_date: "",
        payment_method: "",
        notes: ""
      });
      fetchPayments();
    } catch (error) {
      console.error('Erreur lors de la création du paiement:', error);
      toast.error('Erreur lors de la création du paiement');
    }
  };

  const markAsPaid = async (paymentId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', paymentId)
        .eq('owner_id', user.id);

      if (error) throw error;

      toast.success('Paiement marqué comme payé');
      fetchPayments();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error);
      toast.error('Erreur lors de la mise à jour du paiement');
    }
  };

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    if (!user?.id) return;

    try {
      const updateData: any = { status };
      if (status === 'paid') {
        updateData.paid_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId)
        .eq('owner_id', user.id);

      if (error) throw error;

      toast.success('Statut du paiement mis à jour');
      fetchPayments();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Suivi des Paiements</h2>
        <div className="flex gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:bg-primary-dark">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Paiement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Créer un Nouveau Paiement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="lease">Bail</Label>
                  <Select 
                    value={formData.lease_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, lease_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un bail" />
                    </SelectTrigger>
                    <SelectContent>
                      {leases.map((lease) => (
                        <SelectItem key={lease.id} value={lease.id}>
                          Appt {lease.properties?.unit_number} - {lease.tenants 
                            ? `${lease.tenants.first_name} ${lease.tenants.last_name}` 
                            : 'N/A'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Montant ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_date">Date d'échéance</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="payment_method">Méthode de paiement</Label>
                  <Select 
                    value={formData.payment_method} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une méthode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Espèces</SelectItem>
                      <SelectItem value="check">Chèque</SelectItem>
                      <SelectItem value="transfer">Virement</SelectItem>
                      <SelectItem value="card">Carte bancaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes optionnelles"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={createPayment}
                    disabled={!formData.lease_id || !formData.amount || !formData.due_date}
                    className="bg-gradient-success"
                  >
                    Créer le Paiement
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            Générer Rapport
          </Button>
        </div>
      </div>
      
      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-success-light border-success">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-success">Payé ce Mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-warning-light border-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-warning">En Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">${totalPending.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-destructive">En Retard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totalOverdue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Payment List */}
      <div className="grid gap-4">
        {payments.length === 0 ? (
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucun paiement trouvé</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Créez votre premier paiement en cliquant sur "Nouveau Paiement"
                </p>
              </div>
            </CardContent>
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
                        {payment.payment_method && (
                          <p className="text-xs text-muted-foreground">Méthode: {payment.payment_method}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-lg">${payment.amount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div>Échéance: {payment.due_date}</div>
                        {payment.paid_date && <div className="text-success">Payé: {payment.paid_date}</div>}
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
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => toast.info('Fonctionnalité de rappel à implémenter')}
                      >
                        Envoyer Rappel
                      </Button>
                    )}
                    <Select onValueChange={(value) => updatePaymentStatus(payment.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Actions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="paid">Payé</SelectItem>
                        <SelectItem value="overdue">En retard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {payment.notes && (
                  <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                    <strong>Notes:</strong> {payment.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";

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
  const payments: Payment[] = [
    {
      id: "1",
      unit: "A1",
      tenant: "John Smith",
      amount: 2200,
      dueDate: "2024-01-01",
      paidDate: "2023-12-28",
      status: "paid"
    },
    {
      id: "2",
      unit: "A2",
      tenant: "Sarah Johnson",
      amount: 2100,
      dueDate: "2024-01-01",
      status: "pending"
    },
    {
      id: "3",
      unit: "A3",
      tenant: "Mike Wilson",
      amount: 2300,
      dueDate: "2023-12-15",
      status: "overdue"
    },
    {
      id: "4",
      unit: "A4",
      tenant: "Emma Davis",
      amount: 2000,
      dueDate: "2024-01-01",
      paidDate: "2023-12-30",
      status: "paid"
    },
    {
      id: "5",
      unit: "A5",
      tenant: "Vacant",
      amount: 0,
      dueDate: "-",
      status: "pending"
    }
  ];

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

  const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending" && p.amount > 0).reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Tracking</h2>
        <Button className="bg-gradient-primary hover:bg-primary-dark">
          Generate Report
        </Button>
      </div>
      
      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-success-light border-success">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-success">Paid This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">${totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-warning-light border-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-warning">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">${totalPending.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-destructive">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totalOverdue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Payment List */}
      <div className="grid gap-4">
        {payments.filter(p => p.tenant !== "Vacant").map((payment) => (
          <Card key={payment.id} className="bg-gradient-card shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(payment.status)}
                    <div>
                      <h3 className="font-semibold">{payment.tenant}</h3>
                      <p className="text-sm text-muted-foreground">Unit {payment.unit}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-lg">${payment.amount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <div>Due: {payment.dueDate}</div>
                      {payment.paidDate && <div className="text-success">Paid: {payment.paidDate}</div>}
                    </div>
                  </div>
                  
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  {payment.status === "pending" && (
                    <Button size="sm" className="bg-gradient-success">
                      Mark as Paid
                    </Button>
                  )}
                  {payment.status === "overdue" && (
                    <Button size="sm" variant="destructive">
                      Send Reminder
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
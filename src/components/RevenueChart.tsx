import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface MonthlyRevenue {
  month: string;
  revenus: number;
  paiements: number;
}

export const RevenueChart = () => {
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: async () => {
      // Générer les 12 derniers mois
      const months: MonthlyRevenue[] = [];
      const today = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        // Récupérer les paiements du mois
        const { data: payments, error } = await supabase
          .from('payments')
          .select('amount, status, paid_date')
          .gte('due_date', monthStart.toISOString())
          .lte('due_date', monthEnd.toISOString());
        
        if (error) throw error;
        
        // Calculer les revenus attendus et les paiements reçus
        const totalExpected = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
        const totalPaid = payments?.filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + Number(p.amount), 0) || 0;
        
        months.push({
          month: format(monthDate, 'MMM yyyy', { locale: fr }),
          revenus: totalExpected,
          paiements: totalPaid
        });
      }
      
      return months;
    }
  });

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Évolution des Revenus</CardTitle>
          <CardDescription>Revenus mensuels sur les 12 derniers mois</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const hasData = revenueData && revenueData.some(d => d.revenus > 0 || d.paiements > 0);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Évolution des Revenus</CardTitle>
        <CardDescription>
          Comparaison entre les revenus attendus et les paiements reçus sur les 12 derniers mois
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>Aucune donnée de revenus disponible pour les 12 derniers mois</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))'
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenus" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Revenus attendus"
                dot={{ fill: 'hsl(var(--primary))' }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="paiements" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                name="Paiements reçus"
                dot={{ fill: 'hsl(var(--chart-2))' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
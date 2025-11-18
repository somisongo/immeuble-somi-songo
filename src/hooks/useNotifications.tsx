import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface NotificationCounts {
  overdue_payments: number;
  expiring_leases: number;
  new_tenants: number;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<NotificationCounts>({
    overdue_payments: 0,
    expiring_leases: 0,
    new_tenants: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        // Paiements en retard
        const { count: overduePayments } = await supabase
          .from("payments")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", user.id)
          .eq("status", "pending")
          .lt("due_date", new Date().toISOString());

        // Baux expirant dans les 30 prochains jours
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const { count: expiringLeases } = await supabase
          .from("leases")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", user.id)
          .eq("status", "active")
          .lt("end_date", thirtyDaysFromNow.toISOString())
          .gt("end_date", new Date().toISOString());

        // Nouveaux locataires (derniers 7 jours)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count: newTenants } = await supabase
          .from("tenants")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", user.id)
          .gte("created_at", sevenDaysAgo.toISOString());

        setCounts({
          overdue_payments: overduePayments || 0,
          expiring_leases: expiringLeases || 0,
          new_tenants: newTenants || 0,
        });
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Rafraîchir toutes les 60 secondes
    const interval = setInterval(fetchNotifications, 60000);

    return () => clearInterval(interval);
  }, [user]);

  return { counts, loading };
};

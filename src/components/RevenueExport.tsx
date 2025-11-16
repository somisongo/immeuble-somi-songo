import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

export const RevenueExport = () => {
  const { data: exportData } = useQuery({
    queryKey: ['export-revenue-data'],
    queryFn: async () => {
      const today = new Date();
      const months: any[] = [];
      
      // Récupérer les données des 12 derniers mois
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const { data: payments } = await supabase
          .from('payments')
          .select(`
            *,
            leases!inner(
              rent_amount,
              tenants!inner(first_name, last_name),
              properties!inner(unit_number)
            )
          `)
          .gte('due_date', monthStart.toISOString())
          .lte('due_date', monthEnd.toISOString())
          .order('due_date', { ascending: true });
        
        if (payments) {
          payments.forEach(payment => {
            months.push({
              mois: format(monthDate, 'MMMM yyyy', { locale: fr }),
              date_echeance: format(new Date(payment.due_date), 'dd/MM/yyyy'),
              date_paiement: payment.paid_date ? format(new Date(payment.paid_date), 'dd/MM/yyyy') : 'Non payé',
              appartement: payment.leases?.properties?.unit_number || 'N/A',
              locataire: payment.leases?.tenants 
                ? `${payment.leases.tenants.first_name} ${payment.leases.tenants.last_name}`
                : 'N/A',
              montant_attendu: Number(payment.amount),
              montant_paye: payment.status === 'paid' ? Number(payment.amount) : 0,
              statut: payment.status === 'paid' ? 'Payé' : payment.status === 'pending' ? 'En attente' : 'En retard',
              methode_paiement: payment.payment_method || 'N/A',
              notes: payment.notes || ''
            });
          });
        }
      }
      
      return months;
    }
  });

  const exportToCSV = () => {
    if (!exportData || exportData.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    // Créer le header CSV
    const headers = [
      'Mois',
      'Date échéance',
      'Date paiement',
      'Appartement',
      'Locataire',
      'Montant attendu',
      'Montant payé',
      'Statut',
      'Méthode de paiement',
      'Notes'
    ];

    // Créer les lignes CSV
    const csvRows = [
      headers.join(','),
      ...exportData.map(row => [
        row.mois,
        row.date_echeance,
        row.date_paiement,
        row.appartement,
        row.locataire,
        row.montant_attendu,
        row.montant_paye,
        row.statut,
        row.methode_paiement,
        `"${row.notes.replace(/"/g, '""')}"`
      ].join(','))
    ];

    // Créer le blob et télécharger
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `revenus_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Export CSV réussi !");
  };

  const exportToExcel = () => {
    if (!exportData || exportData.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    // Préparer les données pour Excel
    const excelData = exportData.map(row => ({
      'Mois': row.mois,
      'Date échéance': row.date_echeance,
      'Date paiement': row.date_paiement,
      'Appartement': row.appartement,
      'Locataire': row.locataire,
      'Montant attendu ($)': row.montant_attendu,
      'Montant payé ($)': row.montant_paye,
      'Statut': row.statut,
      'Méthode de paiement': row.methode_paiement,
      'Notes': row.notes
    }));

    // Créer une feuille de calcul avec des totaux
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Ajouter une ligne de totaux
    const totalAttendus = exportData.reduce((sum, row) => sum + row.montant_attendu, 0);
    const totalPayes = exportData.reduce((sum, row) => sum + row.montant_paye, 0);
    
    XLSX.utils.sheet_add_aoa(ws, [
      [],
      ['TOTAUX', '', '', '', '', totalAttendus, totalPayes, '', '', '']
    ], { origin: -1 });

    // Créer le classeur
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Revenus');

    // Ajouter une feuille de résumé
    const summaryData = [];
    const months = [...new Set(exportData.map(row => row.mois))];
    
    months.forEach(month => {
      const monthData = exportData.filter(row => row.mois === month);
      const attendu = monthData.reduce((sum, row) => sum + row.montant_attendu, 0);
      const paye = monthData.reduce((sum, row) => sum + row.montant_paye, 0);
      const taux = attendu > 0 ? ((paye / attendu) * 100).toFixed(2) : '0';
      
      summaryData.push({
        'Mois': month,
        'Revenus attendus ($)': attendu,
        'Revenus perçus ($)': paye,
        'Taux de recouvrement (%)': taux,
        'Différence ($)': paye - attendu
      });
    });

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé mensuel');

    // Télécharger le fichier
    XLSX.writeFile(wb, `revenus_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    toast.success("Export Excel réussi !");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exporter les données
        </CardTitle>
        <CardDescription>
          Téléchargez les données de revenus des 12 derniers mois pour analyse externe
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Button 
          onClick={exportToCSV}
          variant="outline"
          className="flex-1 min-w-[200px]"
          disabled={!exportData || exportData.length === 0}
        >
          <FileText className="h-4 w-4 mr-2" />
          Exporter en CSV
        </Button>
        
        <Button 
          onClick={exportToExcel}
          variant="outline"
          className="flex-1 min-w-[200px]"
          disabled={!exportData || exportData.length === 0}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exporter en Excel
        </Button>
      </CardContent>
    </Card>
  );
};
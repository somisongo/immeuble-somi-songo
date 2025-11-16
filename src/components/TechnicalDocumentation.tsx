import { Button } from "@/components/ui/button";
import { FileDown, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

export const TechnicalDocumentation = () => {
  const { t, language } = useLanguage();

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Fonction pour ajouter une nouvelle page si nécessaire
      const checkPageBreak = (height: number) => {
        if (yPosition + height > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // En-tête du document
      doc.setFontSize(22);
      doc.setTextColor(30, 64, 175); // Bleu
      doc.text(language === 'fr' ? "Documentation Technique" : "Technical Documentation", pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setFontSize(16);
      doc.setTextColor(100, 100, 100);
      doc.text("Gestionnaire Immobilier - Immeuble SOMI SONGO", pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Date
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`${language === 'fr' ? 'Généré le' : 'Generated on'}: ${new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Ligne de séparation
      doc.setDrawColor(30, 64, 175);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Table des matières
      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      doc.text(language === 'fr' ? "Table des matières" : "Table of Contents", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const tocItems = language === 'fr' ? [
        "1. Vue d'ensemble du système",
        "2. Architecture technique",
        "3. Base de données",
        "4. Modules fonctionnels",
        "5. Sécurité et authentification",
        "6. APIs et intégrations",
        "7. Guide de déploiement"
      ] : [
        "1. System Overview",
        "2. Technical Architecture",
        "3. Database",
        "4. Functional Modules",
        "5. Security and Authentication",
        "6. APIs and Integrations",
        "7. Deployment Guide"
      ];

      tocItems.forEach(item => {
        doc.text(item, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 10;

      checkPageBreak(20);

      // Section 1: Vue d'ensemble
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text(language === 'fr' ? "1. Vue d'ensemble du système" : "1. System Overview", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const overviewText = language === 'fr' 
        ? "Le Gestionnaire Immobilier SOMI SONGO est une application web complète pour la gestion d'un immeuble de 5 appartements. Elle permet la gestion des propriétés, locataires, baux, paiements et génération de contrats."
        : "The SOMI SONGO Property Manager is a comprehensive web application for managing a 5-apartment building. It enables property, tenant, lease, payment management and contract generation.";
      
      const splitOverview = doc.splitTextToSize(overviewText, pageWidth - 2 * margin);
      doc.text(splitOverview, margin, yPosition);
      yPosition += splitOverview.length * 5 + 10;

      checkPageBreak(20);

      // Section 2: Architecture
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text(language === 'fr' ? "2. Architecture technique" : "2. Technical Architecture", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const techStack = language === 'fr' ? [
        "Frontend: React 18.3.1 avec TypeScript",
        "UI Framework: Tailwind CSS avec shadcn/ui",
        "Routage: React Router DOM v6",
        "Gestion d'état: TanStack Query (React Query)",
        "Backend: Supabase (PostgreSQL + Edge Functions)",
        "Authentification: Supabase Auth",
        "Génération PDF: jsPDF et html2canvas",
        "Build Tool: Vite"
      ] : [
        "Frontend: React 18.3.1 with TypeScript",
        "UI Framework: Tailwind CSS with shadcn/ui",
        "Routing: React Router DOM v6",
        "State Management: TanStack Query (React Query)",
        "Backend: Supabase (PostgreSQL + Edge Functions)",
        "Authentication: Supabase Auth",
        "PDF Generation: jsPDF and html2canvas",
        "Build Tool: Vite"
      ];

      techStack.forEach(item => {
        checkPageBreak(10);
        doc.text(`• ${item}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 8;

      checkPageBreak(20);

      // Section 3: Base de données
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text(language === 'fr' ? "3. Base de données" : "3. Database", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const dbTables = language === 'fr' ? [
        "profiles: Profils utilisateurs",
        "user_roles: Rôles (propriétaire/locataire)",
        "properties: Propriétés/Appartements",
        "tenants: Locataires",
        "leases: Baux locatifs",
        "payments: Paiements",
        "landlord_info: Informations propriétaire",
        "contract_clauses: Clauses de contrats"
      ] : [
        "profiles: User profiles",
        "user_roles: Roles (owner/tenant)",
        "properties: Properties/Apartments",
        "tenants: Tenants",
        "leases: Rental leases",
        "payments: Payments",
        "landlord_info: Landlord information",
        "contract_clauses: Contract clauses"
      ];

      dbTables.forEach(item => {
        checkPageBreak(10);
        doc.text(`• ${item}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 8;

      checkPageBreak(20);

      // Section 4: Modules fonctionnels
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text(language === 'fr' ? "4. Modules fonctionnels" : "4. Functional Modules", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const modules = language === 'fr' ? [
        "Tableau de bord: Métriques et graphiques de performance",
        "Gestion des propriétés: CRUD des appartements",
        "Gestion des locataires: CRUD des locataires",
        "Assignations: Attribution locataires/propriétés",
        "Gestion des baux: Création et suivi des baux",
        "Suivi des paiements: Enregistrement des paiements",
        "Génération de contrats: Export PDF/DOCX",
        "Portail locataire: Interface dédiée aux locataires",
        "Multilingue: Support français et anglais"
      ] : [
        "Dashboard: Performance metrics and charts",
        "Property Management: Apartment CRUD",
        "Tenant Management: Tenant CRUD",
        "Assignments: Tenant/property attribution",
        "Lease Management: Lease creation and tracking",
        "Payment Tracking: Payment recording",
        "Contract Generation: PDF/DOCX export",
        "Tenant Portal: Dedicated tenant interface",
        "Multilingual: French and English support"
      ];

      modules.forEach(item => {
        checkPageBreak(10);
        doc.text(`• ${item}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 8;

      checkPageBreak(20);

      // Section 5: Sécurité
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text(language === 'fr' ? "5. Sécurité et authentification" : "5. Security and Authentication", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const security = language === 'fr' ? [
        "Authentification par email/mot de passe (Supabase Auth)",
        "Row Level Security (RLS) sur toutes les tables",
        "Gestion des rôles: propriétaire et locataire",
        "Routes protégées avec ProtectedRoute",
        "Isolation des données par owner_id",
        "Sessions sécurisées avec tokens JWT",
        "Politiques RLS pour chaque opération CRUD"
      ] : [
        "Email/password authentication (Supabase Auth)",
        "Row Level Security (RLS) on all tables",
        "Role management: owner and tenant",
        "Protected routes with ProtectedRoute",
        "Data isolation by owner_id",
        "Secure sessions with JWT tokens",
        "RLS policies for each CRUD operation"
      ];

      security.forEach(item => {
        checkPageBreak(10);
        doc.text(`• ${item}`, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 8;

      checkPageBreak(20);

      // Section 6: APIs
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text(language === 'fr' ? "6. APIs et intégrations" : "6. APIs and Integrations", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const apis = language === 'fr' ? [
        "Edge Functions:",
        "  - generate-contract: Génération HTML de contrats",
        "  - generate-contract-docx: Export DOCX des contrats",
        "",
        "Supabase REST API:",
        "  - Opérations CRUD sur toutes les tables",
        "  - Queries avec filtres et relations",
        "  - Real-time subscriptions disponibles"
      ] : [
        "Edge Functions:",
        "  - generate-contract: Contract HTML generation",
        "  - generate-contract-docx: Contract DOCX export",
        "",
        "Supabase REST API:",
        "  - CRUD operations on all tables",
        "  - Queries with filters and relations",
        "  - Real-time subscriptions available"
      ];

      apis.forEach(item => {
        checkPageBreak(10);
        doc.text(item, margin + 5, yPosition);
        yPosition += 6;
      });
      yPosition += 8;

      checkPageBreak(20);

      // Section 7: Déploiement
      doc.setFontSize(14);
      doc.setTextColor(30, 64, 175);
      doc.text(language === 'fr' ? "7. Guide de déploiement" : "7. Deployment Guide", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const deployment = language === 'fr' ? [
        "1. Prérequis:",
        "   - Compte Supabase actif",
        "   - Node.js 18+ et npm installés",
        "",
        "2. Configuration:",
        "   - Créer un projet Supabase",
        "   - Copier les variables d'environnement",
        "   - Configurer .env avec SUPABASE_URL et SUPABASE_ANON_KEY",
        "",
        "3. Installation:",
        "   - npm install",
        "   - npm run dev (développement)",
        "   - npm run build (production)",
        "",
        "4. Déploiement:",
        "   - Frontend: Lovable, Vercel, ou Netlify",
        "   - Backend: Supabase géré automatiquement",
        "   - Edge Functions: Déploiement automatique via Supabase CLI"
      ] : [
        "1. Prerequisites:",
        "   - Active Supabase account",
        "   - Node.js 18+ and npm installed",
        "",
        "2. Configuration:",
        "   - Create a Supabase project",
        "   - Copy environment variables",
        "   - Configure .env with SUPABASE_URL and SUPABASE_ANON_KEY",
        "",
        "3. Installation:",
        "   - npm install",
        "   - npm run dev (development)",
        "   - npm run build (production)",
        "",
        "4. Deployment:",
        "   - Frontend: Lovable, Vercel, or Netlify",
        "   - Backend: Automatically managed by Supabase",
        "   - Edge Functions: Automatic deployment via Supabase CLI"
      ];

      deployment.forEach(item => {
        checkPageBreak(10);
        doc.text(item, margin + 5, yPosition);
        yPosition += 6;
      });

      // Pied de page
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `${language === 'fr' ? 'Document confidentiel - Immeuble SOMI SONGO' : 'Confidential Document - Immeuble SOMI SONGO'}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Sauvegarder le PDF
      doc.save(`Documentation-Technique-SOMI-SONGO-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success(language === 'fr' ? 'Documentation téléchargée avec succès' : 'Documentation downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(language === 'fr' ? 'Erreur lors de la génération du PDF' : 'Error generating PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg shadow-md p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t('technicalDoc.title')}
            </h2>
            <p className="text-muted-foreground mb-4">
              {t('technicalDoc.description')}
            </p>
            <Button onClick={generatePDF} className="gap-2">
              <FileDown className="h-4 w-4" />
              {t('technicalDoc.download')}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t('technicalDoc.contents')}
        </h3>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{t('technicalDoc.content1')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{t('technicalDoc.content2')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{t('technicalDoc.content3')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{t('technicalDoc.content4')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{t('technicalDoc.content5')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{t('technicalDoc.content6')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{t('technicalDoc.content7')}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

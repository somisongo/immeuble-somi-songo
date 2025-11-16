import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Users, FileText, CreditCard, FileSignature, UserCog, Home, Info, Printer } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

const UserGuide = () => {
  const { t } = useLanguage();

  const handlePrint = () => {
    // Expand all accordion items before printing
    const accordionTriggers = document.querySelectorAll('[data-state="closed"]');
    accordionTriggers.forEach(trigger => {
      if (trigger instanceof HTMLElement) {
        trigger.click();
      }
    });

    // Wait for accordions to expand then print
    setTimeout(() => {
      window.print();
      toast.success(t('userGuide.printReady'));
    }, 300);
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          
          .printable-content, .printable-content * {
            visibility: visible;
          }
          
          .printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          .no-print {
            display: none !important;
          }

          .print-section {
            page-break-inside: avoid;
            margin-bottom: 2rem;
          }

          h1 {
            font-size: 28pt;
            margin-bottom: 1rem;
          }

          h2, h3 {
            font-size: 18pt;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
          }

          h4 {
            font-size: 14pt;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
          }

          p, li {
            font-size: 11pt;
            line-height: 1.6;
          }

          .accordion-item {
            border: 1px solid #ddd;
            padding: 1rem;
            margin-bottom: 1rem;
            page-break-inside: avoid;
          }

          [data-radix-accordion-trigger] {
            font-weight: bold;
            font-size: 14pt;
            margin-bottom: 0.5rem;
          }

          [data-radix-accordion-content] {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
          }

          .badge {
            border: 1px solid #333;
            padding: 0.25rem 0.5rem;
            display: inline-block;
          }

          .card {
            border: 1px solid #ddd;
            padding: 1rem;
            margin: 0.5rem 0;
          }

          @page {
            margin: 2cm;
            size: A4;
          }
        }
      `}} />

      <div className="printable-content">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('userGuide.title')}</h1>
          <p className="text-muted-foreground text-lg">
            {t('userGuide.subtitle')}
          </p>
          <Badge variant="secondary" className="mt-2">{t('userGuide.version')}</Badge>
          
          <div className="mt-4 no-print">
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              {t('userGuide.printVersion')}
            </Button>
          </div>
        </div>

        <Alert className="mb-6 no-print">
          <Info className="h-4 w-4" />
          <AlertTitle>{t('userGuide.welcomeTitle')}</AlertTitle>
          <AlertDescription>
            {t('userGuide.welcomeDescription')}
          </AlertDescription>
        </Alert>

        <Accordion type="single" collapsible className="space-y-4">
          {/* Introduction */}
          <AccordionItem value="intro" className="border rounded-lg px-4 accordion-item print-section">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <span className="font-semibold">Introduction à la plateforme</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-4">
            <Card>
              <CardHeader>
                <CardTitle>Qu'est-ce que cette plateforme ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Cette application est une solution complète de gestion immobilière qui vous permet de :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Gérer vos propriétés et leurs informations</li>
                  <li>Suivre vos locataires et leurs coordonnées</li>
                  <li>Créer et gérer des baux de location</li>
                  <li>Suivre les paiements et les échéances</li>
                  <li>Générer des contrats personnalisés</li>
                  <li>Gérer les rôles et permissions des utilisateurs</li>
                </ul>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-semibold mb-2">Deux types d'utilisateurs :</p>
                  <ul className="space-y-2">
                    <li>
                      <Badge variant="default">Propriétaire</Badge> - Accès complet à toutes les fonctionnalités
                    </li>
                    <li>
                      <Badge variant="secondary">Locataire</Badge> - Accès limité aux informations personnelles
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Tableau de bord */}
        <AccordionItem value="dashboard" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-semibold">Tableau de bord</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-4">
            <Card>
              <CardHeader>
                <CardTitle>Vue d'ensemble</CardTitle>
                <CardDescription>Visualisez rapidement l'état de votre portefeuille</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Le tableau de bord vous affiche :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Métriques principales</strong> - Nombre total de propriétés, locataires actifs, baux et revenus</li>
                  <li><strong>Cartes de propriétés</strong> - Aperçu visuel de toutes vos propriétés</li>
                  <li><strong>Statuts en temps réel</strong> - Occupé, Disponible, En maintenance</li>
                </ul>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Gestion des propriétés */}
        <AccordionItem value="properties" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-semibold">Gestion des propriétés</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-4">
            <Card>
              <CardHeader>
                <CardTitle>Comment gérer vos propriétés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Ajouter une propriété :</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Cliquez sur l'onglet "Propriétés"</li>
                    <li>Cliquez sur "Ajouter une propriété"</li>
                    <li>Remplissez les informations : Numéro d'unité, Chambres, Salles de bain, Loyer mensuel</li>
                    <li>Cliquez sur "Ajouter"</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Modifier une propriété :</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Trouvez la propriété dans la liste</li>
                    <li>Cliquez sur le bouton "Modifier"</li>
                    <li>Modifiez les informations souhaitées</li>
                    <li>Cliquez sur "Mettre à jour"</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Supprimer une propriété :</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Cliquez sur le bouton "Supprimer"</li>
                    <li>Confirmez la suppression</li>
                  </ol>
                  <Alert className="mt-2">
                    <AlertDescription>
                      ⚠️ Attention : La suppression est définitive et supprimera également tous les baux associés.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Gestion des locataires */}
        <AccordionItem value="tenants" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">Gestion des locataires</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-4">
            <Card>
              <CardHeader>
                <CardTitle>Comment gérer vos locataires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Ajouter un locataire :</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Cliquez sur l'onglet "Locataires"</li>
                    <li>Cliquez sur "Ajouter un locataire"</li>
                    <li>Remplissez : Prénom, Nom, Email, Téléphone</li>
                    <li>Cliquez sur "Ajouter"</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Modifier un locataire :</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Trouvez le locataire dans la liste</li>
                    <li>Cliquez sur le bouton "Modifier"</li>
                    <li>Modifiez les informations</li>
                    <li>Cliquez sur "Mettre à jour"</li>
                  </ol>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold mb-2">💡 Conseil :</p>
                  <p>Assurez-vous que l'email du locataire est correct, il servira pour les notifications et l'accès au portail locataire.</p>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Gestion des baux */}
        <AccordionItem value="leases" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold">Gestion des baux</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-4">
            <Card>
              <CardHeader>
                <CardTitle>Comment gérer les baux de location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Créer un bail :</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Cliquez sur l'onglet "Baux"</li>
                    <li>Cliquez sur "Créer un bail"</li>
                    <li>Sélectionnez la propriété</li>
                    <li>Sélectionnez le locataire</li>
                    <li>Définissez les dates de début et fin</li>
                    <li>Indiquez le montant du loyer et de la caution</li>
                    <li>Cliquez sur "Créer"</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Statuts des baux :</h4>
                  <ul className="space-y-2 ml-4">
                    <li><Badge>Actif</Badge> - Bail en cours</li>
                    <li><Badge variant="secondary">Expiré</Badge> - Bail terminé</li>
                    <li><Badge variant="outline">En attente</Badge> - Bail pas encore commencé</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Résilier un bail :</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Trouvez le bail dans la liste</li>
                    <li>Cliquez sur "Supprimer"</li>
                    <li>Confirmez la résiliation</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Gestion des paiements */}
        <AccordionItem value="payments" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="font-semibold">Gestion des paiements</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-4">
            <Card>
              <CardHeader>
                <CardTitle>Comment suivre les paiements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Enregistrer un paiement :</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Cliquez sur l'onglet "Paiements"</li>
                    <li>Cliquez sur "Ajouter un paiement"</li>
                    <li>Sélectionnez le bail concerné</li>
                    <li>Indiquez le montant et la date d'échéance</li>
                    <li>Sélectionnez le statut (En attente, Payé, En retard)</li>
                    <li>Ajoutez des notes si nécessaire</li>
                    <li>Cliquez sur "Ajouter"</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Marquer un paiement comme payé :</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Trouvez le paiement dans la liste</li>
                    <li>Cliquez sur "Modifier"</li>
                    <li>Changez le statut en "Payé"</li>
                    <li>Indiquez la date de paiement et la méthode</li>
                    <li>Cliquez sur "Mettre à jour"</li>
                  </ol>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold mb-2">Statuts des paiements :</p>
                  <ul className="space-y-2">
                    <li><Badge variant="secondary">En attente</Badge> - Paiement attendu</li>
                    <li><Badge className="bg-green-500">Payé</Badge> - Paiement reçu</li>
                    <li><Badge variant="destructive">En retard</Badge> - Paiement non reçu après échéance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Gestion des contrats */}
        <AccordionItem value="contracts" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-primary" />
              <span className="font-semibold">Gestion des contrats</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-4">
            <Card>
              <CardHeader>
                <CardTitle>Comment créer et personnaliser des contrats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Configurer vos informations :</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Cliquez sur l'onglet "Contrats"</li>
                    <li>Remplissez vos informations de bailleur (nom, adresse, coordonnées bancaires)</li>
                    <li>Cliquez sur "Enregistrer"</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Personnaliser les clauses :</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Accédez à la section "Clauses du contrat"</li>
                    <li>Cliquez sur "Ajouter une clause"</li>
                    <li>Indiquez si c'est un article ou une annexe</li>
                    <li>Ajoutez le titre et le contenu</li>
                    <li>Réorganisez les clauses par glisser-déposer</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Générer un contrat :</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Sélectionnez un bail existant</li>
                    <li>Cliquez sur "Générer le contrat"</li>
                    <li>Vérifiez l'aperçu</li>
                    <li>Téléchargez le PDF</li>
                  </ol>
                </div>
                <Alert>
                  <AlertDescription>
                    💡 Les contrats générés incluent automatiquement les informations du bail, du locataire et de la propriété.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Gestion des utilisateurs */}
        <AccordionItem value="users" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              <span className="font-semibold">Gestion des utilisateurs</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-4">
            <Card>
              <CardHeader>
                <CardTitle>Comment gérer les rôles et permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Attribuer un rôle :</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Cliquez sur l'onglet "Utilisateurs"</li>
                    <li>Trouvez l'utilisateur dans la liste</li>
                    <li>Cliquez sur "Attribuer un rôle"</li>
                    <li>Sélectionnez Propriétaire ou Locataire</li>
                    <li>Confirmez l'attribution</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Modifier les informations utilisateur :</h4>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Cliquez sur "Modifier" à côté de l'utilisateur</li>
                    <li>Modifiez les informations (prénom, nom, téléphone)</li>
                    <li>Cliquez sur "Enregistrer"</li>
                  </ol>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold mb-2">Permissions par rôle :</p>
                  <ul className="space-y-2">
                    <li>
                      <strong>Propriétaire :</strong> Accès complet à toutes les fonctionnalités
                    </li>
                    <li>
                      <strong>Locataire :</strong> Accès limité aux informations des baux et paiements qui le concernent
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Besoin d'aide ?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Si vous rencontrez des difficultés ou avez des questions, n'hésitez pas à contacter le support technique.
          </p>
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-semibold">📧 Support : support@gestion-immobiliere.com</p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default UserGuide;
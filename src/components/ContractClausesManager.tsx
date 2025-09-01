import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Trash2, Plus, Edit, Save, X } from "lucide-react";

interface ContractClause {
  id: string;
  title: string;
  content: string;
  article_number?: number;
  is_annex: boolean;
  order_index: number;
}

interface LandlordInfo {
  id?: string;
  full_name: string;
  nationality: string;
  passport_number?: string;
  address: string;
  bank_account?: string;
  bank_name: string;
}

export default function ContractClausesManager() {
  const { user } = useAuth();
  const [clauses, setClauses] = useState<ContractClause[]>([]);
  const [landlordInfo, setLandlordInfo] = useState<LandlordInfo>({
    full_name: "",
    nationality: "Congolaise",
    address: "",
    bank_name: "ECOBANK"
  });
  const [editingClause, setEditingClause] = useState<string | null>(null);
  const [editingLandlord, setEditingLandlord] = useState(false);
  const [newClause, setNewClause] = useState({
    title: "",
    content: "",
    article_number: undefined as number | undefined,
    is_annex: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Récupérer les clauses
      const { data: clausesData, error: clausesError } = await supabase
        .from('contract_clauses')
        .select('*')
        .order('order_index');

      if (clausesError) throw clausesError;

      // Récupérer les infos du bailleur
      const { data: landlordData, error: landlordError } = await supabase
        .from('landlord_info')
        .select('*')
        .single();

      if (landlordError && landlordError.code !== 'PGRST116') {
        throw landlordError;
      }

      setClauses(clausesData || []);
      if (landlordData) {
        setLandlordInfo(landlordData);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const saveLandlordInfo = async () => {
    try {
      const dataToSave = {
        ...landlordInfo,
        owner_id: user?.id
      };

      if (landlordInfo.id) {
        const { error } = await supabase
          .from('landlord_info')
          .update(dataToSave)
          .eq('id', landlordInfo.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('landlord_info')
          .insert([dataToSave])
          .select()
          .single();
        if (error) throw error;
        setLandlordInfo(data);
      }

      setEditingLandlord(false);
      toast.success("Informations du bailleur sauvegardées");
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const saveClause = async (clauseId: string, updatedClause: Partial<ContractClause>) => {
    try {
      const { error } = await supabase
        .from('contract_clauses')
        .update(updatedClause)
        .eq('id', clauseId);

      if (error) throw error;

      setClauses(prev => prev.map(clause => 
        clause.id === clauseId ? { ...clause, ...updatedClause } : clause
      ));
      setEditingClause(null);
      toast.success("Clause mise à jour");
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const addClause = async () => {
    if (!newClause.title || !newClause.content) {
      toast.error("Veuillez remplir le titre et le contenu");
      return;
    }

    try {
      const maxOrder = Math.max(...clauses.map(c => c.order_index), 0);
      const clauseToAdd = {
        ...newClause,
        owner_id: user?.id,
        order_index: maxOrder + 1
      };

      const { data, error } = await supabase
        .from('contract_clauses')
        .insert([clauseToAdd])
        .select()
        .single();

      if (error) throw error;

      setClauses(prev => [...prev, data]);
      setNewClause({
        title: "",
        content: "",
        article_number: undefined,
        is_annex: false
      });
      toast.success("Clause ajoutée");
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de l'ajout");
    }
  };

  const deleteClause = async (clauseId: string) => {
    try {
      const { error } = await supabase
        .from('contract_clauses')
        .delete()
        .eq('id', clauseId);

      if (error) throw error;

      setClauses(prev => prev.filter(clause => clause.id !== clauseId));
      toast.success("Clause supprimée");
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return <div className="p-4">Chargement...</div>;
  }

  const mainClauses = clauses.filter(c => !c.is_annex);
  const annexClauses = clauses.filter(c => c.is_annex);

  return (
    <div className="space-y-6">
      {/* Informations du bailleur */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du bailleur</CardTitle>
          <CardDescription>
            Ces informations apparaîtront dans tous les contrats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingLandlord ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Nom complet</Label>
                  <Input
                    id="full_name"
                    value={landlordInfo.full_name}
                    onChange={(e) => setLandlordInfo(prev => ({
                      ...prev,
                      full_name: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationalité</Label>
                  <Input
                    id="nationality"
                    value={landlordInfo.nationality}
                    onChange={(e) => setLandlordInfo(prev => ({
                      ...prev,
                      nationality: e.target.value
                    }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="passport_number">Numéro de passeport</Label>
                <Input
                  id="passport_number"
                  value={landlordInfo.passport_number || ""}
                  onChange={(e) => setLandlordInfo(prev => ({
                    ...prev,
                    passport_number: e.target.value
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={landlordInfo.address}
                  onChange={(e) => setLandlordInfo(prev => ({
                    ...prev,
                    address: e.target.value
                  }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank_name">Banque</Label>
                  <Input
                    id="bank_name"
                    value={landlordInfo.bank_name}
                    onChange={(e) => setLandlordInfo(prev => ({
                      ...prev,
                      bank_name: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="bank_account">Numéro de compte</Label>
                  <Input
                    id="bank_account"
                    value={landlordInfo.bank_account || ""}
                    onChange={(e) => setLandlordInfo(prev => ({
                      ...prev,
                      bank_account: e.target.value
                    }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveLandlordInfo}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button variant="outline" onClick={() => setEditingLandlord(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p><strong>Nom:</strong> {landlordInfo.full_name || "Non défini"}</p>
                <p><strong>Nationalité:</strong> {landlordInfo.nationality}</p>
                <p><strong>Adresse:</strong> {landlordInfo.address || "Non définie"}</p>
                <p><strong>Banque:</strong> {landlordInfo.bank_name} - {landlordInfo.bank_account || "Non défini"}</p>
              </div>
              <Button onClick={() => setEditingLandlord(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Clauses principales */}
      <Card>
        <CardHeader>
          <CardTitle>Clauses du contrat</CardTitle>
          <CardDescription>
            Gérez les articles du contrat de bail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mainClauses.map((clause) => (
            <ClauseCard
              key={clause.id}
              clause={clause}
              isEditing={editingClause === clause.id}
              onEdit={() => setEditingClause(clause.id)}
              onSave={(updatedClause) => saveClause(clause.id, updatedClause)}
              onCancel={() => setEditingClause(null)}
              onDelete={() => deleteClause(clause.id)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Annexes */}
      <Card>
        <CardHeader>
          <CardTitle>Annexes</CardTitle>
          <CardDescription>
            Gérez les annexes du contrat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {annexClauses.map((clause) => (
            <ClauseCard
              key={clause.id}
              clause={clause}
              isEditing={editingClause === clause.id}
              onEdit={() => setEditingClause(clause.id)}
              onSave={(updatedClause) => saveClause(clause.id, updatedClause)}
              onCancel={() => setEditingClause(null)}
              onDelete={() => deleteClause(clause.id)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Ajouter une nouvelle clause */}
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une clause</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="new_title">Titre</Label>
            <Input
              id="new_title"
              value={newClause.title}
              onChange={(e) => setNewClause(prev => ({
                ...prev,
                title: e.target.value
              }))}
            />
          </div>
          <div>
            <Label htmlFor="new_content">Contenu</Label>
            <Textarea
              id="new_content"
              value={newClause.content}
              onChange={(e) => setNewClause(prev => ({
                ...prev,
                content: e.target.value
              }))}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new_article_number">Numéro d'article (optionnel)</Label>
              <Input
                id="new_article_number"
                type="number"
                value={newClause.article_number || ""}
                onChange={(e) => setNewClause(prev => ({
                  ...prev,
                  article_number: e.target.value ? parseInt(e.target.value) : undefined
                }))}
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="new_is_annex"
                checked={newClause.is_annex}
                onCheckedChange={(checked) => setNewClause(prev => ({
                  ...prev,
                  is_annex: !!checked
                }))}
              />
              <Label htmlFor="new_is_annex">C'est une annexe</Label>
            </div>
          </div>
          <Button onClick={addClause}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter la clause
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface ClauseCardProps {
  clause: ContractClause;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updatedClause: Partial<ContractClause>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function ClauseCard({ clause, isEditing, onEdit, onSave, onCancel, onDelete }: ClauseCardProps) {
  const [editData, setEditData] = useState(clause);

  const handleSave = () => {
    onSave(editData);
  };

  if (isEditing) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="edit_title">Titre</Label>
            <Input
              id="edit_title"
              value={editData.title}
              onChange={(e) => setEditData(prev => ({
                ...prev,
                title: e.target.value
              }))}
            />
          </div>
          <div>
            <Label htmlFor="edit_content">Contenu</Label>
            <Textarea
              id="edit_content"
              value={editData.content}
              onChange={(e) => setEditData(prev => ({
                ...prev,
                content: e.target.value
              }))}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="edit_article_number">Numéro d'article</Label>
            <Input
              id="edit_article_number"
              type="number"
              value={editData.article_number || ""}
              onChange={(e) => setEditData(prev => ({
                ...prev,
                article_number: e.target.value ? parseInt(e.target.value) : undefined
              }))}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="font-semibold">
              {clause.article_number && `Article ${clause.article_number} - `}
              {clause.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
              {clause.content}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
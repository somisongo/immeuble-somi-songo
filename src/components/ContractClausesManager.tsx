import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, Plus, Edit, Save, X, Eye } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

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
  const { t } = useLanguage();
  const [clauses, setClauses] = useState<ContractClause[]>([]);
  const [landlordInfo, setLandlordInfo] = useState<LandlordInfo>({
    full_name: "",
    nationality: "Congolaise",
    address: "",
    bank_name: "ECOBANK"
  });
  const [editingClause, setEditingClause] = useState<ContractClause | null>(null);
  const [editingLandlord, setEditingLandlord] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewingClause, setViewingClause] = useState<ContractClause | null>(null);
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
      // Récupérer les clauses pour l'utilisateur actuel
      const { data: clausesData, error: clausesError } = await supabase
        .from('contract_clauses')
        .select('*')
        .eq('owner_id', user?.id)
        .order('order_index');

      if (clausesError) throw clausesError;

      // Récupérer les infos du bailleur pour l'utilisateur actuel
      const { data: landlordData, error: landlordError } = await supabase
        .from('landlord_info')
        .select('*')
        .eq('owner_id', user?.id)
        .maybeSingle();

      if (landlordError) {
        console.error('Erreur lors de la récupération des infos bailleur:', landlordError);
      }

      console.log('Clauses récupérées:', clausesData);
      console.log('Infos bailleur récupérées:', landlordData);

      setClauses(clausesData || []);
      if (landlordData) {
        setLandlordInfo(landlordData);
      }
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(t('contractClauses.errorLoad'));
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
      toast.success(t('contractClauses.successSave'));
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(t('contractClauses.errorSave'));
    }
  };

  const saveClause = async (updatedClause: ContractClause) => {
    try {
      const { error } = await supabase
        .from('contract_clauses')
        .update(updatedClause)
        .eq('id', updatedClause.id);

      if (error) throw error;

      setClauses(prev => prev.map(clause => 
        clause.id === updatedClause.id ? updatedClause : clause
      ));
      setEditingClause(null);
      toast.success(t('contractClauses.successUpdate'));
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(t('contractClauses.errorUpdate'));
    }
  };

  const addClause = async () => {
    if (!newClause.title || !newClause.content) {
      toast.error(t('contractClauses.errorCreate'));
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
      setShowCreateDialog(false);
      toast.success(t('contractClauses.successCreate'));
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(t('contractClauses.errorCreate'));
    }
  };

  const deleteClause = async (clauseId: string) => {
    if (!confirm(t('contractClauses.errorDelete'))) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contract_clauses')
        .delete()
        .eq('id', clauseId);

      if (error) throw error;

      setClauses(prev => prev.filter(clause => clause.id !== clauseId));
      toast.success(t('contractClauses.successDelete'));
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(t('contractClauses.errorDelete'));
    }
  };

  if (loading) {
    return <div className="p-4">{t('common.loading')}</div>;
  }

  const mainClauses = clauses.filter(c => !c.is_annex);
  const annexClauses = clauses.filter(c => c.is_annex);

  return (
    <div className="space-y-6">
      {/* Informations du bailleur */}
      <Card>
        <CardHeader>
          <CardTitle>{t('contractClauses.landlordInfo')}</CardTitle>
          <CardDescription>
            {t('contractClauses.landlordInfo')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingLandlord ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">{t('contractClauses.fullName')}</Label>
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
                  <Label htmlFor="nationality">{t('contractClauses.nationality')}</Label>
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
                <Label htmlFor="passport_number">{t('contractClauses.passportNumber')}</Label>
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
                <Label htmlFor="address">{t('contractClauses.address')}</Label>
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
                  <Label htmlFor="bank_name">{t('contractClauses.bankName')}</Label>
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
                  <Label htmlFor="bank_account">{t('contractClauses.bankAccount')}</Label>
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
                  {t('contractClauses.saveLandlord')}
                </Button>
                <Button variant="outline" onClick={() => setEditingLandlord(false)}>
                  <X className="h-4 w-4 mr-2" />
                  {t('contractClauses.cancelEdit')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p><strong>{t('contractClauses.fullName')}:</strong> {landlordInfo.full_name || t('metrics.noData')}</p>
                <p><strong>{t('contractClauses.nationality')}:</strong> {landlordInfo.nationality}</p>
                <p><strong>{t('contractClauses.passportNumber')}:</strong> {landlordInfo.passport_number || t('metrics.noData')}</p>
                <p><strong>{t('contractClauses.address')}:</strong> {landlordInfo.address || t('metrics.noData')}</p>
                <p><strong>{t('contractClauses.bankName')}:</strong> {landlordInfo.bank_name}</p>
                <p><strong>{t('contractClauses.bankAccount')}:</strong> {landlordInfo.bank_account || t('metrics.noData')}</p>
              </div>
              <Button variant="outline" onClick={() => setEditingLandlord(true)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('contractClauses.editLandlord')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tableau des clauses principales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('contractClauses.clauses')}</CardTitle>
            <CardDescription>
              {t('contractClauses.clauses')}
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('contractClauses.addClause')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('contractClauses.createClause')}</DialogTitle>
                <DialogDescription>
                  {t('contractClauses.createClause')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new_title">{t('contractClauses.title')}</Label>
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
                  <Label htmlFor="new_content">{t('contractClauses.content')}</Label>
                  <Textarea
                    id="new_content"
                    value={newClause.content}
                    onChange={(e) => setNewClause(prev => ({
                      ...prev,
                      content: e.target.value
                    }))}
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new_article_number">{t('contractClauses.articleNumber')}</Label>
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
                    <Label htmlFor="new_is_annex">{t('contractClauses.annexes')}</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  {t('contractClauses.cancel')}
                </Button>
                <Button onClick={addClause}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('contractClauses.create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('contractClauses.articleNumber')}</TableHead>
                <TableHead>{t('contractClauses.title')}</TableHead>
                <TableHead>{t('contractClauses.content')}</TableHead>
                <TableHead className="text-right">{t('contractClauses.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mainClauses.map((clause) => (
                <TableRow key={clause.id}>
                  <TableCell>
                    {clause.article_number ? `Art. ${clause.article_number}` : '-'}
                  </TableCell>
                  <TableCell className="font-medium">{clause.title}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate">
                      {clause.content.length > 100 
                        ? `${clause.content.substring(0, 100)}...` 
                        : clause.content
                      }
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              {clause.article_number && `Article ${clause.article_number} - `}
                              {clause.title}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                              {clause.content}
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingClause(clause)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteClause(clause.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {mainClauses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    {t('contractClauses.noClauses')}. {t('contractClauses.addFirstClause')}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tableau des annexes */}
      <Card>
        <CardHeader>
          <CardTitle>{t('contractClauses.annexes')}</CardTitle>
          <CardDescription>
            {t('contractClauses.annexes')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('contractClauses.title')}</TableHead>
                <TableHead>{t('contractClauses.content')}</TableHead>
                <TableHead className="text-right">{t('contractClauses.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {annexClauses.map((clause) => (
                <TableRow key={clause.id}>
                  <TableCell className="font-medium">{clause.title}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate">
                      {clause.content.length > 100 
                        ? `${clause.content.substring(0, 100)}...` 
                        : clause.content
                      }
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{clause.title}</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                              {clause.content}
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingClause(clause)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteClause(clause.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {annexClauses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    {t('contractClauses.noAnnexes')}.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      {editingClause && (
        <Dialog open={!!editingClause} onOpenChange={() => setEditingClause(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('contractClauses.editClause')}</DialogTitle>
              <DialogDescription>
                {t('contractClauses.editClause')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_title">{t('contractClauses.title')}</Label>
                <Input
                  id="edit_title"
                  value={editingClause.title}
                  onChange={(e) => setEditingClause(prev => prev ? ({
                    ...prev,
                    title: e.target.value
                  }) : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit_content">{t('contractClauses.content')}</Label>
                <Textarea
                  id="edit_content"
                  value={editingClause.content}
                  onChange={(e) => setEditingClause(prev => prev ? ({
                    ...prev,
                    content: e.target.value
                  }) : null)}
                  rows={6}
                />
              </div>
              {!editingClause.is_annex && (
                <div>
                  <Label htmlFor="edit_article_number">{t('contractClauses.articleNumber')}</Label>
                  <Input
                    id="edit_article_number"
                    type="number"
                    value={editingClause.article_number || ""}
                    onChange={(e) => setEditingClause(prev => prev ? ({
                      ...prev,
                      article_number: e.target.value ? parseInt(e.target.value) : undefined
                    }) : null)}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingClause(null)}>
                {t('contractClauses.cancel')}
              </Button>
              <Button onClick={() => editingClause && saveClause(editingClause)}>
                <Save className="h-4 w-4 mr-2" />
                {t('contractClauses.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContractClausesManager from "./ContractClausesManager";
import { ContractParametersForm } from "./ContractParametersForm";
import { useLanguage } from "@/hooks/useLanguage";

export const ContractManager = () => {
  const { t } = useLanguage();
  
  return (
    <Tabs defaultValue="parameters" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="parameters">{t('contracts.parameters')}</TabsTrigger>
        <TabsTrigger value="clauses">{t('contracts.clausesManagement')}</TabsTrigger>
      </TabsList>

      <TabsContent value="parameters" className="mt-6">
        <ContractParametersForm />
      </TabsContent>

      <TabsContent value="clauses" className="mt-6">
        <ContractClausesManager />
      </TabsContent>
    </Tabs>
  );
};
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContractClausesManager from "./ContractClausesManager";
import { ContractParametersForm } from "./ContractParametersForm";

export const ContractManager = () => {
  return (
    <Tabs defaultValue="parameters" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="parameters">Paramètres du Contrat</TabsTrigger>
        <TabsTrigger value="clauses">Gestion des Clauses</TabsTrigger>
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
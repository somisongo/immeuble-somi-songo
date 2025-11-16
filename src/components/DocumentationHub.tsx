import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileCode } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import UserGuide from "@/components/UserGuide";
import { TechnicalDocumentation } from "@/components/TechnicalDocumentation";

export const DocumentationHub = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{t('documentation.title')}</h1>
        <p className="text-muted-foreground">{t('documentation.subtitle')}</p>
      </div>

      <Tabs defaultValue="user-guide" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="user-guide" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            {t('documentation.userGuide')}
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            {t('documentation.technicalGuide')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="user-guide" className="mt-6">
          <UserGuide />
        </TabsContent>

        <TabsContent value="technical" className="mt-6">
          <TechnicalDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
};

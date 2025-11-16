import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useProperties } from "@/hooks/useProperties";
import { useLanguage } from "@/hooks/useLanguage";

const NATIONALITIES = [
  "Afghane", "Albanaise", "Algérienne", "Allemande", "Américaine", "Andorrane", "Angolaise", 
  "Antiguaise", "Argentine", "Arménienne", "Australienne", "Autrichienne", "Azerbaïdjanaise",
  "Bahamienne", "Bahreïnienne", "Bangladaise", "Barbadienne", "Belge", "Bélizienne", "Béninoise",
  "Bhoutanaise", "Biélorusse", "Birmane", "Bolivienne", "Bosnienne", "Botswanaise", "Brésilienne",
  "Britannique", "Brunéienne", "Bulgare", "Burkinabé", "Burundaise", "Cambodgienne", "Camerounaise",
  "Canadienne", "Cap-verdienne", "Centrafricaine", "Chilienne", "Chinoise", "Chypriote", "Colombienne",
  "Comorienne", "Congolaise", "Congolaise (RDC)", "Costaricaine", "Croate", "Cubaine", "Danoise",
  "Djiboutienne", "Dominicaine", "Égyptienne", "Émirienne", "Équatorienne", "Érythréenne", "Espagnole",
  "Estonienne", "Éthiopienne", "Fidjienne", "Finlandaise", "Française", "Gabonaise", "Gambienne",
  "Géorgienne", "Ghanéenne", "Grecque", "Grenadienne", "Guatémaltèque", "Guinéenne", "Guinéenne équatoriale",
  "Guyanienne", "Haïtienne", "Hondurienne", "Hongroise", "Indienne", "Indonésienne", "Irakienne",
  "Iranienne", "Irlandaise", "Islandaise", "Israélienne", "Italienne", "Ivoirienne", "Jamaïcaine",
  "Japonaise", "Jordanienne", "Kazakhe", "Kényane", "Kirghize", "Kiribatienne", "Koweïtienne",
  "Laotienne", "Lettone", "Libanaise", "Libérienne", "Libyenne", "Liechtensteinoise", "Lituanienne",
  "Luxembourgeoise", "Macédonienne", "Malgache", "Malaisienne", "Malawienne", "Maldivienne", "Malienne",
  "Maltaise", "Marocaine", "Marshallaise", "Mauricienne", "Mauritanienne", "Mexicaine", "Micronésienne",
  "Moldave", "Monégasque", "Mongole", "Monténégrine", "Mozambicaine", "Namibienne", "Nauruane",
  "Néerlandaise", "Néo-zélandaise", "Népalaise", "Nicaraguayenne", "Nigériane", "Nigérienne", "Nord-coréenne",
  "Norvégienne", "Omanaise", "Ougandaise", "Ouzbèke", "Pakistanaise", "Palaosienne", "Palestinienne",
  "Panaméenne", "Papouane-néo-guinéenne", "Paraguayenne", "Péruvienne", "Philippine", "Polonaise",
  "Portugaise", "Qatarienne", "Roumaine", "Russe", "Rwandaise", "Saint-lucienne", "Salvadorienne",
  "Samoane", "Santoméenne", "Saoudienne", "Sénégalaise", "Serbe", "Seychelloise", "Sierra-léonaise",
  "Singapourienne", "Slovaque", "Slovène", "Somalienne", "Soudanaise", "Sri-lankaise", "Sud-africaine",
  "Sud-coréenne", "Sud-soudanaise", "Suédoise", "Suisse", "Surinamaise", "Swazie", "Syrienne",
  "Tadjike", "Tanzanienne", "Tchadienne", "Tchèque", "Thaïlandaise", "Timoraise", "Togolaise",
  "Tongienne", "Trinidadienne", "Tunisienne", "Turkmène", "Turque", "Tuvaluane", "Ukrainienne",
  "Uruguayenne", "Vanuatuane", "Vénézuélienne", "Vietnamienne", "Yéménite", "Zambienne", "Zimbabwéenne"
];

interface ContractParameters {
  // Informations du locataire
  tenant_name: string;
  tenant_nationality: string;
  tenant_passport: string;
  tenant_address: string;
  
  // Informations de la propriété
  property_address: string;
  unit_number: string;
  
  // Informations financières
  rent_amount: string;
  rent_amount_words: string;
  deposit_amount: string;
  deposit_amount_words: string;
  
  // Dates
  start_date: string;
  end_date: string;
  signature_date: string;
}

export const ContractParametersForm = () => {
  const { properties, loading } = useProperties();
  const vacantProperties = properties.filter(p => p.status === 'vacant');
  const { t } = useLanguage();
  
  const [parameters, setParameters] = useState<ContractParameters>({
    tenant_name: "",
    tenant_nationality: "Congolaise",
    tenant_passport: "",
    tenant_address: "",
    property_address: "Avenue Saka n° 14, Quartier Kinsuka, Commune de Ngaliema",
    unit_number: "",
    rent_amount: "700",
    rent_amount_words: "sept cents",
    deposit_amount: "2100",
    deposit_amount_words: "deux milles cent",
    start_date: "",
    end_date: "",
    signature_date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!parameters.tenant_name || !parameters.tenant_passport || !parameters.start_date || !parameters.end_date) {
      toast.error(t('contractParameters.errorSave'));
      return;
    }
    
    toast.success(t('contractParameters.successSave'));
    console.log("Contract parameters:", parameters);
  };

  const handleChange = (field: keyof ContractParameters, value: string) => {
    setParameters(prev => ({ ...prev, [field]: value }));
  };

  const convertNumberToWords = (amount: string) => {
    // Cette fonction sera à compléter pour la conversion automatique
    // Pour l'instant, l'utilisateur peut saisir manuellement
    return amount;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('contractParameters.title')}</CardTitle>
        <CardDescription>
          {t('contractParameters.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations du locataire */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('contractParameters.tenantInfo')}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="tenant_name">{t('contractParameters.tenantName')} *</Label>
              <Input
                id="tenant_name"
                value={parameters.tenant_name}
                onChange={(e) => handleChange("tenant_name", e.target.value)}
                placeholder="Monsieur/Madame/Mademoiselle..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenant_nationality">{t('contractParameters.tenantNationality')}</Label>
                <Select
                  value={parameters.tenant_nationality}
                  onValueChange={(value) => handleChange("tenant_nationality", value)}
                >
                  <SelectTrigger id="tenant_nationality">
                    <SelectValue placeholder={t('contractParameters.tenantNationality')} />
                  </SelectTrigger>
                  <SelectContent>
                    {NATIONALITIES.map((nationality) => (
                      <SelectItem key={nationality} value={nationality}>
                        {nationality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenant_passport">{t('contractParameters.tenantPassport')} *</Label>
                <Input
                  id="tenant_passport"
                  value={parameters.tenant_passport}
                  onChange={(e) => handleChange("tenant_passport", e.target.value)}
                  placeholder="OP1234567"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant_address">{t('contractParameters.tenantAddress')}</Label>
              <Textarea
                id="tenant_address"
                value={parameters.tenant_address}
                onChange={(e) => handleChange("tenant_address", e.target.value)}
                placeholder={t('contractParameters.tenantAddress')}
                rows={2}
              />
            </div>
          </div>

          {/* Informations de la propriété */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('contractParameters.propertyInfo')}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="property_address">{t('contractParameters.propertyAddress')}</Label>
              <Textarea
                id="property_address"
                value={parameters.property_address}
                onChange={(e) => handleChange("property_address", e.target.value)}
                placeholder={t('contractParameters.propertyAddress')}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_number">{t('contractParameters.unitNumber')}</Label>
              <Select
                value={parameters.unit_number}
                onValueChange={(value) => handleChange("unit_number", value)}
              >
                <SelectTrigger id="unit_number">
                  <SelectValue placeholder={t('contractParameters.unitNumber')} />
                </SelectTrigger>
                <SelectContent>
                  {vacantProperties.map((property) => (
                    <SelectItem key={property.id} value={property.unit}>
                      {property.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Informations financières */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('contractParameters.financialInfo')}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rent_amount">{t('contractParameters.rentAmount')}</Label>
                <Input
                  id="rent_amount"
                  value={parameters.rent_amount}
                  onChange={(e) => handleChange("rent_amount", e.target.value)}
                  placeholder="700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rent_amount_words">{t('contractParameters.rentAmountWords')}</Label>
                <Input
                  id="rent_amount_words"
                  value={parameters.rent_amount_words}
                  onChange={(e) => handleChange("rent_amount_words", e.target.value)}
                  placeholder="sept cents"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deposit_amount">{t('contractParameters.depositAmount')}</Label>
                <Input
                  id="deposit_amount"
                  value={parameters.deposit_amount}
                  onChange={(e) => handleChange("deposit_amount", e.target.value)}
                  placeholder="2100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deposit_amount_words">{t('contractParameters.depositAmountWords')}</Label>
                <Input
                  id="deposit_amount_words"
                  value={parameters.deposit_amount_words}
                  onChange={(e) => handleChange("deposit_amount_words", e.target.value)}
                  placeholder="deux milles cent"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('contractParameters.dates')}</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">{t('contractParameters.startDate')} *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={parameters.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">{t('contractParameters.endDate')} *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={parameters.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signature_date">{t('contractParameters.signatureDate')}</Label>
                <Input
                  id="signature_date"
                  type="date"
                  value={parameters.signature_date}
                  onChange={(e) => handleChange("signature_date", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setParameters({
              tenant_name: "",
              tenant_nationality: "Congolaise",
              tenant_passport: "",
              tenant_address: "",
              property_address: "Avenue Saka n° 14, Quartier Kinsuka, Commune de Ngaliema",
              unit_number: "",
              rent_amount: "700",
              rent_amount_words: "sept cents",
              deposit_amount: "2100",
              deposit_amount_words: "deux milles cent",
              start_date: "",
              end_date: "",
              signature_date: new Date().toISOString().split('T')[0]
            })}>
              {t('contractParameters.reset')}
            </Button>
            <Button type="submit">
              {t('contractParameters.savePreview')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, User, CreditCard } from "lucide-react";
import type { FlowType, PassportData, ProductType } from "@/context/AppContext";

interface FieldDef {
  key: string;
  label: string;
  span?: "full";
  placeholder?: string;
}

const baseSections: { title: string; icon: React.ElementType; fields: FieldDef[] }[] = [
  {
    title: "Личные данные",
    icon: User,
    fields: [
      { key: "lastName", label: "Фамилия" },
      { key: "firstName", label: "Имя" },
      { key: "middleName", label: "Отчество" },
      { key: "birthDate", label: "Дата рождения" },
      { key: "gender", label: "Пол" },
      { key: "birthPlace", label: "Место рождения", span: "full" },
    ],
  },
  {
    title: "Паспорт",
    icon: CreditCard,
    fields: [
      { key: "passportSeries", label: "Серия" },
      { key: "passportNumber", label: "Номер" },
      { key: "issuedBy", label: "Кем выдан", span: "full" },
      { key: "issueDate", label: "Дата выдачи" },
      { key: "divisionCode", label: "Код подразделения" },
    ],
  },
];

interface Props {
  passport: PassportData;
  productType?: ProductType;
  flowType: FlowType;
  ocrDone: boolean;
  onUpdate: (payload: Partial<PassportData>) => void;
}

export default function PassportFields({ passport, productType, flowType, ocrDone, onUpdate }: Props) {
  const data = passport as Record<string, string>;
  const onlineLightSections = [
    {
      ...baseSections[0],
      fields: baseSections[0].fields.filter((field) => ["lastName", "firstName", "middleName", "birthDate"].includes(field.key)),
    },
    {
      ...baseSections[1],
      fields: baseSections[1].fields.filter((field) => ["passportSeries", "passportNumber", "issuedBy", "issueDate"].includes(field.key)),
    },
  ];
  const sections = flowType === "online_light"
    ? onlineLightSections
    : productType === "ip"
    ? baseSections.map((section) => {
      if (section.title === "Личные данные") {
        return {
          ...section,
          fields: [...section.fields, { key: "citizenship", label: "Гражданство", span: "full" as const }],
        };
      }
      if (section.title === "Паспорт") {
        return {
          ...section,
          fields: [{ key: "documentType", label: "Вид документа", span: "full" as const }, ...section.fields],
        };
      }
      return section;
    })
    : baseSections;

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <Card key={section.title}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <section.icon className="h-4 w-4 text-muted-foreground" />
              <p className="font-semibold text-sm">{section.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-3">
              {section.fields.map((f) => (
                <div key={f.key} className={`space-y-1 ${f.span === "full" ? "col-span-2" : ""}`}>
                  <Label className="text-xs text-muted-foreground">{f.label}</Label>
                  {f.key === "gender" ? (
                    <div className="flex items-center gap-1.5">
                      <Select value={data[f.key] || ""} onValueChange={(val) => onUpdate({ [f.key]: val })}>
                        <SelectTrigger className="text-sm h-10">
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Мужской">Мужской</SelectItem>
                          <SelectItem value="Женский">Женский</SelectItem>
                        </SelectContent>
                      </Select>
                      {ocrDone && data[f.key] && (
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                  ) : f.key === "citizenship" ? (
                    <div className="flex items-center gap-1.5">
                      <Select value={passport.citizenship || ""} onValueChange={(val) => onUpdate({ citizenship: val as PassportData["citizenship"] })}>
                        <SelectTrigger className="text-sm h-10">
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ru">Гражданин РФ</SelectItem>
                          <SelectItem value="foreign">Иностранный гражданин</SelectItem>
                          <SelectItem value="stateless">Лицо без гражданства</SelectItem>
                        </SelectContent>
                      </Select>
                      {ocrDone && passport.citizenship && (
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                  ) : f.key === "documentType" ? (
                    <div className="flex items-center gap-1.5">
                      <Select value={passport.documentType || ""} onValueChange={(val) => onUpdate({ documentType: val as PassportData["documentType"] })}>
                        <SelectTrigger className="text-sm h-10">
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passport_rf">Паспорт гражданина РФ</SelectItem>
                          <SelectItem value="other">Иной документ</SelectItem>
                        </SelectContent>
                      </Select>
                      {ocrDone && passport.documentType && (
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        value={data[f.key] || ""}
                        placeholder={f.placeholder}
                        onChange={(e) => onUpdate({ [f.key]: e.target.value })}
                        className="text-sm h-10 pr-8"
                      />
                      {ocrDone && data[f.key] && (
                        <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import type { PassportData } from "@/context/AppContext";

const fields = [
  { key: "lastName", label: "Фамилия" },
  { key: "firstName", label: "Имя" },
  { key: "middleName", label: "Отчество" },
  { key: "birthDate", label: "Дата рождения" },
  { key: "gender", label: "Пол" },
  { key: "birthPlace", label: "Место рождения" },
  { key: "passportSeries", label: "Серия паспорта" },
  { key: "passportNumber", label: "Номер паспорта" },
  { key: "issuedBy", label: "Кем выдан" },
  { key: "issueDate", label: "Дата выдачи" },
  { key: "divisionCode", label: "Код подразделения" },
];

interface Props {
  passport: PassportData;
  ocrDone: boolean;
  onUpdate: (payload: Partial<PassportData>) => void;
}

export default function PassportFields({ passport, ocrDone, onUpdate }: Props) {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <p className="font-semibold text-sm">Паспортные данные</p>
        {fields.map((f) => (
          <div key={f.key} className="space-y-1">
            <Label className="text-xs text-muted-foreground">{f.label}</Label>
            <div className="flex items-center gap-2">
              <Input
                value={(passport as Record<string, string>)[f.key] || ""}
                onChange={(e) => onUpdate({ [f.key]: e.target.value })}
                className="text-sm"
              />
              {ocrDone && (passport as Record<string, string>)[f.key] && (
                <Check className="h-4 w-4 text-success shrink-0" />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

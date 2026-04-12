import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { PassportData } from "@/context/AppContext";

interface Props {
  passport: PassportData;
  onUpdate: (payload: Partial<PassportData>) => void;
}

export default function AdditionalFields({ passport, onUpdate }: Props) {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <p className="font-semibold text-sm">Дополнительные данные</p>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">ИНН</Label>
          <Input
            placeholder="12 цифр"
            maxLength={12}
            value={passport.inn || ""}
            onChange={(e) => onUpdate({ inn: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">СНИЛС</Label>
          <Input
            placeholder="___-___-___ __"
            value={passport.snils || ""}
            onChange={(e) => onUpdate({ snils: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

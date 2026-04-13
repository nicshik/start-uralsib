import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FileDigit } from "lucide-react";
import type { PassportData } from "@/context/AppContext";

interface Props {
  passport: PassportData;
  onUpdate: (payload: Partial<PassportData>) => void;
}

export default function AdditionalFields({ passport, onUpdate }: Props) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FileDigit className="h-4 w-4 text-muted-foreground" />
          <p className="font-semibold text-sm">ИНН и СНИЛС</p>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">ИНН</Label>
            <Input
              placeholder="12 цифр"
              maxLength={12}
              value={passport.inn || ""}
              onChange={(e) => onUpdate({ inn: e.target.value })}
              className="text-sm h-10"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">СНИЛС</Label>
            <Input
              placeholder="___-___-___ __"
              value={passport.snils || ""}
              onChange={(e) => onUpdate({ snils: e.target.value })}
              className="text-sm h-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

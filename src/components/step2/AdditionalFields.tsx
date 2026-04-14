import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import type { BusinessData, PassportData, ProductType } from "@/context/AppContext";

interface Props {
  passport: PassportData;
  productType?: ProductType;
  business?: BusinessData;
  email?: string;
  phone?: string;
  emailValid: boolean;
  onUpdate: (payload: Partial<PassportData>) => void;
  onBusinessUpdate?: (payload: Partial<BusinessData>) => void;
  onPhoneUpdate?: (phone: string) => void;
  onEmailUpdate: (email: string) => void;
}

export default function AdditionalFields({
  passport,
  productType,
  business,
  email,
  phone,
  emailValid,
  onUpdate,
  onBusinessUpdate,
  onPhoneUpdate,
  onEmailUpdate,
}: Props) {
  const isOoo = productType === "ooo";
  const registrationAddress = isOoo
    ? business?.founderRegistrationAddress || passport.registrationAddress || ""
    : passport.registrationAddress || "";
  const registrationAddressLabel = isOoo ? "Адрес регистрации учредителя" : "Адрес регистрации";
  const handleRegistrationAddressChange = (value: string) => {
    if (isOoo && onBusinessUpdate) {
      onBusinessUpdate({
        founderRegistrationAddress: value,
        legalAddress: business?.addressIsFounder === false ? business?.legalAddress : value,
      });
      return;
    }
    onUpdate({ registrationAddress: value });
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <p className="font-semibold text-sm">Контакты и реквизиты</p>
        </div>

        <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input
              type="email"
              placeholder="example@mail.ru"
              value={email || ""}
              onChange={(e) => onEmailUpdate(e.target.value)}
              className={`text-sm h-10 ${email && !emailValid ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Телефон</Label>
            <Input
              value={phone || ""}
              onChange={(e) => onPhoneUpdate?.(e.target.value)}
              readOnly={!onPhoneUpdate}
              className={`h-10 text-sm ${onPhoneUpdate ? "" : "bg-muted text-muted-foreground"}`}
            />
          </div>
          {email && !emailValid && (
            <p className="text-xs sm:col-span-2 text-destructive">
              Введите корректный email
            </p>
          )}
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

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{registrationAddressLabel}</Label>
          <Input
            placeholder="Город, улица, дом, квартира"
            value={registrationAddress}
            onChange={(e) => handleRegistrationAddressChange(e.target.value)}
            className="text-sm h-10"
          />
        </div>
      </CardContent>
    </Card>
  );
}

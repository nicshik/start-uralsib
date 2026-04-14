import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import type { BusinessData, FlowType, PassportData, ProductType } from "@/context/AppContext";
import { isValidEmail } from "@/lib/applicationValidation";

interface Props {
  passport: PassportData;
  productType?: ProductType;
  flowType: FlowType;
  business?: BusinessData;
  email?: string;
  phone?: string;
  onUpdate: (payload: Partial<PassportData>) => void;
  onBusinessUpdate?: (payload: Partial<BusinessData>) => void;
  onPhoneUpdate?: (phone: string) => void;
  onEmailUpdate: (email: string) => void;
}

export default function AdditionalFields({
  passport,
  productType,
  flowType,
  business,
  email,
  phone,
  onUpdate,
  onBusinessUpdate,
  onPhoneUpdate,
  onEmailUpdate,
}: Props) {
  const isOnlineLight = flowType === "online_light";
  const isOoo = productType === "ooo";
  const registrationAddress = isOoo
    ? business?.founderRegistrationAddress || passport.registrationAddress || ""
    : passport.registrationAddress || "";
  const registrationAddressLabel = isOoo ? "Адрес регистрации учредителя" : "Адрес регистрации";
  const businessEmail =
    productType === "ooo"
      ? business?.legalEntityEmail || email || ""
      : productType === "ip"
        ? business?.entrepreneurEmail || email || ""
        : email || "";
  const registrationResultEmail = business?.registrationResultEmail || businessEmail;
  const businessEmailLabel =
    isOnlineLight
      ? "Email"
      : productType === "ooo"
      ? "Email юридического лица"
      : productType === "ip"
        ? "Email ИП"
        : "Email";

  const handleBusinessEmailChange = (value: string) => {
    const currentResultEmail = business?.registrationResultEmail || email || "";
    const shouldSyncResultEmail = !currentResultEmail || currentResultEmail === businessEmail;

    onEmailUpdate(value);
    if (productType === "ooo") {
      onBusinessUpdate?.({
        legalEntityEmail: value,
        registrationResultEmail: shouldSyncResultEmail ? value : currentResultEmail,
      });
    } else if (productType === "ip") {
      onBusinessUpdate?.({
        entrepreneurEmail: value,
        registrationResultEmail: shouldSyncResultEmail ? value : currentResultEmail,
      });
    }
  };

  const handleRegistrationResultEmailChange = (value: string) => {
    onBusinessUpdate?.({ registrationResultEmail: value });
  };

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
            <Label className="text-xs text-muted-foreground">{businessEmailLabel}</Label>
            <Input
              type="email"
              placeholder="example@mail.ru"
              value={businessEmail}
              onChange={(e) => handleBusinessEmailChange(e.target.value)}
              className={`text-sm h-10 ${businessEmail && !isValidEmail(businessEmail) ? "border-destructive focus-visible:ring-destructive" : ""}`}
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
          {businessEmail && !isValidEmail(businessEmail) && (
            <p className="text-xs sm:col-span-2 text-destructive">
              Введите корректный email
            </p>
          )}
        </div>

        {!isOnlineLight && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Email для документов ФНС</Label>
            <Input
              type="email"
              placeholder="example@mail.ru"
              value={registrationResultEmail}
              onChange={(e) => handleRegistrationResultEmailChange(e.target.value)}
              className={`text-sm h-10 ${registrationResultEmail && !isValidEmail(registrationResultEmail) ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            <p className="text-xs text-muted-foreground">
              ФНС направит результат регистрации на этот адрес. Можно оставить тот же email.
            </p>
            {registrationResultEmail && !isValidEmail(registrationResultEmail) && (
              <p className="text-xs text-destructive">Введите корректный email для документов ФНС</p>
            )}
          </div>
        )}

        {!isOnlineLight && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {productType === "ip" ? "ИНН (для банковского пакета)" : "ИНН"}
              </Label>
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
        )}

        {!isOnlineLight && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{registrationAddressLabel}</Label>
            <Input
              placeholder="Город, улица, дом, квартира"
              value={registrationAddress}
              onChange={(e) => handleRegistrationAddressChange(e.target.value)}
              className="text-sm h-10"
            />
            {productType === "ip" && (
              <p className="text-xs text-muted-foreground">
                Укажите адрес регистрации по паспорту. Менеджер сверит ФИАС/ГАР при расхождении.
              </p>
            )}
          </div>
        )}

        {isOnlineLight && (
          <p className="text-xs text-muted-foreground">
            Этот email используем для связи и предварительно укажем для документов. Если потребуется отдельный адрес, менеджер уточнит его в офисе.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

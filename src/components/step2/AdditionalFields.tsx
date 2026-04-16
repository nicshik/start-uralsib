import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { ChevronDown, Mail, MapPin } from "lucide-react";
import type { BusinessData, FlowType, PassportData, ProductType } from "@/context/AppContext";
import { isValidEmail } from "@/lib/applicationValidation";
import { OFFICES, getDefaultVisitCity, getDefaultVisitOffice, getOffices } from "@/lib/offices";
import type { VisitPreference, VisitRegion } from "@/lib/offices";

interface Props {
  passport: PassportData;
  productType?: ProductType;
  flowType: FlowType;
  business?: BusinessData;
  email?: string;
  phone?: string;
  visitPreference?: VisitPreference;
  visitRegion?: string;
  visitCity?: string;
  visitOffice?: string;
  onUpdate: (payload: Partial<PassportData>) => void;
  onBusinessUpdate?: (payload: Partial<BusinessData>) => void;
  onPhoneUpdate?: (phone: string) => void;
  onEmailUpdate: (email: string) => void;
  onVisitUpdate?: (payload: {
    visitPreference?: VisitPreference;
    visitRegion?: string;
    visitCity?: string;
    visitOffice?: string;
  }) => void;
}

export default function AdditionalFields({
  passport,
  productType,
  flowType,
  business,
  email,
  phone,
  visitPreference,
  visitRegion,
  visitCity,
  visitOffice,
  onUpdate,
  onBusinessUpdate,
  onPhoneUpdate,
  onEmailUpdate,
  onVisitUpdate,
}: Props) {
  const isOnlineLight = flowType === "online_light";
  const [showInnSnils, setShowInnSnils] = useState(false);
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
  const selectedVisitRegion = (visitRegion || "Москва") as VisitRegion;
  const visitCities = Object.keys(OFFICES[selectedVisitRegion].cities);
  const selectedVisitCity = visitCity || getDefaultVisitCity(selectedVisitRegion);
  const visitOffices = getOffices(selectedVisitRegion, selectedVisitCity);

  const handleVisitPreferenceChange = (value: VisitPreference) => {
    onVisitUpdate?.({
      visitPreference: value,
      visitRegion: visitRegion || selectedVisitRegion,
      visitCity: visitCity || selectedVisitCity,
      visitOffice: value === "office" ? visitOffice || getDefaultVisitOffice(selectedVisitRegion, selectedVisitCity) : undefined,
    });
  };

  const handleVisitRegionChange = (value: VisitRegion) => {
    const nextCity = getDefaultVisitCity(value);
    onVisitUpdate?.({
      visitPreference: visitPreference || "manager_pick",
      visitRegion: value,
      visitCity: nextCity,
      visitOffice: visitPreference === "office" ? getDefaultVisitOffice(value, nextCity) : undefined,
    });
  };

  const handleVisitCityChange = (value: string) => {
    onVisitUpdate?.({
      visitPreference: visitPreference || "manager_pick",
      visitRegion: selectedVisitRegion,
      visitCity: value,
      visitOffice: visitPreference === "office" ? getDefaultVisitOffice(selectedVisitRegion, value) : undefined,
    });
  };

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
          <p className="font-semibold text-sm">Контакты</p>
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

        {isOnlineLight ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowInnSnils(!showInnSnils)}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed border-primary/40 px-3 py-2 text-xs font-medium text-primary hover:bg-brand-light transition-colors"
            >
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${showInnSnils ? "rotate-180" : ""}`} />
              <span>{showInnSnils ? "Скрыть" : "Добавить ИНН и СНИЛС (необязательно)"}</span>
            </button>
            {showInnSnils && (
              <div className="space-y-3 rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Не обязательно сейчас — менеджер уточнит в офисе. Если есть под рукой, укажите: сэкономите время.
                </p>
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
              </div>
            )}
          </div>
        ) : (
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
          <div className="space-y-4 rounded-lg border border-[#E5E0EB] bg-brand-light p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Визит в отделение</p>
            </div>

            <RadioGroup
              value={visitPreference || ""}
              onValueChange={(value) => handleVisitPreferenceChange(value as VisitPreference)}
              className="grid gap-2 sm:grid-cols-2"
            >
              <Label className="flex cursor-pointer items-start gap-2 rounded-lg border bg-white p-3 text-sm [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="manager_pick" className="mt-0.5" />
                <span>
                  <span className="block font-medium">Менеджер подберёт отделение</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">Укажите регион, а время согласуем по телефону.</span>
                </span>
              </Label>
              <Label className="flex cursor-pointer items-start gap-2 rounded-lg border bg-white p-3 text-sm [&:has([data-state=checked])]:border-primary">
                <RadioGroupItem value="office" className="mt-0.5" />
                <span>
                  <span className="block font-medium">Выбрать отделение сейчас</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">Передадим выбранный офис сотруднику банка.</span>
                </span>
              </Label>
            </RadioGroup>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Регион</Label>
                <Select value={visitRegion || ""} onValueChange={(value) => handleVisitRegionChange(value as VisitRegion)}>
                  <SelectTrigger className="h-10 bg-white">
                    <SelectValue placeholder="Выберите регион" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(OFFICES).map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Город</Label>
                <Select value={visitCity || ""} onValueChange={handleVisitCityChange} disabled={!visitRegion}>
                  <SelectTrigger className="h-10 bg-white">
                    <SelectValue placeholder="Выберите город" />
                  </SelectTrigger>
                  <SelectContent>
                    {visitCities.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {visitPreference === "office" && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Отделение</Label>
                <Select
                  value={visitOffice || ""}
                  onValueChange={(value) => onVisitUpdate?.({ visitOffice: value })}
                  disabled={!visitRegion || !visitCity}
                >
                  <SelectTrigger className="h-10 bg-white">
                    <SelectValue placeholder="Выберите отделение" />
                  </SelectTrigger>
                  <SelectContent>
                    {visitOffices.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <p className="text-xs leading-relaxed text-muted-foreground">
              Эти контакты и предпочтение по визиту используем для связи и предварительно укажем для оформления пакета документов.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

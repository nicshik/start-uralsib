import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { getBusinessEmail, isValidEmail } from "@/lib/applicationValidation";
import { OFFICES, getDefaultVisitCity, getDefaultVisitOffice, getOffices, isVisitRegion } from "@/lib/offices";
import type { VisitRegion } from "@/lib/offices";
import { Building2, CheckCircle2, FileText, Gift, Phone } from "lucide-react";

export default function RkoRequest() {
  const navigate = useNavigate();
  const { clearDraft, state } = useApp();
  const fullName = [state.passport.lastName, state.passport.firstName, state.passport.middleName].filter(Boolean).join(" ");
  const businessEmail = getBusinessEmail(state.productType, state.business, state.email);
  const initialRegion: VisitRegion = isVisitRegion(state.visitRegion) ? state.visitRegion : "Москва";
  const initialCity = state.visitCity && Object.keys(OFFICES[initialRegion].cities).includes(state.visitCity)
    ? state.visitCity
    : getDefaultVisitCity(initialRegion);
  const initialOffices = getOffices(initialRegion, initialCity);
  const initialOffice = state.visitOffice && initialOffices.includes(state.visitOffice)
    ? state.visitOffice
    : getDefaultVisitOffice(initialRegion, initialCity);
  const [clientName, setClientName] = useState(fullName);
  const [phone, setPhone] = useState(state.phone || "");
  const [email, setEmail] = useState(businessEmail);
  const [region, setRegion] = useState<VisitRegion>(initialRegion);
  const [city, setCity] = useState(initialCity);
  const [office, setOffice] = useState(initialOffice);
  const [submitted, setSubmitted] = useState(false);

  const cities = useMemo(() => Object.keys(OFFICES[region].cities), [region]);
  const offices = useMemo(() => getOffices(region, city), [city, region]);
  const productLabel = state.productType === "ooo" ? "ООО" : "ИП";

  useEffect(() => {
    trackEvent("page_view", { page: "rko_request", product: state.productType, flowType: state.flowType });
  }, [state.flowType, state.productType]);

  const handleRegionChange = (value: VisitRegion) => {
    const nextCity = getDefaultVisitCity(value);
    const nextOffice = getDefaultVisitOffice(value, nextCity);
    setRegion(value);
    setCity(nextCity);
    setOffice(nextOffice);
  };

  const handleCityChange = (value: string) => {
    const nextOffice = getDefaultVisitOffice(region, value);
    setCity(value);
    setOffice(nextOffice);
  };

  const canSubmit =
    clientName.trim().length > 3 &&
    phone.replace(/\D/g, "").length >= 10 &&
    (!email.trim() || isValidEmail(email)) &&
    Boolean(region && city && office);

  const submitRequest = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    trackEvent("rko_request_submitted", {
      product: state.productType,
      flowType: state.flowType,
      region,
      city,
      emailProvided: email.trim().length > 0,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-light">
        <AppHeader />
        <main className="mx-auto max-w-lg space-y-4 px-4 py-10">
          <section className="overflow-hidden rounded-[16px] border border-[#E5E0EB] bg-white">
            <div className="bg-[#F7F5FB] px-5 py-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] bg-white text-primary ring-1 ring-[#E5E0EB]">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Заявка на открытие счёта отправлена</h1>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Менеджер рассмотрит её вместе с документами для регистрации {productLabel}
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-[12px] border border-[#E5E0EB] bg-white p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Что дальше</p>
                <div className="mt-3 flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Держите телефон рядом. Если понадобится уточнить отделение или тариф, менеджер подскажет следующий шаг.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-[12px] bg-brand-light p-4">
                  <p className="text-xs text-muted-foreground">Клиент</p>
                  <p className="mt-1 break-words text-sm font-semibold">{clientName}</p>
                </div>
                <div className="rounded-[12px] bg-brand-light p-4">
                  <p className="text-xs text-muted-foreground">Отделение</p>
                  <p className="mt-1 break-words text-sm font-semibold">{office}</p>
                </div>
              </div>
            </div>
          </section>

          <Button
            className="h-12 w-full"
            onClick={() => {
              clearDraft();
              navigate("/");
            }}
          >
            На главную
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light">
      <AppHeader showBack>
        <AutosaveIndicator />
      </AppHeader>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-8">
        <section className="overflow-hidden rounded-[16px] border border-[#E5E0EB] bg-white">
          <div className="border-b border-[#E5E0EB] bg-[#F7F5FB] px-5 py-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-white text-primary ring-1 ring-[#E5E0EB]">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-3">
                <div className="inline-flex rounded-[8px] bg-white px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-[#E5E0EB]">
                  1 месяц обслуживания бесплатно
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight">Заявка на открытие счёта</h1>
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Первый месяц бесплатно при открытии счёта вместе с подачей документов.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex items-start gap-3 rounded-[12px] bg-brand-light p-4">
              <Gift className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Для новых клиентов</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Менеджер подготовит заявку на счёт вместе с регистрационным пакетом.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rko-name">ФИО</Label>
              <Input id="rko-name" value={clientName} onChange={(event) => setClientName(event.target.value)} className="h-12 bg-[#F5F5F5]" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Форма бизнеса</Label>
                <div className="flex h-12 items-center gap-2 rounded-[8px] border border-[#E5E0EB] bg-[#F5F5F5] px-3 text-sm font-medium">
                  <Building2 className="h-4 w-4 text-primary" />
                  {productLabel}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rko-phone">Телефон</Label>
                <Input id="rko-phone" value={phone} onChange={(event) => setPhone(event.target.value)} className="h-12 bg-[#F5F5F5]" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rko-email">Email</Label>
              <Input
                id="rko-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`h-12 bg-[#F5F5F5] ${email && !isValidEmail(email) ? "border-destructive" : ""}`}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Регион</Label>
                <Select value={region} onValueChange={(value) => handleRegionChange(value as VisitRegion)}>
                  <SelectTrigger className="h-12 bg-[#F5F5F5]">
                    <SelectValue />
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
              <div className="space-y-2">
                <Label>Город</Label>
                <Select value={city} onValueChange={handleCityChange}>
                  <SelectTrigger className="h-12 bg-[#F5F5F5]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Адрес отделения</Label>
              <Select value={office} onValueChange={setOffice}>
                <SelectTrigger className="h-12 bg-[#F5F5F5]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {offices.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            <Button className="h-12 w-full" disabled={!canSubmit} onClick={submitRequest}>
              Отправить заявку на счёт
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

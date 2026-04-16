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
import { Building2, Check, CheckCircle2, Copy, FileText, Gift, Phone, Send } from "lucide-react";

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
  const [copied, setCopied] = useState(false);

  const appNumber = useMemo(() => {
    const date = new Date();
    const num = Math.floor(10000 + Math.random() * 90000);
    return `РС-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${num}`;
  }, []);

  const appDate = useMemo(() => {
    return new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(appNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const rkoSteps = [
    { title: "Звонок менеджера", desc: "В течение 1 рабочего дня" },
    { title: "Визит в отделение", desc: "Паспорт + подпись документов (около 15 мин)" },
    { title: "Открытие счёта", desc: "Банк активирует расчётный счёт" },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-light">
        <AppHeader />
        <main className="mx-auto max-w-lg space-y-5 px-4 py-10">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[16px] bg-white ring-1 ring-[#E5E0EB]">
              <CheckCircle2 className="h-7 w-7 text-[#34C759]" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-medium tracking-tight">Заявка на открытие счёта принята</h1>
              <p className="text-sm text-muted-foreground">Менеджер позвонит в течение 1 рабочего дня, чтобы согласовать дальнейшие шаги.</p>
            </div>
          </div>

          <section className="rounded-[16px] border border-[#E5E0EB] bg-white">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5E0EB] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#6440BF]">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Номер заявки</p>
                  <p className="font-mono text-base font-bold tracking-wide">{appNumber}</p>
                </div>
              </div>
              <button onClick={handleCopy} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Скопировано" : "Копировать"}
              </button>
            </div>
            <div className="divide-y divide-[#E5E0EB] px-5">
              <div className="flex items-start justify-between gap-4 py-3">
                <span className="text-sm text-muted-foreground">Дата подачи</span>
                <span className="text-right text-sm font-medium">{appDate}</span>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <span className="text-sm text-muted-foreground">Клиент</span>
                <span className="max-w-[60%] break-words text-right text-sm font-medium">{clientName}</span>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <span className="text-sm text-muted-foreground">Отделение</span>
                <span className="max-w-[60%] break-words text-right text-sm font-medium">{office}</span>
              </div>
            </div>
          </section>

          <section className="rounded-[16px] border border-[#E5E0EB] bg-white p-5">
            <p className="mb-4 text-sm font-semibold">Что дальше</p>
            <div className="space-y-0">
              {rkoSteps.map((step, index) => (
                <div key={step.title} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0ECFA]">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    {index < rkoSteps.length - 1 && <div className="my-1 h-8 w-px bg-border" />}
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Button
            variant="outline"
            className="h-12 w-full"
            onClick={() => navigate("/my-applications")}
          >
            Открыть мои заявки
          </Button>
          <Button
            variant="outline"
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

      <main className="mx-auto max-w-2xl space-y-3 px-4 py-4">
        <section className="overflow-hidden rounded-[16px] border border-[#E5E0EB] bg-white">
          <div className="border-b border-[#E5E0EB] bg-[#F7F5FB] px-4 py-3">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-white text-primary ring-1 ring-[#E5E0EB]">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <div className="inline-flex rounded-[8px] bg-white px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-[#E5E0EB]">
                  1 месяц обслуживания бесплатно
                </div>
                <div className="space-y-0.5">
                  <h1 className="text-xl font-medium tracking-tight">Заявка на открытие счёта</h1>
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Первый месяц бесплатно при открытии счёта вместе с подачей документов.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4">
            <div className="flex items-start gap-3 rounded-[12px] bg-brand-light p-3">
              <Gift className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Для новых клиентов</p>
                <p className="text-sm text-muted-foreground">
                  Менеджер подготовит заявку на счёт вместе с регистрационным пакетом.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rko-name">ФИО</Label>
              <Input id="rko-name" value={clientName} onChange={(event) => setClientName(event.target.value)} className="h-10 bg-[#F5F5F5]" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Форма бизнеса</Label>
                <div className="flex h-10 items-center gap-2 rounded-[8px] border border-[#E5E0EB] bg-[#F5F5F5] px-3 text-sm font-medium">
                  <Building2 className="h-4 w-4 text-primary" />
                  {productLabel}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rko-phone">Телефон</Label>
                <Input id="rko-phone" value={phone} onChange={(event) => setPhone(event.target.value)} className="h-10 bg-[#F5F5F5]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rko-email">Email</Label>
              <Input
                id="rko-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`h-10 bg-[#F5F5F5] ${email && !isValidEmail(email) ? "border-destructive" : ""}`}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Регион</Label>
                <Select value={region} onValueChange={(value) => handleRegionChange(value as VisitRegion)}>
                  <SelectTrigger className="h-10 bg-[#F5F5F5]">
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
              <div className="space-y-1.5">
                <Label>Город</Label>
                <Select value={city} onValueChange={handleCityChange}>
                  <SelectTrigger className="h-10 bg-[#F5F5F5]">
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

            <div className="space-y-1.5">
              <Label>Адрес отделения</Label>
              <Select value={office} onValueChange={setOffice}>
                <SelectTrigger className="h-10 bg-[#F5F5F5]">
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

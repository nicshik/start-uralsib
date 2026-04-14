import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { ApplicantCitizenship, IdentityDocumentType } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { getApplicantValidation, getBusinessValidation } from "@/lib/applicationValidation";
import { TAX_REGIMES } from "@/lib/mockData";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Briefcase,
  CheckCircle2,
  FileText,
  MonitorUp,
  PenTool,
  Search,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type AgentProduct = "ip" | "ooo";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export default function ManagerWorkspace() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const initialProduct: AgentProduct = state.productType === "ooo" ? "ooo" : "ip";
  const initialName = [state.passport.lastName, state.passport.firstName, state.passport.middleName].filter(Boolean).join(" ");
  const hasOnlineData = Boolean(
      state.phone ||
      state.email ||
      state.passport.lastName ||
      state.business.okvedCodes.length ||
      state.business.companyName ||
      state.submitted,
  );

  const [agentProduct, setAgentProduct] = useState<AgentProduct>(initialProduct);
  const [clientName, setClientName] = useState(initialName || "");
  const [clientPhone, setClientPhone] = useState(state.phone || "");
  const [clientEmail, setClientEmail] = useState(state.email || "");
  const [clientInn, setClientInn] = useState(state.passport.inn || "");
  const [citizenship, setCitizenship] = useState<ApplicantCitizenship>(state.passport.citizenship || "ru");
  const [documentType, setDocumentType] = useState<IdentityDocumentType>(state.passport.documentType || "passport_rf");
  const [companyName, setCompanyName] = useState(state.business.companyName || "");
  const [tax, setTax] = useState(state.business.taxRegime || "usn6");
  const [okvedText, setOkvedText] = useState(
    state.business.okvedCodes.length
      ? state.business.okvedCodes.join("\n")
      : "62.01 Разработка компьютерного программного обеспечения",
  );
  const [founderAddress, setFounderAddress] = useState(state.business.founderRegistrationAddress || state.passport.registrationAddress || "");
  const [address, setAddress] = useState(state.business.legalAddress || state.business.founderRegistrationAddress || state.passport.registrationAddress || "");
  const [directorPosition, setDirectorPosition] = useState(state.business.directorPosition || "Генеральный директор");
  const [directorTerm, setDirectorTerm] = useState(state.business.directorTerm || "");
  const [charterType, setCharterType] = useState(state.business.charterType || "generated");
  const [hasSeal, setHasSeal] = useState(state.business.hasSeal ? "yes" : "no");
  const [managerNotes, setManagerNotes] = useState(state.business.managerReason || "");
  const [tariff, setTariff] = useState("start");
  const [completed, setCompleted] = useState(false);

  const sourceLabel = hasOnlineData
    ? state.flowType === "manager"
      ? "Заявка заполнена с сотрудником"
      : "Клиент начал онлайн"
    : "Новая заявка в офисе";

  const selectedTax = useMemo(() => TAX_REGIMES.find((item) => item.id === tax), [tax]);
  const availableRegimes = useMemo(
    () => TAX_REGIMES.filter((item) => item.availableFor.includes(agentProduct)),
    [agentProduct],
  );
  const managerReasons = useMemo(() => {
    if (agentProduct === "ooo") return getBusinessValidation("ooo", state.business).managerReasons;

    return getApplicantValidation(
      "ip",
      { ...state.passport, citizenship, documentType },
      clientEmail,
      clientPhone,
      state.business,
    ).managerReasons;
  }, [agentProduct, citizenship, clientEmail, clientPhone, documentType, state.business, state.passport]);

  useEffect(() => {
    if (!availableRegimes.some((item) => item.id === tax)) {
      setTax(availableRegimes[0]?.id || "usn6");
    }
  }, [agentProduct, availableRegimes, tax]);

  useEffect(() => {
    trackEvent("page_view", {
      page: "office_agent",
      flowType: state.flowType,
      source: hasOnlineData ? "draft_or_submitted" : "office_new",
    });
    trackEvent("office_agent_view", {
      flowType: state.flowType,
      source: hasOnlineData ? "draft_or_submitted" : "office_new",
    });
  }, [hasOnlineData, state.flowType]);

  const canComplete =
    clientName.trim().length > 3 &&
    clientPhone.replace(/\D/g, "").length >= 10 &&
    isValidEmail(clientEmail) &&
    okvedText.trim().length > 5 &&
    address.trim().length >= 5 &&
    (agentProduct === "ip"
      ? Boolean(citizenship && documentType)
      : companyName.trim().length > 2 &&
        founderAddress.trim().length >= 5 &&
        directorPosition.trim().length > 2 &&
        directorTerm.trim().length > 0);

  const handleSign = () => {
    const okvedCodes = okvedText
      .split("\n")
      .map((line) => line.trim().split(/\s+/)[0])
      .filter(Boolean);
    const primaryOkvedCode = state.business.primaryOkvedCode && okvedCodes.includes(state.business.primaryOkvedCode)
      ? state.business.primaryOkvedCode
      : okvedCodes[0];
    const [lastName, firstName, ...middleNameParts] = clientName.trim().split(/\s+/);

    dispatch({ type: "SET_PRODUCT", payload: agentProduct });
    dispatch({ type: "SET_PHONE", payload: clientPhone });
    dispatch({ type: "SET_EMAIL", payload: clientEmail });
    dispatch({
      type: "UPDATE_PASSPORT",
      payload: {
        lastName: lastName || state.passport.lastName,
        firstName: firstName || state.passport.firstName,
        middleName: middleNameParts.join(" ") || state.passport.middleName,
        citizenship,
        documentType,
        inn: clientInn,
        registrationAddress: agentProduct === "ip" ? address : founderAddress,
      },
    });
    dispatch({
      type: "UPDATE_BUSINESS",
      payload: {
        companyName,
        legalEntityEmail: agentProduct === "ooo" ? clientEmail : state.business.legalEntityEmail,
        entrepreneurEmail: agentProduct === "ip" ? clientEmail : state.business.entrepreneurEmail,
        registrationResultEmail: clientEmail,
        taxRegime: tax,
        okvedCodes,
        primaryOkvedCode,
        capitalType: "charter",
        legalLocation: address.split(",")[0]?.trim() || address,
        founderDocumentType: "passport_rf",
        founderRegistrationAddress: founderAddress,
        founderSharePercent: "100",
        legalAddress: address,
        directorPosition,
        directorTerm,
        charterType: charterType as "generated" | "custom",
        typicalCharterNumber: state.business.typicalCharterNumber || "36",
        applicantRole: "founder_individual",
        hasSeal: hasSeal === "yes",
        requiresManager: agentProduct === "ooo" && managerReasons.length > 0,
        managerReason: managerNotes || managerReasons[0],
      },
    });

    trackEvent("office_agent_completed", {
      flowType: state.flowType,
      source: hasOnlineData ? "draft_or_submitted" : "office_new",
      product: agentProduct,
      tariff,
      tax,
      emailProvided: true,
      complexOoo: agentProduct === "ooo" && managerReasons.length > 0,
      managerNotesProvided: managerNotes.trim().length > 0,
    });
    trackEvent("manager_workspace_completed", { flowType: state.flowType });
    setCompleted(true);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans text-slate-800">
      <aside className="fixed left-0 top-0 z-10 flex h-full w-64 flex-col bg-[#1E293B] text-slate-200">
        <div className="border-b border-slate-700/50 p-5">
          <div className="mb-1 text-lg font-bold tracking-tight text-white">УРАЛСИБ | CRM</div>
          <div className="text-xs text-slate-400">Единое окно сотрудника</div>
        </div>

        <div className="flex-1 space-y-4 p-4">
          <div className="rounded-lg bg-slate-800 p-3">
            <div className="mb-1 text-xs text-slate-400">Сотрудник</div>
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <User className="h-4 w-4" /> Константинов М.А.
            </div>
            <div className="mt-1 text-xs text-slate-400">ДО «Петровский», Окно 4</div>
          </div>

          <nav className="space-y-1">
            <button className="flex w-full items-center gap-3 rounded-md bg-[#6440BF] px-3 py-2 text-sm font-medium text-white">
              <CheckCircle2 className="h-4 w-4" /> Текущая заявка
            </button>
            <button
              onClick={() => navigate("/assisted-start")}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800"
            >
              <MonitorUp className="h-4 w-4" /> Assisted-вход
            </button>
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800">
              <Search className="h-4 w-4" /> Поиск клиентов
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-700/50 p-4">
          <button onClick={() => navigate("/")} className="text-xs text-slate-400 transition-colors hover:text-white">
            &larr; Вернуться на клиентский сайт
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <header className="mb-8 flex items-end justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Рабочее место сотрудника</h1>
            <p className="mt-1 text-sm text-slate-500">Номер заявки: #UR-849-21-APP</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              <BadgeCheck className="mr-1.5 h-4 w-4" />
              {sourceLabel}
            </span>
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Клиент рядом
            </span>
          </div>
        </header>

        {completed ? (
          <div className="flex h-64 flex-col items-center justify-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Документы отправлены в ФНС</h2>
            <p className="text-muted-foreground">
              Пакет документов ушел на регистрацию. Счет будет активирован после отбивки из налоговой.
            </p>
            <Button onClick={() => navigate("/assisted-start")} variant="outline" className="mt-4">
              Следующий клиент
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-5">
              <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                <CardHeader className="border-b border-gray-100 bg-slate-50/50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <User className="h-4 w-4 text-slate-400" />
                    Вводные клиента
                  </CardTitle>
                  <CardDescription>Данные можно собрать здесь или продолжить assisted-заявку с сайта.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Форма бизнеса</Label>
                    <RadioGroup value={agentProduct} onValueChange={(value) => setAgentProduct(value as AgentProduct)} className="grid grid-cols-2 gap-3">
                      <div>
                        <RadioGroupItem value="ip" id="agent-ip" className="peer sr-only" />
                        <Label
                          htmlFor="agent-ip"
                          className="flex cursor-pointer items-center gap-2 rounded-md border-2 border-muted bg-white p-3 text-sm hover:bg-slate-50 peer-data-[state=checked]:border-[#6440BF]"
                        >
                          <Briefcase className="h-4 w-4 text-[#6440BF]" />
                          ИП
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="ooo" id="agent-ooo" className="peer sr-only" />
                        <Label
                          htmlFor="agent-ooo"
                          className="flex cursor-pointer items-center gap-2 rounded-md border-2 border-muted bg-white p-3 text-sm hover:bg-slate-50 peer-data-[state=checked]:border-[#6440BF]"
                        >
                          <Building2 className="h-4 w-4 text-[#6440BF]" />
                          ООО
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="agent-name">ФИО клиента</Label>
                      <Input
                        id="agent-name"
                        value={clientName}
                        onChange={(event) => setClientName(event.target.value)}
                        placeholder="Иванов Иван Иванович"
                        className="h-10 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agent-phone">Телефон</Label>
                      <Input
                        id="agent-phone"
                        type="tel"
                        value={clientPhone}
                        onChange={(event) => setClientPhone(event.target.value)}
                        placeholder="+7 (___) ___-__-__"
                        className="h-10 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agent-email">Email</Label>
                      <Input
                        id="agent-email"
                        type="email"
                        value={clientEmail}
                        onChange={(event) => setClientEmail(event.target.value)}
                        placeholder="example@mail.ru"
                        className={`h-10 bg-white ${clientEmail && !isValidEmail(clientEmail) ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agent-inn">ИНН</Label>
                      <Input
                        id="agent-inn"
                        value={clientInn}
                        onChange={(event) => setClientInn(event.target.value)}
                        placeholder="770012345678"
                        className="h-10 bg-white"
                      />
                    </div>
                    {agentProduct === "ip" && (
                      <>
                        <div className="space-y-2">
                          <Label>Гражданство</Label>
                          <Select value={citizenship} onValueChange={(value) => setCitizenship(value as ApplicantCitizenship)}>
                            <SelectTrigger className="h-10 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ru">Гражданин РФ</SelectItem>
                              <SelectItem value="foreign">Иностранный гражданин</SelectItem>
                              <SelectItem value="stateless">Лицо без гражданства</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Документ</Label>
                          <Select value={documentType} onValueChange={(value) => setDocumentType(value as IdentityDocumentType)}>
                            <SelectTrigger className="h-10 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="passport_rf">Паспорт гражданина РФ</SelectItem>
                              <SelectItem value="other">Иной документ</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    {agentProduct === "ooo" && (
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="agent-company">Наименование ООО</Label>
                        <Input
                          id="agent-company"
                          value={companyName}
                          onChange={(event) => setCompanyName(event.target.value)}
                          placeholder='ООО "Альфа"'
                          className="h-10 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                <CardHeader className="border-b border-gray-100 bg-slate-50/50 pb-4">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    {agentProduct === "ooo" ? <Building2 className="h-4 w-4 text-[#6440BF]" /> : <Briefcase className="h-4 w-4 text-[#6440BF]" />}
                    Бизнес и документы
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Налоговый режим</Label>
                    <Select value={tax} onValueChange={setTax}>
                      <SelectTrigger className="h-10 bg-white">
                        <SelectValue placeholder="Выберите режим" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRegimes.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTax && <p className="text-xs text-slate-500">{selectedTax.description}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="agent-okveds">ОКВЭД</Label>
                    <Textarea
                      id="agent-okveds"
                      value={okvedText}
                      onChange={(event) => setOkvedText(event.target.value)}
                      placeholder="62.01 Разработка компьютерного программного обеспечения"
                      className="min-h-24 bg-white text-sm"
                    />
                    <p className="text-xs text-slate-500">Можно вставить один или несколько кодов, которые клиент назвал на консультации.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 xl:col-span-7">
              {agentProduct === "ip" && managerReasons.length > 0 && (
                <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                  <CardHeader className="border-b border-gray-100 bg-amber-50/70 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-amber-950">
                      <AlertCircle className="h-4 w-4" />
                      Сложный ИП-сценарий
                    </CardTitle>
                    <CardDescription>
                      Причины перевода к менеджеру по данным Р21001.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="list-disc space-y-1 pl-4 text-sm text-amber-900">
                      {managerReasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {agentProduct === "ooo" && (
                <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                  <CardHeader className="border-b border-gray-100 bg-amber-50/70 pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-amber-950">
                      <AlertCircle className="h-4 w-4" />
                      Оформление с помощью менеджера
                    </CardTitle>
                    <CardDescription>
                      Причины перевода и поля, которые менеджер проверяет перед подготовкой пакета.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {managerReasons.length > 0 ? (
                      <ul className="list-disc space-y-1 pl-4 text-sm text-amber-900">
                        {managerReasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">Ограничений онлайн-сценария не отмечено, но данные ООО нужно сверить перед подписанием.</p>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="agent-founder-address">Адрес регистрации учредителя</Label>
                        <Input
                          id="agent-founder-address"
                          value={founderAddress}
                          onChange={(event) => setFounderAddress(event.target.value)}
                          placeholder="Адрес по паспорту"
                          className="h-10 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="agent-director-position">Должность руководителя</Label>
                        <Input
                          id="agent-director-position"
                          value={directorPosition}
                          onChange={(event) => setDirectorPosition(event.target.value)}
                          placeholder="Генеральный директор"
                          className="h-10 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="agent-director-term">Срок избрания</Label>
                        <Input
                          id="agent-director-term"
                          value={directorTerm}
                          onChange={(event) => setDirectorTerm(event.target.value)}
                          placeholder="Например, 5 лет"
                          className="h-10 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Устав</Label>
                        <RadioGroup value={charterType} onValueChange={setCharterType} className="grid gap-2">
                          <Label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm [&:has([data-state=checked])]:border-[#6440BF]">
                            <RadioGroupItem value="generated" />
                            Сгенерировать по шаблону
                          </Label>
                          <Label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm [&:has([data-state=checked])]:border-[#6440BF]">
                            <RadioGroupItem value="custom" />
                            Свой устав / документы
                          </Label>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label>Печать</Label>
                        <RadioGroup value={hasSeal} onValueChange={setHasSeal} className="grid gap-2">
                          <Label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm [&:has([data-state=checked])]:border-[#6440BF]">
                            <RadioGroupItem value="no" />
                            Без печати
                          </Label>
                          <Label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm [&:has([data-state=checked])]:border-[#6440BF]">
                            <RadioGroupItem value="yes" />
                            С печатью
                          </Label>
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="agent-manager-notes">Комментарий менеджера</Label>
                      <Textarea
                        id="agent-manager-notes"
                        value={managerNotes}
                        onChange={(event) => setManagerNotes(event.target.value)}
                        placeholder="Что проверить перед подписанием"
                        className="min-h-20 bg-white text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                <CardHeader className="bg-[#1E293B] text-white">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PenTool className="h-5 w-5" />
                    Завершение заявки в офисе
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Сотрудник сверяет данные, выбирает РКО и передает пакет на подписание клиенту.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-base font-semibold">
                      1. Подтверждение юридического адреса
                      <span className="ml-auto flex items-center gap-1 text-xs font-normal text-slate-400">
                        <Search className="h-3 w-3" /> Поиск по ФИАС
                      </span>
                    </Label>
                    <Input
                      placeholder="Начните вводить адрес (город, улица, дом)..."
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      className="h-10 border-slate-300 bg-white focus-visible:ring-[#6440BF]"
                    />
                    <div className="text-xs text-slate-500">
                      Адрес должен точно совпадать с государственным реестром. При необходимости запросите договор аренды.
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">2. Выбор тарифа расчётно-кассового обслуживания</Label>
                    <RadioGroup value={tariff} onValueChange={setTariff} className="grid grid-cols-2 gap-4">
                      <div>
                        <RadioGroupItem value="start" id="start" className="peer sr-only" />
                        <Label
                          htmlFor="start"
                          className="flex cursor-pointer flex-col items-start justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-[#6440BF]"
                        >
                          <div className="mb-1 font-semibold">Начни с нуля</div>
                          <div className="mb-2 text-xs text-muted-foreground">0 ₽/мес, бесплатно навсегда</div>
                          <div className="text-xs font-medium text-[#6440BF]">Подходит для старта</div>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="growth" id="growth" className="peer sr-only" />
                        <Label
                          htmlFor="growth"
                          className="flex cursor-pointer flex-col items-start justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-[#6440BF]"
                        >
                          <div className="mb-1 font-semibold">Развитие</div>
                          <div className="mb-2 text-xs text-muted-foreground">990 ₽/мес, бесплатные переводы</div>
                          <div className="text-xs font-medium text-[#6440BF]">Для стабильной выручки</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-blue-950">3. Контроль перед подписанием</p>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>Клиент находится рядом и подтверждает корректность данных.</li>
                      <li>SMS-код вводится клиентом, не сотрудником.</li>
                      <li>Заявка уходит в отдельный assisted/office канал Метрики.</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <FileText className="h-4 w-4" />
                      Клиент получит SMS-код для подписания
                    </div>
                    <Button onClick={handleSign} disabled={!canComplete} className="bg-[#6440BF] px-8 hover:bg-[#503399]">
                      Подписать и отправить в ФНС
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

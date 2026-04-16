import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { ApplicantCitizenship, ApplicationStatus, BusinessData, IdentityDocumentType, PassportData } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { getApplicantValidation, getBusinessValidation } from "@/lib/applicationValidation";
import { TAX_REGIMES } from "@/lib/mockData";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  Hash,
  Inbox,
  MapPin,
  MonitorUp,
  PenTool,
  PlusCircle,
  Search,
  User,
} from "lucide-react";
import { MOCK_INCOMING_APPLICATIONS } from "@/lib/mockApplications";
import type { MockIncomingApplication } from "@/lib/mockApplications";
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
  const [birthDate, setBirthDate] = useState(state.passport.birthDate || "");
  const [gender, setGender] = useState(state.passport.gender || "");
  const [birthPlace, setBirthPlace] = useState(state.passport.birthPlace || "");
  const [citizenship, setCitizenship] = useState<ApplicantCitizenship>(state.passport.citizenship || "ru");
  const [documentType, setDocumentType] = useState<IdentityDocumentType>(state.passport.documentType || "passport_rf");
  const [passportSeries, setPassportSeries] = useState(state.passport.passportSeries || "");
  const [passportNumber, setPassportNumber] = useState(state.passport.passportNumber || "");
  const [issuedBy, setIssuedBy] = useState(state.passport.issuedBy || "");
  const [issueDate, setIssueDate] = useState(state.passport.issueDate || "");
  const [divisionCode, setDivisionCode] = useState(state.passport.divisionCode || "");
  const [snils, setSnils] = useState(state.passport.snils || "");
  const [companyName, setCompanyName] = useState(state.business.companyName || "");
  const [charterCapital, setCharterCapital] = useState(state.business.charterCapital || "10000");
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
  const [completionStatus, setCompletionStatus] = useState<"office_crm_completed" | "submitted_to_fns" | null>(null);

  const [activeTab, setActiveTab] = useState<"current" | "inbox">("current");
  const [entrepreneurEmail, setEntrepreneurEmail] = useState(state.business.entrepreneurEmail || state.email || "");
  const [registrationEmail, setRegistrationEmail] = useState(state.business.registrationResultEmail || state.email || "");
  const [companyNameFull, setCompanyNameFull] = useState(state.business.companyNameFull || "");
  const [paperDocuments, setPaperDocuments] = useState(state.paperDocuments || false);
  const [founderSharePercent, setFounderSharePercent] = useState(state.business.founderSharePercent || "100");
  const [directorIsFounderState, setDirectorIsFounderState] = useState(state.business.directorIsFounder ?? true);
  const [applicantRole, setApplicantRole] = useState<string>(state.business.applicantRole || "founder_individual");
  const [registrationAddress, setRegistrationAddress] = useState(state.passport.registrationAddress || "");
  const [legalLocation, setLegalLocation] = useState(state.business.legalLocation || "");
  const [typicalCharterNumber, setTypicalCharterNumber] = useState(state.business.typicalCharterNumber || "36");
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);
  const [passportOpen, setPassportOpen] = useState(false);
  const [showEmailDetails, setShowEmailDetails] = useState(false);

  const sourceLabel = hasOnlineData
    ? state.applicationStatus === "online_light_submitted"
      ? "Предзаявка Online Light"
      : state.applicationStatus === "assisted_submitted"
        ? "Assisted-заявка"
        : "Клиент начал онлайн"
    : "Новая заявка в офисе";
  const visitSummary = state.visitPreference === "office"
    ? state.visitOffice
    : state.visitRegion && state.visitCity
      ? `${state.visitRegion}, ${state.visitCity}. Менеджер подбирает отделение`
      : "";

  const selectedTax = useMemo(() => TAX_REGIMES.find((item) => item.id === tax), [tax]);
  const availableRegimes = useMemo(
    () => TAX_REGIMES.filter((item) => item.availableFor.includes(agentProduct)),
    [agentProduct],
  );
  const okvedCodes = useMemo(
    () => okvedText
      .split("\n")
      .map((line) => line.trim().split(/\s+/)[0])
      .filter(Boolean),
    [okvedText],
  );
  const primaryOkvedCode = state.business.primaryOkvedCode && okvedCodes.includes(state.business.primaryOkvedCode)
    ? state.business.primaryOkvedCode
    : okvedCodes[0];
  const [lastName, firstName, ...middleNameParts] = clientName.trim().split(/\s+/);
  const draftPassport: PassportData = {
    ...state.passport,
    lastName: lastName || state.passport.lastName,
    firstName: firstName || state.passport.firstName,
    middleName: middleNameParts.join(" ") || state.passport.middleName,
    birthDate,
    gender,
    birthPlace,
    citizenship,
    documentType,
    passportSeries,
    passportNumber,
    issuedBy,
    issueDate,
    divisionCode,
    inn: clientInn,
    snils,
    registrationAddress: agentProduct === "ip" ? (registrationAddress || address) : founderAddress,
  };
  const draftBusiness: BusinessData = {
    ...state.business,
    companyName,
    companyNameFull: agentProduct === "ooo" ? companyNameFull : state.business.companyNameFull,
    legalEntityEmail: agentProduct === "ooo" ? clientEmail : state.business.legalEntityEmail,
    entrepreneurEmail: agentProduct === "ip" ? entrepreneurEmail : state.business.entrepreneurEmail,
    registrationResultEmail: registrationEmail,
    taxRegime: tax,
    okvedCodes,
    primaryOkvedCode,
    charterCapital,
    capitalType: "charter",
    legalLocation: legalLocation || address.split(",")[0]?.trim() || address,
    founderCount: state.business.founderCount || "one",
    founderCitizenship: state.business.founderCitizenship || "ru",
    founderDocumentType: "passport_rf",
    founderRegistrationAddress: founderAddress,
    founderSharePercent,
    legalAddress: address,
    directorIsFounder: directorIsFounderState,
    addressIsFounder: founderAddress.trim() === address.trim(),
    directorPosition,
    directorTerm,
    charterType: charterType as "generated" | "custom",
    typicalCharterNumber,
    applicantRole: applicantRole as "founder_individual",
    hasSeal: hasSeal === "yes",
    managerReason: managerNotes || state.business.managerReason,
  };
  const managerReasons = agentProduct === "ooo"
    ? getBusinessValidation("ooo", draftBusiness, { flowType: "office_crm", target: "fns_ready" }).managerReasons
    : getApplicantValidation(
      "ip",
      draftPassport,
      clientEmail,
      clientPhone,
      draftBusiness,
      { flowType: "office_crm", target: "fns_ready" },
    ).managerReasons;
  const fnsBusinessValidation = getBusinessValidation(agentProduct, draftBusiness, { flowType: "office_crm", target: "fns_ready" });
  const fnsApplicantValidation = getApplicantValidation(agentProduct, draftPassport, clientEmail, clientPhone, draftBusiness, {
    flowType: "office_crm",
    target: "fns_ready",
  });
  const officeCrmBusinessValidation = getBusinessValidation(agentProduct, draftBusiness, {
    flowType: "office_crm",
    target: "office_crm_complete",
  });
  const officeCrmApplicantValidation = getApplicantValidation(agentProduct, draftPassport, clientEmail, clientPhone, draftBusiness, {
    flowType: "office_crm",
    target: "office_crm_complete",
  });
  const officeCrmMissingFields = Array.from(new Set([
    ...officeCrmBusinessValidation.missingFields,
    ...officeCrmApplicantValidation.missingFields,
  ]));
  const fnsMissingFields = Array.from(new Set([
    ...fnsBusinessValidation.missingFields,
    ...fnsApplicantValidation.missingFields,
  ]));
  const fnsManagerReasons = Array.from(new Set([
    ...fnsBusinessValidation.managerReasons,
    ...fnsApplicantValidation.managerReasons,
  ]));
  const isFnsReady = fnsBusinessValidation.isComplete && fnsApplicantValidation.isComplete;

  useEffect(() => {
    if (state.flowType !== "office_crm") {
      dispatch({ type: "SET_FLOW", payload: "office_crm" });
    }
  }, [dispatch, state.flowType]);

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

  const canComplete = officeCrmBusinessValidation.isComplete && officeCrmApplicantValidation.isComplete;

  const handleSign = () => {
    const persistApplication = (status: ApplicationStatus, markSubmitted: boolean) => {
      dispatch({ type: "SET_PRODUCT", payload: agentProduct });
      dispatch({ type: "SET_PHONE", payload: clientPhone });
      dispatch({ type: "SET_EMAIL", payload: clientEmail });
      dispatch({ type: "UPDATE_PASSPORT", payload: draftPassport });
      dispatch({
        type: "UPDATE_BUSINESS",
        payload: {
          ...draftBusiness,
          requiresManager: agentProduct === "ooo" && managerReasons.length > 0,
          managerReason: managerNotes || managerReasons[0],
        },
      });
      dispatch({ type: "SET_APPLICATION_STATUS", payload: status });
      if (markSubmitted) {
        dispatch({ type: "SUBMIT" });
      }
    };

    if (isFnsReady && state.applicationStatus !== "fns_ready") {
      persistApplication("fns_ready", false);
      trackEvent("application_ready_for_documents", {
        flowType: "office_crm",
        product: agentProduct,
        applicationStatus: "fns_ready",
      });
      trackEvent("fns_ready", { flowType: "office_crm", product: agentProduct, applicationStatus: "fns_ready" });
      return;
    }

    const nextStatus = isFnsReady ? "submitted_to_fns" : "office_crm_completed";
    persistApplication(nextStatus, true);

    trackEvent("office_agent_completed", {
      flowType: "office_crm",
      source: hasOnlineData ? "draft_or_submitted" : "office_new",
      product: agentProduct,
      tariff,
      tax,
      applicationStatus: nextStatus,
      emailProvided: true,
      complexOoo: agentProduct === "ooo" && managerReasons.length > 0,
      managerNotesProvided: managerNotes.trim().length > 0,
    });
    trackEvent("office_crm_completed", { flowType: "office_crm", product: agentProduct, applicationStatus: nextStatus });
    if (isFnsReady) {
      trackEvent("submitted_to_fns", { flowType: "office_crm", product: agentProduct, applicationStatus: nextStatus });
    } else {
      trackEvent("manager_completed_missing_fields", {
        flowType: "office_crm",
        product: agentProduct,
        missingFields: fnsMissingFields,
        managerReasons: fnsManagerReasons,
        applicationStatus: nextStatus,
      });
    }
    trackEvent("manager_workspace_completed", { flowType: "office_crm", applicationStatus: nextStatus });
    setCompletionStatus(nextStatus);
  };

  const handleNewApplication = () => {
    setAgentProduct("ip");
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setClientInn("");
    setBirthDate("");
    setGender("");
    setBirthPlace("");
    setCitizenship("ru");
    setDocumentType("passport_rf");
    setPassportSeries("");
    setPassportNumber("");
    setIssuedBy("");
    setIssueDate("");
    setDivisionCode("");
    setSnils("");
    setRegistrationAddress("");
    setCompanyName("");
    setCompanyNameFull("");
    setCharterCapital("10000");
    setTax("usn6");
    setOkvedText("");
    setFounderAddress("");
    setAddress("");
    setDirectorPosition("Генеральный директор");
    setDirectorTerm("");
    setCharterType("generated");
    setHasSeal("no");
    setEntrepreneurEmail("");
    setRegistrationEmail("");
    setFounderSharePercent("100");
    setDirectorIsFounderState(true);
    setApplicantRole("founder_individual");
    setPaperDocuments(false);
    setLegalLocation("");
    setTypicalCharterNumber("36");
    setConfirmAccuracy(false);
    setManagerNotes("");
    setCompletionStatus(null);
    setPassportOpen(false);
    setShowEmailDetails(false);
    setActiveTab("current");
  };

  const loadApplicationToForm = (app: MockIncomingApplication) => {
    const p = app.passport;
    const b = app.business;
    setAgentProduct(app.type === "ooo" ? "ooo" : "ip");
    const fullName = [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ");
    setClientName(fullName);
    setClientPhone(app.phone);
    setClientEmail(app.email);
    setClientInn(p.inn || "");
    setBirthDate(p.birthDate || "");
    setGender(p.gender || "");
    setBirthPlace(p.birthPlace || "");
    setCitizenship(p.citizenship || "ru");
    setDocumentType(p.documentType || "passport_rf");
    setPassportSeries(p.passportSeries || "");
    setPassportNumber(p.passportNumber || "");
    setIssuedBy(p.issuedBy || "");
    setIssueDate(p.issueDate || "");
    setDivisionCode(p.divisionCode || "");
    setSnils(p.snils || "");
    setRegistrationAddress(p.registrationAddress || "");
    setCompanyName(b.companyName || "");
    setCompanyNameFull(b.companyNameFull || "");
    setCharterCapital(b.charterCapital || "10000");
    setTax(b.taxRegime || "usn6");
    setOkvedText(b.okvedCodes.join("\n"));
    setFounderAddress(b.founderRegistrationAddress || p.registrationAddress || "");
    setAddress(b.legalAddress || b.founderRegistrationAddress || p.registrationAddress || "");
    setDirectorPosition(b.directorPosition || "Генеральный директор");
    setDirectorTerm(b.directorTerm || "");
    setCharterType(b.charterType || "generated");
    setHasSeal(b.hasSeal ? "yes" : "no");
    setEntrepreneurEmail(b.entrepreneurEmail || app.email);
    setRegistrationEmail(b.registrationResultEmail || app.email);
    setFounderSharePercent(b.founderSharePercent || "100");
    setDirectorIsFounderState(b.directorIsFounder ?? true);
    setApplicantRole(b.applicantRole || "founder_individual");
    setPaperDocuments(app.paperDocuments);
    setLegalLocation(b.legalLocation || "");
    setTypicalCharterNumber(b.typicalCharterNumber || "36");
    setConfirmAccuracy(false);
    setManagerNotes("");
    setCompletionStatus(null);
    setPassportOpen(Boolean(p.passportSeries || p.passportNumber || p.birthDate));
    setShowEmailDetails(Boolean(b.entrepreneurEmail && b.entrepreneurEmail !== app.email));
    setActiveTab("current");
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

          <button
            onClick={handleNewApplication}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-[#6440BF]/50 bg-[#6440BF]/20 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6440BF]/40"
          >
            <PlusCircle className="h-4 w-4" /> Новая заявка
          </button>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("current")}
              className={`flex w-full flex-col items-start rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeTab === "current" ? "bg-[#6440BF] text-white" : "text-slate-300 hover:bg-slate-800"}`}
            >
              <span className="flex items-center gap-3">
                <ClipboardList className="h-4 w-4" />
                {clientName ? "В работе" : "Рабочее место"}
              </span>
              {clientName && (
                <span className={`ml-7 truncate text-xs font-normal ${activeTab === "current" ? "text-white/70" : "text-slate-400"}`}>
                  {clientName}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("inbox")}
              className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeTab === "inbox" ? "bg-[#6440BF] text-white" : "text-slate-300 hover:bg-slate-800"}`}
            >
              <span className="flex items-center gap-3"><Inbox className="h-4 w-4" /> Входящие заявки</span>
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${activeTab === "inbox" ? "bg-white/20 text-white" : "bg-amber-500 text-white"}`}>
                {MOCK_INCOMING_APPLICATIONS.length}
              </span>
            </button>
            <button
              onClick={() => navigate("/assisted-start")}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-800"
            >
              <MonitorUp className="h-4 w-4" /> Заявка вместе с клиентом
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
        {activeTab === "inbox" ? (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Входящие заявки</h1>
              <p className="mt-1 text-sm text-slate-500">Заявки клиентов, поступившие через онлайн-форму</p>
            </div>
            <div className="space-y-3">
              {MOCK_INCOMING_APPLICATIONS.map((app) => {
                const Icon = app.type === "ip" ? Briefcase : Building2;
                const isSubmitted = app.status === "submitted_to_fns" || app.status === "online_light_submitted" || app.status === "assisted_submitted";
                return (
                  <Card key={app.id} className="border-0 shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md">
                    <CardContent className="p-0">
                      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                          <Icon className="h-5 w-5 text-[#6440BF]" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <p className="font-semibold text-slate-900">{app.title}</p>
                          <p className="text-sm text-slate-500">{app.subtitle}</p>
                          <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Hash className="h-3 w-3" />{app.applicationNumber}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />{app.date}
                            </span>
                            <span>{app.phone}</span>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${isSubmitted ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-amber-50 text-amber-700 ring-amber-600/20"}`}>
                            {isSubmitted ? <CheckCircle2 className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                            {app.statusLabel}
                          </span>
                          <Button
                            size="sm"
                            className="bg-[#6440BF] hover:bg-[#503399]"
                            onClick={() => loadApplicationToForm(app)}
                          >
                            Открыть в CRM
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
        <>
        <header className="mb-8 flex items-end justify-between border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {clientName || "Новая заявка"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {clientName ? "Номер заявки: #UR-849-21-APP" : "Заполните данные клиента вместе с ним"}
            </p>
          </div>
          {clientName && (
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                <BadgeCheck className="mr-1.5 h-4 w-4" />
                {sourceLabel}
              </span>
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                Клиент рядом
              </span>
            </div>
          )}
        </header>

        {completionStatus ? (
          <div className="flex h-64 flex-col items-center justify-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">
              {completionStatus === "submitted_to_fns" ? "Документы отправлены в ФНС" : "Заявка сохранена в CRM"}
            </h2>
            <p className="text-muted-foreground">
              {completionStatus === "submitted_to_fns"
                ? "Пакет документов ушел на регистрацию. Счет будет активирован после отбивки из налоговой."
                : "Данные сохранены. Недостающие поля нужно дозаполнить перед передачей пакета в ФНС."}
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
                  {visitSummary && (
                    <div className="flex items-start gap-3 rounded-md border border-violet-100 bg-violet-50 p-3 text-sm text-violet-950">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#6440BF]" />
                      <div>
                        <p className="font-semibold">Предпочтение по визиту</p>
                        <p className="mt-1 text-violet-900">{visitSummary}</p>
                      </div>
                    </div>
                  )}

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
                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => setShowEmailDetails((prev) => !prev)}
                        className="flex items-center gap-1 text-xs text-[#6440BF] hover:underline"
                      >
                        <ChevronDown className={`h-3 w-3 transition-transform ${showEmailDetails ? "rotate-180" : ""}`} />
                        {showEmailDetails ? "Скрыть" : "Показать"} адреса для документов ФНС
                      </button>
                    </div>
                    {showEmailDetails && agentProduct === "ip" && (
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="agent-entrepreneur-email" className="text-sm">Email ИП <span className="text-xs font-normal text-slate-400">(Р21001, раздел 9)</span></Label>
                        <Input
                          id="agent-entrepreneur-email"
                          type="email"
                          value={entrepreneurEmail}
                          onChange={(event) => setEntrepreneurEmail(event.target.value)}
                          placeholder="email-ip@mail.ru"
                          className="h-10 bg-white"
                        />
                      </div>
                    )}
                    {showEmailDetails && (
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="agent-reg-email" className="text-sm">Email для ФНС <span className="text-xs font-normal text-slate-400">(лист Б/заявителя)</span></Label>
                        <Input
                          id="agent-reg-email"
                          type="email"
                          value={registrationEmail}
                          onChange={(event) => setRegistrationEmail(event.target.value)}
                          placeholder="result@mail.ru"
                          className="h-10 bg-white"
                        />
                      </div>
                    )}
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="text-sm font-semibold">Способ получения документов</Label>
                      <RadioGroup
                        value={paperDocuments ? "paper" : "electronic"}
                        onValueChange={(v) => setPaperDocuments(v === "paper")}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div>
                          <RadioGroupItem value="electronic" id="doc-electronic" className="peer sr-only" />
                          <Label htmlFor="doc-electronic" className="flex cursor-pointer items-center gap-2 rounded-md border-2 border-muted bg-white p-3 text-sm hover:bg-slate-50 peer-data-[state=checked]:border-[#6440BF]">
                            Электронно (по email)
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="paper" id="doc-paper" className="peer sr-only" />
                          <Label htmlFor="doc-paper" className="flex cursor-pointer items-center gap-2 rounded-md border-2 border-muted bg-white p-3 text-sm hover:bg-slate-50 peer-data-[state=checked]:border-[#6440BF]">
                            На бумажном носителе
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label>{agentProduct === "ooo" ? "Гражданство учредителя" : "Гражданство"} <span className="text-xs font-normal text-slate-400">({agentProduct === "ooo" ? "Р11001, лист физлица" : "Р21001, раздел 5"})</span></Label>
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
                      <Label>{agentProduct === "ooo" ? "Документ учредителя" : "Документ"} <span className="text-xs font-normal text-slate-400">(вид документа, раздел 6)</span></Label>
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
                    {agentProduct === "ooo" && (
                      <>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="agent-company">Краткое наименование ООО</Label>
                          <Input
                            id="agent-company"
                            value={companyName}
                            onChange={(event) => setCompanyName(event.target.value)}
                            placeholder='ООО "Альфа"'
                            className="h-10 bg-white"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="agent-company-full">Полное наименование ООО <span className="text-xs font-normal text-slate-400">(Р11001)</span></Label>
                          <Input
                            id="agent-company-full"
                            value={companyNameFull}
                            onChange={(event) => setCompanyNameFull(event.target.value)}
                            placeholder='Общество с ограниченной ответственностью "Альфа"'
                            className="h-10 bg-white"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="agent-capital">Уставный капитал (мин. 10 000 ₽)</Label>
                          <Input
                            id="agent-capital"
                            type="number"
                            min={10000}
                            value={charterCapital}
                            onChange={(event) => setCharterCapital(event.target.value)}
                            placeholder="10000"
                            className="h-10 bg-white"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Роль заявителя <span className="text-xs font-normal text-slate-400">(лист заявителя Р11001)</span></Label>
                          <Select value={applicantRole} onValueChange={setApplicantRole}>
                            <SelectTrigger className="h-10 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="founder_individual">Учредитель — физическое лицо</SelectItem>
                              <SelectItem value="founder_org_head">Руководитель юрлица-учредителя</SelectItem>
                              <SelectItem value="authorized">Уполномоченное лицо</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="agent-legal-location">Место нахождения юридического лица <span className="text-xs font-normal text-slate-400">(Р11001, раздел 3)</span></Label>
                          <Input
                            id="agent-legal-location"
                            value={legalLocation}
                            onChange={(event) => setLegalLocation(event.target.value)}
                            placeholder="г. Санкт-Петербург"
                            className="h-10 bg-white"
                          />
                          <p className="text-xs text-slate-500">Субъект РФ/муниципальный округ. Отличается от полного адреса (раздел 4).</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                <button
                  type="button"
                  onClick={() => setPassportOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between border-b border-gray-100 bg-slate-50/50 px-6 py-4 text-left transition-colors hover:bg-slate-100/80"
                >
                  <div className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    <FileText className="h-4 w-4 text-slate-400" />
                    Паспорт и проверка личности
                    {!passportOpen && (passportSeries || birthDate) && (
                      <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">заполнен</span>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${passportOpen ? "rotate-180" : ""}`} />
                </button>
                {passportOpen && (
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="agent-birth-date">Дата рождения</Label>
                      <Input
                        id="agent-birth-date"
                        value={birthDate}
                        onChange={(event) => setBirthDate(event.target.value)}
                        placeholder="15.03.1990"
                        className="h-10 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Пол</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="h-10 bg-white">
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Мужской">Мужской</SelectItem>
                          <SelectItem value="Женский">Женский</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="agent-birth-place">Место рождения</Label>
                      <Input
                        id="agent-birth-place"
                        value={birthPlace}
                        onChange={(event) => setBirthPlace(event.target.value)}
                        placeholder="г. Москва"
                        className="h-10 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agent-passport-series">Серия паспорта</Label>
                      <Input
                        id="agent-passport-series"
                        value={passportSeries}
                        onChange={(event) => setPassportSeries(event.target.value)}
                        placeholder="45 12"
                        className="h-10 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agent-passport-number">Номер паспорта</Label>
                      <Input
                        id="agent-passport-number"
                        value={passportNumber}
                        onChange={(event) => setPassportNumber(event.target.value)}
                        placeholder="345678"
                        className="h-10 bg-white"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="agent-issued-by">Кем выдан</Label>
                      <Input
                        id="agent-issued-by"
                        value={issuedBy}
                        onChange={(event) => setIssuedBy(event.target.value)}
                        placeholder="Отделом УФМС России..."
                        className="h-10 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agent-issue-date">Дата выдачи</Label>
                      <Input
                        id="agent-issue-date"
                        value={issueDate}
                        onChange={(event) => setIssueDate(event.target.value)}
                        placeholder="20.05.2010"
                        className="h-10 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agent-division-code">Код подразделения</Label>
                      <Input
                        id="agent-division-code"
                        value={divisionCode}
                        onChange={(event) => setDivisionCode(event.target.value)}
                        placeholder="770-045"
                        className="h-10 bg-white"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="agent-snils">СНИЛС <span className="text-xs font-normal text-slate-400">(банковский пакет)</span></Label>
                      <Input
                        id="agent-snils"
                        value={snils}
                        onChange={(event) => setSnils(event.target.value)}
                        placeholder="123-456-789 00"
                        className="h-10 bg-white"
                      />
                    </div>
                    {agentProduct === "ip" && (
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="agent-reg-address">Адрес регистрации по месту жительства <span className="text-xs font-normal text-slate-400">(Р21001, раздел 7)</span></Label>
                        <Input
                          id="agent-reg-address"
                          value={registrationAddress}
                          onChange={(event) => setRegistrationAddress(event.target.value)}
                          placeholder="г. Москва, ул. Тверская, д. 1, кв. 12"
                          className="h-10 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
                )}
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
                        <Label htmlFor="agent-founder-address">Адрес регистрации учредителя <span className="text-xs font-normal text-slate-400">(для юрадреса и банковского пакета)</span></Label>
                        <Input
                          id="agent-founder-address"
                          value={founderAddress}
                          onChange={(event) => setFounderAddress(event.target.value)}
                          placeholder="Адрес по паспорту"
                          className="h-10 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="agent-founder-share">Доля учредителя <span className="text-xs font-normal text-slate-400">(Р11001, лист учредителя)</span></Label>
                        <Input
                          id="agent-founder-share"
                          value={founderSharePercent}
                          onChange={(event) => setFounderSharePercent(event.target.value)}
                          placeholder="100"
                          className="h-10 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="block">Руководитель является учредителем <span className="text-xs font-normal text-slate-400">(Р11001)</span></Label>
                        <RadioGroup
                          value={directorIsFounderState ? "yes" : "no"}
                          onValueChange={(v) => setDirectorIsFounderState(v === "yes")}
                          className="grid grid-cols-2 gap-2"
                        >
                          <Label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm [&:has([data-state=checked])]:border-[#6440BF]">
                            <RadioGroupItem value="yes" />
                            Да
                          </Label>
                          <Label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm [&:has([data-state=checked])]:border-[#6440BF]">
                            <RadioGroupItem value="no" />
                            Нет
                          </Label>
                        </RadioGroup>
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
                        <Label htmlFor="agent-director-term">Срок избрания руководителя <span className="text-xs font-normal text-slate-400">(решение/устав)</span></Label>
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
                        <RadioGroup value={charterType} onValueChange={(v) => setCharterType(v as "custom" | "generated")} className="grid gap-2">
                          <Label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm [&:has([data-state=checked])]:border-[#6440BF]">
                            <RadioGroupItem value="generated" />
                            Сгенерировать по шаблону
                          </Label>
                          <Label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm [&:has([data-state=checked])]:border-[#6440BF]">
                            <RadioGroupItem value="custom" />
                            Свой устав / документы
                          </Label>
                        </RadioGroup>
                        {charterType === "generated" && (
                          <div className="mt-2 space-y-1">
                            <Label htmlFor="agent-charter-num" className="text-xs">Номер типового устава <span className="font-normal text-slate-400">(Р11001, раздел 8)</span></Label>
                            <Input
                              id="agent-charter-num"
                              value={typicalCharterNumber}
                              onChange={(event) => setTypicalCharterNumber(event.target.value)}
                              placeholder="36"
                              className="h-9 bg-white text-sm"
                            />
                          </div>
                        )}
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
                      <li>Заявка уходит в отдельный office/CRM канал Метрики.</li>
                    </ul>
                  </div>

                  <div className={`rounded-lg border p-4 ${isFnsReady ? "border-emerald-100 bg-emerald-50" : "border-amber-100 bg-amber-50"}`}>
                    <p className={`mb-2 text-sm font-semibold ${isFnsReady ? "text-emerald-950" : "text-amber-950"}`}>
                      4. Готовность к ФНС
                    </p>
                    {isFnsReady ? (
                      <p className="text-sm text-emerald-800">
                        Все обязательные поля заполнены. Пакет можно передать в ФНС.
                      </p>
                    ) : (
                      <div className="space-y-2 text-sm text-amber-900">
                        <p>Перед отправкой в ФНС нужно дозаполнить или проверить:</p>
                        <ul className="list-disc space-y-1 pl-5">
                          {fnsMissingFields.slice(0, 8).map((field) => (
                            <li key={field}>{field}</li>
                          ))}
                          {fnsManagerReasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <input
                      type="checkbox"
                      checked={confirmAccuracy}
                      onChange={(e) => setConfirmAccuracy(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[#6440BF]"
                    />
                    <span className="text-sm text-slate-700">
                      <span className="font-semibold">5. Подтверждение достоверности сведений</span>
                      <span className="ml-1 text-slate-500">(Р21001/Р11001, лист заявителя)</span>
                      <br />
                      Клиент подтверждает, что все указанные сведения достоверны и он несёт ответственность за их правильность.
                    </span>
                  </label>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="space-y-2 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {isFnsReady
                          ? state.applicationStatus === "fns_ready"
                            ? "Клиент получит SMS-код для подписания"
                            : "Пакет заполнен. Подтвердите готовность перед отправкой"
                          : "Сохраните заявку и продолжите дозаполнение"}
                      </div>
                      {!canComplete && officeCrmMissingFields.length > 0 && (
                        <p className="max-w-xl text-xs text-amber-700">
                          Для сохранения в CRM заполните: {officeCrmMissingFields.slice(0, 6).join(", ")}.
                        </p>
                      )}
                    </div>
                    <Button onClick={handleSign} disabled={!canComplete || !confirmAccuracy} className="bg-[#6440BF] px-8 hover:bg-[#503399]">
                      {isFnsReady
                        ? state.applicationStatus === "fns_ready"
                          ? "Передать пакет в ФНС"
                          : "Подтвердить готовность пакета"
                        : "Сохранить и отметить как дозаполнено"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        </>
        )}
      </main>
    </div>
  );
}

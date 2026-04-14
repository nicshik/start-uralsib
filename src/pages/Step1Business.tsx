import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { OKVED_CODES, TAX_REGIMES, OKVED_SECTIONS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProgressHeader } from "@/components/ProgressHeader";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { SupportBlock } from "@/components/SupportBlock";
import { MicroReinforcement } from "@/components/MicroReinforcement";
import { Search, X, Check, UserCheck, ChevronDown, Receipt, Briefcase, Sparkles, Building2, AlertCircle } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AiOkvedSuggest } from "@/components/AiOkvedSuggest";
import { getBusinessValidation, getCompanyFullName } from "@/lib/applicationValidation";
import type { BusinessData } from "@/context/AppContext";

type SubStep = "tax" | "okved" | "ooo";

const DIRECTOR_TERMS = [
  { value: "1 год", label: "1 год" },
  { value: "3 года", label: "3 года" },
  { value: "5 лет", label: "5 лет" },
  { value: "бессрочно", label: "Бессрочно" },
];

const getGeneratedFullName = (business: BusinessData, companyName: string) =>
  getCompanyFullName({ ...business, companyName, companyNameFull: "" });

export default function Step1Business() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState("");
  const [showComplete, setShowComplete] = useState(false);
  const [showAllCodes, setShowAllCodes] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<string | null>(null);
  const [showAiSuggest, setShowAiSuggest] = useState(false);
  const isOoo = state.productType === "ooo";

  const getSubStep = (): SubStep => {
    if (!state.business.taxRegime) return "tax";
    if (state.business.okvedCodes.length === 0) return "okved";
    if (isOoo) return "ooo";
    return "okved";
  };
  const [subStep, setSubStep] = useState<SubStep>(getSubStep);

  useEffect(() => {
    trackEvent("page_view", { page: "step1_business", flowType: state.flowType });
  }, [state.flowType]);

  useEffect(() => {
    if (!isOoo) return;

    const defaults: Partial<BusinessData> = {};
    if (!state.business.charterCapital) defaults.charterCapital = "10000";
    if (!state.business.directorPosition) defaults.directorPosition = "Генеральный директор";
    if (!state.business.charterType) defaults.charterType = "generated";
    if (state.business.hasSeal === undefined) defaults.hasSeal = false;

    if (Object.keys(defaults).length > 0) {
      dispatch({ type: "UPDATE_BUSINESS", payload: defaults });
    }
  }, [dispatch, isOoo, state.business]);

  const businessValidation = useMemo(
    () => getBusinessValidation(state.productType, state.business),
    [state.productType, state.business],
  );
  const showManagerPrompt = isOoo && businessValidation.managerReasons.length > 0;

  const filteredCodes = useMemo(() => {
    let codes = OKVED_CODES;
    if (sectionFilter) {
      codes = codes.filter((c) => c.section === sectionFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      codes = codes.filter(
        (c) => c.code.includes(q) || c.name.toLowerCase().includes(q) || (c.section && c.section.toLowerCase().includes(q))
      );
    }
    if (!search && !sectionFilter && !showAllCodes) return codes.slice(0, 8);
    return codes;
  }, [search, showAllCodes, sectionFilter]);

  const updateBusiness = (payload: Partial<BusinessData>) => {
    const nextBusiness = { ...state.business, ...payload };
    const managerReasons = getBusinessValidation("ooo", nextBusiness).managerReasons;
    dispatch({
      type: "UPDATE_BUSINESS",
      payload: {
        ...payload,
        requiresManager: managerReasons.length > 0,
        managerReason: managerReasons[0],
      },
    });
  };

  const updateCompanyName = (companyName: string) => {
    const previousGeneratedName = getGeneratedFullName(state.business, state.business.companyName || "");
    const payload: Partial<BusinessData> = { companyName };
    if (!state.business.companyNameFull || state.business.companyNameFull === previousGeneratedName) {
      payload.companyNameFull = getGeneratedFullName(state.business, companyName);
    }
    updateBusiness(payload);
  };

  const toggleOkved = (code: string) => {
    const current = state.business.okvedCodes;
    const updated = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];
    const primaryOkvedCode = current.includes(code)
      ? state.business.primaryOkvedCode === code
        ? updated[0]
        : state.business.primaryOkvedCode
      : state.business.primaryOkvedCode || code;

    dispatch({ type: "UPDATE_BUSINESS", payload: { okvedCodes: updated, primaryOkvedCode } });
    trackEvent("okved_toggled", { code, selected: !current.includes(code), flowType: state.flowType });
  };

  const setPrimaryOkved = (code: string) => {
    dispatch({ type: "UPDATE_BUSINESS", payload: { primaryOkvedCode: code } });
    trackEvent("primary_okved_selected", { code, flowType: state.flowType });
  };

  const setTax = (id: string) => {
    dispatch({ type: "UPDATE_BUSINESS", payload: { taxRegime: id } });
    trackEvent("tax_selected", { regime: id, flowType: state.flowType });
    setTimeout(() => setSubStep("okved"), 300);
  };

  const okvedReady = Boolean(
    state.business.taxRegime &&
    state.business.okvedCodes.length > 0 &&
    state.business.primaryOkvedCode &&
    state.business.okvedCodes.includes(state.business.primaryOkvedCode),
  );
  const canProceed =
    (subStep === "tax" && Boolean(state.business.taxRegime)) ||
    (subStep === "okved" && okvedReady) ||
    (subStep === "ooo" && businessValidation.isComplete);

  const handleNext = () => {
    if (subStep === "tax" && state.business.taxRegime) {
      setSubStep("okved");
      return;
    }
    if (subStep === "okved" && isOoo) {
      setSubStep("ooo");
      return;
    }
    if (!businessValidation.isComplete) return;

    dispatch({ type: "SET_STEP", payload: 2 });
    trackEvent("step1_completed", {
      okvedCount: state.business.okvedCodes.length,
      taxRegime: state.business.taxRegime,
      primaryOkved: state.business.primaryOkvedCode,
      flowType: state.flowType,
    });
    if (state.flowType === "manager") {
      trackEvent("assisted_step_completed", { step: 1, flowType: "manager" });
    }
    setShowComplete(true);
    setTimeout(() => navigate("/step/2"), 1500);
  };

  const productLabel = isOoo ? "ООО" : "ИП";
  const availableRegimes = TAX_REGIMES.filter((t) => !state.productType || t.availableFor.includes(state.productType));
  const selectedTax = TAX_REGIMES.find((t) => t.id === state.business.taxRegime);

  return (
    <div className="min-h-screen pb-24 bg-brand-light">
      <AppHeader showBack>
        <AutosaveIndicator />
      </AppHeader>
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <ProgressHeader step={1} totalSteps={3} timeEstimate={isOoo ? "5 минут" : "3 минуты"} />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {showComplete && (
          <MicroReinforcement message="Шаг 1 готов. Осталось подтвердить паспорт" />
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button
            onClick={() => setSubStep("tax")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${subStep === "tax" ? "bg-primary text-white font-medium" : selectedTax ? "bg-accent text-accent-foreground" : "bg-muted"}`}
          >
            <Receipt className="h-3 w-3" />
            {selectedTax ? selectedTax.name : "Налоги"}
          </button>
          <div className="w-4 h-px bg-border" />
          <button
            onClick={() => state.business.taxRegime ? setSubStep("okved") : undefined}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${subStep === "okved" ? "bg-primary text-white font-medium" : state.business.okvedCodes.length > 0 && state.business.primaryOkvedCode ? "bg-accent text-accent-foreground" : "bg-muted"}`}
          >
            <Briefcase className="h-3 w-3" />
            ОКВЭД {state.business.okvedCodes.length > 0 && `(${state.business.okvedCodes.length})`}
          </button>
          {isOoo && (
            <>
              <div className="w-4 h-px bg-border" />
              <button
                onClick={() => state.business.okvedCodes.length > 0 ? setSubStep("ooo") : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${subStep === "ooo" ? "bg-primary text-white font-medium" : businessValidation.isComplete ? "bg-accent text-accent-foreground" : "bg-muted"}`}
              >
                Компания
              </button>
            </>
          )}
        </div>

        {subStep === "tax" && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Налоги для {productLabel}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isOoo ? "Выберите систему налогообложения для вашей компании" : "Выберите подходящий режим (можно будет изменить позже)."}
              </p>
            </div>
            <div className="space-y-3">
              {availableRegimes.map((t) => (
                <Card
                  key={t.id}
                  className={`cursor-pointer transition-all ${state.business.taxRegime === t.id ? "border-primary ring-2 ring-primary/20 bg-accent/30" : "hover:border-primary/40 hover:shadow-sm"}`}
                  onClick={() => setTax(t.id)}
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${state.business.taxRegime === t.id ? "border-primary" : "border-muted-foreground/30"}`}>
                      {state.business.taxRegime === t.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <p className="font-semibold text-base">{t.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {subStep === "okved" && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Чем будет заниматься {isOoo ? "компания" : "ваш бизнес"}?</h2>
                <p className="text-sm text-muted-foreground mt-1">Выберите коды и отметьте основной вид деятельности для ФНС</p>
              </div>
              <button
                className="text-xs text-primary flex items-center gap-1 hover:underline mt-1 shrink-0"
                onClick={() => setShowAiSuggest(!showAiSuggest)}
              >
                <Sparkles className="h-3 w-3" /> {showAiSuggest ? "Выбрать вручную" : "ИИ подберёт"}
              </button>
            </div>

            {showAiSuggest && (
              <AiOkvedSuggest
                selectedCodes={state.business.okvedCodes}
                onToggle={toggleOkved}
                onClose={() => setShowAiSuggest(false)}
              />
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или коду, например «IT» или «62.01»"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-12 bg-white border border-gray-200 text-base"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => { setSectionFilter(null); setShowAllCodes(false); }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!sectionFilter ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-accent"}`}
              >
                Все сферы
              </button>
              {OKVED_SECTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSectionFilter(sectionFilter === s ? null : s); setShowAllCodes(true); }}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${sectionFilter === s ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-accent"}`}
                >
                  {s}
                </button>
              ))}
            </div>

            {state.business.okvedCodes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {state.business.okvedCodes.map((code) => {
                  const found = OKVED_CODES.find((c) => c.code === code);
                  const isPrimary = state.business.primaryOkvedCode === code;
                  return (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 text-xs font-medium"
                    >
                      {code} {found && `- ${found.name.substring(0, 30)}${found.name.length > 30 ? "..." : ""}`}
                      {isPrimary ? (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">Основной</span>
                      ) : (
                        <button onClick={() => setPrimaryOkved(code)} className="text-[10px] hover:underline">
                          Сделать основным
                        </button>
                      )}
                      <button onClick={() => toggleOkved(code)} className="hover:text-destructive transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
                <button
                  onClick={() => dispatch({ type: "UPDATE_BUSINESS", payload: { okvedCodes: [], primaryOkvedCode: undefined } })}
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline px-2 py-1.5"
                >
                  Сбросить все
                </button>
              </div>
            )}

            <Card>
              <CardContent className="p-0">
                <div className="divide-y max-h-80 overflow-y-auto">
                  {filteredCodes.map((c) => {
                    const selected = state.business.okvedCodes.includes(c.code);
                    return (
                      <button
                        key={c.code}
                        onClick={() => toggleOkved(c.code)}
                        className={`w-full text-left px-4 py-3.5 text-sm flex items-start gap-3 transition-colors ${selected ? "bg-accent/50" : "hover:bg-muted/50"}`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <div>
                          <span className="font-mono text-xs text-muted-foreground">{c.code}</span>{" "}
                          <span>{c.name}</span>
                          {state.business.primaryOkvedCode === c.code && (
                            <p className="text-xs text-primary mt-0.5">Основной вид деятельности</p>
                          )}
                          {c.linked && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              + связанные: {c.linked.join(", ")}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  {filteredCodes.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-6">Ничего не найдено. Попробуйте другой запрос или выберите раздел выше.</p>
                  )}
                </div>
                {!search && !sectionFilter && !showAllCodes && (
                  <button
                    onClick={() => setShowAllCodes(true)}
                    className="w-full py-3 text-sm text-primary font-medium flex items-center justify-center gap-1 border-t hover:bg-muted/50 transition-colors"
                  >
                    Показать все ({OKVED_CODES.length}) <ChevronDown className="h-4 w-4" />
                  </button>
                )}
                {(search || sectionFilter) && filteredCodes.length > 0 && (
                  <div className="py-2 text-center text-xs text-muted-foreground border-t">
                    Найдено: {filteredCodes.length}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {subStep === "ooo" && isOoo && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Данные компании</h2>
              <p className="text-sm text-muted-foreground mt-1">Заполните данные для Р11001 и банковского пакета документов</p>
            </div>
            <Card>
              <CardContent className="p-5 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">Наименование</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Краткое наименование *</Label>
                    <Input
                      placeholder='ООО "Ромашка"'
                      value={state.business.companyName || ""}
                      onChange={(e) => updateCompanyName(e.target.value)}
                      className="h-11 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Полное наименование *</Label>
                    <Input
                      placeholder='Общество с ограниченной ответственностью "Ромашка"'
                      value={state.business.companyNameFull || ""}
                      onChange={(e) => updateBusiness({ companyNameFull: e.target.value })}
                      className="h-11 text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Автоматически сформируется из краткого, но его нужно проверить.</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-sm">Уставной капитал, ₽ *</Label>
                  <Input
                    type="number"
                    placeholder="10 000"
                    min={10000}
                    value={state.business.charterCapital || ""}
                    onChange={(e) => updateBusiness({ charterCapital: e.target.value })}
                    className="h-11 text-base"
                  />
                  <p className="text-xs text-muted-foreground">Минимум 10 000 ₽. Вносится в течение 4 месяцев после регистрации.</p>
                </div>

                <div className="space-y-4 pt-2 border-t">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Учредитель</p>
                    <p className="text-xs text-muted-foreground">Онлайн-подача ООО доступна для одного учредителя-гражданина РФ.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Количество учредителей *</Label>
                    <RadioGroup
                      value={state.business.founderCount || ""}
                      onValueChange={(value) => updateBusiness({ founderCount: value as BusinessData["founderCount"] })}
                      className="grid grid-cols-2 gap-2"
                    >
                      <Label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-3 text-sm [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="one" />
                        Один
                      </Label>
                      <Label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-3 text-sm [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="multiple" />
                        Несколько
                      </Label>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Гражданство учредителя *</Label>
                    <RadioGroup
                      value={state.business.founderCitizenship || ""}
                      onValueChange={(value) => updateBusiness({ founderCitizenship: value as BusinessData["founderCitizenship"] })}
                      className="grid grid-cols-2 gap-2"
                    >
                      <Label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-3 text-sm [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="ru" />
                        Гражданин РФ
                      </Label>
                      <Label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-3 text-sm [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="foreign" />
                        Иностранный гражданин
                      </Label>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Адрес регистрации учредителя в РФ *</Label>
                    <Input
                      placeholder="г. Москва, ул. Тверская, д. 1, кв. 12"
                      value={state.business.founderRegistrationAddress || ""}
                      onChange={(e) => updateBusiness({
                        founderRegistrationAddress: e.target.value,
                        legalAddress: state.business.addressIsFounder === false ? state.business.legalAddress : e.target.value,
                      })}
                      className="h-11 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Юр. адрес = адрес учредителя</Label>
                    <Switch
                      checked={state.business.addressIsFounder ?? true}
                      onCheckedChange={(v) => updateBusiness({
                        addressIsFounder: v,
                        legalAddress: v ? state.business.founderRegistrationAddress : state.business.legalAddress,
                      })}
                    />
                  </div>
                  {!state.business.addressIsFounder && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <Label className="text-sm">Юридический адрес</Label>
                      <Input
                        placeholder="г. Москва, ул. Примерная, д. 1, оф. 101"
                        value={state.business.legalAddress || ""}
                        onChange={(e) => updateBusiness({ legalAddress: e.target.value })}
                        className="h-11 text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Отдельный юридический адрес проверит менеджер.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-2 border-t">
                  <div className="space-y-2">
                    <Label className="text-sm">Руководитель является учредителем *</Label>
                    <RadioGroup
                      value={state.business.directorIsFounder === undefined ? "" : state.business.directorIsFounder ? "yes" : "no"}
                      onValueChange={(value) => updateBusiness({ directorIsFounder: value === "yes" })}
                      className="grid grid-cols-2 gap-2"
                    >
                      <Label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-3 text-sm [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="yes" />
                        Да
                      </Label>
                      <Label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-3 text-sm [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="no" />
                        Нет
                      </Label>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm">Должность руководителя *</Label>
                      <Input
                        placeholder="Генеральный директор"
                        value={state.business.directorPosition || ""}
                        onChange={(e) => updateBusiness({ directorPosition: e.target.value })}
                        className="h-11 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Срок избрания *</Label>
                      <Select value={state.business.directorTerm || ""} onValueChange={(value) => updateBusiness({ directorTerm: value })}>
                        <SelectTrigger className="h-11 bg-white">
                          <SelectValue placeholder="Выберите срок" />
                        </SelectTrigger>
                        <SelectContent>
                          {DIRECTOR_TERMS.map((term) => (
                            <SelectItem key={term.value} value={term.value}>
                              {term.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t">
                  <div className="space-y-2">
                    <Label className="text-sm">Устав *</Label>
                    <RadioGroup
                      value={state.business.charterType || "generated"}
                      onValueChange={(value) => updateBusiness({ charterType: value as BusinessData["charterType"] })}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                    >
                      <Label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-3 text-sm [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="generated" />
                        Сгенерировать по шаблону
                      </Label>
                      <Label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-3 text-sm [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="custom" />
                        Свой устав / документы
                      </Label>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Печать организации *</Label>
                    <RadioGroup
                      value={state.business.hasSeal ? "yes" : "no"}
                      onValueChange={(value) => updateBusiness({ hasSeal: value === "yes" })}
                      className="grid grid-cols-2 gap-2"
                    >
                      <Label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-3 text-sm [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="no" />
                        Без печати
                      </Label>
                      <Label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-3 text-sm [&:has([data-state=checked])]:border-primary">
                        <RadioGroupItem value="yes" />
                        С печатью
                      </Label>
                    </RadioGroup>
                  </div>
                </div>

                {businessValidation.missingFields.length > 0 && !showManagerPrompt && (
                  <div className="rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <div className="mb-2 flex items-center gap-2 font-medium">
                      <AlertCircle className="h-4 w-4" />
                      Для отправки в ФНС осталось заполнить
                    </div>
                    <p>{businessValidation.missingFields.join(", ")}.</p>
                  </div>
                )}

                {showManagerPrompt && (
                  <div className="rounded-card border border-primary bg-accent/50 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <UserCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Сложный ООО-сценарий</p>
                        <p className="text-sm text-muted-foreground">
                          Заявку можно отправить сейчас. Менеджер позвонит, проверит детали и поможет завершить оформление.
                        </p>
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                          {businessValidation.managerReasons.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => { trackEvent("manager_request_opened", { reason: businessValidation.managerReasons[0], flowType: state.flowType }); navigate("/manager-request"); }}>
                      Проверить и отправить заявку
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        <SupportBlock compact />
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur-sm p-4">
        <div className="max-w-2xl mx-auto px-4">
          <Button className="w-full h-12" disabled={!canProceed} onClick={handleNext}>
            Продолжить
          </Button>
        </div>
      </div>
    </div>
  );
}

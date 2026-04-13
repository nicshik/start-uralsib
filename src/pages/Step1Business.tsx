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
import { ProgressHeader } from "@/components/ProgressHeader";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { SupportBlock } from "@/components/SupportBlock";
import { MicroReinforcement } from "@/components/MicroReinforcement";
import { Search, X, Check, UserCheck, ChevronDown, Receipt, Briefcase, Sparkles, Building2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { AiOkvedSuggest } from "@/components/AiOkvedSuggest";

type SubStep = "tax" | "okved" | "ooo";

export default function Step1Business() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState("");
  const [showComplete, setShowComplete] = useState(false);
  const [showAllCodes, setShowAllCodes] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<string | null>(null);
  const [showAiSuggest, setShowAiSuggest] = useState(false);
  const isOoo = state.productType === "ooo";

  // Determine which sub-step to show
  const getSubStep = (): SubStep => {
    if (!state.business.taxRegime) return "tax";
    if (state.business.okvedCodes.length === 0) return "okved";
    if (isOoo && !state.business.companyName) return "ooo";
    return "okved"; // default back to okved for editing
  };
  const [subStep, setSubStep] = useState<SubStep>(getSubStep);

  useEffect(() => {
    trackEvent("page_view", { page: "step1_business" });
  }, []);

  const showManagerPrompt = isOoo && state.business.directorIsFounder === false;

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

  const toggleOkved = (code: string) => {
    const current = state.business.okvedCodes;
    const updated = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];
    dispatch({ type: "UPDATE_BUSINESS", payload: { okvedCodes: updated } });
    trackEvent("okved_toggled", { code, selected: !current.includes(code) });
  };

  const setTax = (id: string) => {
    dispatch({ type: "UPDATE_BUSINESS", payload: { taxRegime: id } });
    trackEvent("tax_selected", { regime: id });
    // Auto-advance to next sub-step
    setTimeout(() => setSubStep("okved"), 300);
  };

  const canProceed =
    state.business.okvedCodes.length > 0 &&
    state.business.taxRegime &&
    (!isOoo || subStep !== "ooo" || state.business.companyName) &&
    !showManagerPrompt;

  const handleNext = () => {
    if (subStep === "okved" && isOoo && !state.business.companyName) {
      setSubStep("ooo");
      return;
    }
    dispatch({ type: "SET_STEP", payload: 2 });
    trackEvent("step1_completed", {
      okvedCount: state.business.okvedCodes.length,
      taxRegime: state.business.taxRegime,
    });
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

        {/* Sub-step indicator */}
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${subStep === "okved" ? "bg-primary text-white font-medium" : state.business.okvedCodes.length > 0 ? "bg-accent text-accent-foreground" : "bg-muted"}`}
          >
            <Briefcase className="h-3 w-3" />
            ОКВЭД {state.business.okvedCodes.length > 0 && `(${state.business.okvedCodes.length})`}
          </button>
          {isOoo && (
            <>
              <div className="w-4 h-px bg-border" />
              <button
                onClick={() => state.business.okvedCodes.length > 0 ? setSubStep("ooo") : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${subStep === "ooo" ? "bg-primary text-white font-medium" : state.business.companyName ? "bg-accent text-accent-foreground" : "bg-muted"}`}
              >
                Компания
              </button>
            </>
          )}
        </div>

        {/* SUB-STEP: Tax regime */}
        {subStep === "tax" && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Налоги для {productLabel}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isOoo ? "Выберите систему налогообложения для вашей компании" : "Выберите подходящий режим. Менеджер поможет определиться на встрече."}
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

        {/* SUB-STEP: OKVED */}
        {subStep === "okved" && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Чем будет заниматься {isOoo ? "компания" : "ваш бизнес"}?</h2>
                <p className="text-sm text-muted-foreground mt-1">{isOoo ? "Выберите ОКВЭД-коды для устава ООО" : "Найдите свою сферу через поиск или выберите из списка"}</p>
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

            {/* Search */}
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

            {/* Section filter */}
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

            {/* Selected tags */}
            {state.business.okvedCodes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {state.business.okvedCodes.map((code) => {
                  const found = OKVED_CODES.find((c) => c.code === code);
                  return (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 text-xs font-medium"
                    >
                      {code} {found && `— ${found.name.substring(0, 30)}${found.name.length > 30 ? "…" : ""}`}
                      <button onClick={() => toggleOkved(code)} className="hover:text-destructive transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
                <button
                  onClick={() => dispatch({ type: "UPDATE_BUSINESS", payload: { okvedCodes: [] } })}
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline px-2 py-1.5"
                >
                  Сбросить все
                </button>
              </div>
            )}

            {/* Code list */}
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

        {/* SUB-STEP: OOO extras */}
        {subStep === "ooo" && isOoo && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Данные компании</h2>
              <p className="text-sm text-muted-foreground mt-1">Заполните основные реквизиты ООО</p>
            </div>
            <Card>
              <CardContent className="p-5 space-y-5">
                {/* Company names */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-semibold">Наименование</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Краткое наименование</Label>
                    <Input
                      placeholder='ООО "Ромашка"'
                      value={state.business.companyName || ""}
                      onChange={(e) => dispatch({ type: "UPDATE_BUSINESS", payload: { companyName: e.target.value } })}
                      className="h-11 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Полное наименование</Label>
                    <Input
                      placeholder='Общество с ограниченной ответственностью "Ромашка"'
                      value={state.business.companyNameFull || ""}
                      onChange={(e) => dispatch({ type: "UPDATE_BUSINESS", payload: { companyNameFull: e.target.value } })}
                      className="h-11 text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Автоматически сформируется из краткого, если оставить пустым</p>
                  </div>
                </div>

                {/* Charter capital */}
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-sm">Уставной капитал, ₽</Label>
                  <Input
                    type="number"
                    placeholder="10 000"
                    min={10000}
                    value={state.business.charterCapital || ""}
                    onChange={(e) => dispatch({ type: "UPDATE_BUSINESS", payload: { charterCapital: e.target.value } })}
                    className="h-11 text-base"
                  />
                  <p className="text-xs text-muted-foreground">Минимум 10 000 ₽. Вносится в течение 4 месяцев после регистрации.</p>
                </div>

                {/* Legal address */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Юр. адрес = адрес учредителя</Label>
                    <Switch
                      checked={state.business.addressIsFounder ?? true}
                      onCheckedChange={(v) => dispatch({ type: "UPDATE_BUSINESS", payload: { addressIsFounder: v } })}
                    />
                  </div>
                  {!state.business.addressIsFounder && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <Label className="text-sm">Юридический адрес</Label>
                      <Input
                        placeholder="г. Москва, ул. Примерная, д. 1, оф. 101"
                        value={state.business.legalAddress || ""}
                        onChange={(e) => dispatch({ type: "UPDATE_BUSINESS", payload: { legalAddress: e.target.value } })}
                        className="h-11 text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Адрес, по которому будет зарегистрировано ООО</p>
                    </div>
                  )}
                </div>

                {/* Director = founder */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Директор = единственный учредитель</Label>
                    <Switch
                      checked={state.business.directorIsFounder ?? true}
                      onCheckedChange={(v) => dispatch({ type: "UPDATE_BUSINESS", payload: { directorIsFounder: v } })}
                    />
                  </div>
                </div>

                {showManagerPrompt && (
                  <div className="rounded-card border border-primary bg-accent/50 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <UserCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Несколько учредителей?</p>
                        <p className="text-sm text-muted-foreground">
                          Если директор и учредитель — разные лица или учредителей несколько, менеджер поможет подготовить документы.
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => { trackEvent("manager_redirect", { reason: "director_not_founder" }); navigate("/manager"); }}>
                      Связаться с менеджером
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

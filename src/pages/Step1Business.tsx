import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { OKVED_CODES, TAX_REGIMES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ProgressHeader } from "@/components/ProgressHeader";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { SupportBlock } from "@/components/SupportBlock";
import { MicroReinforcement } from "@/components/MicroReinforcement";
import { ArrowLeft, Search, X, Check, HelpCircle } from "lucide-react";

export default function Step1Business() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState("");
  const [showComplete, setShowComplete] = useState(false);
  const isOoo = state.productType === "ooo";

  useEffect(() => {
    trackEvent("page_view", { page: "step1_business" });
  }, []);

  const filteredCodes = useMemo(() => {
    if (!search) return OKVED_CODES;
    const q = search.toLowerCase();
    return OKVED_CODES.filter(
      (c) => c.code.includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [search]);

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
  };

  const canProceed =
    state.business.okvedCodes.length > 0 &&
    state.business.taxRegime &&
    (!isOoo || state.business.companyName);

  const handleNext = () => {
    dispatch({ type: "SET_STEP", payload: 2 });
    trackEvent("step1_completed", {
      okvedCount: state.business.okvedCodes.length,
      taxRegime: state.business.taxRegime,
    });
    setShowComplete(true);
    setTimeout(() => navigate("/step/2"), 1500);
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-lg font-bold text-primary">УРАЛСИБ</span>
          <div className="ml-auto"><AutosaveIndicator /></div>
        </div>
        <div className="container pb-3">
          <ProgressHeader step={1} totalSteps={3} timeEstimate="3 минуты" />
        </div>
      </header>

      <main className="container max-w-lg mx-auto py-6 space-y-6">
        {showComplete && (
          <MicroReinforcement message="Шаг 1 готов. Осталось подтвердить паспорт" />
        )}

        {/* OKVED */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Виды деятельности (ОКВЭД)</Label>
            <button className="text-xs text-primary flex items-center gap-1" onClick={() => alert("Подбор ОКВЭД с менеджером (демо)")}>
              <HelpCircle className="h-3 w-3" /> Помочь выбрать
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию или коду"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {state.business.okvedCodes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {state.business.okvedCodes.map((code) => {
                const okved = OKVED_CODES.find((c) => c.code === code);
                return (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium"
                  >
                    {code}
                    <button onClick={() => toggleOkved(code)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={() => dispatch({ type: "UPDATE_BUSINESS", payload: { okvedCodes: [] } })}
                className="text-xs text-destructive underline"
              >
                Сбросить все
              </button>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border p-2">
            {filteredCodes.map((c) => {
              const selected = state.business.okvedCodes.includes(c.code);
              return (
                <button
                  key={c.code}
                  onClick={() => toggleOkved(c.code)}
                  className={`w-full text-left p-2 rounded text-sm flex items-start gap-2 transition-colors ${selected ? "bg-primary/5" : "hover:bg-muted"}`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected ? "bg-primary border-primary" : "border-input"}`}>
                    {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <div>
                    <span className="font-mono text-xs text-muted-foreground">{c.code}</span>{" "}
                    <span>{c.name}</span>
                    {c.linked && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Связанные: {c.linked.join(", ")}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
            {filteredCodes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Ничего не найдено</p>
            )}
          </div>
        </section>

        {/* Tax regime */}
        <section className="space-y-3">
          <Label className="text-base font-semibold">Система налогообложения</Label>
          <div className="space-y-2">
            {TAX_REGIMES.map((t) => (
              <Card
                key={t.id}
                className={`cursor-pointer transition-all ${state.business.taxRegime === t.id ? "border-primary ring-1 ring-primary" : "hover:border-primary/50"}`}
                onClick={() => setTax(t.id)}
              >
                <CardContent className="p-3 flex items-start gap-3">
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${state.business.taxRegime === t.id ? "border-primary" : "border-input"}`}>
                    {state.business.taxRegime === t.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* OOO extras */}
        {isOoo && (
          <section className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Название компании</Label>
              <Input
                placeholder='ООО "Название"'
                value={state.business.companyName || ""}
                onChange={(e) => dispatch({ type: "UPDATE_BUSINESS", payload: { companyName: e.target.value } })}
              />
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Упрощённые параметры</p>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Директор = учредитель</Label>
                <Switch
                  checked={state.business.directorIsFounder ?? true}
                  onCheckedChange={(v) => dispatch({ type: "UPDATE_BUSINESS", payload: { directorIsFounder: v } })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Юр. адрес = адрес учредителя</Label>
                <Switch
                  checked={state.business.addressIsFounder ?? true}
                  onCheckedChange={(v) => dispatch({ type: "UPDATE_BUSINESS", payload: { addressIsFounder: v } })}
                />
              </div>
            </div>
          </section>
        )}

        <SupportBlock compact />
      </main>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-card p-4">
        <div className="container max-w-lg mx-auto">
          <Button className="w-full" disabled={!canProceed} onClick={handleNext}>
            Продолжить
          </Button>
        </div>
      </div>
    </div>
  );
}

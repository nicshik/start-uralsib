import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { OKVED_CODES, TAX_REGIMES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { ProgressHeader } from "@/components/ProgressHeader";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { MicroReinforcement } from "@/components/MicroReinforcement";
import { Pencil, CheckCircle2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export default function Step3Review() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    trackEvent("page_view", { page: "step3_review" });
  }, []);

  const tax = TAX_REGIMES.find((t) => t.id === state.business.taxRegime);
  const selectedOkveds = OKVED_CODES.filter((c) => state.business.okvedCodes.includes(c.code));
  const isOoo = state.productType === "ooo";
  const fullName = [state.passport.lastName, state.passport.firstName, state.passport.middleName].filter(Boolean).join(" ");

  const handleSubmit = () => {
    setSubmitting(true);
    trackEvent("application_submitted");
    setTimeout(() => {
      dispatch({ type: "SUBMIT" });
      navigate("/success");
    }, 1500);
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <AppHeader showBack>
        <AutosaveIndicator />
      </AppHeader>
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <ProgressHeader step={3} totalSteps={3} />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <MicroReinforcement message="Онлайн-часть готова. Остальные детали уточним на встрече" />

        <h2 className="text-lg font-bold tracking-tight">Проверьте данные</h2>

        {/* Summary card */}
        <div className="rounded-2xl border border-[#E5E0EB] bg-white divide-y divide-[#E5E0EB]">
          {/* Business section */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Бизнес</p>
              <button onClick={() => navigate("/step/1")} className="text-xs text-primary flex items-center gap-1 hover:underline">
                <Pencil className="h-3 w-3" /> Изменить
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <div>
                <span className="text-muted-foreground">Форма: </span>
                <span className="font-medium">{isOoo ? "ООО" : "ИП"}</span>
              </div>
              {tax && (
                <div>
                  <span className="text-muted-foreground">Налоги: </span>
                  <span className="font-medium">{tax.name}</span>
                </div>
              )}
              {state.business.companyName && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Название: </span>
                  <span className="font-medium">{state.business.companyName}</span>
                </div>
              )}
              {state.business.charterCapital && (
                <div>
                  <span className="text-muted-foreground">Уст. капитал: </span>
                  <span className="font-medium">{Number(state.business.charterCapital).toLocaleString("ru-RU")} ₽</span>
                </div>
              )}
              {state.business.legalAddress && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Юр. адрес: </span>
                  <span className="font-medium">{state.business.legalAddress}</span>
                </div>
              )}
            </div>
            {selectedOkveds.length > 0 && (
              <div className="text-xs text-muted-foreground pt-1">
                ОКВЭД: {selectedOkveds.map((c) => c.code).join(", ")}
                {selectedOkveds.length > 3 && ` и ещё ${selectedOkveds.length - 3}`}
              </div>
            )}
          </div>

          {/* Personal section */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Личные данные</p>
              <button onClick={() => navigate("/step/2")} className="text-xs text-primary flex items-center gap-1 hover:underline">
                <Pencil className="h-3 w-3" /> Изменить
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <div className="col-span-2">
                <span className="font-medium">{fullName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Паспорт: </span>
                <span className="font-medium">{state.passport.passportSeries} {state.passport.passportNumber}</span>
              </div>
              {state.passport.inn && (
                <div>
                  <span className="text-muted-foreground">ИНН: </span>
                  <span className="font-medium">{state.passport.inn}</span>
                </div>
              )}
              {state.passport.snils && (
                <div>
                  <span className="text-muted-foreground">СНИЛС: </span>
                  <span className="font-medium">{state.passport.snils}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meeting note */}
        <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            После отправки менеджер свяжется для уточнения деталей и назначит встречу в офисе — проверка документов, подписание заявления, открытие счёта.
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur-sm p-4">
        <div className="max-w-2xl mx-auto px-4">
          <Button className="w-full h-12" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Отправляем..." : "Отправить заявку"}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { OKVED_CODES, TAX_REGIMES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressHeader } from "@/components/ProgressHeader";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { SupportBlock } from "@/components/SupportBlock";
import { MicroReinforcement } from "@/components/MicroReinforcement";
import { ArrowLeft, Building2, User, Receipt, Calendar, Edit } from "lucide-react";

export default function Step3Review() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    trackEvent("page_view", { page: "step3_review" });
  }, []);

  const tax = TAX_REGIMES.find((t) => t.id === state.business.taxRegime);
  const selectedOkveds = OKVED_CODES.filter((c) => state.business.okvedCodes.includes(c.code));

  const handleSubmit = () => {
    setSubmitting(true);
    trackEvent("application_submitted");
    setTimeout(() => {
      dispatch({ type: "SUBMIT" });
      navigate("/success");
    }, 1500);
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
          <ProgressHeader step={3} totalSteps={3} />
        </div>
      </header>

      <main className="container max-w-lg mx-auto py-6 space-y-6">
        <MicroReinforcement message="Онлайн-часть готова. Остальные детали уточним на встрече" />

        <h2 className="text-lg font-semibold">Проверьте данные заявки</h2>

        {/* Business summary */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Бизнес</span>
              </div>
              <button onClick={() => navigate("/step/1")} className="text-xs text-primary flex items-center gap-1">
                <Edit className="h-3 w-3" /> Изменить
              </button>
            </div>
            <div className="space-y-1 text-sm">
              <p><span className="text-muted-foreground">Форма:</span> {state.productType === "ooo" ? "ООО" : "ИП"}</p>
              {state.business.companyName && (
                <p><span className="text-muted-foreground">Название:</span> {state.business.companyName}</p>
              )}
              <p><span className="text-muted-foreground">ОКВЭД:</span></p>
              <ul className="ml-4 space-y-0.5">
                {selectedOkveds.map((c) => (
                  <li key={c.code} className="text-xs">{c.code} — {c.name}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Tax summary */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Налоги</span>
              </div>
              <button onClick={() => navigate("/step/1")} className="text-xs text-primary flex items-center gap-1">
                <Edit className="h-3 w-3" /> Изменить
              </button>
            </div>
            <p className="text-sm">{tax?.name} — {tax?.description}</p>
          </CardContent>
        </Card>

        {/* Passport summary */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Паспортные данные</span>
              </div>
              <button onClick={() => navigate("/step/2")} className="text-xs text-primary flex items-center gap-1">
                <Edit className="h-3 w-3" /> Изменить
              </button>
            </div>
            <div className="text-sm space-y-0.5">
              <p>{state.passport.lastName} {state.passport.firstName} {state.passport.middleName}</p>
              <p className="text-muted-foreground">Паспорт: {state.passport.passportSeries} {state.passport.passportNumber}</p>
              {state.passport.inn && <p className="text-muted-foreground">ИНН: {state.passport.inn}</p>}
            </div>
          </CardContent>
        </Card>

        {/* What manager will clarify */}
        <Card className="bg-muted/50">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Что уточнит сотрудник на встрече</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Проверка оригиналов документов</li>
              <li>Подписание заявления на регистрацию</li>
              <li>Открытие расчётного счёта</li>
              <li>Подключение интернет-банка</li>
            </ul>
          </CardContent>
        </Card>

        <SupportBlock compact />
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-card p-4">
        <div className="container max-w-lg mx-auto">
          <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Отправляем..." : "Отправить заявку"}
          </Button>
        </div>
      </div>
    </div>
  );
}

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
import { Building2, User, Receipt, Calendar, Edit } from "lucide-react";
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

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <MicroReinforcement message="Онлайн-часть готова. Остальные детали уточним на встрече" />

        <h2 className="text-xl font-bold tracking-tight">Проверьте данные заявки</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                    <Building2 className="h-3.5 w-3.5 text-accent-foreground" />
                  </div>
                  <span className="font-semibold text-sm">Бизнес</span>
                </div>
                <button onClick={() => navigate("/step/1")} className="text-xs text-primary flex items-center gap-1 hover:underline">
                  <Edit className="h-3 w-3" /> Изменить
                </button>
              </div>
              <div className="space-y-1.5 text-sm">
                <p><span className="text-muted-foreground">Форма:</span> {state.productType === "ooo" ? "ООО" : "ИП"}</p>
                {state.business.companyName && (
                  <p><span className="text-muted-foreground">Название:</span> {state.business.companyName}</p>
                )}
                {selectedOkveds.length > 0 && (
                  <>
                    <p className="text-muted-foreground">ОКВЭД:</p>
                    <ul className="ml-4 space-y-0.5">
                      {selectedOkveds.map((c) => (
                        <li key={c.code} className="text-xs text-muted-foreground">{c.code} — {c.name}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                    <Receipt className="h-3.5 w-3.5 text-accent-foreground" />
                  </div>
                  <span className="font-semibold text-sm">Налоги</span>
                </div>
                <button onClick={() => navigate("/step/1")} className="text-xs text-primary flex items-center gap-1 hover:underline">
                  <Edit className="h-3 w-3" /> Изменить
                </button>
              </div>
              {tax ? (
                <div className="text-sm">
                  <p className="font-medium">{tax.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tax.description}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Не выбрано</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-accent-foreground" />
                </div>
                <span className="font-semibold text-sm">Паспортные данные</span>
              </div>
              <button onClick={() => navigate("/step/2")} className="text-xs text-primary flex items-center gap-1 hover:underline">
                <Edit className="h-3 w-3" /> Изменить
              </button>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium">{state.passport.lastName} {state.passport.firstName} {state.passport.middleName}</p>
              <p className="text-muted-foreground">Паспорт: {state.passport.passportSeries} {state.passport.passportNumber}</p>
              {state.passport.inn && <p className="text-muted-foreground">ИНН: {state.passport.inn}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#E5E0EB] rounded-[16px]">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-semibold text-sm">Что уточнит сотрудник на встрече</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1.5 ml-9 list-disc">
              <li>Проверка оригиналов документов</li>
              <li>Подписание заявления на регистрацию</li>
              <li>Открытие расчётного счёта</li>
              <li>Подключение интернет-банка</li>
            </ul>
          </CardContent>
        </Card>

        <SupportBlock compact />
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

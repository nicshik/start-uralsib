import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Briefcase, ClipboardCheck, MonitorUp, ShieldCheck, UserCheck } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { ProductQuiz } from "@/components/ProductQuiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { SmsAuthDialog } from "@/pages/SmsAuth";

type AssistedChoice = "ip" | "ooo";

export default function AssistedStart() {
  const navigate = useNavigate();
  const { dispatch, clearDraft } = useApp();
  const [isSmsOpen, setIsSmsOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    dispatch({ type: "SET_FLOW", payload: "manager" });
    trackEvent("page_view", { page: "assisted_start", flowType: "manager" });
    trackEvent("assisted_entry_view", { flowType: "manager" });
  }, [dispatch]);

  const startAssistedFlow = (product: AssistedChoice) => {
    clearDraft();
    dispatch({ type: "SET_FLOW", payload: "manager" });
    dispatch({ type: "SET_PRODUCT", payload: product });
    trackEvent("assisted_flow_started", { product, flowType: "manager" });
    setIsSmsOpen(true);
  };

  const openWorkspace = (reason = "office_intake") => {
    clearDraft();
    dispatch({ type: "SET_FLOW", payload: "manager" });
    trackEvent("assisted_workspace_opened", { reason, flowType: "manager" });
    navigate("/office-agent");
  };

  const handleQuizChoice = (choice: "ip" | "ooo" | "help") => {
    setIsQuizOpen(false);
    setTimeout(() => {
      if (choice === "help") {
        openWorkspace("expert_help");
        return;
      }
      startAssistedFlow(choice);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-brand-light">
      <AppHeader showBack backTo="/" />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <section className="space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              Отдельный assisted-канал
            </div>
            <div className="max-w-2xl space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Заявка вместе с клиентом
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Используйте этот вход, когда клиент рядом с вами в офисе или на консультации. Форма остается клиентской, но визит сотрудника не смешивается с самостоятельной онлайн-воронкой.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={() => startAssistedFlow("ip")}
              className="rounded-lg border border-border bg-white p-5 text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-light-purple">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <p className="font-semibold">Открыть ИП</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Быстрый сценарий для одного владельца бизнеса.
              </p>
            </button>

            <button
              onClick={() => startAssistedFlow("ooo")}
              className="rounded-lg border border-border bg-white p-5 text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-light-purple">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <p className="font-semibold">Открыть ООО</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Для компании с названием, уставным капиталом и юр. адресом.
              </p>
            </button>

            <button
              onClick={() => {
                trackEvent("assisted_quiz_opened", { flowType: "manager" });
                setIsQuizOpen(true);
              }}
              className="rounded-lg border border-border bg-white p-5 text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-light-purple">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <p className="font-semibold">Помочь выбрать</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Пройдите короткие вопросы вместе с клиентом.
              </p>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-[#E5E0EB] bg-white">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                  <p className="font-semibold">Что меняется в аналитике</p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Все события получают признак `flowType: manager`. Прямые заходы сотрудников становятся отдельной assisted-воронкой, а клиентский онлайн больше считается чище.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#E5E0EB] bg-white">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2">
                  <MonitorUp className="h-5 w-5 text-primary" />
                  <p className="font-semibold">Когда нужен CRM-режим</p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Если клиент не хочет проходить сайт сам, откройте рабочее место сотрудника и соберите вводные в офисном интерфейсе.
                </p>
                <Button variant="outline" className="h-10" onClick={() => openWorkspace()}>
                  Открыть рабочее место
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <SmsAuthDialog open={isSmsOpen} onOpenChange={setIsSmsOpen} />
      <ProductQuiz open={isQuizOpen} onOpenChange={setIsQuizOpen} onResultChoice={handleQuizChoice} />
    </div>
  );
}

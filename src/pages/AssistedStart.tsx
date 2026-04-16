import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Briefcase, ClipboardCheck, MonitorUp } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { SmsAuthDialog } from "@/pages/SmsAuth";

type AssistedChoice = "ip" | "ooo";

export default function AssistedStart() {
  const navigate = useNavigate();
  const { dispatch, clearDraft } = useApp();
  const [isSmsOpen, setIsSmsOpen] = useState(false);

  useEffect(() => {
    dispatch({ type: "SET_FLOW", payload: "assisted" });
    trackEvent("page_view", { page: "assisted_start", flowType: "assisted" });
    trackEvent("assisted_entry_view", { flowType: "assisted" });
  }, [dispatch]);

  const startAssistedFlow = (product: AssistedChoice) => {
    clearDraft();
    dispatch({ type: "SET_FLOW", payload: "assisted" });
    dispatch({ type: "SET_PRODUCT", payload: product });
    trackEvent("assisted_started", { product, flowType: "assisted" });
    trackEvent("assisted_flow_started", { product, flowType: "assisted" });
    setIsSmsOpen(true);
  };

  const openWorkspace = (reason = "office_intake") => {
    clearDraft();
    dispatch({ type: "SET_FLOW", payload: "office_crm" });
    trackEvent("office_crm_created", { reason, flowType: "office_crm" });
    trackEvent("assisted_workspace_opened", { reason, flowType: "office_crm" });
    navigate("/office-agent");
  };

  return (
    <div className="min-h-screen bg-brand-light">
      <AppHeader showBack backTo="/" />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <section className="space-y-6">
          <div className="space-y-3">
            <div className="max-w-2xl space-y-2">
              <h1 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                Заявка на открытие ИП или ООО
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Используйте этот вход, когда клиент рядом с вами в офисе или на консультации.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => startAssistedFlow("ip")}
              className="rounded-lg border border-border bg-white p-5 text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-light-purple">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <p className="font-semibold">Открыть ИП</p>
            </button>

            <button
              onClick={() => startAssistedFlow("ooo")}
              className="rounded-lg border border-border bg-white p-5 text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-light-purple">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <p className="font-semibold">Открыть ООО</p>
            </button>

          </div>

          <Accordion type="single" collapsible className="rounded-lg border border-border bg-white px-4">
            <AccordionItem value="help" className="border-0">
              <AccordionTrigger className="py-4 text-sm font-medium">Справка</AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4 pb-4 md:grid-cols-3">
                  <div className="space-y-3 rounded-lg border border-[#E5E0EB] bg-brand-light p-4">
                    <p className="font-semibold">Зачем нужна эта отдельная форма?</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Форма остается клиентской, но визит сотрудника не смешивается с самостоятельной онлайн-воронкой.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-lg border border-[#E5E0EB] bg-brand-light p-4">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                      <p className="font-semibold">Что меняется в аналитике</p>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Все события получают признак `flowType: assisted`. Прямые заходы сотрудников становятся отдельной assisted-воронкой, а клиентский онлайн больше считается чище.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-lg border border-[#E5E0EB] bg-brand-light p-4">
                    <div className="flex items-center gap-2">
                      <MonitorUp className="h-5 w-5 text-primary" />
                      <p className="font-semibold">Когда нужен CRM-режим</p>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Если клиент не хочет проходить сайт сам, откройте рабочее место сотрудника и соберите вводные в офисном интерфейсе.
                    </p>
                    <Button variant="outline" className="h-10 bg-white" onClick={() => openWorkspace()}>
                      Открыть рабочее место
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      <SmsAuthDialog open={isSmsOpen} onOpenChange={setIsSmsOpen} />
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SupportBlock } from "@/components/SupportBlock";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, Shield, Clock, ChevronRight, AlertCircle, UserCheck } from "lucide-react";
import { useState, useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const { dispatch, hasDraft, loadDraft, clearDraft } = useApp();
  const [showDraftWarning, setShowDraftWarning] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<"ip" | "ooo" | null>(null);

  useEffect(() => {
    trackEvent("page_view", { page: "landing" });
  }, []);

  const handleChoice = (type: "ip" | "ooo") => {
    if (hasDraft()) {
      setPendingProduct(type);
      setShowDraftWarning(true);
      return;
    }
    proceed(type);
  };

  const proceed = (type: "ip" | "ooo") => {
    dispatch({ type: "SET_PRODUCT", payload: type });
    trackEvent("product_selected", { product: type });
    navigate("/sms-auth");
  };

  const resumeDraft = () => {
    loadDraft();
    trackEvent("draft_resumed");
    navigate("/sms-auth");
  };

  const startFresh = () => {
    clearDraft();
    setShowDraftWarning(false);
    if (pendingProduct) proceed(pendingProduct);
  };

  const goToManager = () => {
    dispatch({ type: "SET_PRODUCT", payload: "help" });
    trackEvent("product_selected", { product: "help" });
    navigate("/manager");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">УРАЛСИБ</span>
          <SupportBlock compact />
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[hsl(262,60%,25%)] to-[hsl(262,70%,15%)] text-primary-foreground">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
            Зарегистрируйте ИП или ООО<br className="hidden sm:block" /> за ~10 минут онлайн
          </h1>
          <p className="text-primary-foreground/70 text-sm md:text-base max-w-xl mx-auto">
            Онлайн-часть заявки — бесплатно и без госпошлины
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 text-primary-foreground px-3 py-1 text-sm font-medium">
              <Shield className="h-3.5 w-3.5" /> Бесплатно
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 text-primary-foreground px-3 py-1 text-sm font-medium">
              <Clock className="h-3.5 w-3.5" /> ~10 минут
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Draft Warning */}
        {showDraftWarning && (
          <Card className="border-primary max-w-2xl mx-auto">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm">У вас есть незавершённая заявка</p>
                  <p className="text-sm text-muted-foreground">Вы можете продолжить или начать заново</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={resumeDraft}>Продолжить</Button>
                <Button size="sm" variant="outline" onClick={startFresh}>Начать заново</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA Cards — horizontal on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <button
            onClick={() => handleChoice("ip")}
            className="text-left rounded-2xl border bg-card p-5 hover:border-primary hover:shadow-sm transition-all flex items-center justify-between md:flex-col md:items-start md:gap-3 group"
          >
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Открыть ИП</p>
              <p className="text-sm text-muted-foreground">Индивидуальный предприниматель</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors md:self-end" />
          </button>

          <button
            onClick={() => handleChoice("ooo")}
            className="text-left rounded-2xl border bg-card p-5 hover:border-primary hover:shadow-sm transition-all flex items-center justify-between md:flex-col md:items-start md:gap-3 group"
          >
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Открыть ООО</p>
              <p className="text-sm text-muted-foreground">Общество с ограниченной ответственностью</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors md:self-end" />
          </button>

          <button
            onClick={goToManager}
            className="text-left rounded-2xl border bg-card p-5 hover:border-primary hover:shadow-sm transition-all flex items-center justify-between md:flex-col md:items-start md:gap-3 group"
          >
            <div className="flex items-center gap-2 md:flex-col md:items-start">
              <UserCheck className="h-5 w-5 text-primary shrink-0 md:mb-1" />
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Поможем подобрать</p>
                <p className="text-sm text-muted-foreground">Менеджер поможет выбрать форму</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors md:self-end" />
          </button>
        </div>

        {/* Checklist + FAQ side by side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Checklist */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <p className="font-medium text-sm">Что понадобится</p>
              {[
                "Паспорт гражданина РФ",
                "ИНН (или мы поможем узнать)",
                "СНИЛС",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* FAQ */}
          <div>
            <p className="font-medium text-sm mb-2">Частые вопросы</p>
            <Accordion type="single" collapsible>
              <AccordionItem value="1">
                <AccordionTrigger className="text-sm">Это полностью онлайн?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Онлайн-часть — заполнение заявки (~10 минут). После этого менеджер свяжется с вами для уточнения деталей и назначит встречу в офисе для подписания документов.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="2">
                <AccordionTrigger className="text-sm">Сколько стоит регистрация?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Подача заявки через наш сервис бесплатна. Госпошлина при электронной подаче не взимается.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="3">
                <AccordionTrigger className="text-sm">Нужно ли приходить в офис?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Да, для завершения регистрации потребуется визит в офис банка. Менеджер согласует удобное время.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <SupportBlock />
        </div>
      </main>
    </div>
  );
}

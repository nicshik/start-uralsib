import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SupportBlock } from "@/components/SupportBlock";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, Shield, Clock, ChevronRight, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const { dispatch, hasDraft, loadDraft, clearDraft } = useApp();
  const [showDraftWarning, setShowDraftWarning] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<"ip" | "ooo" | "help" | null>(null);

  useEffect(() => {
    trackEvent("page_view", { page: "landing" });
  }, []);

  const handleChoice = (type: "ip" | "ooo" | "help") => {
    if (hasDraft()) {
      setPendingProduct(type);
      setShowDraftWarning(true);
      return;
    }
    proceed(type);
  };

  const proceed = (type: "ip" | "ooo" | "help") => {
    dispatch({ type: "SET_PRODUCT", payload: type });
    trackEvent("product_selected", { product: type });
    navigate("/branching");
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-3 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">УРАЛСИБ</span>
          <SupportBlock compact />
        </div>
      </header>

      <main className="container max-w-lg mx-auto py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            Зарегистрируйте ИП или ООО<br />за ~10 минут онлайн
          </h1>
          <p className="text-muted-foreground">
            Онлайн-часть заявки — бесплатно и без госпошлины
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 text-success px-3 py-1 text-sm font-medium">
              <Shield className="h-3.5 w-3.5" /> Бесплатно
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium">
              <Clock className="h-3.5 w-3.5" /> ~10 минут
            </span>
          </div>
        </div>

        {/* Draft Warning */}
        {showDraftWarning && (
          <Card className="border-primary">
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

        {/* CTA Cards */}
        <div className="space-y-3">
          {[
            { type: "ip" as const, title: "Открыть ИП", desc: "Индивидуальный предприниматель" },
            { type: "ooo" as const, title: "Открыть ООО", desc: "Общество с ограниченной ответственностью" },
            { type: "help" as const, title: "Помогите выбрать", desc: "Ответьте на 3 вопроса — подберём форму" },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => handleChoice(item.type)}
              className="w-full text-left rounded-lg border bg-card p-4 hover:border-primary hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>

        {/* Checklist */}
        <Card>
          <CardContent className="p-4 space-y-3">
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

        <SupportBlock />
      </main>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SupportBlock } from "@/components/SupportBlock";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, Shield, Clock, ChevronRight, AlertCircle, UserCheck, Briefcase, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import heroCard3d from "@/assets/hero-card-3d.png";


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
      <header className="sticky top-0 z-50 bg-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M4 6C4 4.89543 4.89543 4 6 4H10C10 4 10 4 10 6V22C10 22 10 22 8 22H6C4.89543 22 4 21.1046 4 20V6Z" fill="white" fillOpacity="0.9"/>
              <path d="M10 18C10 18 10 22 14 22H22C23.1046 22 24 21.1046 24 20V18H10Z" fill="white" fillOpacity="0.9"/>
              <path d="M18 4H22C23.1046 4 24 4.89543 24 6V14C24 14 24 18 20 18H18V4Z" fill="white" fillOpacity="0.6"/>
            </svg>
            <span className="text-xl font-bold text-white tracking-tight">УРАЛСИБ</span>
          </div>
          <button
            className="text-white text-sm font-medium px-5 py-2 bg-transparent border-[1.5px] border-white rounded-[8px] hover:bg-white/10 transition-colors"
          >
            Войти
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="-mt-[60px] relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #2D1B69 0%, #1A0E45 100%)' }}>
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(100, 64, 191, 0.4) 0%, transparent 70%)' }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-[80px] pb-14 md:pt-[100px] md:pb-20 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-12">
            {/* Text */}
            <div className="flex-1 text-center md:text-left space-y-5">
              <h1 className="text-2xl sm:text-3xl md:text-[2.5rem] font-bold leading-tight tracking-tight text-white">
                Зарегистрируйте ИП или ООО
                <br className="hidden sm:block" />
                <span className="text-white/90"> за ~10 минут онлайн</span>
              </h1>
              <p className="text-white/60 text-sm md:text-base max-w-lg">
                Заполните заявку онлайн — бесплатно и без госпошлины.
                <br className="hidden sm:block" />
                Менеджер поможет завершить оформление.
              </p>
              <div className="flex justify-center md:justify-start gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 text-white px-4 py-1.5 text-sm font-medium">
                  <Shield className="h-3.5 w-3.5" /> Бесплатно
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 text-white px-4 py-1.5 text-sm font-medium">
                  <Clock className="h-3.5 w-3.5" /> ~10 минут
                </span>
              </div>
            </div>
            {/* 3D Illustration */}
            <div className="shrink-0 hidden md:block">
              <img src={heroCard3d} alt="" width={280} height={280} className="drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
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

        {/* CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { type: "ip" as const, icon: Briefcase, title: "Открыть ИП", desc: "Индивидуальный предприниматель", onClick: () => handleChoice("ip") },
            { type: "ooo" as const, icon: Building2, title: "Открыть ООО", desc: "Общество с ограниченной ответственностью", onClick: () => handleChoice("ooo") },
          ].map((item) => (
            <button
              key={item.type}
              onClick={item.onClick}
              className="text-left rounded-[20px] border border-[#E5E0EB] bg-white p-5 hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <item.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors self-end" />
            </button>
          ))}

          <button
            onClick={goToManager}
            className="text-left rounded-[20px] border border-[#E5E0EB] bg-white p-5 hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Поможем подобрать</p>
              <p className="text-sm text-muted-foreground mt-0.5">Менеджер поможет выбрать форму</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors self-end" />
          </button>
        </div>

        {/* Checklist + FAQ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-5 space-y-4">
              <p className="font-semibold text-sm">Что понадобится</p>
              {[
                "Паспорт гражданина РФ",
                "ИНН (или мы поможем узнать)",
                "СНИЛС",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <FileText className="h-3.5 w-3.5 text-accent-foreground" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div>
            <p className="font-semibold text-sm mb-3">Частые вопросы</p>
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

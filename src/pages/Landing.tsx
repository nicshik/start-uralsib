import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Clock, AlertCircle, UserCheck, Briefcase, Building2, MessageCircle, Phone, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import heroCard3d from "@/assets/hero-card-3d.png";
import uralsibLogo from "@/assets/uralsib-logo-clean.png";
import uralsibLogoDark from "@/assets/uralsib-logo-dark.png";
import { ProductQuiz } from "@/components/ProductQuiz";
import { SmsAuthDialog } from "@/pages/SmsAuth";
import { openChat } from "@/components/ChatWidget";


export default function Landing() {
  const navigate = useNavigate();
  const { dispatch, hasDraft, loadDraft, clearDraft } = useApp();
  const [showDraftWarning, setShowDraftWarning] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<"ip" | "ooo" | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isSmsOpen, setIsSmsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    setIsSmsOpen(true);
  };

  const resumeDraft = () => {
    loadDraft();
    trackEvent("draft_resumed");
    setIsSmsOpen(true);
  };

  const startFresh = () => {
    clearDraft();
    setShowDraftWarning(false);
    if (pendingProduct) proceed(pendingProduct);
  };

  const openQuiz = () => {
    setIsQuizOpen(true);
  };

  const handleQuizChoice = (choice: "ip" | "ooo" | "help") => {
    setIsQuizOpen(false);
    // Delay navigation slightly so the dialog unmounts first
    setTimeout(() => {
      if (choice === "help") {
        dispatch({ type: "SET_PRODUCT", payload: "help" });
        trackEvent("product_selected", { product: "help" });
        navigate("/manager");
      } else {
        handleChoice(choice);
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={scrolled ? uralsibLogoDark : uralsibLogo} alt="Уралсиб" className="h-8 object-contain transition-opacity duration-300" />
          </div>
          <button
            onClick={() => { trackEvent("header_login_click"); setIsSmsOpen(true); }}
            className={`text-sm font-medium px-5 py-2 rounded-[8px] transition-colors border-[1.5px] flex items-center gap-1.5 ${scrolled ? 'text-[#6440BF] border-[#6440BF] hover:bg-[#6440BF]/5' : 'text-white border-white hover:bg-white/10'}`}
          >
            <LogIn className="h-4 w-4" />
            Войти
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #2D1B69 0%, #1A0E45 100%)' }}>
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(100, 64, 191, 0.4) 0%, transparent 70%)' }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-[80px] pb-14 md:pt-[100px] md:pb-20 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-12">
            {/* Text */}
            <div className="flex-1 text-center md:text-left space-y-5">
              <h1 className="text-2xl sm:text-3xl md:text-[2.5rem] font-bold leading-tight tracking-tight text-white">
                <span>Зарегистрируйте ИП или ООО</span>
                <span className="hidden sm:block" />
                <span className="text-white/90"></span>
              </h1>
              <p className="text-white/60 text-sm md:text-base max-w-lg font-sans">
                Заполните заявку онлайн.<br />
                Менеджер поможет завершить процесс.
              </p>
              <div className="flex flex-col items-center md:items-start gap-4">
                <button
                  onClick={() => {
                    trackEvent("hero_cta_click");
                    const el = document.getElementById("cta-cards");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-8 py-3 rounded-xl bg-white text-[#2D1B69] font-semibold text-base hover:bg-white/90 transition-colors shadow-lg shadow-black/20"
                >
                  Оставить заявку
                </button>
                <div className="flex items-center gap-4 text-white/50 text-xs">
                  <span className="inline-flex items-center gap-1"><Shield className="h-3 w-3" /> Бесплатно</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> ~10 минут</span>
                </div>
              </div>
            </div>
            {/* 3D Illustration */}
            <div className="shrink-0 hidden md:block">
              <img src={heroCard3d} alt="" width={280} height={280} className="drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
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
        <div id="cta-cards" className="max-w-lg mx-auto space-y-3 scroll-mt-24">
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: "ip" as const, icon: Briefcase, title: "Открыть ИП", desc: "Индивидуальный предприниматель", onClick: () => handleChoice("ip") },
              { type: "ooo" as const, icon: Building2, title: "Открыть ООО", desc: "Общество с ограниченной ответственностью", onClick: () => handleChoice("ooo") },
            ].map((item) => (
              <button
                key={item.type}
                onClick={item.onClick}
                className="text-left rounded-xl border border-[#E5E0EB] bg-white p-4 hover:border-[#6440BF] hover:shadow-md transition-all duration-200 group flex flex-col"
              >
                <div className="w-9 h-9 rounded-lg bg-[#F0ECFA] flex items-center justify-center mb-3">
                  <item.icon className="h-4 w-4 text-[#6440BF]" />
                </div>
                <p className="font-semibold text-sm text-foreground group-hover:text-[#6440BF] transition-colors">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{item.desc}</p>
              </button>
            ))}
          </div>
          <button
            onClick={openQuiz}
            className="w-full text-left rounded-xl border border-[#E5E0EB] bg-white px-4 py-3 hover:border-[#6440BF] hover:shadow-md transition-all duration-200 group flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F0ECFA] flex items-center justify-center shrink-0">
              <UserCheck className="h-4 w-4 text-[#6440BF]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground group-hover:text-[#6440BF] transition-colors">Помочь выбрать</p>
              <p className="text-xs text-muted-foreground">Ответьте на 4 вопроса — подскажем подходящую форму</p>
            </div>
          </button>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto rounded-xl border border-[#E5E0EB] bg-white overflow-hidden">
          <Accordion type="single" collapsible>
            <AccordionItem value="1" className="border-b border-[#E5E0EB] last:border-0">
              <AccordionTrigger className="text-sm px-4 py-3">Это полностью онлайн?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground px-4 pb-3">
                Онлайн-часть — заполнение заявки (~10 минут). После менеджер свяжется и назначит встречу в офисе.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="2" className="border-b border-[#E5E0EB] last:border-0">
              <AccordionTrigger className="text-sm px-4 py-3">Сколько стоит регистрация?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground px-4 pb-3">
                Подача заявки бесплатна. Госпошлина при электронной подаче не взимается.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="3" className="border-b border-[#E5E0EB] last:border-0">
              <AccordionTrigger className="text-sm px-4 py-3">Нужно ли приходить в офис?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground px-4 pb-3">
                Да, один визит для подписания документов. Менеджер согласует удобное время.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#F4F3F7] border-t border-[#E5E0EB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {/* Contact card */}
          <div className="rounded-[20px] bg-[#6440BF] text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <p className="font-bold text-lg">Свяжитесь с нами</p>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Phone className="h-4 w-4" />
                <span>8 800 250-57-57 (бесплатно по РФ)</span>
              </div>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Phone className="h-4 w-4" />
                <span>+7 (495) 723-77-21 (Москва)</span>
              </div>
            </div>
            <div className="flex gap-3">
              {["VK", "TG", "OK"].map((soc) => (
                <div key={soc} className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center text-white text-xs font-bold cursor-pointer">
                  {soc}
                </div>
              ))}
            </div>
          </div>

          {/* Legal accordion */}
          <div className="rounded-[16px] border border-[#E5E0EB] bg-white p-1">
            <Accordion type="single" collapsible>
              <AccordionItem value="legal" className="border-none">
                <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground px-4">Юридическая информация</AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed px-4">
                  ПАО «БАНК УРАЛСИБ». Генеральная лицензия Банка России №30 от 10.09.2015. 119048, г. Москва, ул. Ефремова, д. 8. Реклама. Подробности на сайте uralsib.ru. Не является публичной офертой.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground text-center max-w-md mx-auto">
            Этот сайт выполнен в рамках учебного проекта, вся представленная информация представлена в демонстрационных целях, введенные персональные данные не сохраняются на сервере и не передаются третьим лицам.
          </p>
        </div>
      </footer>

      {/* FAB */}
      <button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#2D1B69] text-white flex items-center justify-center hover:scale-105 transition-transform"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
        onClick={() => openChat()}
        aria-label="Открыть чат"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <ProductQuiz open={isQuizOpen} onOpenChange={setIsQuizOpen} onResultChoice={handleQuizChoice} />
      <SmsAuthDialog open={isSmsOpen} onOpenChange={setIsSmsOpen} />
    </div>
  );
}

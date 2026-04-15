import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Clock, AlertCircle, UserCheck, Briefcase, Building2, MessageCircle, Phone, LogIn, ClipboardCheck, BarChart3, Palette } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { useState, useEffect } from "react";
import heroCard3d from "@/assets/hero-card-3d.webp";
import uralsibLogo from "@/assets/uralsib-logo-clean.webp";
import uralsibLogoDark from "@/assets/uralsib-logo-dark.webp";
import { ProductQuiz } from "@/components/ProductQuiz";
import { SmsAuthDialog } from "@/pages/SmsAuth";
import { openChat } from "@/components/ChatWidget";


export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch, hasDraft, loadDraft, clearDraft } = useApp();
  const [showDraftWarning, setShowDraftWarning] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<"ip" | "ooo" | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isSmsOpen, setIsSmsOpen] = useState(false);
  const [isLoginSmsOpen, setIsLoginSmsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    trackEvent("page_view", { page: "landing", flowType: "online_light" });
  }, []);

  useEffect(() => {
    if ((location.state as { scrollToCta?: boolean } | null)?.scrollToCta) {
      const el = document.getElementById("cta-cards");
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [location.state]);

  const handleChoice = (type: "ip" | "ooo") => {
    if (hasDraft()) {
      setPendingProduct(type);
      setShowDraftWarning(true);
      return;
    }
    proceed(type);
  };

  const proceed = (type: "ip" | "ooo") => {
    dispatch({ type: "SET_FLOW", payload: "online_light" });
    dispatch({ type: "SET_PRODUCT", payload: type });
    trackEvent("online_light_started", { product: type, flowType: "online_light" });
    trackEvent("product_selected", { product: type, flowType: "online_light" });
    if (state.smsVerified) {
      dispatch({ type: "SET_STEP", payload: 1 });
      navigate("/step/1");
    } else {
      setIsSmsOpen(true);
    }
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
        dispatch({ type: "SET_FLOW", payload: "online_light" });
        dispatch({ type: "SET_PRODUCT", payload: "help" });
        trackEvent("product_selected", { product: "help", flowType: "online_light" });
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
            <img
              src={scrolled ? uralsibLogoDark : uralsibLogo}
              alt="Уралсиб"
              width={136}
              height={32}
              loading="eager"
              decoding="sync"
              className="h-8 w-[136px] object-contain transition-opacity duration-300"
            />
          </div>
          {state.smsVerified ? (
            <UserMenu variant={scrolled ? "light" : "dark"} />
          ) : (
            <button
              onClick={() => {
                dispatch({ type: "SET_FLOW", payload: "online_light" });
                trackEvent("header_login_click", { flowType: "online_light" });
                setIsLoginSmsOpen(true);
              }}
              className={`text-sm font-medium px-5 py-2 rounded-[8px] transition-colors border-[1.5px] flex items-center gap-1.5 ${scrolled ? 'text-primary border-primary hover:bg-primary/5' : 'text-white border-white hover:bg-white/10'}`}
            >
              <LogIn className="h-4 w-4" />
              Войти
            </button>
          )}
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
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> ~10 минут на заявку</span>
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
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
        <div id="cta-cards" className="max-w-4xl mx-auto space-y-4 scroll-mt-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { type: "ip" as const, icon: Briefcase, title: "Открыть ИП", desc: "Индивидуальный предприниматель", onClick: () => handleChoice("ip") },
              { type: "ooo" as const, icon: Building2, title: "Открыть ООО", desc: "Общество с ограниченной ответственностью", onClick: () => handleChoice("ooo") },
            ].map((item) => (
              <button
                key={item.type}
                onClick={item.onClick}
                className="group flex items-center gap-5 rounded-xl border border-border bg-white p-5 text-left transition-all duration-200 hover:border-primary hover:shadow-md sm:flex-row sm:items-center sm:p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-light-purple">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={openQuiz}
            className="w-full text-left rounded-xl border border-border bg-white p-5 hover:border-primary hover:shadow-md transition-all duration-200 group flex items-center gap-5"
          >
            <div className="w-12 h-12 rounded-lg bg-light-purple flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">Помощь с выбором</p>
              <p className="text-sm text-muted-foreground mt-1">Ответьте на 4 вопроса — подскажем подходящую форму</p>
            </div>
          </button>
        </div>

        {/* Benefits */}
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-center">Удобный и понятный сервис</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-4 rounded-xl border border-border bg-white p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-light-purple">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-medium">10 минут на предзаявку</p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">Вы заполняете основные данные, а менеджер помогает собрать полный регистрационный пакет</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-border bg-white p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-light-purple">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-medium">Без дублирования</p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">В офисе сотрудник проверит данные вашей заявки и дозаполнит недостающие поля</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border border-border bg-white p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-light-purple">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-medium">Актуальные формы</p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">Финальный пакет документов готовится по формам Р11001 и Р21001 после проверки данных</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto rounded-xl border border-border bg-white overflow-hidden">
          <Accordion type="single" collapsible>
            <AccordionItem value="1" className="border-b border-border last:border-0">
              <AccordionTrigger className="px-6 py-4 text-left text-base">Это полностью онлайн?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground px-6 pb-4">
                Онлайн-часть — заполнение заявки (~10 минут).<br />
                После менеджер свяжется и назначит встречу в удобном для вас отделении банка.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="2" className="border-b border-border last:border-0">
              <AccordionTrigger className="px-6 py-4 text-left text-base">Сколько стоит регистрация?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground px-6 pb-4">
                Подача заявки бесплатна. Госпошлина при электронной подаче не взимается.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="3" className="border-b border-border last:border-0">
              <AccordionTrigger className="px-6 py-4 text-left text-base">Какие документы будут подготовлены?</AccordionTrigger>
              <AccordionContent className="px-6 pb-5">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>После проверки и дозаполнения подготовим пакет под выбранную форму бизнеса.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-brand-light p-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground">ИП</p>
                      <ul className="space-y-1.5 text-sm leading-relaxed">
                        <li>Заявление на регистрацию ИП</li>
                        <li>Заявление на УСН</li>
                        <li>Инструкция по регистрации ИП</li>
                      </ul>
                    </div>
                    <div className="rounded-lg bg-brand-light p-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground">ООО</p>
                      <ul className="space-y-1.5 text-sm leading-relaxed">
                        <li>Заявление на регистрацию ООО</li>
                        <li>Заявление на УСН</li>
                        <li>Устав ООО</li>
                        <li>Решение или протокол учредителей</li>
                        <li>Инструкция по регистрации ООО</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="4" className="border-b border-border last:border-0">
              <AccordionTrigger className="px-6 py-4 text-left text-base">Нужно ли приходить в офис?</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground px-6 pb-4">
                Да, один визит для подписания документов. Менеджер согласует удобное время.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-light border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {/* Contact card */}
          <div className="rounded-card-lg bg-[#6440BF] text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
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
          <div className="rounded-card border border-border bg-white p-1">
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
          <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
            Этот сайт выполнен в рамках учебного проекта, вся информация представлена в демонстрационных целях.<br />
            Введенные персональные данные не сохраняются на сервере и не передаются третьим лицам.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                trackEvent("assisted_entry_link_click", { placement: "footer" });
                navigate("/assisted-start");
              }}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Оформление с менеджером
            </button>
            <span className="text-xs text-muted-foreground/40">·</span>
            <button
              onClick={() => {
                trackEvent("crm_entry_link_click", { placement: "footer" });
                navigate("/office-agent");
              }}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              CRM менеджера
            </button>
          </div>
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
      <SmsAuthDialog open={isLoginSmsOpen} onOpenChange={setIsLoginSmsOpen} onSuccess={() => {}} />
    </div>
  );
}

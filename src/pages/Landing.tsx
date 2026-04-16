import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Clock, AlertCircle, UserCheck, Briefcase, Building2, MessageCircle, Phone, LogIn, ClipboardCheck, BarChart3, Palette, Handshake, LayoutDashboard } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { useState, useEffect, useRef } from "react";
import heroCard3d from "@/assets/hero-card-3d.webp";
import uralsibLogo from "@/assets/uralsib-logo-clean.webp";
import uralsibLogoDark from "@/assets/uralsib-logo-dark.webp";
import { ProductQuiz } from "@/components/ProductQuiz";
import { SmsAuthDialog } from "@/pages/SmsAuth";
import { openChat } from "@/components/ChatWidget";


function ScrollReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-[600ms] ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} ${className}`}
    >
      {children}
    </div>
  );
}

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
              <h1 className="text-3xl sm:text-3xl md:text-[2.5rem] font-bold leading-tight tracking-tight text-white">
                <span>Зарегистрируйте ИП или ООО</span>
                <span className="hidden sm:block" />
                <span className="text-white/90"></span>
              </h1>
              <p className="text-[#C4B7E0] text-sm md:text-base max-w-lg font-sans">
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
                  className="px-10 py-3.5 rounded-full bg-white text-[#6440BF] font-medium text-base hover:bg-white/95 transition-all shadow-[0_4px_16px_rgba(100,64,191,0.3)] hover:shadow-[0_6px_24px_rgba(100,64,191,0.4)]"
                >
                  Оставить заявку
                </button>
                <div className="flex items-center gap-4 text-[#C4B7E0]/70 text-xs">
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
                className="group flex items-center gap-5 rounded-[16px] border border-border bg-white p-5 text-left transition-all duration-200 hover:border-primary hover:shadow-md hover:-translate-y-0.5 sm:flex-row sm:items-center sm:p-5"
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
            className="w-full text-left rounded-[16px] border border-border bg-white p-5 hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex items-center gap-5"
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
        <ScrollReveal className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-medium tracking-tight text-center">Удобный и понятный сервис</h2>
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
        </ScrollReveal>

        {/* FAQ */}
        <ScrollReveal className="max-w-4xl mx-auto rounded-xl border border-border bg-white overflow-hidden">
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
        </ScrollReveal>
      </main>

      {/* Footer */}
      <footer className="bg-brand-light border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {/* Contact card */}
          <div className="rounded-card-lg bg-[#2D1B69] text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
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
              {[
                { key: "vk", label: "ВКонтакте", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.596-.19 1.362 1.259 2.174 1.815.613.42 1.08.328 1.08.328l2.168-.03s1.132-.07.595-.964c-.044-.073-.313-.66-1.609-1.866-1.357-1.263-1.175-1.059.459-3.244.995-1.33 1.392-2.142 1.268-2.49-.118-.331-.847-.244-.847-.244l-2.441.015s-.181-.025-.315.056c-.131.079-.215.263-.215.263s-.387 1.028-.9 1.902c-1.085 1.849-1.52 1.946-1.696 1.832-.412-.266-.309-1.07-.309-1.64 0-1.782.271-2.525-.527-2.716-.265-.063-.46-.105-1.138-.112-.869-.009-1.604.003-2.02.207-.277.136-.491.437-.361.454.16.022.523.098.716.36.248.338.24 1.097.24 1.097s.143 2.098-.333 2.357c-.327.178-.775-.185-1.737-1.846-.493-.852-.866-1.794-.866-1.794s-.072-.176-.2-.27c-.155-.114-.372-.15-.372-.15l-2.322.016s-.348.01-.476.161C3.726 7.63 3.9 7.9 3.9 7.9s1.817 4.244 3.874 6.381c1.886 1.96 4.03 1.832 4.03 1.832l.981.003z"/></svg> },
                { key: "tg", label: "Telegram", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
                { key: "ok", label: "Одноклассники", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M14.505 17.44a11.599 11.599 0 0 0 2.626-1.107c.46-.284.674-.87.51-1.388a1.14 1.14 0 0 0-1.595-.585 9.339 9.339 0 0 1-8.094.002 1.138 1.138 0 0 0-1.594.583c-.165.52.05 1.104.51 1.39a11.598 11.598 0 0 0 2.629 1.108l-2.465 2.467a1.14 1.14 0 0 0 0 1.611 1.14 1.14 0 0 0 1.611 0L12 18.952l2.357 2.357a1.14 1.14 0 0 0 1.611 0 1.14 1.14 0 0 0 0-1.61l-2.463-2.26zM12 12.11c3.24 0 5.865-2.627 5.865-5.867C17.865 2.98 15.24.355 12 .355 8.76.355 6.135 2.98 6.135 6.243c0 3.24 2.625 5.867 5.865 5.867zm0-9.454a3.59 3.59 0 0 1 3.585 3.587A3.59 3.59 0 0 1 12 9.83a3.59 3.59 0 0 1-3.585-3.587A3.59 3.59 0 0 1 12 2.656z"/></svg> }
              ].map((soc) => (
                <a key={soc.key} href="#" aria-label={soc.label} className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center text-white cursor-pointer">
                  {soc.icon}
                </a>
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

          {/* Project docs */}
          <div className="rounded-xl border border-dashed border-border bg-white/60 p-5 space-y-3 opacity-70 hover:opacity-100 transition-opacity duration-300">
            <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">для команды · рабочая документация</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              <button
                onClick={() => navigate("/coverage")}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/60 transition-colors text-left"
              >
                <BarChart3 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Матрица покрытия полей</p>
                  <p className="text-xs text-muted-foreground/70">Какие данные собираются на каждом этапе</p>
                </div>
              </button>
              <button
                onClick={() => navigate("/design")}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/60 transition-colors text-left"
              >
                <Palette className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Дизайн-код</p>
                  <p className="text-xs text-muted-foreground/70">Визуальные стандарты и компоненты</p>
                </div>
              </button>
              <button
                onClick={() => {
                  trackEvent("assisted_entry_link_click", { placement: "footer" });
                  navigate("/assisted-start");
                }}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/60 transition-colors text-left"
              >
                <Handshake className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Оформление с менеджером</p>
                  <p className="text-xs text-muted-foreground/70">Ассистированный сценарий подачи заявки</p>
                </div>
              </button>
              <button
                onClick={() => {
                  trackEvent("crm_entry_link_click", { placement: "footer" });
                  navigate("/office-agent");
                }}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted/60 transition-colors text-left"
              >
                <LayoutDashboard className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CRM менеджера</p>
                  <p className="text-xs text-muted-foreground/70">Рабочее пространство сотрудника банка</p>
                </div>
              </button>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
            Этот сайт выполнен в рамках учебного проекта, вся информация представлена в демонстрационных целях.<br />
            Введенные персональные данные не сохраняются на сервере и не передаются третьим лицам.
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
      <SmsAuthDialog open={isLoginSmsOpen} onOpenChange={setIsLoginSmsOpen} onSuccess={() => {}} />
    </div>
  );
}

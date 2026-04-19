import React, { useState } from "react";
import {
  Lightbulb,
  Target,
  Layers,
  ScanLine,
  Building2,
  ListFilter,
  History,
  Split,
  Handshake,
  ArrowRight,
  Briefcase,
  CreditCard,
  Smartphone,
  Globe,
  Wallet,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  Users,
  Building,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Hypothesis = {
  id: string;
  title: string;
  icon: React.ElementType;
  fact: string;
  mvp: string;
};

const HYPOTHESES: Hypothesis[] = [
  {
    id: "H1",
    title: "Снизить неопределённость до авторизации",
    icon: Target,
    fact: "Между CTA на главной и стартом формы есть искусственный отвал: пользователь не уверен, что попал туда, куда нужно.",
    mvp: "Hero с «~10 мин», ProductQuiz, отложенная SMS",
  },
  {
    id: "H2",
    title: "Разбить бюрократию на 4 тематических шага",
    icon: Layers,
    fact: "Самый резкий провал воронки — первый переход со Шага 1 на Шаг 2, где начинается тяжёлый паспортно-адресный блок.",
    mvp: "Business → Passport → Contact → Review",
  },
  {
    id: "H3",
    title: "Сделать OCR центральным действием",
    icon: ScanLine,
    fact: "Мобильная аудитория преобладает, а ручной ввод паспортных полей с телефона — критический барьер.",
    mvp: "OCR автозаполняет 11 паспортных полей + fallback",
  },
  {
    id: "H4",
    title: "Перенести сложность ООО в офис",
    icon: Building2,
    fact: "ООО сложнее ИП на порядок: устав, учредители, адрес, директор — эти поля плохо работают в публичном онлайне без сопровождения.",
    mvp: "Online Light: онлайн только простые поля, офис дозаполняет",
  },
  {
    id: "H5",
    title: "Дать контроль на ОКВЭД",
    icon: ListFilter,
    fact: "UX-аудит CJM в Miro выявил ряд системных проблем на экране ОКВЭД: нельзя вбить код, нет сброса, выделяются все подпункты.",
    mvp: "Поиск по коду и названию, сброс, AI-подбор",
  },
  {
    id: "H6",
    title: "Поддержать многосессионность",
    icon: History,
    fact: "Регистрацию редко завершают в одну сессию: пользователи возвращаются, начинают заново и создают дубликаты пакетов.",
    mvp: "Autosave, Draft Warning, /my-applications",
  },
  {
    id: "H7",
    title: "Разделить регистрацию и РКО",
    icon: Split,
    fact: "Account-шаг в конце воронки ведёт себя как блокирующий барьер: банковский продукт требует завершить оформление до отправки документов.",
    mvp: "РКО как primary CTA после success, не блокирует",
  },
  {
    id: "H8",
    title: "Формализовать assisted-сценарий",
    icon: Handshake,
    fact: "Product Owner подтвердил: сотрудники банка уже заходят по прямым ссылкам и помогают клиентам в отделениях — этот сценарий нужно формализовать.",
    mvp: "/office-agent: CRM менеджера, сканы, отправка в ФНС",
  },
];

const ECOSYSTEM_JOURNEY = [
  {
    num: 1,
    title: "Регистрация ИП / ООО в ФНС",
    desc: "Наш MVP: 4 шага онлайн + офис-CRM менеджера",
  },
  {
    num: 2,
    title: "Открытие РКО без посещения офиса",
    desc: "Сотрудник приедет с документами. Primary CTA на success-экране (H7)",
  },
  {
    num: 3,
    title: "Активация Уралсиб Бизнес Онлайн",
    desc: "Интернет-банк + мобильное приложение: переводы 24/7, заказ наличных, чеки",
  },
  {
    num: 4,
    title: "Сопутствующие продукты",
    desc: "Бизнес-карта (7% кешбэк), эквайринг, ВЭД, депозиты, кредиты",
  },
];

const ECOSYSTEM_PRODUCTS = [
  {
    title: "Уралсиб Бизнес Онлайн",
    desc: "Интернет-банк + мобильное приложение, переводы 24/7",
    icon: Smartphone,
  },
  {
    title: "Бизнес-карта",
    desc: "Кешбэк до 7% на АЗС, еду, билеты, офис",
    icon: CreditCard,
  },
  {
    title: "Эквайринг и ВЭД",
    desc: "POS-терминалы + валютный контроль",
    icon: Globe,
  },
  {
    title: "Депозиты, кредиты, зарплаты",
    desc: "Полный набор финансовых продуктов",
    icon: Wallet,
  },
];

function HypothesisCard({ h, idx }: { h: Hypothesis; idx: number }) {
  const Icon = h.icon;
  return (
    <div
      className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-uralsib-md hover:border-primary/40"
      style={{ animationDelay: `${idx * 40}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-11 h-11 rounded-xl bg-light-purple text-primary flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-primary bg-light-purple px-2 py-0.5 rounded">
              {h.id}
            </span>
          </div>
          <h3 className="text-base md:text-lg font-semibold text-foreground leading-snug mb-3">
            {h.title}
          </h3>
          <div className="space-y-2.5 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Наблюдение
              </p>
              <p className="text-foreground leading-snug">{h.fact}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-primary mb-1">
                Решение в MVP
              </p>
              <p className="text-foreground leading-snug">{h.mvp}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hypotheses() {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="min-h-screen bg-background selection:bg-accent pb-24">
      <AppHeader showBack backTo="/" />

      {/* Hero */}
      <header className="text-white pt-12 pb-24 px-6 md:px-10 text-center bg-gradient-to-b from-[#2D1B69] to-[#1A0E45]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium border border-white/20">
            <Lightbulb className="w-4 h-4" /> Продуктовые гипотезы
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            8 гипотез — от факта к&nbsp;решению
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Каждая гипотеза опирается на наблюдение из Метрики, анализ воронки
            и аудита CJM (выполнен в Miro), и превращается в конкретное решение
            в MVP.
          </p>

          <Collapsible defaultOpen className="mt-8 max-w-3xl mx-auto text-left">
            <CollapsibleTrigger className="group flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-medium border border-white/20 transition-colors mx-auto">
              <span>Как мы пришли к этим гипотезам</span>
              <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 md:p-8 space-y-5 text-sm leading-relaxed text-white/80">
              <p className="text-white/90">
                Чтобы сформулировать гипотезы, мы прошли полный исследовательский цикл:
              </p>
              <ol className="space-y-3 list-none pl-0">
                {[
                  "Проанализировали данные веб-аналитики текущего сервиса регистрации ИП и ООО",
                  "Изучили текущий вебсайт и совместно с продуктовым исследователем построили карту клиентского пути (CJM) в Miro",
                  "Разобрали воронку конверсии и достижение целей по ключевым этапам сценария",
                  "Уточнили ключевые вопросы, ограничения и приоритеты с Product Owner",
                ].map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-white/20 text-white text-xs font-semibold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
              <p>
                На основе этих данных разработали набор гипотез, которые раскрыты
                ниже. Приоритизация: сначала квалификации (H1) и 4-шаговая форма
                (H2, H5), затем OCR (H3), перенос сложности в офис (H4, H8) и
                многосессионность (H6). H7 — стратегическая развязка РКО и
                регистрации.
              </p>
              <p className="text-white/60">
                H9 — стратегический инсайт: регистрация не конечный продукт, а вход
                в банковскую экосистему. Его мы раскрываем в карточке выше основного
                списка.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 space-y-16 -mt-12 relative z-10">
        {/* Key hypothesis — H9 */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-light-purple via-card to-card shadow-uralsib-lg overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono font-bold text-primary bg-card border border-primary/30 px-2.5 py-1 rounded">
                H9
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
                <Sparkles className="w-4 h-4" /> Ключевой продуктовый инсайт
              </span>
            </div>
            <CardTitle className="text-2xl md:text-3xl leading-tight mt-3">
              Регистрация — не конечный продукт, а вход в банковскую экосистему
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <p className="text-base md:text-lg text-foreground leading-relaxed max-w-4xl">
              Банк завершает оформление и сопровождает клиента дальше — РКО,
              бизнес-карта, Уралсиб Бизнес Онлайн, эквайринг, ВЭД. Именно это
              делает регистрацию экономически оправданным лид-магнитом, а не
              разовой услугой.
            </p>

            <div className="grid md:grid-cols-[1.3fr_1fr] gap-8">
              {/* Journey */}
              <div>
                <h3 className="text-base font-semibold text-foreground mb-5">
                  Путь клиента после успешной регистрации
                </h3>
                <ol className="space-y-5">
                  {ECOSYSTEM_JOURNEY.map((step) => (
                    <li key={step.num} className="flex gap-4">
                      <div className="shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center">
                        {step.num}
                      </div>
                      <div className="min-w-0 pt-1">
                        <p className="font-semibold text-foreground leading-snug">
                          {step.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 leading-snug">
                          {step.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Ecosystem products */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Экосистема Уралсиба для бизнеса
                </h3>
                <ul className="space-y-4">
                  {ECOSYSTEM_PRODUCTS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <li key={p.title} className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-light-purple text-primary flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm leading-snug">
                            {p.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                            {p.desc}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <a
                  href="https://www.uralsib.ru/business/rko"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-5"
                >
                  Подробнее: uralsib.ru/business/rko
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Why for the bank */}
            <div className="rounded-2xl bg-light-purple border border-primary/20 p-5 md:p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Зачем это банку
                </h3>
              </div>
              <ul className="grid md:grid-cols-3 gap-4 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground leading-snug">
                    <strong>LTV клиента ×N</strong> вместо единоразовой регистрации
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground leading-snug">
                    <strong>Офлайн-визит</strong> = прямой контакт и идеальная
                    точка кросс-селла
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground leading-snug">
                    <strong>Регистрация как лид-магнит</strong> в собственный
                    бесплатный канал привлечения
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 8 hypotheses grid */}
        <section>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-foreground">
                8 продуктовых гипотез
              </h2>
              <p className="text-base text-muted-foreground mt-2 max-w-2xl">
                Приоритизация: H1 и H2 закрывают наибольший массив потерь воронки,
                остальные — усиливают отдельные шаги и стратегические развязки.
              </p>
            </div>
            <button
              onClick={() => setShowTable((v) => !v)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              {showTable ? "Показать карточками" : "Показать таблицей"}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showTable ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {!showTable ? (
            <div className="grid md:grid-cols-2 gap-5">
              {HYPOTHESES.map((h, idx) => (
                <HypothesisCard key={h.id} h={h} idx={idx} />
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">№</TableHead>
                      <TableHead className="w-[28%]">Гипотеза</TableHead>
                      <TableHead className="w-[36%]">Наблюдение</TableHead>
                      <TableHead>Решение в MVP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {HYPOTHESES.map((h) => (
                      <TableRow key={h.id} className="hover:bg-accent/30">
                        <TableCell className="font-mono font-semibold text-primary">
                          {h.id}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {h.title}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {h.fact}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {h.mvp}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Segment splits — ИП / ООО context */}
        <section className="grid md:grid-cols-2 gap-5">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-light-purple text-primary flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">ИП</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-snug">
              Mobile-first сегмент: основной путь — с телефона. OCR-центричный
              Шаг 2 существенно усиливает конверсию. Основной рычаг — H1, H2, H3, H6.
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-light-purple text-primary flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">ООО</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-snug">
              Сложнее ИП на порядок: устав, учредители, адрес, директор.
              Основной рычаг — H4 и H8: онлайн только простые поля, офис-CRM
              дозаполняет остальное.
            </p>
          </Card>
        </section>

        {/* Methodology & related artefacts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Методология и связанные материалы</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Как была построена работа и где посмотреть продолжение
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Анализ данных веб-аналитики текущего сервиса регистрации" },
                { label: "UX-аудит клиентского пути (CJM) в Miro совместно с продуктовым исследователем" },
                { label: "Валидация воронки конверсии и достижения целей по этапам" },
                { label: "Сопоставление проблем и решений в формате матрицы «проблема → решение в MVP»" },
                { label: "Q&A с Product Owner: приоритеты, ограничения, ожидания от метрики" },
                { label: "Матрица покрытия полей", url: "/coverage" },
                { label: "Дизайн-код Уралсиб", url: "/design" },
              ].map((src, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-primary font-bold select-none mt-0.5">•</span>
                  {src.url ? (
                    <a
                      href={src.url}
                      className="text-primary hover:underline break-words leading-snug"
                    >
                      {src.label}
                    </a>
                  ) : (
                    <span className="text-foreground leading-snug">{src.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

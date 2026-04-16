import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  User,
  MonitorSmartphone,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Lock,
  Minus,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MATRIX_DATA = [
  {
    group: "Общие поля (ИП + ООО)",
    rows: [
      { name: "Форма бизнеса (ИП / ООО)", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Налоговый режим", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Основной ОКВЭД", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Дополнительные ОКВЭД", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Телефон", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Email контактный", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Email для направления результата", lite: "auto", assisted: "yes", crm: "yes" },
      { name: "Способ получения документов", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Подтверждение достоверности", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Предпочтение по визиту", lite: "yes", assisted: "no", crm: "no" },
    ],
  },
  {
    group: "ИП — Личность, Адрес, Пакет",
    rows: [
      { name: "Фамилия", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Имя", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Отчество", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Дата рождения", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Пол", lite: "auto", assisted: "yes", crm: "yes" },
      { name: "Место рождения", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Гражданство", lite: "crm", assisted: "yes", crm: "yes" },
      { name: "Вид документа", lite: "auto", assisted: "yes", crm: "yes" },
      { name: "Серия паспорта", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Номер паспорта", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Кем выдан", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Дата выдачи паспорта", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Код подразделения", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Адрес регистрации по месту жительства", lite: "crm", assisted: "yes", crm: "yes" },
      { name: "Email ИП", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "ИНН", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "СНИЛС", lite: "yes", assisted: "yes", crm: "yes" },
    ],
  },
  {
    group: "ООО — Юрлицо, Учредитель, Руководитель",
    rows: [
      { name: "Краткое наименование", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Полное наименование", lite: "auto", assisted: "yes", crm: "yes" },
      { name: "Место нахождения ЮЛ (субъект РФ)", lite: "crm", assisted: "yes", crm: "yes" },
      { name: "Адрес ЮЛ (полный)", lite: "crm", assisted: "yes", crm: "yes" },
      { name: "Email юридического лица", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Вид капитала", lite: "auto", assisted: "auto", crm: "yes" },
      { name: "Размер уставного капитала", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Тип устава", lite: "crm", assisted: "yes", crm: "yes" },
      { name: "Номер типового устава", lite: "crm", assisted: "yes", crm: "yes" },
      { name: "Количество учредителей", lite: "crm", assisted: "yes", crm: "auto" },
      { name: "Фамилия учредителя", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Имя учредителя", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Отчество учредителя", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Дата рождения учредителя", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Пол учредителя", lite: "auto", assisted: "yes", crm: "yes" },
      { name: "Место рождения учредителя", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Гражданство учредителя", lite: "crm", assisted: "yes", crm: "yes" },
      { name: "Документ учредителя (вид)", lite: "auto", assisted: "yes", crm: "yes" },
      { name: "Серия паспорта учредителя", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Номер паспорта учредителя", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Кем выдан (учредитель)", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Дата выдачи паспорта (учредитель)", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Код подразделения учредителя", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Адрес регистрации учредителя", lite: "crm", assisted: "yes", crm: "yes" },
      { name: "Доля учредителя в УК", lite: "crm", assisted: "auto", crm: "yes" },
      { name: "ИНН учредителя", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "СНИЛС учредителя", lite: "yes", assisted: "yes", crm: "yes" },
      { name: "Руководитель является учредителем", lite: "crm", assisted: "yes", crm: "yes" },
      { name: "Должность руководителя", lite: "crm", assisted: "yes", crm: "yes" },
      { name: "Срок избрания руководителя", lite: "crm", assisted: "yes", crm: "yes" },
      { name: "Роль заявителя", lite: "crm", assisted: "auto", crm: "yes" },
      { name: "Печать организации", lite: "crm", assisted: "yes", crm: "yes" },
    ],
  },
];

interface StatBarProps {
  label: string;
  filled: number;
  total: number;
  icon: React.ElementType;
}

const StatBar = ({ label, filled, total, icon: Icon }: StatBarProps) => {
  const percentage = Math.round((filled / total) * 100);
  const gap = total - filled;
  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-2 text-foreground">
          <Icon className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-foreground">{filled}</span>
          <span className="text-sm text-muted-foreground"> / {total} полей</span>
        </div>
      </div>
      <div className="h-2 w-full bg-border rounded-full overflow-hidden flex">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {gap > 0 && (
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 font-medium">
          <ArrowRight className="w-3 h-3 text-primary" /> Дозаполняет менеджер: {gap}
        </p>
      )}
      {gap === 0 && (
        <p className="text-xs mt-2 flex items-center gap-1 font-medium text-success">
          <CheckCircle2 className="w-3 h-3" /> Полное покрытие
        </p>
      )}
    </div>
  );
};

interface ScenarioCardProps {
  title: string;
  description: string;
  user: string;
  route: string;
  icon: React.ElementType;
  link?: string;
}

const ScenarioCard = ({ title, description, user, route, icon: Icon, link }: ScenarioCardProps) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (link) navigate(link);
  };

  return (
    <div
      className="p-6 rounded-2xl bg-brand-light flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="p-3 bg-card rounded-xl text-primary">
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-mono bg-border text-foreground px-2 py-1 rounded">
          {route}
        </span>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-card px-3 py-1.5 rounded-lg border border-border w-full">
          <User className="w-4 h-4" />
          Кто: {user}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "yes") {
    return (
      <div className="inline-flex items-center gap-1.5 text-success">
        <CheckCircle2 className="w-4 h-4" /> <span className="text-sm font-medium">Да</span>
      </div>
    );
  }
  if (status === "auto") {
    return (
      <div className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Lock className="w-4 h-4" /> <span className="text-sm font-medium">Авто</span>
      </div>
    );
  }
  if (status === "crm") {
    return (
      <div className="inline-flex items-center gap-1.5 text-primary">
        <ArrowRight className="w-4 h-4" /> <span className="text-sm font-medium">В CRM</span>
      </div>
    );
  }
  if (status === "no") {
    return (
      <div className="inline-flex items-center gap-1.5 text-muted-foreground/60">
        <Minus className="w-4 h-4" /> <span className="text-sm font-medium">Нет</span>
      </div>
    );
  }
  return <span className="text-sm text-foreground">{status}</span>;
};

const DetailedTable = () => (
  <Card className="overflow-hidden">
    <CardHeader className="bg-brand-light border-b border-border">
      <CardTitle className="text-2xl">Детальная матрица полей</CardTitle>
      <p className="text-sm text-muted-foreground mt-1">
        Полный перечень собираемых данных в разрезе сценариев
      </p>
    </CardHeader>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-2/5">Поле / Раздел</TableHead>
            <TableHead className="w-1/5">1. Lite</TableHead>
            <TableHead className="w-1/5">2. Assisted</TableHead>
            <TableHead className="w-1/5">3. CRM</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MATRIX_DATA.map((group, gIdx) => (
            <React.Fragment key={gIdx}>
              <TableRow className="bg-muted">
                <TableCell colSpan={4} className="font-bold text-sm uppercase tracking-wide text-foreground">
                  {group.group}
                </TableCell>
              </TableRow>
              {group.rows.map((row, rIdx) => (
                <TableRow key={rIdx} className="hover:bg-accent/30 transition-colors">
                  <TableCell className="text-sm">{row.name}</TableCell>
                  <TableCell><StatusBadge status={row.lite} /></TableCell>
                  <TableCell><StatusBadge status={row.assisted} /></TableCell>
                  <TableCell><StatusBadge status={row.crm} /></TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default function FieldCoverage() {
  const missingIP = [
    "Гражданство",
    "Адрес регистрации",
  ];

  const missingOOO = [
    "Место нахождения ЮЛ", "Адрес ЮЛ (полный)",
    "Количество учредителей", "Гражданство учредителя",
    "Адрес рег. учредителя",
    "Доля в УК", "Руководитель = учредитель", "Должность руководителя",
    "Срок избрания", "Роль заявителя", "Тип устава",
    "Номер типового устава", "Печать",
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-accent pb-24">
      <AppHeader showBack backTo="/" />

      {/* Hero */}
      <header className="text-white pt-12 pb-20 px-6 md:px-10 text-center bg-gradient-to-b from-[#2D1B69] to-[#1A0E45]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium border border-white/20">
            <BarChart3 className="w-4 h-4" /> Аналитика процесса
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Матрица покрытия полей
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Анализ распределения нагрузки между клиентом и менеджером банка. Визуализация готовности анкет для ИП и ООО.
          </p>

          <Collapsible className="mt-8 max-w-3xl mx-auto text-left">
            <CollapsibleTrigger className="group flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-medium border border-white/20 transition-colors mx-auto">
              <span>Продуктовая гипотеза в основе</span>
              <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 md:p-8 space-y-6 text-sm leading-relaxed text-white/80">
              <div>
                <h3 className="text-base font-semibold text-white mb-2">Контекст</h3>
                <p>
                  После сверки клиентских форм с требованиями ФНС и банковским/AS-IS пакетом стало видно, что единая большая анкета перегружает публичный self-service сценарий. В ней появляются поля, которые нужны для полного пакета документов и корректной подготовки Р11001/Р21001, но для клиента на первом онлайн-этапе выглядят техническими и преждевременными.
                </p>
                <p className="mt-3">
                  <span className="font-semibold text-white">Ключевое изменение подхода:</span> публичная онлайн-заявка не обязана собирать полный пакет данных до визита клиента в офис. Если в процессе все равно есть очная верификация личности в отделении банка, часть данных можно корректно дозаполнить там. Сотрудник банка одновременно проверит уже введённые сведения, уточнит спорные поля и поможет избежать ошибок в регистрационных документах.
                </p>
                <p className="mt-3">
                  Текущая большая анкета остаётся полезной, но меняет роль. Она должна жить в assisted-сценарии и в CRM, где рядом есть менеджер или сотрудник банка, который понимает смысл технических полей и может объяснить их клиенту.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2">Главный принцип TO-BE</h3>
                <p className="mb-3">Один конечный результат, три разных входа:</p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1">
                  <li>Клиент сам оставляет лёгкую онлайн-заявку.</li>
                  <li>Клиент сам заполняет полную анкету с сопровождением менеджера.</li>
                  <li>Менеджер или сотрудник банка заполняет заявку за клиента в CRM.</li>
                </ol>
                <p className="mt-3">
                  Все пути должны приводить к одной бизнес-цели: заявка на регистрацию ИП или ООО, подготовка регистрационного и банковского пакета, дальнейшая верификация и оформление. Отличается не результат, а момент сбора данных и ответственный за качество заполнения.
                </p>
                <p className="mt-3 text-white/60 italic">
                  Требования ФНС остаются актуальными. Меняется не перечень данных, которые в итоге понадобятся для ФНС и банка, а этап, на котором эти данные собираются.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 space-y-16 -mt-8 relative z-10">
        {/* Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Сценарии регистрации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <ScenarioCard
                title="1. Lite (Онлайн)"
                description="Клиент онлайн заполняет базовую анкету. Требует дозаполнения сотрудником в отделении банка."
                user="Клиент (до визита)"
                route="flowType: online_light"
                icon={MonitorSmartphone}
                link="/"
              />
              <ScenarioCard
                title="2. Assisted"
                description="Клиент в офисе на планшете или экране, сотрудник находится рядом и помогает."
                user="Клиент + Сотрудник"
                route="flowType: assisted"
                icon={User}
                link="/assisted-start"
              />
              <ScenarioCard
                title="3. CRM"
                description="Сотрудник самостоятельно формирует заявку со слов клиента в отделении."
                user="Сотрудник (в офисе)"
                route="/office-agent"
                icon={Briefcase}
                link="/office-agent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Coverage Stats */}
        <section>
          <h2 className="text-3xl font-medium text-foreground mb-8">Уровень покрытия анкет</h2>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="bg-brand-light rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-primary shadow-uralsib-sm">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-medium text-foreground">ИП (18 полей)</h3>
              </div>
              <StatBar label="Lite" filled={16} total={18} icon={MonitorSmartphone} />
              <StatBar label="Assisted" filled={18} total={18} icon={User} />
              <StatBar label="CRM" filled={18} total={18} icon={Briefcase} />
            </div>
            <div className="bg-brand-light rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-primary shadow-uralsib-sm">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-medium text-foreground">ООО (28 полей)</h3>
              </div>
              <StatBar label="Lite" filled={15} total={28} icon={MonitorSmartphone} />
              <StatBar label="Assisted" filled={28} total={28} icon={User} />
              <StatBar label="CRM" filled={28} total={28} icon={Briefcase} />
            </div>
          </div>
        </section>

        {/* Gap Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-medium text-foreground flex items-start md:items-center gap-3">
              <AlertCircle className="w-8 h-8 text-primary shrink-0" />
              <span>Заполняется менеджером в CRM</span>
            </h2>
            <p className="text-base text-muted-foreground mt-2 max-w-2xl">
              Данные, которые заполняет менеджер при сценарии подачи онлайн-заявки клиентом
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8">
              <h3 className="text-xl font-medium text-foreground mb-6 flex items-center justify-between">
                <span>ИП: Остаток для менеджера</span>
                <span className="bg-brand-light text-muted-foreground px-3 py-1 rounded-lg text-sm">~2 полей</span>
              </h3>
              <ul className="grid grid-cols-1 gap-y-3 text-sm text-foreground">
                {missingIP.map((field, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-primary font-bold select-none">•</span>
                    <span className="leading-snug">{field}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-8">
              <h3 className="text-xl font-medium text-foreground mb-6 flex items-center justify-between">
                <span>ООО: Остаток для менеджера</span>
                <span className="bg-accent text-primary px-3 py-1 rounded-lg text-sm">~13 полей</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-foreground">
                {missingOOO.map((field, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-primary font-bold select-none">•</span>
                    <span className="leading-snug">{field}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* Detailed Table */}
        <DetailedTable />

        {/* Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Источники</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Дата сверки: 2026-04-14
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {[
                { label: "ФНС: форма Р11001, заявление о государственной регистрации юридического лица при создании", url: "https://www.nalog.gov.ru/rn77/related_activities/registration_ip_yl/reg_yl/order/4162139/" },
                { label: "PDF формы Р11001", url: "https://www.nalog.gov.ru/cdn/form/4162139.pdf" },
                { label: "ФНС: порядок регистрации юридического лица", url: "https://www.nalog.gov.ru/rn77/related_activities/registration_ip_yl/reg_yl/order/" },
                { label: "ФНС: форма Р21001, заявление о государственной регистрации физического лица в качестве ИП", url: "https://www.nalog.gov.ru/rn77/related_activities/registration_ip_yl/registration_ip/order/4162994/" },
                { label: "PDF формы Р21001", url: "https://www.nalog.gov.ru/cdn/form/4162994.pdf" },
                { label: "ФНС: порядок регистрации ИП", url: "https://www.nalog.gov.ru/rn77/related_activities/registration_ip_yl/registration_ip/order/" },
                { label: "Базовый приказ по формам и требованиям: приказ ФНС России от 31.08.2020 N ЕД-7-14/617@" },
                { label: "Изменения для Р21001: приказ ФНС России от 09.01.2024 N ЕД-7-14/4@" },
              ].map((src, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-primary font-bold select-none mt-0.5">•</span>
                  {src.url ? (
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all leading-snug">
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

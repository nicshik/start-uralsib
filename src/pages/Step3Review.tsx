import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { getBusinessEmail, getCompanyFullName, getRegistrationResultEmail } from "@/lib/applicationValidation";
import { OKVED_CODES, TAX_REGIMES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProgressHeader } from "@/components/ProgressHeader";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  FileCheck2,
  Mail,
  MapPin,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

interface SummarySectionProps {
  title: string;
  icon: ReactNode;
  onEdit?: () => void;
  children: ReactNode;
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
      <Pencil className="h-3 w-3" /> Изменить
    </button>
  );
}

function SummarySection({ title, icon, onEdit, children }: SummarySectionProps) {
  return (
    <section className="rounded-lg border border-[#E5E0EB] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[#E5E0EB] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
            {icon}
          </span>
          <h3 className="truncate text-sm font-semibold">{title}</h3>
        </div>
        {onEdit && <EditButton onClick={onEdit} />}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function SummaryGrid({ children }: { children: ReactNode }) {
  return <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</dl>;
}

function SummaryItem({ label, value, wide = false }: { label: string; value?: ReactNode; wide?: boolean }) {
  if (!value) return null;

  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium leading-relaxed text-foreground">{value}</dd>
    </div>
  );
}

function ValuePill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-[#E5E0EB] bg-brand-light px-2.5 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

export default function Step3Review() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    trackEvent("page_view", { page: "step3_review", flowType: state.flowType });
  }, [state.flowType]);

  const tax = TAX_REGIMES.find((t) => t.id === state.business.taxRegime);
  const selectedOkveds = OKVED_CODES.filter((c) => state.business.okvedCodes.includes(c.code));
  const primaryOkved = OKVED_CODES.find((c) => c.code === state.business.primaryOkvedCode);
  const secondaryOkveds = selectedOkveds.filter((c) => c.code !== state.business.primaryOkvedCode);
  const isOoo = state.productType === "ooo";
  const isOnlineLight = state.flowType === "online_light";
  const fullName = [state.passport.lastName, state.passport.firstName, state.passport.middleName].filter(Boolean).join(" ");
  const companyFullName = getCompanyFullName(state.business);
  const businessEmail = getBusinessEmail(state.productType, state.business, state.email);
  const registrationResultEmail = getRegistrationResultEmail(state.business, state.email);
  const legalAddress = state.business.addressIsFounder === false ? state.business.legalAddress : state.business.founderRegistrationAddress;
  const registrationAddress = isOoo ? state.business.founderRegistrationAddress : state.passport.registrationAddress;
  const charterLabel = state.business.charterType === "custom" ? "Свой устав / документы" : "Сгенерировать по шаблону";
  const citizenshipLabel = {
    ru: "Гражданин РФ",
    foreign: "Иностранный гражданин",
    stateless: "Лицо без гражданства",
  }[state.passport.citizenship || "ru"];
  const documentTypeLabel = {
    passport_rf: "Паспорт гражданина РФ",
    other: "Иной документ",
  }[state.passport.documentType || "passport_rf"];
  const founderDocumentTypeLabel = {
    passport_rf: "Паспорт гражданина РФ",
    other: "Иной документ",
  }[state.business.founderDocumentType || "passport_rf"];
  const visitLabel = state.visitPreference === "office"
    ? state.visitOffice
    : state.visitRegion && state.visitCity
      ? "Менеджер подберёт отделение"
      : undefined;

  const handleSubmit = () => {
    setSubmitting(true);
    const applicationStatus = isOnlineLight
      ? "online_light_submitted"
      : state.flowType === "assisted"
        ? "assisted_submitted"
        : "office_crm_completed";

    trackEvent("application_submitted", {
      flowType: state.flowType,
      productType: state.productType,
      applicationStatus,
      paperDocuments: state.paperDocuments,
    });
    trackEvent(applicationStatus, {
      flowType: state.flowType,
      productType: state.productType,
      applicationStatus,
    });
    if (state.flowType === "assisted") {
      trackEvent("assisted_step_completed", { step: 3, flowType: "assisted" });
    }
    setTimeout(() => {
      dispatch({ type: "SET_APPLICATION_STATUS", payload: applicationStatus });
      dispatch({ type: "SUBMIT" });
      navigate("/success");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-light pb-24">
      <AppHeader showBack>
        <AutosaveIndicator />
      </AppHeader>
      <div className="border-b bg-card">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <ProgressHeader step={4} totalSteps={4} />
        </div>
      </div>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">
            {isOnlineLight ? "Проверьте предварительную заявку" : "Проверьте заявку"}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {isOnlineLight
              ? "Эти данные передадим сотруднику банка. Остальное проверим и дозаполним в офисе."
              : "После отправки изменить данные можно будет только через менеджера."}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <ValuePill>{isOoo ? "ООО" : "ИП"}</ValuePill>
            {tax && <ValuePill>{tax.name}</ValuePill>}
            {primaryOkved && <ValuePill>Основной ОКВЭД {primaryOkved.code}</ValuePill>}
          </div>
        </div>

        <SummarySection title="Бизнес" icon={<Briefcase className="h-4 w-4" />} onEdit={() => navigate("/step/1")}>
          <SummaryGrid>
            <SummaryItem label="Форма" value={isOoo ? "ООО" : "ИП"} />
            <SummaryItem label="Налоги" value={tax?.name} />
            {isOoo && <SummaryItem label="Краткое название" value={state.business.companyName} wide />}
            {isOoo && <SummaryItem label="Полное название" value={companyFullName} wide />}
            {isOoo && state.business.charterCapital && (
              <SummaryItem
                label="Предварительный капитал"
                value={`${Number(state.business.charterCapital).toLocaleString("ru-RU")} ₽`}
              />
            )}
            {!isOnlineLight && isOoo && <SummaryItem label="Место нахождения" value={state.business.legalLocation} wide />}
            {!isOnlineLight && isOoo && <SummaryItem label="Юридический адрес" value={legalAddress} wide />}
          </SummaryGrid>
        </SummarySection>

        {!isOnlineLight && isOoo && (
          <SummarySection title="Компания и документы" icon={<Building2 className="h-4 w-4" />} onEdit={() => navigate("/step/1")}>
            <SummaryGrid>
              <SummaryItem
                label="Уставный капитал"
                value={state.business.charterCapital ? `${Number(state.business.charterCapital).toLocaleString("ru-RU")} ₽` : undefined}
              />
              <SummaryItem label="Вид капитала" value="Уставный капитал" />
              <SummaryItem label="Учредители" value={state.business.founderCount === "multiple" ? "Несколько" : "Один"} />
              <SummaryItem
                label="Гражданство учредителя"
                value={state.business.founderCitizenship === "foreign" ? "Иностранный гражданин" : "Гражданин РФ"}
              />
              <SummaryItem label="Документ учредителя" value={founderDocumentTypeLabel} />
              <SummaryItem label="Доля" value={`${state.business.founderSharePercent || "100"}%`} />
              <SummaryItem label="Заявитель" value="Учредитель-физлицо" />
              <SummaryItem label="Руководитель" value={state.business.directorPosition} />
              <SummaryItem label="Срок избрания" value={state.business.directorTerm} />
              <SummaryItem label="Устав" value={charterLabel} />
              {state.business.charterType === "generated" && (
                <SummaryItem label="Типовой устав №" value={state.business.typicalCharterNumber} />
              )}
              <SummaryItem label="Печать" value={state.business.hasSeal ? "С печатью" : "Без печати"} />
            </SummaryGrid>
          </SummarySection>
        )}

        <SummarySection title={isOoo ? "Заявитель и учредитель" : "Заявитель"} icon={<UserRound className="h-4 w-4" />} onEdit={() => navigate("/step/2")}>
          <SummaryGrid>
            <SummaryItem label="ФИО" value={fullName} wide />
            <SummaryItem label="Дата рождения" value={state.passport.birthDate} />
            {!isOnlineLight && <SummaryItem label="Место рождения" value={state.passport.birthPlace} wide />}
            {!isOnlineLight && !isOoo && <SummaryItem label="Гражданство" value={state.passport.citizenship ? citizenshipLabel : undefined} />}
            {!isOnlineLight && !isOoo && <SummaryItem label="Документ" value={state.passport.documentType ? documentTypeLabel : undefined} />}
            <SummaryItem label="Паспорт" value={`${state.passport.passportSeries || ""} ${state.passport.passportNumber || ""}`.trim()} />
            <SummaryItem label="Дата выдачи" value={state.passport.issueDate} />
            <SummaryItem label="Кем выдан" value={state.passport.issuedBy} wide />
            {!isOnlineLight && <SummaryItem label="Код подразделения" value={state.passport.divisionCode} />}
            {!isOnlineLight && <SummaryItem label="ИНН" value={state.passport.inn} />}
            {!isOnlineLight && <SummaryItem label="СНИЛС" value={state.passport.snils} />}
            {!isOnlineLight && <SummaryItem label={isOoo ? "Адрес регистрации учредителя" : "Адрес регистрации"} value={registrationAddress} wide />}
          </SummaryGrid>
        </SummarySection>

        <SummarySection title="Контакты" icon={<Mail className="h-4 w-4" />} onEdit={() => navigate("/step/3")}>
          <SummaryGrid>
            <SummaryItem label="Телефон" value={state.phone} />
            <SummaryItem label={isOnlineLight ? "Email" : isOoo ? "Email юрлица" : "Email ИП"} value={businessEmail} />
          </SummaryGrid>
        </SummarySection>

        <SummarySection title="ОКВЭД" icon={<ShieldCheck className="h-4 w-4" />} onEdit={() => navigate("/step/1")}>
          <div className="space-y-3">
            {primaryOkved && (
              <div className="rounded-lg border border-primary/20 bg-accent p-3">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Основной</p>
                <p className="mt-1 text-sm font-semibold">{primaryOkved.code} — {primaryOkved.name}</p>
              </div>
            )}
            {secondaryOkveds.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Дополнительные</p>
                <div className="space-y-1.5">
                  {secondaryOkveds.map((code) => (
                    <div key={code.code} className="rounded-lg border border-[#E5E0EB] px-3 py-2 text-sm">
                      <span className="font-mono text-xs text-muted-foreground">{code.code}</span>{" "}
                      <span className="font-medium">{code.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SummarySection>

        {isOnlineLight && (
          <SummarySection title="Визит" icon={<MapPin className="h-4 w-4" />} onEdit={() => navigate("/step/3")}>
            <SummaryGrid>
              <SummaryItem label="Регион" value={state.visitRegion} />
              <SummaryItem label="Город" value={state.visitCity} />
              <SummaryItem label="Формат" value={visitLabel} wide />
            </SummaryGrid>
          </SummarySection>
        )}

        {!isOnlineLight && <SummarySection title="Получение документов" icon={<FileCheck2 className="h-4 w-4" />} onEdit={() => navigate("/step/3")}>
          <div className="space-y-4">
            <div className="rounded-lg border border-[#E5E0EB] bg-brand-light p-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">Email для уведомлений ФНС:</span>
              </div>
              <p className="mt-1 break-words text-sm font-semibold">{registrationResultEmail}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Способ получения документов ФНС</p>
              <RadioGroup
                value={state.paperDocuments ? "paper" : "electronic"}
                onValueChange={(v) => {
                  const enabled = v === "paper";
                  dispatch({ type: "SET_PAPER_DOCUMENTS", payload: enabled });
                  trackEvent("paper_documents_toggled", { enabled, flowType: state.flowType });
                }}
                className="grid grid-cols-2 gap-3"
              >
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[#E5E0EB] bg-brand-light p-3 text-sm [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-accent">
                  <RadioGroupItem value="electronic" className="mt-0.5 shrink-0" />
                  <span>
                    <span className="block font-medium">Электронно</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">На email из ФНС</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[#E5E0EB] bg-brand-light p-3 text-sm [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-accent">
                  <RadioGroupItem value="paper" className="mt-0.5 shrink-0" />
                  <span>
                    <span className="block font-medium">На бумаге</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">Бумажный носитель из ФНС</span>
                  </span>
                </label>
              </RadioGroup>
            </div>
          </div>
        </SummarySection>}

        {isOnlineLight && (
          <SummarySection title="Что уточним в офисе" icon={<FileCheck2 className="h-4 w-4" />}>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>Адрес регистрации и структурированный адрес по ФИАС/ГАР.</li>
              <li>ИНН, СНИЛС и отдельный email для документов ФНС, если он отличается.</li>
              {isOoo && (
                <>
                  <li>Данные учредителя, руководителя, роль заявителя и срок полномочий.</li>
                  <li>Вид капитала, устав, печать и юридический адрес для Р11001.</li>
                </>
              )}
              {!isOoo && <li>Гражданство, вид документа и недостающие поля для Р21001.</li>}
            </ul>
          </SummarySection>
        )}

        <div className="flex items-start gap-2.5 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="leading-relaxed">
            {isOnlineLight
              ? "После отправки предварительной заявки сотрудник банка свяжется с вами, назначит визит и поможет дозаполнить данные регистрационного пакета для отправки в ФНС."
              : "После отправки менеджер свяжется для уточнения деталей и назначит встречу в офисе — проверка документов, подписание заявления, открытие счёта."}
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-card/95 p-4 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-4">
          <Button className="h-12 w-full" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Отправляем..." : isOnlineLight ? "Отправить предварительную заявку" : "Отправить заявку"}
          </Button>
        </div>
      </div>
    </div>
  );
}

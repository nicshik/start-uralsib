import { useEffect, useState, useMemo } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { getBusinessEmail } from "@/lib/applicationValidation";
import { Button } from "@/components/ui/button";
import { SupportBlock } from "@/components/SupportBlock";
import { AppHeader } from "@/components/AppHeader";
import { Building2, Check, CheckCircle2, Clock, Copy, FileText, Phone } from "lucide-react";

function DetailRow({ label, value }: { label: string; value?: ReactNode }) {
  if (!value) return null;

  return (
    <div className="flex items-start justify-between gap-4 border-t border-[#E5E0EB] py-3 first:border-t-0 first:pt-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="max-w-[60%] break-words text-right text-sm font-medium">{value}</span>
    </div>
  );
}

export default function Success() {
  const navigate = useNavigate();
  const { clearDraft, state } = useApp();
  const [copied, setCopied] = useState(false);

  const appNumber = useMemo(() => {
    const date = new Date();
    const num = Math.floor(10000 + Math.random() * 90000);
    return `УС-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${num}`;
  }, []);

  useEffect(() => {
    trackEvent("page_view", {
      page: "success",
      appNumber,
      flowType: state.flowType,
      applicationStatus: state.applicationStatus,
    });
  }, [appNumber, state.applicationStatus, state.flowType]);

  const handleCopy = () => {
    navigator.clipboard.writeText(appNumber);
    setCopied(true);
    trackEvent("app_number_copied", { flowType: state.flowType, applicationStatus: state.applicationStatus });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRkoClick = () => {
    trackEvent("rko_offer_opened", {
      source: "success",
      product: state.productType,
      flowType: state.flowType,
      applicationStatus: state.applicationStatus,
    });
    navigate("/rko-request");
  };

  const businessEmail = getBusinessEmail(state.productType, state.business, state.email);
  const productLabel = state.productType === "ooo" ? "ООО" : "ИП";
  const visitValue = state.visitPreference === "office"
    ? state.visitOffice
    : state.visitRegion && state.visitCity
      ? `${state.visitRegion}, ${state.visitCity}. Менеджер подберёт отделение`
      : undefined;
  const steps = [
    { icon: CheckCircle2, title: "Заявка принята", desc: "Только что", done: true },
    { icon: Phone, title: "Звонок менеджера", desc: "В течение 1 рабочего дня", done: false },
    { icon: Clock, title: "Назначение встречи", desc: "В удобное для вас время", done: false },
    { icon: Building2, title: "Визит в офис", desc: "Подписание и открытие счёта", done: false },
  ];

  return (
    <div className="min-h-screen bg-brand-light">
      <AppHeader />

      <main className="mx-auto max-w-lg space-y-5 px-4 py-10">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[16px] bg-white ring-1 ring-[#E5E0EB]">
            <CheckCircle2 className="h-7 w-7 text-[#34C759]" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Заявка отправлена</h1>
            <p className="text-sm text-muted-foreground">Менеджер свяжется с вами для согласования встречи</p>
          </div>
        </div>

        <section className="rounded-[16px] border border-[#E5E0EB] bg-white">
          <div className="flex items-start justify-between gap-4 border-b border-[#E5E0EB] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#6440BF]">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Номер заявки</p>
                <p className="font-mono text-base font-bold tracking-wide">{appNumber}</p>
              </div>
            </div>
            <button onClick={handleCopy} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Скопировано" : "Копировать"}
            </button>
          </div>

          <div className="p-5">
            <DetailRow label="Форма бизнеса" value={productLabel} />
            <DetailRow label="Визит" value={visitValue} />
            <DetailRow label="Копия заявки" value={businessEmail ? businessEmail : "Email можно добавить через менеджера"} />
            <DetailRow
              label="Что передадим менеджеру"
              value={`Номер заявки, ОКВЭД, налоговый режим${state.productType === "ooo" ? ", данные компании" : ""}`}
            />
            <DetailRow
              label="Важно"
              value="Для завершения регистрации потребуется визит в отделение с оригиналами документов"
            />
          </div>
        </section>

        <section className="rounded-[16px] border border-[#E5E0EB] bg-white p-5">
          <p className="mb-4 text-sm font-semibold">Что дальше</p>
          <div className="space-y-0">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${step.done ? "bg-[#F0ECFA]" : "bg-muted"}`}>
                    <step.icon className={`h-4 w-4 ${step.done ? "text-primary" : "text-muted-foreground/60"}`} />
                  </div>
                  {index < steps.length - 1 && <div className="my-1 h-8 w-px bg-border" />}
                </div>
                <div className="pt-1">
                  <p className={`text-sm font-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[16px] border border-[#D4CCE6] bg-white p-5">
          <div className="mb-3 inline-flex rounded-[8px] bg-[#F0ECFA] px-2.5 py-1 text-xs font-medium text-primary">
            1 месяц бесплатно
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight">Откройте счёт вместе с регистрацией</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Он потребуется для приема платежей и подключения РКО. Менеджер подготовит все необходимые документы.
            </p>
          </div>
          <Button className="mt-4 h-12 w-full" onClick={handleRkoClick}>
            Оставить заявку на счёт
          </Button>
        </section>

        <Button
          variant="outline"
          className="h-12 w-full"
          onClick={() => {
            clearDraft();
            navigate("/");
          }}
        >
          На главную
        </Button>

        <SupportBlock compact />
      </main>
    </div>
  );
}

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SupportBlock } from "@/components/SupportBlock";
import { AppHeader } from "@/components/AppHeader";
import { CheckCircle2, Building, Phone, Clock, Copy, Mail, Check, FileText } from "lucide-react";

export default function Success() {
  const navigate = useNavigate();
  const { clearDraft, state } = useApp();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate stable application number
  const appNumber = useMemo(() => {
    const date = new Date();
    const num = Math.floor(10000 + Math.random() * 90000);
    return `УС-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${num}`;
  }, []);

  useEffect(() => {
    trackEvent("page_view", { page: "success", appNumber });
  }, [appNumber]);

  const handleCopy = () => {
    navigator.clipboard.writeText(appNumber);
    setCopied(true);
    trackEvent("app_number_copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    if (!email.trim() || !email.includes("@")) return;
    setEmailSent(true);
    trackEvent("success_email_sent", { email: email.replace(/(.{2}).*(@.*)/, "$1***$2") });
  };

  const steps = [
    { icon: CheckCircle2, title: "Заявка принята", desc: "Только что", active: true, done: true },
    { icon: Phone, title: "Звонок менеджера", desc: "В течение 1 рабочего дня", active: false, done: false },
    { icon: Clock, title: "Назначение встречи", desc: "В удобное для вас время", active: false, done: false },
    { icon: Building, title: "Визит в офис", desc: "Подписание и открытие счёта", active: false, done: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="max-w-lg mx-auto px-4 py-10 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Заявка отправлена!</h1>
          <p className="text-muted-foreground text-sm">
            Менеджер свяжется с вами для согласования встречи
          </p>
        </div>

        {/* Application number */}
        <Card className="border-primary/20 bg-gradient-to-r from-[#F0ECFA]/50 to-white">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6440BF] flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Номер заявки</p>
                <p className="font-mono font-bold text-base tracking-wide">{appNumber}</p>
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Скопировано" : "Копировать"}
            </button>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardContent className="p-5 space-y-0">
            <p className="font-semibold text-sm mb-4">Статус заявки</p>
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    step.done ? "bg-green-100" : step.active ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <step.icon className={`h-4 w-4 ${
                      step.done ? "text-green-600" : step.active ? "text-primary" : "text-muted-foreground/50"
                    }`} />
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-px h-8 my-1 ${step.done ? "bg-green-300" : "bg-border"}`} />
                  )}
                </div>
                <div className="pt-1">
                  <p className={`text-sm font-medium ${step.done ? "text-green-700" : step.active ? "" : "text-muted-foreground"}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Email copy */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="font-semibold text-sm">Получить копию на email</p>
            </div>
            {!emailSent ? (
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendEmail()}
                  className="h-10 flex-1 bg-white border-gray-200"
                />
                <Button
                  size="sm"
                  className="h-10 px-4 bg-[#6440BF] hover:bg-[#5535a6]"
                  disabled={!email.trim() || !email.includes("@")}
                  onClick={handleSendEmail}
                >
                  Отправить
                </Button>
              </div>
            ) : (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <p className="text-sm text-green-800">
                  Копия заявки <span className="font-mono font-medium">{appNumber}</span> отправлена на {email}
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Пришлём номер заявки, выбранные ОКВЭД и налоговый режим{state.productType === "ooo" ? ", данные компании" : ""}
            </p>
          </CardContent>
        </Card>

        {/* Important note */}
        <Card className="bg-white border border-gray-200 rounded-2xl">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Важно:</strong> для завершения регистрации потребуется визит в отделение с оригиналами документов. Менеджер поможет выбрать ближайшее отделение и удобное время.
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center gap-2">
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={() => {
              clearDraft();
              navigate("/");
            }}
          >
            На главную
          </Button>

          <button 
            onClick={() => navigate('/office-agent')}
            className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors"
          >
            [DEMO: Открыть интерфейс сотрудника в офисе]
          </button>
        </div>

        <SupportBlock />
      </main>
    </div>
  );
}

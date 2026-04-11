import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Shield, FileText, ScanLine, CheckCircle2 } from "lucide-react";
import { SupportBlock } from "@/components/SupportBlock";

export default function SmsAuth() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [phone, setPhone] = useState(state.phone || "");
  const [smsSent, setSmsSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");

  useEffect(() => {
    trackEvent("page_view", { page: "sms_auth" });
  }, []);

  useEffect(() => {
    if (smsSent && timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [smsSent, timer]);

  const sendSms = () => {
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Введите корректный номер телефона");
      return;
    }
    dispatch({ type: "SET_PHONE", payload: phone });
    trackEvent("sms_sent", { phone: "***" });
    setSmsSent(true);
    setTimer(60);
    setError("");
  };

  const verifySms = useCallback(() => {
    if (otp === "0000" || otp.length === 4) {
      dispatch({ type: "SET_SMS_VERIFIED" });
      dispatch({ type: "SET_STEP", payload: 1 });
      trackEvent("sms_verified");
      navigate("/step/1");
    }
  }, [otp, dispatch, navigate]);

  useEffect(() => {
    if (otp.length === 4) verifySms();
  }, [otp, verifySms]);

  const roadmap = [
    { icon: FileText, label: "Бизнес", desc: "ОКВЭД, налоги" },
    { icon: ScanLine, label: "Паспорт", desc: "Фото → автозаполнение" },
    { icon: CheckCircle2, label: "Проверка", desc: "Проверить и отправить" },
    { icon: Shield, label: "Встреча", desc: "В офисе банка" },
  ];

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="container py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-lg font-bold text-primary">УРАЛСИБ</span>
        </div>
      </header>

      <main className="container max-w-lg mx-auto py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold">Подтвердите номер телефона</h1>
          <p className="text-sm text-muted-foreground">
            {smsSent ? `Код отправлен на ${phone}` : "Для сохранения прогресса"}
          </p>
        </div>

        {!smsSent ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-center text-lg"
              />
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </div>
            <Button className="w-full" onClick={sendSms}>Получить код</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={4} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {timer > 0 ? (
                `Повторная отправка через ${timer} сек.`
              ) : (
                <button className="text-primary underline" onClick={() => { setTimer(60); trackEvent("sms_resent"); }}>
                  Отправить код повторно
                </button>
              )}
            </p>
          </div>
        )}

        {/* Mini roadmap */}
        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Что вас ждёт</p>
          <div className="space-y-2">
            {roadmap.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <Shield className="h-3 w-3 inline mr-1" />
          Ваш прогресс сохранится автоматически
        </p>

        <SupportBlock compact />
      </main>
    </div>
  );
}

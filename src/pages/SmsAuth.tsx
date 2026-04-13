import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, FileText, ScanLine, CheckCircle2 } from "lucide-react";
import { SupportBlock } from "@/components/SupportBlock";
import { AppHeader } from "@/components/AppHeader";

export default function SmsAuth() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [phone, setPhone] = useState(state.phone || "+7 985 999 99 99");
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
    { icon: FileText, label: "Опишите бизнес", desc: "~3 мин · вид деятельности и налоги" },
    { icon: ScanLine, label: "Подтвердите личность", desc: "~2 мин · по фото паспорта" },
    { icon: CheckCircle2, label: "Проверьте и отправьте", desc: "Мы подготовим документы" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBack />

      <main className="max-w-[480px] mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Подтвердите номер телефона</h1>
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
                className="text-center text-lg bg-white border-[#E5E0EB] rounded-xl h-14 px-4"
              />
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </div>
            <Button className="w-full h-12 rounded-[8px] bg-[#6440BF] hover:bg-[#5535a6] text-white font-medium" onClick={sendSms}>Получить код</Button>
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
        <div className="rounded-[16px] bg-white border border-[#E5E0EB] shadow-none p-5 space-y-4">
          <p className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wider">Как это работает</p>
          <div className="space-y-3">
            {roadmap.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F0ECFA] flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon className="h-4 w-4 text-[#6440BF]" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-[#6B6B6B] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          Ваш прогресс сохранится автоматически
        </p>

        <SupportBlock compact />
      </main>
    </div>
  );
}

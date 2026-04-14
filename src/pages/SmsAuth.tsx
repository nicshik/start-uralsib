import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Headset } from "lucide-react";

interface SmsAuthProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SmsAuthDialog({ open, onOpenChange }: SmsAuthProps) {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [phone, setPhone] = useState(state.phone || "+7 985 999 99 99");
  const [smsSent, setSmsSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setSmsSent(false);
      setOtp("");
      setError("");
      trackEvent("page_view", { page: "sms_auth", flowType: state.flowType });
    }
  }, [open, state.flowType]);

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
    trackEvent("sms_sent", { phone: "***", flowType: state.flowType });
    setSmsSent(true);
    setTimer(60);
    setError("");
  };

  const verifySms = useCallback(() => {
    if (otp === "0000" || otp.length === 4) {
      dispatch({ type: "SET_SMS_VERIFIED" });
      dispatch({ type: "SET_STEP", payload: 1 });
      trackEvent("sms_verified", { flowType: state.flowType });
      onOpenChange(false);
      setTimeout(() => navigate("/step/1"), 150);
    }
  }, [otp, dispatch, navigate, onOpenChange, state.flowType]);

  useEffect(() => {
    if (otp.length === 4) verifySms();
  }, [otp, verifySms]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Подтвердите номер телефона</DialogTitle>
          <DialogDescription className="text-center">
            {smsSent ? `Код отправлен на ${phone}` : "Для сохранения прогресса"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-6">
          {!smsSent ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-center text-lg bg-white border-border rounded-xl h-14 px-4"
                />
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
              </div>
              <Button className="w-full text-base font-medium" onClick={sendSms}>Получить код</Button>
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
                  <button className="text-primary underline" onClick={() => { setTimer(60); trackEvent("sms_resent", { flowType: state.flowType }); }}>
                    Отправить код повторно
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Tip */}
          {smsSent ? (
            <div className="flex items-start gap-3 rounded-xl bg-light-purple/60 border border-border px-4 py-3">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Не знаете, какой ОКВЭД выбрать?</span>{" "}
                На следующем шаге ИИ подберёт коды по описанию вашего бизнеса.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl bg-light-purple/60 border border-border px-4 py-3">
              <Headset className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Наши менеджеры готовы помочь</span>{" "}
                на любом этапе — от выбора формы до подачи документов.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Keep default export as redirect for direct /sms-auth URL access
export default function SmsAuth() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/", { replace: true }); }, [navigate]);
  return null;
}

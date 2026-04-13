import { useState } from "react";
import { Camera, Smartphone, QrCode, CheckCircle2, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";

interface OcrCaptureProps {
  onStartOcr: () => void;
  onManualMode: () => void;
}

export default function OcrCapture({ onStartOcr, onManualMode }: OcrCaptureProps) {
  const [showPhoneOption, setShowPhoneOption] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const handlePhoneOption = () => {
    setShowPhoneOption(true);
    trackEvent("phone_transfer_opened");
  };

  const handleSendLink = () => {
    setSmsSent(true);
    trackEvent("phone_transfer_sms_sent");
  };

  return (
    <div className="space-y-5 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold tracking-tight">Сфотографируйте паспорт</h2>
        <p className="text-sm text-muted-foreground">
          Мы автоматически заполним 8 полей из фотографии
        </p>
      </div>

      {!showPhoneOption ? (
        <>
          {/* Camera option */}
          <button
            onClick={onStartOcr}
            className="w-full aspect-[4/3] max-w-md mx-auto rounded-2xl border-2 border-dashed border-primary/30 bg-white flex flex-col items-center justify-center gap-3 hover:bg-accent hover:border-primary/50 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Camera className="h-7 w-7 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">Нажмите, чтобы сфотографировать</span>
            <span className="text-xs text-muted-foreground">или загрузить фото паспорта</span>
          </button>

          {/* Phone transfer option */}
          <Card
            className="max-w-md mx-auto cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all"
            onClick={handlePhoneOption}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#F0ECFA] flex items-center justify-center shrink-0">
                <Smartphone className="h-5 w-5 text-[#6440BF]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Продолжить с телефона</p>
                <p className="text-xs text-muted-foreground">Удобнее сфотографировать — все данные сохранятся</p>
              </div>
            </CardContent>
          </Card>

          <button
            onClick={onManualMode}
            className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors underline"
          >
            Заполнить вручную
          </button>
        </>
      ) : (
        <div className="max-w-md mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-primary/20 bg-gradient-to-b from-[#F0ECFA]/30 to-white">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6440BF] flex items-center justify-center shrink-0">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Продолжите с телефона</p>
                  <p className="text-xs text-muted-foreground">Все заполненные данные будут доступны</p>
                </div>
              </div>

              {!smsSent ? (
                <div className="space-y-4">
                  {/* QR Code placeholder */}
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-40 h-40 rounded-2xl bg-white border-2 border-gray-100 flex items-center justify-center relative">
                      <QrCode className="h-28 w-28 text-slate-800" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-lg bg-[#6440BF] flex items-center justify-center">
                          <span className="text-white text-xs font-bold">УС</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Отсканируйте QR-код камерой телефона
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">или</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <button
                    onClick={handleSendLink}
                    className="w-full h-11 rounded-xl bg-[#6440BF] hover:bg-[#5535a6] text-white text-sm font-medium transition-colors"
                  >
                    Отправить ссылку по SMS
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-green-900">SMS отправлено</p>
                      <p className="text-xs text-green-700 mt-0.5">
                        Ссылка для продолжения заявки отправлена на ваш номер. Откройте её на телефоне.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-muted/50 p-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Что произойдёт:</p>
                    <ul className="text-xs text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span>Все заполненные данные (бизнес, налоги, ОКВЭД) будут на телефоне</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span>Сфотографируете паспорт камерой телефона</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span>Можете завершить заявку с любого устройства</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center">
                <Shield className="h-3.5 w-3.5" />
                Данные передаются в зашифрованном виде
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => { setShowPhoneOption(false); setSmsSent(false); }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
            >
              Назад
            </button>
            <button
              onClick={onStartOcr}
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
            >
              Сфотографировать здесь
            </button>
            <button
              onClick={onManualMode}
              className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
            >
              Заполнить вручную
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { MOCK_PASSPORT_DATA } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressHeader } from "@/components/ProgressHeader";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { SupportBlock } from "@/components/SupportBlock";
import { MicroReinforcement } from "@/components/MicroReinforcement";
import { ArrowLeft, Camera, ScanLine, Check, Loader2 } from "lucide-react";

type OcrPhase = "idle" | "scanning" | "checking" | "done";

export default function Step2Passport() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [ocrPhase, setOcrPhase] = useState<OcrPhase>(state.passport.ocrCompleted ? "done" : "idle");
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    trackEvent("page_view", { page: "step2_passport" });
  }, []);

  const startOcr = () => {
    trackEvent("ocr_started");
    setOcrPhase("scanning");
    setTimeout(() => setOcrPhase("checking"), 1000);
    setTimeout(() => {
      setOcrPhase("done");
      dispatch({
        type: "UPDATE_PASSPORT",
        payload: { ...MOCK_PASSPORT_DATA, ocrCompleted: true },
      });
      trackEvent("ocr_completed", { fieldsAutoFilled: 8 });
    }, 2000);
  };

  const ocrLabels: Record<OcrPhase, string> = {
    idle: "",
    scanning: "Распознаём документ...",
    checking: "Проверяем данные...",
    done: "Готово!",
  };

  const passportFields = [
    { key: "lastName", label: "Фамилия" },
    { key: "firstName", label: "Имя" },
    { key: "middleName", label: "Отчество" },
    { key: "birthDate", label: "Дата рождения" },
    { key: "gender", label: "Пол" },
    { key: "birthPlace", label: "Место рождения" },
    { key: "passportSeries", label: "Серия паспорта" },
    { key: "passportNumber", label: "Номер паспорта" },
    { key: "issuedBy", label: "Кем выдан" },
    { key: "issueDate", label: "Дата выдачи" },
    { key: "divisionCode", label: "Код подразделения" },
  ];

  const canProceed = state.passport.ocrCompleted || manualMode;

  const handleNext = () => {
    dispatch({ type: "SET_STEP", payload: 3 });
    trackEvent("step2_completed");
    navigate("/step/3");
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-lg font-bold text-primary">УРАЛСИБ</span>
          <div className="ml-auto"><AutosaveIndicator /></div>
        </div>
        <div className="container pb-3">
          <ProgressHeader step={2} totalSteps={3} timeEstimate="5 минут" />
        </div>
      </header>

      <main className="container max-w-lg mx-auto py-6 space-y-6">
        {/* OCR section */}
        {ocrPhase === "idle" && !manualMode && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold">Сфотографируйте паспорт</h2>
              <p className="text-sm text-muted-foreground">
                Мы автоматически заполним 8 полей из фотографии
              </p>
            </div>
            <button
              onClick={startOcr}
              className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-3 hover:bg-primary/10 transition-colors"
            >
              <Camera className="h-12 w-12 text-primary" />
              <span className="text-sm font-medium text-primary">Нажмите, чтобы сфотографировать</span>
              <span className="text-xs text-muted-foreground">или загрузить фото паспорта</span>
            </button>
            <button
              onClick={() => { setManualMode(true); trackEvent("manual_entry_selected"); }}
              className="w-full text-center text-sm text-muted-foreground underline"
            >
              Заполнить вручную
            </button>
          </div>
        )}

        {/* OCR progress */}
        {(ocrPhase === "scanning" || ocrPhase === "checking") && (
          <div className="text-center py-12 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {ocrPhase === "scanning" ? (
                <ScanLine className="h-8 w-8 text-primary animate-pulse" />
              ) : (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              )}
            </div>
            <p className="font-medium">{ocrLabels[ocrPhase]}</p>
            <div className="flex justify-center gap-2">
              {["scanning", "checking", "done"].map((phase, i) => (
                <div
                  key={phase}
                  className={`h-1.5 w-12 rounded-full ${
                    i <= ["scanning", "checking", "done"].indexOf(ocrPhase)
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* OCR done / Manual mode */}
        {(ocrPhase === "done" || manualMode) && (
          <>
            {ocrPhase === "done" && (
              <MicroReinforcement message="Заполнили 8 полей автоматически. Проверьте данные" />
            )}

            <Card>
              <CardContent className="p-4 space-y-4">
                <p className="font-semibold text-sm">Паспортные данные</p>
                {passportFields.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{f.label}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={(state.passport as Record<string, string>)[f.key] || ""}
                        onChange={(e) =>
                          dispatch({ type: "UPDATE_PASSPORT", payload: { [f.key]: e.target.value } })
                        }
                        className="text-sm"
                      />
                      {ocrPhase === "done" && (state.passport as Record<string, string>)[f.key] && (
                        <Check className="h-4 w-4 text-success shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Manual fields */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <p className="font-semibold text-sm">Дополнительные данные</p>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">ИНН</Label>
                  <Input
                    placeholder="12 цифр"
                    maxLength={12}
                    value={state.passport.inn || ""}
                    onChange={(e) => dispatch({ type: "UPDATE_PASSPORT", payload: { inn: e.target.value } })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">СНИЛС</Label>
                  <Input
                    placeholder="___-___-___ __"
                    value={state.passport.snils || ""}
                    onChange={(e) => dispatch({ type: "UPDATE_PASSPORT", payload: { snils: e.target.value } })}
                  />
                </div>
              </CardContent>
            </Card>

            <SupportBlock compact />
          </>
        )}
      </main>

      {(ocrPhase === "done" || manualMode) && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-card p-4">
          <div className="container max-w-lg mx-auto">
            <Button className="w-full" disabled={!canProceed} onClick={handleNext}>
              Продолжить
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

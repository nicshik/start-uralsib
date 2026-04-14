import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { MOCK_PASSPORT_DATA } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { ProgressHeader } from "@/components/ProgressHeader";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { SupportBlock } from "@/components/SupportBlock";
import { AppHeader } from "@/components/AppHeader";

import OcrCapture from "@/components/step2/OcrCapture";
import OcrProgress from "@/components/step2/OcrProgress";
import PassportFields from "@/components/step2/PassportFields";
import AdditionalFields from "@/components/step2/AdditionalFields";

type OcrPhase = "idle" | "scanning" | "checking" | "done";

const isValidEmail = (email?: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || "");

export default function Step2Passport() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [ocrPhase, setOcrPhase] = useState<OcrPhase>(state.passport.ocrCompleted ? "done" : "idle");
  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    trackEvent("page_view", { page: "step2_passport", flowType: state.flowType });
  }, [state.flowType]);

  const startOcr = () => {
    trackEvent("ocr_started", { flowType: state.flowType });
    setOcrPhase("scanning");
    setTimeout(() => setOcrPhase("checking"), 1000);
    setTimeout(() => {
      setOcrPhase("done");
      dispatch({
        type: "UPDATE_PASSPORT",
        payload: { ...MOCK_PASSPORT_DATA, ocrCompleted: true },
      });
      trackEvent("ocr_completed", { fieldsAutoFilled: 8, flowType: state.flowType });
    }, 2000);
  };

  const emailValid = isValidEmail(state.email);
  const canProceed = (state.passport.ocrCompleted || manualMode) && emailValid;

  const handleNext = () => {
    dispatch({ type: "SET_STEP", payload: 3 });
    trackEvent("step2_completed", { flowType: state.flowType, emailProvided: true });
    if (state.flowType === "manager") {
      trackEvent("assisted_step_completed", { step: 2, flowType: "manager" });
    }
    navigate("/step/3");
  };

  return (
    <div className="min-h-screen pb-24 bg-brand-light">
      <AppHeader showBack>
        <AutosaveIndicator />
      </AppHeader>
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <ProgressHeader step={2} totalSteps={3} timeEstimate="5 минут" />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {ocrPhase === "idle" && !manualMode && (
          <OcrCapture onStartOcr={startOcr} onManualMode={() => { setManualMode(true); trackEvent("manual_entry_selected", { flowType: state.flowType }); }} />
        )}

        {(ocrPhase === "scanning" || ocrPhase === "checking") && (
          <OcrProgress phase={ocrPhase} />
        )}

        {(ocrPhase === "done" || manualMode) && (
          <>
            <PassportFields
              passport={state.passport}
              ocrDone={ocrPhase === "done"}
              onUpdate={(payload) => dispatch({ type: "UPDATE_PASSPORT", payload })}
            />
            <AdditionalFields
              passport={state.passport}
              email={state.email}
              emailValid={emailValid}
              onUpdate={(payload) => dispatch({ type: "UPDATE_PASSPORT", payload })}
              onEmailUpdate={(email) => dispatch({ type: "SET_EMAIL", payload: email })}
            />

            {ocrPhase === "done" && (
              <p className="text-xs text-muted-foreground text-center">
                Данные заполнены автоматически — проверьте перед отправкой
              </p>
            )}

            <SupportBlock compact />
          </>
        )}
      </main>

      {(ocrPhase === "done" || manualMode) && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur-sm p-4">
          <div className="max-w-2xl mx-auto px-4">
            <Button className="w-full h-12" disabled={!canProceed} onClick={handleNext}>
              Продолжить
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

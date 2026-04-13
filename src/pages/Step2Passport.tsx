import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { MOCK_PASSPORT_DATA } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { ProgressHeader } from "@/components/ProgressHeader";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { SupportBlock } from "@/components/SupportBlock";
import { MicroReinforcement } from "@/components/MicroReinforcement";
import { AppHeader } from "@/components/AppHeader";

import OcrCapture from "@/components/step2/OcrCapture";
import OcrProgress from "@/components/step2/OcrProgress";
import PassportFields from "@/components/step2/PassportFields";
import AdditionalFields from "@/components/step2/AdditionalFields";

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

  const canProceed = state.passport.ocrCompleted || manualMode;

  const handleNext = () => {
    dispatch({ type: "SET_STEP", payload: 3 });
    trackEvent("step2_completed");
    navigate("/step/3");
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
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
          <OcrCapture onStartOcr={startOcr} onManualMode={() => { setManualMode(true); trackEvent("manual_entry_selected"); }} />
        )}

        {(ocrPhase === "scanning" || ocrPhase === "checking") && (
          <OcrProgress phase={ocrPhase} />
        )}

        {(ocrPhase === "done" || manualMode) && (
          <>
            {ocrPhase === "done" && (
              <MicroReinforcement message="Заполнили 8 полей автоматически. Проверьте данные" />
            )}

            <PassportFields
              passport={state.passport}
              ocrDone={ocrPhase === "done"}
              onUpdate={(payload) => dispatch({ type: "UPDATE_PASSPORT", payload })}
            />
            <AdditionalFields
              passport={state.passport}
              onUpdate={(payload) => dispatch({ type: "UPDATE_PASSPORT", payload })}
            />

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

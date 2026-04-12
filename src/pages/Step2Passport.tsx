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
    <div className="min-h-screen pb-24">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-lg font-bold text-primary">УРАЛСИБ</span>
          <div className="ml-auto"><AutosaveIndicator /></div>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <ProgressHeader step={2} totalSteps={3} timeEstimate="5 минут" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* OCR idle */}
        {ocrPhase === "idle" && !manualMode && (
          <OcrCapture onStartOcr={startOcr} onManualMode={() => { setManualMode(true); trackEvent("manual_entry_selected"); }} />
        )}

        {/* OCR progress */}
        {(ocrPhase === "scanning" || ocrPhase === "checking") && (
          <OcrProgress phase={ocrPhase} />
        )}

        {/* OCR done / Manual mode */}
        {(ocrPhase === "done" || manualMode) && (
          <>
            {ocrPhase === "done" && (
              <MicroReinforcement message="Заполнили 8 полей автоматически. Проверьте данные" />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PassportFields
                passport={state.passport}
                ocrDone={ocrPhase === "done"}
                onUpdate={(payload) => dispatch({ type: "UPDATE_PASSPORT", payload })}
              />
              <AdditionalFields
                passport={state.passport}
                onUpdate={(payload) => dispatch({ type: "UPDATE_PASSPORT", payload })}
              />
            </div>

            <SupportBlock compact />
          </>
        )}
      </main>

      {(ocrPhase === "done" || manualMode) && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-card p-4">
          <div className="max-w-2xl mx-auto px-4">
            <Button className="w-full" disabled={!canProceed} onClick={handleNext}>
              Продолжить
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

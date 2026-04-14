import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { getApplicantValidation } from "@/lib/applicationValidation";
import type { ValidationTarget } from "@/lib/applicationValidation";
import { MOCK_PASSPORT_DATA } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { ProgressHeader } from "@/components/ProgressHeader";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { SupportBlock } from "@/components/SupportBlock";
import { AppHeader } from "@/components/AppHeader";
import { UserCheck } from "lucide-react";

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
  const isOnlineLight = state.flowType === "online_light";
  const applicantValidationTarget: ValidationTarget = isOnlineLight ? "online_light_submit" : "assisted_submit";

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
      trackEvent("ocr_completed", { fieldsAutoFilled: Object.keys(MOCK_PASSPORT_DATA).length, flowType: state.flowType });
    }, 2000);
  };

  const applicantValidation = getApplicantValidation(
    state.productType,
    state.passport,
    state.email,
    state.phone,
    state.business,
    { flowType: state.flowType, target: applicantValidationTarget },
  );
  const showManagerPrompt = !isOnlineLight && applicantValidation.managerReasons.length > 0;
  const canProceed = (state.passport.ocrCompleted || manualMode) && applicantValidation.isComplete;

  const handleNext = () => {
    dispatch({ type: "SET_STEP", payload: 3 });
    trackEvent("step2_completed", { flowType: state.flowType, emailProvided: true });
    if (state.flowType === "assisted") {
      trackEvent("assisted_step_completed", { step: 2, flowType: "assisted" });
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
              productType={state.productType}
              flowType={state.flowType}
              ocrDone={ocrPhase === "done"}
              onUpdate={(payload) => dispatch({ type: "UPDATE_PASSPORT", payload })}
            />

            {ocrPhase === "done" && (
              <p className="text-xs text-muted-foreground text-center">
                Данные заполнены автоматически — проверьте перед отправкой
              </p>
            )}

            <AdditionalFields
              passport={state.passport}
              productType={state.productType}
              flowType={state.flowType}
              business={state.business}
              email={state.email}
              phone={state.phone}
              onUpdate={(payload) => dispatch({ type: "UPDATE_PASSPORT", payload })}
              onBusinessUpdate={(payload) => dispatch({ type: "UPDATE_BUSINESS", payload })}
              onPhoneUpdate={(phone) => dispatch({ type: "SET_PHONE", payload: phone })}
              onEmailUpdate={(email) => dispatch({ type: "SET_EMAIL", payload: email })}
            />

            {applicantValidation.missingFields.length > 0 && (
              <div className="rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {isOnlineLight ? "Для предварительной заявки осталось заполнить" : "Для отправки в ФНС осталось заполнить"}: {applicantValidation.missingFields.join(", ")}.
              </div>
            )}

            {showManagerPrompt && (
              <div className="rounded-card border border-primary bg-accent/50 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <UserCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Нужна проверка менеджера</p>
                    <p className="text-sm text-muted-foreground">
                      Заявку можно отправить сейчас. Менеджер позвонит и подскажет, какие документы нужны.
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                      {applicantValidation.managerReasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    trackEvent("manager_request_opened", { reason: applicantValidation.managerReasons[0], flowType: state.flowType });
                    navigate("/manager-request");
                  }}
                >
                  Проверить данные и отправить заявку
                </Button>
              </div>
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

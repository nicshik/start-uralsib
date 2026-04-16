import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { isValidEmail } from "@/lib/applicationValidation";
import { Button } from "@/components/ui/button";
import { ProgressHeader } from "@/components/ProgressHeader";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { AppHeader } from "@/components/AppHeader";
import AdditionalFields from "@/components/step2/AdditionalFields";

export default function Step3Contact() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const isOnlineLight = state.flowType === "online_light";

  useEffect(() => {
    trackEvent("page_view", { page: "step3_contact", flowType: state.flowType });
  }, [state.flowType]);

  const hasValidEmail = isValidEmail(state.email ?? "");
  const hasValidPhone = (state.phone ?? "").replace(/\D/g, "").length >= 10;
  const hasVisit =
    !isOnlineLight ||
    Boolean(state.visitPreference && state.visitRegion && state.visitCity);
  const canProceed = hasValidEmail && hasValidPhone && hasVisit;

  const handleNext = () => {
    dispatch({ type: "SET_STEP", payload: 3 });
    trackEvent("step3_contact_completed", { flowType: state.flowType });
    if (state.flowType === "assisted") {
      trackEvent("assisted_step_completed", { step: 3, flowType: "assisted" });
    }
    navigate("/step/4");
  };

  return (
    <div className="min-h-screen pb-24 bg-brand-light">
      <AppHeader showBack>
        <AutosaveIndicator />
      </AppHeader>
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <ProgressHeader step={3} totalSteps={4} timeEstimate="2 минуты" />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <AdditionalFields
          passport={state.passport}
          productType={state.productType}
          flowType={state.flowType}
          business={state.business}
          email={state.email}
          phone={state.phone}
          visitPreference={state.visitPreference}
          visitRegion={state.visitRegion}
          visitCity={state.visitCity}
          visitOffice={state.visitOffice}
          onUpdate={(payload) => dispatch({ type: "UPDATE_PASSPORT", payload })}
          onBusinessUpdate={(payload) => dispatch({ type: "UPDATE_BUSINESS", payload })}
          onPhoneUpdate={(phone) => dispatch({ type: "SET_PHONE", payload: phone })}
          onEmailUpdate={(email) => dispatch({ type: "SET_EMAIL", payload: email })}
          paperDocuments={state.paperDocuments}
          onPaperDocumentsUpdate={(value) => dispatch({ type: "SET_PAPER_DOCUMENTS", payload: value })}
          onVisitUpdate={(payload) => dispatch({ type: "SET_VISIT", payload })}
        />
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur-sm p-4">
        <div className="max-w-2xl mx-auto px-4">
          <Button className="w-full h-12" disabled={!canProceed} onClick={handleNext}>
            Продолжить
          </Button>
        </div>
      </div>
    </div>
  );
}

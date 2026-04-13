import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

interface RouteGuardProps {
  requireSms?: boolean;
  requireStep?: number;
  children: React.ReactNode;
}

export function RouteGuard({ requireSms, requireStep, children }: RouteGuardProps) {
  const navigate = useNavigate();
  const { state } = useApp();

  useEffect(() => {
    if (requireSms && !state.smsVerified) {
      navigate("/", { replace: true });
      return;
    }
    if (requireStep !== undefined && state.currentStep < requireStep) {
      navigate("/", { replace: true });
      return;
    }
  }, [state.smsVerified, state.currentStep, requireSms, requireStep, navigate]);

  if (requireSms && !state.smsVerified) return null;
  if (requireStep !== undefined && state.currentStep < requireStep) return null;

  return <>{children}</>;
}

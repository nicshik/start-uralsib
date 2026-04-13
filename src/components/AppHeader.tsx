import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import uralsibLogo from "@/assets/uralsib-logo-clean.png";

interface AppHeaderProps {
  showBack?: boolean;
  backTo?: string | number;
  children?: React.ReactNode;
}

export function AppHeader({ showBack = false, backTo = -1, children }: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-[#2D1B69] shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => typeof backTo === "number" ? navigate(backTo as any) : navigate(backTo)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
        )}
        <button onClick={() => navigate("/")} className="shrink-0">
          <img src={uralsibLogo} alt="Уралсиб" className="h-7 object-contain" />
        </button>
        {children && <div className="ml-auto flex items-center gap-3">{children}</div>}
      </div>
    </header>
  );
}

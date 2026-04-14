import { useNavigate } from "react-router-dom";
import { BadgeCheck, MonitorUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";

interface AssistedModeBannerProps {
  compact?: boolean;
}

export function AssistedModeBanner({ compact = false }: AssistedModeBannerProps) {
  const navigate = useNavigate();
  const { state } = useApp();

  if (state.flowType !== "manager") return null;

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-md bg-white p-1.5 text-emerald-700 shadow-sm">
            <BadgeCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Режим сотрудника банка</p>
            <p className="mt-0.5 text-xs leading-relaxed text-emerald-800">
              {compact
                ? "Заявка идет в отдельный assisted-канал."
                : "Заполняйте форму вместе с клиентом. Клиент подтверждает номер и дает ответы лично, а заявка считается отдельно от самостоятельной онлайн-воронки."}
            </p>
          </div>
        </div>
        {!compact && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0 border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-100"
            onClick={() => navigate("/office-agent")}
          >
            <MonitorUp className="mr-1.5 h-4 w-4" />
            Рабочее место
          </Button>
        )}
      </div>
    </div>
  );
}

import { useApp } from "@/context/AppContext";
import { Check } from "lucide-react";

export function AutosaveIndicator() {
  const { state } = useApp();
  if (!state.lastSaved) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Check className="h-3 w-3 text-success" />
      <span>Черновик сохранён</span>
    </div>
  );
}

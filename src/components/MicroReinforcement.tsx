import { CheckCircle2 } from "lucide-react";

export function MicroReinforcement({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-success/10 border border-success/20 p-4 animate-in fade-in slide-in-from-bottom-2">
      <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
      <p className="text-sm font-medium text-foreground">{message}</p>
    </div>
  );
}

import { cn } from "@/lib/utils";

interface Props {
  step: number;
  totalSteps: number;
  timeEstimate?: string;
}

export function ProgressHeader({ step, totalSteps, timeEstimate }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">
          Шаг {step} из {totalSteps}
        </span>
        {timeEstimate && (
          <span className="text-muted-foreground text-xs">~{timeEstimate}</span>
        )}
      </div>
      <div className="flex items-center gap-1.5 h-2">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const isActive = idx === step - 1;
          const isPast = idx < step - 1;
          return (
            <div
              key={idx}
              className={cn(
                "h-2 transition-all duration-300",
                isActive ? "w-6 rounded-[4px] bg-primary" : "w-2 rounded-full",
                isPast ? "bg-primary" : "",
                !isActive && !isPast ? "bg-[#E5E0EB]" : ""
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

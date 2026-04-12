import { Progress } from "@/components/ui/progress";

interface Props {
  step: number;
  totalSteps: number;
  timeEstimate?: string;
}

export function ProgressHeader({ step, totalSteps, timeEstimate }: Props) {
  const pct = (step / totalSteps) * 100;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">
          Шаг {step} из {totalSteps}
        </span>
        {timeEstimate && (
          <span className="text-muted-foreground text-xs">~{timeEstimate}</span>
        )}
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}

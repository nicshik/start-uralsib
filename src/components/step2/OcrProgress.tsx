import { ScanLine, Loader2 } from "lucide-react";

interface OcrProgressProps {
  phase: "scanning" | "checking";
}

const labels = {
  scanning: "Распознаём документ...",
  checking: "Проверяем данные...",
};

export default function OcrProgress({ phase }: OcrProgressProps) {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        {phase === "scanning" ? (
          <ScanLine className="h-8 w-8 text-primary animate-pulse" />
        ) : (
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        )}
      </div>
      <p className="font-medium">{labels[phase]}</p>
      <div className="flex justify-center gap-2">
        {["scanning", "checking", "done"].map((p, i) => (
          <div
            key={p}
            className={`h-1.5 w-12 rounded-full ${
              i <= ["scanning", "checking", "done"].indexOf(phase)
                ? "bg-primary"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

import { Camera } from "lucide-react";

interface OcrCaptureProps {
  onStartOcr: () => void;
  onManualMode: () => void;
}

export default function OcrCapture({ onStartOcr, onManualMode }: OcrCaptureProps) {
  return (
    <div className="space-y-5 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold tracking-tight">Сфотографируйте паспорт</h2>
        <p className="text-sm text-muted-foreground">
          Мы автоматически заполним 8 полей из фотографии
        </p>
      </div>
      <button
        onClick={onStartOcr}
        className="w-full aspect-[4/3] max-w-md mx-auto rounded-2xl border-2 border-dashed border-primary/30 bg-accent/50 flex flex-col items-center justify-center gap-3 hover:bg-accent hover:border-primary/50 transition-all"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Camera className="h-7 w-7 text-primary" />
        </div>
        <span className="text-sm font-medium text-primary">Нажмите, чтобы сфотографировать</span>
        <span className="text-xs text-muted-foreground">или загрузить фото паспорта</span>
      </button>
      <button
        onClick={onManualMode}
        className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors underline"
      >
        Заполнить вручную
      </button>
    </div>
  );
}

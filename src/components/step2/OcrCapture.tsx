import { Camera } from "lucide-react";

interface OcrCaptureProps {
  onStartOcr: () => void;
  onManualMode: () => void;
}

export default function OcrCapture({ onStartOcr, onManualMode }: OcrCaptureProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold">Сфотографируйте паспорт</h2>
        <p className="text-sm text-muted-foreground">
          Мы автоматически заполним 8 полей из фотографии
        </p>
      </div>
      <button
        onClick={onStartOcr}
        className="w-full aspect-[4/3] max-w-md mx-auto rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-3 hover:bg-primary/10 transition-colors"
      >
        <Camera className="h-12 w-12 text-primary" />
        <span className="text-sm font-medium text-primary">Нажмите, чтобы сфотографировать</span>
        <span className="text-xs text-muted-foreground">или загрузить фото паспорта</span>
      </button>
      <button
        onClick={onManualMode}
        className="w-full text-center text-sm text-muted-foreground underline"
      >
        Заполнить вручную
      </button>
    </div>
  );
}

import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SupportBlock({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageCircle className="h-4 w-4" />
        <span>Нужна помощь? <button className="underline text-primary" onClick={() => alert("Чат с поддержкой (демо)")}>Напишите нам</button></span>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-[#E5E0EB] bg-white p-4 space-y-3">
      <p className="font-medium text-sm">Нужна помощь?</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" size="sm" className="gap-2 rounded-[8px]" onClick={() => alert("Чат (демо)")}>
          <MessageCircle className="h-4 w-4" /> Написать в чат
        </Button>
        <Button variant="outline" size="sm" className="gap-2 rounded-[8px]" onClick={() => alert("Звонок (демо)")}>
          <Phone className="h-4 w-4" /> 8 800 250-57-57
        </Button>
      </div>
    </div>
  );
}

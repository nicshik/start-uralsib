import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openChat } from "@/components/ChatWidget";

export function SupportBlock({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="text-center py-2">
        <span className="text-[13px] text-muted-foreground">Нужна помощь?</span>{" "}
        <button
          className="text-[13px] text-foreground/60 border-b border-border hover:text-foreground hover:border-foreground/40 transition-all"
          onClick={() => openChat()}
        >
          Напишите нам
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-[#E5E0EB] bg-white p-4 space-y-3">
      <p className="font-medium text-sm">Нужна помощь?</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" size="sm" className="gap-2 rounded-[8px]" onClick={() => openChat()}>
          <MessageCircle className="h-4 w-4" /> Написать в чат
        </Button>
        <Button variant="outline" size="sm" className="gap-2 rounded-[8px]" asChild>
          <a href="tel:88002505757"><Phone className="h-4 w-4" /> 8 800 250-57-57</a>
        </Button>
      </div>
    </div>
  );
}

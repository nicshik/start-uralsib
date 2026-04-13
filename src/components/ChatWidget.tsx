import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trackEvent } from "@/lib/analytics";
import { Send, Bot, User } from "lucide-react";

interface Message {
  role: "bot" | "user";
  text: string;
}

const BOT_REPLIES: Record<string, string> = {
  default: "Спасибо за обращение! Менеджер ответит вам в течение нескольких минут. Пока вы можете продолжить заполнение заявки — ваш прогресс сохраняется автоматически.",
  оквэд: "Для подбора ОКВЭД рекомендую начать с описания вашей деятельности. Например, если вы занимаетесь разработкой ПО — подойдёт код 62.01. Я могу помочь подобрать точный код!",
  налог: "Для большинства начинающих предпринимателей оптимальна УСН 6% (доходы). Если у вас значительные расходы — рассмотрите УСН 15%. Менеджер поможет выбрать на встрече.",
  документ: "Для регистрации ИП вам понадобится: паспорт РФ, ИНН и СНИЛС. Всё остальное мы подготовим за вас!",
  срок: "Онлайн-часть занимает около 10 минут. После отправки заявки менеджер свяжется с вами в течение 1 рабочего дня для назначения встречи.",
  офис: "Визит в офис необходим для подписания документов и верификации личности. Менеджер подберёт ближайшее отделение и удобное время.",
};

function getBotReply(text: string): string {
  const lower = text.toLowerCase();
  for (const [key, reply] of Object.entries(BOT_REPLIES)) {
    if (key !== "default" && lower.includes(key)) return reply;
  }
  return BOT_REPLIES.default;
}

const INITIAL_MESSAGES: Message[] = [
  { role: "bot", text: "Здравствуйте! Я виртуальный помощник Уралсиб. Чем могу помочь с регистрацией бизнеса?" },
];

let chatWidgetOpen: (() => void) | null = null;

export function openChat() {
  chatWidgetOpen?.();
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatWidgetOpen = () => {
      setOpen(true);
      trackEvent("chat_opened");
    };
    return () => { chatWidgetOpen = null; };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    trackEvent("chat_message_sent");

    setTyping(true);
    setTimeout(() => {
      const reply = getBotReply(text);
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
      setTyping(false);
    }, 800 + Math.random() * 700);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="bg-[#6440BF] text-white p-4">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Поддержка Уралсиб
          </DialogTitle>
          <p className="text-xs text-white/70">Онлайн · обычно отвечаем за 2 минуты</p>
        </DialogHeader>

        <ScrollArea className="h-80 p-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-[#F0ECFA] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-[#6440BF]" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#6440BF] text-white rounded-br-md"
                      : "bg-[#F4F3F7] text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-[#E5E0EB] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-[#6440BF]" />
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex gap-2 items-start">
                <div className="w-7 h-7 rounded-full bg-[#F0ECFA] flex items-center justify-center shrink-0">
                  <Bot className="h-3.5 w-3.5 text-[#6440BF]" />
                </div>
                <div className="bg-[#F4F3F7] rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#6440BF]/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-[#6440BF]/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-[#6440BF]/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-3 flex gap-2">
          <Input
            placeholder="Напишите сообщение..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-1 h-10 rounded-xl bg-[#F4F3F7] border-0"
          />
          <Button
            size="icon"
            className="h-10 w-10 rounded-xl bg-[#6440BF] hover:bg-[#5535a6] shrink-0"
            onClick={send}
            disabled={!input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

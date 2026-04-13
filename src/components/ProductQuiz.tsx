import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { Building2, Briefcase, UserCheck } from "lucide-react";

interface ProductQuizProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResultChoice: (choice: "ip" | "ooo" | "help") => void;
}

const QUESTIONS = [
  {
    id: "partners",
    text: "Сколько будет владельцев бизнеса?",
    options: [
      { text: "Только я", type: "ip" },
      { text: "Будут партнёры или инвесторы", type: "ooo", force: true },
    ]
  },
  {
    id: "risk",
    text: "Готовы ли вы отвечать личным имуществом по долгам бизнеса?",
    options: [
      { text: "Да, риски небольшие", type: "ip" },
      { text: "Нет, хочу ограничить ответственность", type: "ooo" },
    ]
  },
  {
    id: "clients",
    text: "С кем планируете работать?",
    options: [
      { text: "Частные клиенты и малый бизнес", type: "ip" },
      { text: "Крупные компании, госзаказы, тендеры", type: "ooo" },
    ]
  },
  {
    id: "simplicity",
    text: "Что важнее на старте?",
    options: [
      { text: "Быстро и просто начать, минимум бумаг", type: "ip" },
      { text: "Статус компании и возможность масштабирования", type: "ooo" },
    ]
  }
];

export function ProductQuiz({ open, onOpenChange, onResultChoice }: ProductQuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { type: string, force?: boolean }>>({});

  useEffect(() => {
    if (open) {
      setStep(0);
      setAnswers({});
      trackEvent("quiz_start");
    }
  }, [open]);

  const handleAnswer = (option: { type: string, force?: boolean }) => {
    const currentQ = QUESTIONS[step];
    const newAnswers = { ...answers, [currentQ.id]: option };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      trackEvent("quiz_complete", { final_step: true });
      setStep(QUESTIONS.length); // Results step
    }
  };

  const getResult = () => {
    // If any force OOO is selected, then definitely OOO.
    const hasForceOoo = Object.values(answers).some(a => a.force);
    if (hasForceOoo) return "ooo";
    
    // Otherwise count
    const oooCount = Object.values(answers).filter(a => a.type === "ooo").length;
    const ipCount = Object.values(answers).filter(a => a.type === "ip").length;

    if (oooCount > ipCount) return "ooo";
    return "ip";
  };

  const currentQuestion = step < QUESTIONS.length ? QUESTIONS[step] : null;
  const resultType = step === QUESTIONS.length ? getResult() : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Поможем подобрать форму</DialogTitle>
          <DialogDescription>
            {step < QUESTIONS.length 
              ? `Ответьте на ${QUESTIONS.length} коротких вопроса (${step + 1} / ${QUESTIONS.length})`
              : "Наша рекомендация"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {currentQuestion && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="font-semibold text-lg">{currentQuestion.text}</h3>
              <div className="space-y-2">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(opt)}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-primary hover:bg-accent/50 transition-all font-medium text-sm"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === QUESTIONS.length && (
            <div className="space-y-6 animate-in zoom-in-95 fade-in">
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-[#F0ECFA] flex items-center justify-center">
                  {resultType === "ooo" ? (
                    <Building2 className="h-8 w-8 text-[#6440BF]" />
                  ) : (
                    <Briefcase className="h-8 w-8 text-[#6440BF]" />
                  )}
                </div>
                <h3 className="text-xl font-bold">Вам отлично подойдёт {resultType === "ooo" ? "ООО" : "ИП"}</h3>
                <p className="text-sm text-muted-foreground">
                  {resultType === "ooo" 
                    ? "ООО подходит для бизнеса с партнёрами, инвестициями или работы с крупными клиентами. Ответственность ограничена уставным капиталом (от 10 000 ₽)."
                    : "ИП — самый быстрый старт: простая регистрация, минимум отчётности, доступен патент. Деньги можно свободно использовать на личные нужды."}
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full h-12" 
                  onClick={() => onResultChoice(resultType as "ip" | "ooo")}
                >
                  Продолжить как {resultType === "ooo" ? "ООО" : "ИП"}
                </Button>
                
                <button 
                  onClick={() => onResultChoice("help")}
                  className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-2"
                >
                  <UserCheck className="h-4 w-4" />
                  Я всё ещё сомневаюсь, нужен эксперт
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

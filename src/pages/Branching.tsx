import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CITIES } from "@/lib/mockData";
import { ArrowLeft } from "lucide-react";
import { SupportBlock } from "@/components/SupportBlock";

export default function Branching() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const product = state.productType;
  const [step, setStep] = useState(0);

  useEffect(() => {
    trackEvent("page_view", { page: "branching", product });
    if (!product) navigate("/");
  }, [product, navigate]);

  const setAnswer = (key: string, value: unknown) => {
    dispatch({ type: "SET_BRANCHING", payload: { [key]: value } });
    trackEvent("branching_answer", { question: key, answer: value });
  };

  const goOnline = () => {
    dispatch({ type: "SET_FLOW", payload: "online" });
    trackEvent("flow_selected", { flow: "online" });
    navigate("/sms-auth");
  };

  const goManager = () => {
    dispatch({ type: "SET_FLOW", payload: "manager" });
    trackEvent("flow_selected", { flow: "manager" });
    navigate("/manager");
  };

  // === HELP quiz ===
  if (product === "help") {
    const questions = [
      {
        q: "Вы будете работать один или с партнёрами?",
        options: [
          { label: "Один", value: "alone" },
          { label: "С партнёрами", value: "partners" },
        ],
        key: "workAlone",
      },
      {
        q: "Хотите ограничить личную ответственность?",
        options: [
          { label: "Да, хочу", value: "yes" },
          { label: "Нет, не нужно", value: "no" },
        ],
        key: "needLimitedLiability",
      },
      {
        q: "Планируете нанимать сотрудников?",
        options: [
          { label: "Да", value: "yes" },
          { label: "Пока нет", value: "no" },
        ],
        key: "planToHire",
      },
    ];

    if (step < questions.length) {
      const current = questions[step];
      return (
        <PageWrapper onBack={() => step === 0 ? navigate("/") : setStep(step - 1)}>
          <div className="text-center space-y-2 mb-6">
            <p className="text-sm text-muted-foreground">Вопрос {step + 1} из {questions.length}</p>
            <h2 className="text-xl font-semibold">{current.q}</h2>
          </div>
          <div className="space-y-3">
            {current.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setAnswer(current.key, opt.value === "alone" || opt.value === "no" ? true : false);
                  if (step === questions.length - 1) {
                    // Determine recommendation
                    const alone = current.key === "workAlone" ? (opt.value === "alone") : state.branchingAnswers.workAlone;
                    if (alone) {
                      dispatch({ type: "SET_PRODUCT", payload: "ip" });
                      goOnline();
                    } else {
                      dispatch({ type: "SET_PRODUCT", payload: "ooo" });
                      // multiple partners → manager
                      goManager();
                    }
                  } else {
                    setStep(step + 1);
                  }
                }}
                className="w-full text-left rounded-lg border bg-card p-4 hover:border-primary transition-all"
              >
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </PageWrapper>
      );
    }
  }

  // === IP flow ===
  if (product === "ip") {
    const questions = [
      {
        q: "Вы гражданин Российской Федерации?",
        options: [
          { label: "Да, гражданин РФ", action: () => { setAnswer("citizenship", "russian"); setStep(1); } },
          { label: "Нет / Другое гражданство", action: () => { setAnswer("citizenship", "foreign"); goManager(); } },
        ],
      },
      {
        q: "Как вам удобнее подать заявку?",
        options: [
          { label: "Заполню сам онлайн", action: () => { setAnswer("selfService", true); setStep(2); } },
          { label: "Хочу с помощью менеджера", action: () => { setAnswer("selfService", false); goManager(); } },
        ],
      },
      {
        q: "В каком городе вы находитесь?",
        isCity: true,
      },
    ];

    if (step < questions.length) {
      const current = questions[step];
      return (
        <PageWrapper onBack={() => step === 0 ? navigate("/") : setStep(step - 1)}>
          <div className="text-center space-y-2 mb-6">
            <p className="text-sm text-muted-foreground">Регистрация ИП</p>
            <h2 className="text-xl font-semibold">{current.q}</h2>
          </div>
          {"isCity" in current ? (
            <div className="space-y-4">
              <Select onValueChange={(v) => setAnswer("city", v)}>
                <SelectTrigger><SelectValue placeholder="Выберите город" /></SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={goOnline}>Продолжить</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {current.options!.map((opt) => (
                <button
                  key={opt.label}
                  onClick={opt.action}
                  className="w-full text-left rounded-lg border bg-card p-4 hover:border-primary transition-all"
                >
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </PageWrapper>
      );
    }
  }

  // === OOO flow ===
  if (product === "ooo") {
    const questions = [
      {
        q: "Сколько учредителей будет в ООО?",
        options: [
          { label: "Один учредитель", action: () => { setAnswer("founderCount", "one"); setStep(1); } },
          { label: "Несколько учредителей", action: () => { setAnswer("founderCount", "multiple"); goManager(); } },
        ],
      },
      {
        q: "Директор будет одним из учредителей?",
        options: [
          { label: "Да, я буду и директором", action: () => { setAnswer("directorIsFounder", true); setStep(2); } },
          { label: "Нет, директор — другой человек", action: () => { setAnswer("directorIsFounder", false); goManager(); } },
        ],
      },
      {
        q: "Есть ли среди участников иностранные граждане?",
        options: [
          { label: "Нет, все граждане РФ", action: () => { setAnswer("hasForeignFounders", false); setStep(3); } },
          { label: "Да, есть иностранные граждане", action: () => { setAnswer("hasForeignFounders", true); goManager(); } },
        ],
      },
      {
        q: "В каком городе вы находитесь?",
        isCity: true,
      },
    ];

    if (step < questions.length) {
      const current = questions[step];
      return (
        <PageWrapper onBack={() => step === 0 ? navigate("/") : setStep(step - 1)}>
          <div className="text-center space-y-2 mb-6">
            <p className="text-sm text-muted-foreground">Регистрация ООО</p>
            <h2 className="text-xl font-semibold">{current.q}</h2>
          </div>
          {"isCity" in current ? (
            <div className="space-y-4">
              <Select onValueChange={(v) => setAnswer("city", v)}>
                <SelectTrigger><SelectValue placeholder="Выберите город" /></SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={goOnline}>Продолжить</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {current.options!.map((opt) => (
                <button
                  key={opt.label}
                  onClick={opt.action}
                  className="w-full text-left rounded-lg border bg-card p-4 hover:border-primary transition-all"
                >
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </PageWrapper>
      );
    }
  }

  return null;
}

function PageWrapper({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="container py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-1 rounded hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-lg font-bold text-primary">УРАЛСИБ</span>
        </div>
      </header>
      <main className="container max-w-lg mx-auto py-8 space-y-6">
        {children}
        <SupportBlock compact />
      </main>
    </div>
  );
}

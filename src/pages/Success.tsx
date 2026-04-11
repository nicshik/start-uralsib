import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SupportBlock } from "@/components/SupportBlock";
import { CheckCircle2, Building, Phone, Clock } from "lucide-react";

export default function Success() {
  const navigate = useNavigate();
  const { clearDraft } = useApp();

  useEffect(() => {
    trackEvent("page_view", { page: "success" });
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="container py-3">
          <span className="text-lg font-bold text-primary">УРАЛСИБ</span>
        </div>
      </header>

      <main className="container max-w-lg mx-auto py-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-xl font-bold">Заявка отправлена!</h1>
          <p className="text-muted-foreground text-sm">
            Менеджер свяжется с вами для согласования встречи в офисе
          </p>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <p className="font-medium text-sm">Что дальше</p>
            {[
              { icon: Phone, title: "Звонок менеджера", desc: "В течение 1 рабочего дня" },
              { icon: Clock, title: "Назначение встречи", desc: "В удобное для вас время" },
              { icon: Building, title: "Визит в офис", desc: "Подписание документов и открытие счёта" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Важно:</strong> для завершения регистрации потребуется личный визит в отделение банка с оригиналами документов. Менеджер поможет выбрать удобное отделение и время.
            </p>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            clearDraft();
            navigate("/");
          }}
        >
          На главную
        </Button>

        <SupportBlock />
      </main>
    </div>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SupportBlock } from "@/components/SupportBlock";
import { AppHeader } from "@/components/AppHeader";
import { Phone, MessageCircle, MapPin, UserCheck } from "lucide-react";

export default function ManagerHandoff() {
  const navigate = useNavigate();
  const { state } = useApp();

  useEffect(() => {
    trackEvent("page_view", { page: "manager_handoff", product: state.productType });
  }, [state.productType]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBack backTo="/" />

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
            <UserCheck className="h-7 w-7 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Поможем подобрать форму и оформить заявку</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Менеджер поможет подготовить все документы и ответит на вопросы. Ваши ответы уже сохранены — не придётся повторять.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: Phone, title: "Заказать обратный звонок", desc: "Перезвоним в течение 15 минут", method: "callback" },
            { icon: MessageCircle, title: "Написать в чат", desc: "Онлайн-консультант на связи", method: "chat" },
            { icon: MapPin, title: "Записаться в офис", desc: "Выберите удобное отделение и время", method: "office" },
          ].map((item) => (
            <Card
              key={item.method}
              className="hover:border-primary hover:shadow-md transition-all cursor-pointer group"
              onClick={() => { trackEvent("manager_contact", { method: item.method }); alert(`${item.title} (демо)`); }}
            >
              <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <item.icon className="h-5 w-5 text-accent-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button variant="outline" className="w-full h-12" onClick={() => navigate("/")}>
          Вернуться на главную
        </Button>

        <SupportBlock />
      </main>
    </div>
  );
}

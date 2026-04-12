import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SupportBlock } from "@/components/SupportBlock";
import { ArrowLeft, Phone, MessageCircle, MapPin, UserCheck } from "lucide-react";

export default function ManagerHandoff() {
  const navigate = useNavigate();
  const { state } = useApp();

  useEffect(() => {
    trackEvent("page_view", { page: "manager_handoff", product: state.productType });
  }, [state.productType]);

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1 rounded hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-lg font-bold text-primary">УРАЛСИБ</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Поможем подобрать форму и оформить заявку</h1>
          <p className="text-sm text-muted-foreground">
            Менеджер поможет подготовить все документы и ответит на вопросы. Ваши ответы уже сохранены — не придётся повторять.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="hover:border-primary transition-all cursor-pointer" onClick={() => { trackEvent("manager_contact", { method: "callback" }); alert("Заявка на звонок отправлена (демо)"); }}>
            <CardContent className="p-4 flex items-center gap-3 md:flex-col md:text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Заказать обратный звонок</p>
                <p className="text-xs text-muted-foreground">Перезвоним в течение 15 минут</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-all cursor-pointer" onClick={() => { trackEvent("manager_contact", { method: "chat" }); alert("Чат открыт (демо)"); }}>
            <CardContent className="p-4 flex items-center gap-3 md:flex-col md:text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Написать в чат</p>
                <p className="text-xs text-muted-foreground">Онлайн-консультант на связи</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-all cursor-pointer" onClick={() => { trackEvent("manager_contact", { method: "office" }); alert("Запись в офис (демо)"); }}>
            <CardContent className="p-4 flex items-center gap-3 md:flex-col md:text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Записаться в офис</p>
                <p className="text-xs text-muted-foreground">Выберите удобное отделение и время</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button variant="outline" className="w-full" onClick={() => navigate("/")}>
          Вернуться на главную
        </Button>

        <SupportBlock />
      </main>
    </div>
  );
}

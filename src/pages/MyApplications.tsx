import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { AppHeader } from "@/components/AppHeader";
import { UserMenu } from "@/components/UserMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Building2, CheckCircle2, Clock, CreditCard, Plus, ChevronRight, CalendarDays, Hash } from "lucide-react";
import { MOCK_INCOMING_APPLICATIONS } from "@/lib/mockApplications";

type MockApplication = {
  id: string;
  type: "ip" | "ooo" | "rko";
  title: string;
  subtitle: string;
  status: "submitted_to_fns" | "draft" | "online_light_submitted" | "assisted_submitted" | "rko_submitted" | "rko_active";
  statusLabel: string;
  date: string;
  applicationNumber: string;
};

const MOCK_APPLICATIONS: MockApplication[] = MOCK_INCOMING_APPLICATIONS;

function StatusBadge({ status }: { status: MockApplication["status"] }) {
  if (status === "submitted_to_fns" || status === "online_light_submitted" || status === "assisted_submitted") {
    return (
      <Badge className="gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
        <CheckCircle2 className="h-3 w-3" />
        Отправлено в ФНС
      </Badge>
    );
  }
  if (status === "rko_active") {
    return (
      <Badge className="gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
        <CheckCircle2 className="h-3 w-3" />
        Счёт открыт
      </Badge>
    );
  }
  if (status === "rko_submitted") {
    return (
      <Badge variant="outline" className="gap-1.5 text-sky-700 border-sky-300 bg-sky-50 hover:bg-sky-50">
        <Clock className="h-3 w-3" />
        Заявка принята
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1.5 text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-50">
      <Clock className="h-3 w-3" />
      Черновик — ожидает оформления
    </Badge>
  );
}

function ApplicationCard({ app, onContinue }: { app: MockApplication; onContinue?: () => void }) {
  const Icon = app.type === "rko" ? CreditCard : app.type === "ip" ? Briefcase : Building2;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-light-purple">
            <Icon className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <p className="font-semibold text-foreground leading-snug">{app.title}</p>
            <p className="text-sm text-muted-foreground">{app.subtitle}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
              <span className="inline-flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {app.applicationNumber}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {app.date}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-3 shrink-0">
            <StatusBadge status={app.status} />
            {app.status === "draft" && onContinue && (
              <Button size="sm" onClick={onContinue} className="gap-1">
                Продолжить оформление
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyApplications() {
  const navigate = useNavigate();
  const { dispatch } = useApp();

  const handleNewApplication = () => {
    navigate("/", { state: { scrollToCta: true } });
  };

  const handleContinueDraft = () => {
    dispatch({ type: "SET_PRODUCT", payload: "ooo" });
    dispatch({ type: "SET_FLOW", payload: "online_light" });
    dispatch({ type: "SET_STEP", payload: 1 });
    navigate("/step/1");
  };

  return (
    <div className="min-h-screen bg-brand-light">
      <AppHeader>
        <UserMenu variant="dark" />
      </AppHeader>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Мои заявки</h1>
          <p className="text-sm text-muted-foreground mt-0.5">История ваших обращений в Уралсиб</p>
        </div>

        <div className="space-y-3">
          {MOCK_APPLICATIONS.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              onContinue={app.status === "draft" ? handleContinueDraft : undefined}
            />
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Хотите открыть ещё одно юрлицо?</p>
          <Button variant="outline" onClick={handleNewApplication} className="gap-2">
            <Plus className="h-4 w-4" />
            Подать новую заявку
          </Button>
        </div>
      </main>
    </div>
  );
}

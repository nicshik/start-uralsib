import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppHeader } from "@/components/AppHeader";
import { CheckCircle2, Phone, MessageCircle, MapPin, UserCheck } from "lucide-react";
import { openChat } from "@/components/ChatWidget";

type ContactMethod = "callback" | "office" | null;

const OFFICE_ADDRESSES = [
  "Москва, ул. Ефремова, д. 8",
  "Москва, Ленинградский проспект, д. 72, корп. 2",
  "Санкт-Петербург, Невский проспект, д. 68",
  "Уфа, ул. Революционная, д. 41",
  "Екатеринбург, ул. Малышева, д. 31",
];

export default function ManagerHandoff() {
  const navigate = useNavigate();
  const { state } = useApp();
  const initialName = [state.passport.lastName, state.passport.firstName, state.passport.middleName].filter(Boolean).join(" ");
  const [activeMethod, setActiveMethod] = useState<ContactMethod>(null);
  const [callbackName, setCallbackName] = useState(initialName);
  const [callbackPhone, setCallbackPhone] = useState(state.phone || "");
  const [officeName, setOfficeName] = useState(initialName);
  const [officePhone, setOfficePhone] = useState(state.phone || "");
  const [officeAddress, setOfficeAddress] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [requestSent, setRequestSent] = useState<ContactMethod>(null);

  useEffect(() => {
    trackEvent("page_view", { page: "manager_handoff", product: state.productType, flowType: state.flowType });
  }, [state.productType, state.flowType]);

  const openContactMethod = (method: ContactMethod) => {
    setActiveMethod(method);
    setRequestSent(null);
    trackEvent("manager_contact", { method, flowType: state.flowType });
  };

  const submitCallback = () => {
    setRequestSent("callback");
    trackEvent("manager_callback_requested", { flowType: state.flowType });
  };

  const submitOfficeMeeting = () => {
    setRequestSent("office");
    trackEvent("manager_office_meeting_requested", { office: officeAddress, date: meetingDate, time: meetingTime, flowType: state.flowType });
  };

  const canSubmitCallback = callbackName.trim().length > 1 && callbackPhone.replace(/\D/g, "").length >= 10;
  const canSubmitOffice =
    officeName.trim().length > 1 &&
    officePhone.replace(/\D/g, "").length >= 10 &&
    officeAddress &&
    meetingDate &&
    meetingTime;

  return (
    <div className="min-h-screen bg-brand-light">
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
              className={`hover:border-primary hover:shadow-md transition-all cursor-pointer group ${
                activeMethod === item.method ? "border-primary ring-2 ring-primary/15" : ""
              }`}
              onClick={() => {
                if (item.method === "chat") {
                  trackEvent("manager_contact", { method: item.method, flowType: state.flowType });
                  openChat();
                  return;
                }
                openContactMethod(item.method as ContactMethod);
              }}
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

        {activeMethod === "callback" && (
          <Card className="border-[#E5E0EB] bg-white">
            <CardContent className="p-5 space-y-5">
              <div className="space-y-1">
                <p className="font-semibold">Заказать обратный звонок</p>
                <p className="text-sm text-muted-foreground">Оставьте контакты — менеджер перезвонит в течение 15 минут.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="callback-name">Имя</Label>
                  <Input
                    id="callback-name"
                    value={callbackName}
                    onChange={(e) => setCallbackName(e.target.value)}
                    placeholder="Как к вам обращаться"
                    className="h-11 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="callback-phone">Телефон</Label>
                  <Input
                    id="callback-phone"
                    type="tel"
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    placeholder="+7 (___) ___-__-__"
                    className="h-11 bg-white"
                  />
                </div>
              </div>

              {requestSent === "callback" ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-green-800">Заявка на звонок принята. Менеджер свяжется с вами в ближайшее время.</p>
                </div>
              ) : (
                <Button className="w-full h-11" disabled={!canSubmitCallback} onClick={submitCallback}>
                  Заказать звонок
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {activeMethod === "office" && (
          <Card className="border-[#E5E0EB] bg-white">
            <CardContent className="p-5 space-y-5">
              <div className="space-y-1">
                <p className="font-semibold">Записаться в офис</p>
                <p className="text-sm text-muted-foreground">Выберите отделение и удобное время встречи с менеджером.</p>
              </div>

              <div className="space-y-2">
                <Label>Офис Уралсиб</Label>
                <Select value={officeAddress} onValueChange={setOfficeAddress}>
                  <SelectTrigger className="h-11 bg-white">
                    <SelectValue placeholder="Выберите адрес офиса" />
                  </SelectTrigger>
                  <SelectContent>
                    {OFFICE_ADDRESSES.map((address) => (
                      <SelectItem key={address} value={address}>
                        {address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meeting-date">Желаемая дата</Label>
                  <Input
                    id="meeting-date"
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="h-11 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meeting-time">Желаемое время</Label>
                  <Input
                    id="meeting-time"
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="h-11 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="office-name">Имя</Label>
                  <Input
                    id="office-name"
                    value={officeName}
                    onChange={(e) => setOfficeName(e.target.value)}
                    placeholder="Как к вам обращаться"
                    className="h-11 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="office-phone">Телефон</Label>
                  <Input
                    id="office-phone"
                    type="tel"
                    value={officePhone}
                    onChange={(e) => setOfficePhone(e.target.value)}
                    placeholder="+7 (___) ___-__-__"
                    className="h-11 bg-white"
                  />
                </div>
              </div>

              {requestSent === "office" ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-green-800">Запись отправлена. Менеджер подтвердит встречу по телефону.</p>
                </div>
              ) : (
                <Button className="w-full h-11" disabled={!canSubmitOffice} onClick={submitOfficeMeeting}>
                  Записаться на встречу
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <Button variant="outline" className="w-full h-12" onClick={() => navigate("/")}>
          Вернуться на главную
        </Button>
      </main>
    </div>
  );
}

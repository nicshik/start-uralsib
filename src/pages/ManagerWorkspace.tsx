import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { Building2, Briefcase, User, Search, CheckCircle2, FileText, CreditCard, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function ManagerWorkspace() {
  const navigate = useNavigate();
  const { state } = useApp();
  
  const [address, setAddress] = useState("");
  const [tariff, setTariff] = useState("start");
  const [completed, setCompleted] = useState(false);

  // Fallback to demo data if accessed directly without Context
  const isOOO = state.productType === "ooo";
  const name = state.passport?.lastName ? `${state.passport.lastName} ${state.passport.firstName} ${state.passport.middleName || ""}` : "Иванов Иван Иванович";
  const phone = state.phone || "+7 (999) 000-00-00";
  const tax = state.business?.taxRegime || "УСН Доходы (6%)";
  const okveds = state.business?.okvedCodes?.length ? state.business.okvedCodes : ["62.01 Разработка компьютерного программного обеспечения"];
  const companyName = state.business?.companyName || "ООО «Альфа»";

  const handleSign = () => {
    trackEvent("manager_workspace_completed");
    setCompleted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex text-slate-800">
      {/* Sidebar - strict CRM style */}
      <aside className="w-64 bg-[#1E293B] text-slate-200 flex flex-col fixed h-full z-10 left-0 top-0">
        <div className="p-5 border-b border-slate-700/50">
          <div className="font-bold text-white text-lg tracking-tight mb-1">УРАЛСИБ | CRM</div>
          <div className="text-xs text-slate-400">Единое окно агента</div>
        </div>
        
        <div className="p-4 space-y-4 flex-1">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">Сотрудник</div>
            <div className="text-sm font-medium text-white flex items-center gap-2">
              <User className="h-4 w-4" /> Константинов М.А.
            </div>
            <div className="text-xs text-slate-400 mt-1">ДО «Петровский», Окно 4</div>
          </div>
          
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 bg-[#6440BF] text-white rounded-md text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" /> Текущая заявка
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-md text-sm transition-colors">
              <Search className="h-4 w-4" /> Поиск клиентов
            </a>
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-700/50">
          <button onClick={() => navigate("/")} className="text-xs text-slate-400 hover:text-white transition-colors">
            &larr; Вернуться на клиентский сайт
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 p-8">
        <header className="mb-8 flex justify-between items-end border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Встреча с клиентом</h1>
            <p className="text-sm text-slate-500 mt-1">Номер заявки: #UR-849-21-APP</p>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Клиент идентифицирован
            </span>
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Онлайн-часть пройдена
            </span>
          </div>
        </header>

        {completed ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Документы отправлены в ФНС</h2>
            <p className="text-muted-foreground">Пакет документов ушел на регистрацию. Счет будет активирован после отбивки из налоговой.</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Следующий клиент</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Column: Read-Only Data from Context */}
            <div className="xl:col-span-5 space-y-6">
              <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                <CardHeader className="bg-slate-50/50 border-b border-gray-100 pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    Заявитель
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div className="text-slate-500">ФИО</div>
                    <div className="font-medium">{name}</div>
                    <div className="text-slate-500">Телефон</div>
                    <div className="font-medium">{phone}</div>
                    <div className="text-slate-500">ИНН</div>
                    <div className="font-medium">{state.passport.inn || "770012345678"}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                <CardHeader className="bg-slate-50/50 border-b border-gray-100 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    {isOOO ? <Building2 className="h-4 w-4 text-[#6440BF]" /> : <Briefcase className="h-4 w-4 text-[#6440BF]" />}
                    Данные бизнеса
                  </CardTitle>
                  <span className="text-xs bg-[#F0ECFA] text-[#6440BF] px-2 py-0.5 rounded font-medium">Собрано онлайн</span>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-1 gap-y-4 text-sm">
                    {isOOO && (
                      <div>
                        <div className="text-slate-500 mb-1">Наименование</div>
                        <div className="font-medium">{companyName}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-slate-500 mb-1">Форма и налоги</div>
                      <div className="font-medium">{isOOO ? "ООО" : "ИП"} на {tax}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-1">Виды деятельности (ОКВЭД)</div>
                      <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-700">
                        {okveds.map((code, idx) => (
                          <li key={idx} className={idx === 0 ? "font-semibold" : ""}>
                            {code} {idx === 0 && <span className="text-xs text-muted-foreground font-normal ml-1">(Основной)</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Actions needed by Manager */}
            <div className="xl:col-span-7 space-y-6">
              <Card className="border-0 shadow-sm ring-1 ring-gray-200">
                <CardHeader className="bg-[#1E293B] text-white">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PenTool className="h-5 w-5" />
                    Совместное заполнение (Задачи менеджера)
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Эти данные нельзя было собрать онлайн. Заполните их вместе с клиентом в офисе.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-8">
                  
                  {/* Task 1: FIAS Address */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      1. Подтверждение юридического адреса
                      <span className="text-xs font-normal text-slate-400 ml-auto flex items-center gap-1">
                        <Search className="h-3 w-3" /> Поиск по ФИАС
                      </span>
                    </Label>
                    <Input 
                      placeholder="Начните вводить адрес (город, улица, дом)..." 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-10 border-slate-300 focus-visible:ring-[#6440BF]"
                    />
                    <div className="text-xs text-slate-500">
                      Адрес должен точно совпадать с государственным реестром (ФИАС). При необходимости запросите договор аренды.
                    </div>
                  </div>

                  {/* Task 2: Account Tariff */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">2. Выбор тарифа расчётно-кассового обслуживания</Label>
                    <RadioGroup value={tariff} onValueChange={setTariff} className="grid grid-cols-2 gap-4">
                      <div>
                        <RadioGroupItem value="start" id="start" className="peer sr-only" />
                        <Label
                          htmlFor="start"
                          className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#6440BF] [&:has([data-state=checked])]:border-[#6440BF]"
                        >
                          <div className="font-semibold mb-1">Начни с нуля</div>
                          <div className="text-xs text-muted-foreground mb-2">0 ₽/мес, бесплатно навсегда</div>
                          <div className="text-xs font-medium text-[#6440BF]">Подходит для старта</div>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="growth" id="growth" className="peer sr-only" />
                        <Label
                          htmlFor="growth"
                          className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#6440BF] [&:has([data-state=checked])]:border-[#6440BF]"
                        >
                          <div className="font-semibold mb-1">Развитие</div>
                          <div className="text-xs text-muted-foreground mb-2">990 ₽/мес, бесплатные переводы</div>
                          <div className="text-xs font-medium text-[#6440BF]">Для стабильной выручки</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Task 3: Signing */}
                  <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Клиент получит SMS-код для подписания (КЭП)
                    </div>
                    <Button 
                      onClick={handleSign}
                      disabled={!address || address.length < 5}
                      className="bg-[#6440BF] hover:bg-[#503399] px-8"
                    >
                      Подписать и отправить в ФНС
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

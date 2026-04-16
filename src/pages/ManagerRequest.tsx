import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { SupportBlock } from "@/components/SupportBlock";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";
import {
  getApplicantValidation,
  getBusinessEmail,
  getBusinessValidation,
  getCompanyFullName,
  getRegistrationResultEmail,
} from "@/lib/applicationValidation";
import { OKVED_CODES, TAX_REGIMES } from "@/lib/mockData";
import { trackEvent } from "@/lib/analytics";
import { CheckCircle2, Clock, FileText, Phone, UserCheck } from "lucide-react";

export default function ManagerRequest() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [submitted, setSubmitted] = useState(false);

  const appNumber = useMemo(() => {
    const date = new Date();
    const num = Math.floor(10000 + Math.random() * 90000);
    return `УС-М-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${num}`;
  }, []);

  const isOoo = state.productType === "ooo";
  const tax = TAX_REGIMES.find((item) => item.id === state.business.taxRegime);
  const primaryOkved = OKVED_CODES.find((item) => item.code === state.business.primaryOkvedCode);
  const secondaryOkveds = OKVED_CODES.filter(
    (item) => state.business.okvedCodes.includes(item.code) && item.code !== state.business.primaryOkvedCode,
  );
  const businessValidation = getBusinessValidation(state.productType, state.business, { flowType: state.flowType, target: "fns_ready" });
  const applicantValidation = getApplicantValidation(state.productType, state.passport, state.email, state.phone, state.business, {
    flowType: state.flowType,
    target: "fns_ready",
  });
  const reasons = [...businessValidation.managerReasons, ...applicantValidation.managerReasons];
  const companyFullName = getCompanyFullName(state.business);
  const businessEmail = getBusinessEmail(state.productType, state.business, state.email);
  const registrationResultEmail = getRegistrationResultEmail(state.business, state.email);
  const legalAddress = state.business.addressIsFounder === false ? state.business.legalAddress : state.business.founderRegistrationAddress;
  const fullName = [state.passport.lastName, state.passport.firstName, state.passport.middleName].filter(Boolean).join(" ");
  const citizenshipLabel = {
    ru: "Гражданин РФ",
    foreign: "Иностранный гражданин",
    stateless: "Лицо без гражданства",
  }[state.passport.citizenship || "ru"];
  const documentTypeLabel = {
    passport_rf: "Паспорт гражданина РФ",
    other: "Иной документ",
  }[state.passport.documentType || "passport_rf"];
  const founderDocumentTypeLabel = {
    passport_rf: "Паспорт гражданина РФ",
    other: "Иной документ",
  }[state.business.founderDocumentType || "passport_rf"];

  useEffect(() => {
    trackEvent("page_view", {
      page: "manager_request",
      product: state.productType,
      reasonCount: reasons.length,
      flowType: state.flowType,
    });
  }, [reasons.length, state.flowType, state.productType]);

  const submitRequest = () => {
    const applicationStatus = state.flowType === "assisted" ? "assisted_submitted" : "online_light_submitted";
    dispatch({ type: "SET_APPLICATION_STATUS", payload: applicationStatus });
    dispatch({ type: "SUBMIT" });
    setSubmitted(true);
    trackEvent(applicationStatus, {
      appNumber,
      product: state.productType,
      reasonCount: reasons.length,
      flowType: state.flowType,
      applicationStatus,
    });
    trackEvent("manager_request_submitted", {
      appNumber,
      product: state.productType,
      reasonCount: reasons.length,
      flowType: state.flowType,
      applicationStatus,
    });
  };

  return (
    <div className="min-h-screen bg-brand-light">
      <AppHeader showBack>
        <AutosaveIndicator />
      </AppHeader>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-accent">
            {submitted ? (
              <CheckCircle2 className="h-7 w-7 text-accent-foreground" />
            ) : (
              <UserCheck className="h-7 w-7 text-accent-foreground" />
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-medium tracking-tight">
              {submitted ? "Заявка отправлена менеджеру" : "Проверим заявку с менеджером"}
            </h1>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              {submitted
                ? "Менеджер свяжется с вами по телефону, уточнит детали и поможет завершить оформление."
                : "Мы сохраним уже введённые данные. Менеджер позвонит и подскажет, какие документы нужны для этого сценария. Это ещё не отправка в ФНС."}
            </p>
          </div>
        </div>

        {submitted && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="flex items-start gap-3 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-green-900">Номер заявки: {appNumber}</p>
                <p className="text-sm text-green-800">Обычно менеджер звонит в течение 1 рабочего дня.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="font-semibold">Что передадим менеджеру</p>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Форма бизнеса: </span>
                <span className="font-medium">{isOoo ? "ООО" : "ИП"}</span>
              </div>
              {tax && (
                <div>
                  <span className="text-muted-foreground">Налоги: </span>
                  <span className="font-medium">{tax.name}</span>
                </div>
              )}
              {isOoo && state.business.companyName && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Краткое название: </span>
                  <span className="font-medium">{state.business.companyName}</span>
                </div>
              )}
              {isOoo && companyFullName && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Полное название: </span>
                  <span className="font-medium">{companyFullName}</span>
                </div>
              )}
              {isOoo && state.business.legalLocation && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Место нахождения: </span>
                  <span className="font-medium">{state.business.legalLocation}</span>
                </div>
              )}
              {isOoo && state.business.charterCapital && (
                <div>
                  <span className="text-muted-foreground">Уставной капитал: </span>
                  <span className="font-medium">{Number(state.business.charterCapital).toLocaleString("ru-RU")} ₽</span>
                </div>
              )}
              {isOoo && (
                <div>
                  <span className="text-muted-foreground">Вид капитала: </span>
                  <span className="font-medium">Уставный капитал</span>
                </div>
              )}
              {isOoo && legalAddress && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Юридический адрес: </span>
                  <span className="font-medium">{legalAddress}</span>
                </div>
              )}
              {isOoo && state.business.founderRegistrationAddress && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Адрес регистрации учредителя: </span>
                  <span className="font-medium">{state.business.founderRegistrationAddress}</span>
                </div>
              )}
              {isOoo && (
                <>
                  <div>
                    <span className="text-muted-foreground">Учредители: </span>
                    <span className="font-medium">{state.business.founderCount === "multiple" ? "Несколько" : "Один"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Гражданство учредителя: </span>
                    <span className="font-medium">{state.business.founderCitizenship === "foreign" ? "Иностранный гражданин" : "Гражданин РФ"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Документ учредителя: </span>
                    <span className="font-medium">{founderDocumentTypeLabel}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Доля: </span>
                    <span className="font-medium">{state.business.founderSharePercent || "100"}%</span>
                  </div>
                  {state.business.directorPosition && (
                    <div>
                      <span className="text-muted-foreground">Руководитель: </span>
                      <span className="font-medium">{state.business.directorPosition}</span>
                    </div>
                  )}
                  {state.business.directorTerm && (
                    <div>
                      <span className="text-muted-foreground">Срок: </span>
                      <span className="font-medium">{state.business.directorTerm}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Устав: </span>
                    <span className="font-medium">
                      {state.business.charterType === "custom" ? "Свой устав / документы" : `Типовой устав №${state.business.typicalCharterNumber || "36"}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Печать: </span>
                    <span className="font-medium">{state.business.hasSeal ? "С печатью" : "Без печати"}</span>
                  </div>
                </>
              )}
              {fullName && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Клиент: </span>
                  <span className="font-medium">{fullName}</span>
                </div>
              )}
              {!isOoo && state.passport.citizenship && (
                <div>
                  <span className="text-muted-foreground">Гражданство: </span>
                  <span className="font-medium">{citizenshipLabel}</span>
                </div>
              )}
              {!isOoo && state.passport.documentType && (
                <div>
                  <span className="text-muted-foreground">Документ: </span>
                  <span className="font-medium">{documentTypeLabel}</span>
                </div>
              )}
              {state.passport.passportSeries && state.passport.passportNumber && (
                <div>
                  <span className="text-muted-foreground">Паспорт: </span>
                  <span className="font-medium">{state.passport.passportSeries} {state.passport.passportNumber}</span>
                </div>
              )}
              {state.passport.inn && (
                <div>
                  <span className="text-muted-foreground">ИНН: </span>
                  <span className="font-medium">{state.passport.inn}</span>
                </div>
              )}
              {state.passport.snils && (
                <div>
                  <span className="text-muted-foreground">СНИЛС: </span>
                  <span className="font-medium">{state.passport.snils}</span>
                </div>
              )}
              {!isOoo && state.passport.registrationAddress && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Адрес регистрации: </span>
                  <span className="font-medium">{state.passport.registrationAddress}</span>
                </div>
              )}
              {state.phone && (
                <div>
                  <span className="text-muted-foreground">Телефон: </span>
                  <span className="font-medium">{state.phone}</span>
                </div>
              )}
              {businessEmail && (
                <div>
                  <span className="text-muted-foreground">{isOoo ? "Email юрлица: " : "Email ИП: "}</span>
                  <span className="font-medium">{businessEmail}</span>
                </div>
              )}
              {registrationResultEmail && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Email для документов ФНС: </span>
                  <span className="font-medium">{registrationResultEmail}</span>
                </div>
              )}
              {primaryOkved && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Основной ОКВЭД: </span>
                  <span className="font-medium">{primaryOkved.code} - {primaryOkved.name}</span>
                </div>
              )}
              {secondaryOkveds.length > 0 && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Дополнительные ОКВЭД: </span>
                  <span className="font-medium">{secondaryOkveds.slice(0, 3).map((item) => item.code).join(", ")}</span>
                  {secondaryOkveds.length > 3 && <span className="text-muted-foreground"> и ещё {secondaryOkveds.length - 3}</span>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {reasons.length > 0 && (
          <Card className="border-primary/20 bg-accent/40">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <p className="font-semibold">Что уточнит менеджер</p>
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {!submitted ? (
          <div className="space-y-3">
            <Button className="h-12 w-full" onClick={submitRequest}>
              Отправить заявку менеджеру
            </Button>
            <Button variant="outline" className="h-11 w-full" onClick={() => navigate(-1)}>
              Вернуться и изменить данные
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Card>
              <CardContent className="flex items-start gap-3 p-4">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Держите телефон рядом. Если менеджеру понадобится уточнить адрес или документы, он подскажет следующий шаг.
                </p>
              </CardContent>
            </Card>
            <Button variant="outline" className="h-11 w-full" onClick={() => navigate("/")}>
              На главную
            </Button>
          </div>
        )}

        <SupportBlock compact />
      </main>
    </div>
  );
}

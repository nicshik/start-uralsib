import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { trackEvent } from "@/lib/analytics";
import { getCompanyFullName } from "@/lib/applicationValidation";
import { OKVED_CODES, TAX_REGIMES } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressHeader } from "@/components/ProgressHeader";
import { AutosaveIndicator } from "@/components/AutosaveIndicator";
import { Pencil, CheckCircle2, FileText, Mail } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export default function Step3Review() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    trackEvent("page_view", { page: "step3_review", flowType: state.flowType });
  }, [state.flowType]);

  const tax = TAX_REGIMES.find((t) => t.id === state.business.taxRegime);
  const selectedOkveds = OKVED_CODES.filter((c) => state.business.okvedCodes.includes(c.code));
  const primaryOkved = OKVED_CODES.find((c) => c.code === state.business.primaryOkvedCode);
  const secondaryOkveds = selectedOkveds.filter((c) => c.code !== state.business.primaryOkvedCode);
  const isOoo = state.productType === "ooo";
  const fullName = [state.passport.lastName, state.passport.firstName, state.passport.middleName].filter(Boolean).join(" ");
  const companyFullName = getCompanyFullName(state.business);
  const legalAddress = state.business.addressIsFounder === false ? state.business.legalAddress : state.business.founderRegistrationAddress;
  const registrationAddress = isOoo ? state.business.founderRegistrationAddress : state.passport.registrationAddress;
  const charterLabel = state.business.charterType === "custom" ? "Свой устав / документы" : "Сгенерировать по шаблону";

  const handleSubmit = () => {
    setSubmitting(true);
    trackEvent("application_submitted", { flowType: state.flowType, paperDocuments: state.paperDocuments });
    if (state.flowType === "manager") {
      trackEvent("assisted_step_completed", { step: 3, flowType: "manager" });
    }
    setTimeout(() => {
      dispatch({ type: "SUBMIT" });
      navigate("/success");
    }, 1500);
  };

  return (
    <div className="min-h-screen pb-24 bg-brand-light">
      <AppHeader showBack>
        <AutosaveIndicator />
      </AppHeader>
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <ProgressHeader step={3} totalSteps={3} />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Проверьте данные перед отправкой</h2>
          <p className="text-sm text-muted-foreground mt-1">Убедитесь, что всё заполнено верно — после отправки изменить данные можно будет только через менеджера.</p>
        </div>

        {/* Summary card */}
        <div className="rounded-2xl border border-[#E5E0EB] bg-white divide-y divide-[#E5E0EB]">
          {/* Business section */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Бизнес</p>
              <button onClick={() => navigate("/step/1")} className="text-xs text-primary flex items-center gap-1 hover:underline">
                <Pencil className="h-3 w-3" /> Изменить
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <div>
                <span className="text-muted-foreground">Форма: </span>
                <span className="font-medium">{isOoo ? "ООО" : "ИП"}</span>
              </div>
              {tax && (
                <div>
                  <span className="text-muted-foreground">Налоги: </span>
                  <span className="font-medium">{tax.name}</span>
                </div>
              )}
              {state.business.companyName && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Краткое название: </span>
                  <span className="font-medium">{state.business.companyName}</span>
                </div>
              )}
              {isOoo && companyFullName && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Полное название: </span>
                  <span className="font-medium">{companyFullName}</span>
                </div>
              )}
              {state.business.charterCapital && (
                <div>
                  <span className="text-muted-foreground">Уст. капитал: </span>
                  <span className="font-medium">{Number(state.business.charterCapital).toLocaleString("ru-RU")} ₽</span>
                </div>
              )}
              {legalAddress && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Юр. адрес: </span>
                  <span className="font-medium">{legalAddress}</span>
                </div>
              )}
              {isOoo && (
                <>
                  <div>
                    <span className="text-muted-foreground">Учредители: </span>
                    <span className="font-medium">{state.business.founderCount === "multiple" ? "Несколько" : "Один"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Гражданство: </span>
                    <span className="font-medium">{state.business.founderCitizenship === "foreign" ? "Иностранный гражданин" : "Гражданин РФ"}</span>
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
                    <span className="font-medium">{charterLabel}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Печать: </span>
                    <span className="font-medium">{state.business.hasSeal ? "С печатью" : "Без печати"}</span>
                  </div>
                </>
              )}
              {primaryOkved && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Основной ОКВЭД: </span>
                  <span className="font-medium">{primaryOkved.code} — {primaryOkved.name}</span>
                </div>
              )}
            </div>
            {secondaryOkveds.length > 0 && (
              <div className="text-xs text-muted-foreground pt-1 space-y-0.5">
                <p>Дополнительные ОКВЭД:</p>
                {secondaryOkveds.slice(0, 5).map((c) => (
                  <p key={c.code}>{c.code} — {c.name}</p>
                ))}
                {secondaryOkveds.length > 5 && <p>и ещё {secondaryOkveds.length - 5}</p>}
              </div>
            )}
          </div>

          {/* Personal section */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Личные данные</p>
              <button onClick={() => navigate("/step/2")} className="text-xs text-primary flex items-center gap-1 hover:underline">
                <Pencil className="h-3 w-3" /> Изменить
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <div className="col-span-2">
                <span className="font-medium">{fullName}</span>
              </div>
              {state.passport.birthDate && (
                <div>
                  <span className="text-muted-foreground">Дата рождения: </span>
                  <span className="font-medium">{state.passport.birthDate}</span>
                </div>
              )}
              {state.passport.birthPlace && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Место рождения: </span>
                  <span className="font-medium">{state.passport.birthPlace}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Паспорт: </span>
                <span className="font-medium">{state.passport.passportSeries} {state.passport.passportNumber}</span>
              </div>
              {state.passport.issueDate && (
                <div>
                  <span className="text-muted-foreground">Выдан: </span>
                  <span className="font-medium">{state.passport.issueDate}</span>
                </div>
              )}
              {state.passport.issuedBy && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Кем выдан: </span>
                  <span className="font-medium">{state.passport.issuedBy}</span>
                </div>
              )}
              {state.passport.divisionCode && (
                <div>
                  <span className="text-muted-foreground">Код подразд.: </span>
                  <span className="font-medium">{state.passport.divisionCode}</span>
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
              {registrationAddress && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">{isOoo ? "Адрес регистрации учредителя: " : "Адрес регистрации: "}</span>
                  <span className="font-medium">{registrationAddress}</span>
                </div>
              )}
              {state.email && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Email: </span>
                  <span className="font-medium">{state.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E0EB] bg-white p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Получение документов</p>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email для уведомлений ФНС:</span>
                <span className="font-medium">{state.email}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Используем email, указанный на предыдущем шаге. Документы придут на бумаге только при выбранной отметке ниже.
              </p>
            </div>
            <button onClick={() => navigate("/step/2")} className="text-xs text-primary flex items-center gap-1 hover:underline shrink-0">
              <Pencil className="h-3 w-3" /> Изменить
            </button>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-brand-light p-3">
            <Checkbox
              checked={state.paperDocuments}
              onCheckedChange={(checked) => {
                const enabled = checked === true;
                dispatch({ type: "SET_PAPER_DOCUMENTS", payload: enabled });
                trackEvent("paper_documents_toggled", { enabled, flowType: state.flowType });
              }}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Получить документы из ФНС на бумажном носителе
              </p>
              <p className="text-xs text-muted-foreground">
                Если не отмечать, ФНС направит документы только на электронную почту.
              </p>
            </div>
          </label>
        </div>

        {/* Meeting note */}
        <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            После отправки менеджер свяжется для уточнения деталей и назначит встречу в офисе — проверка документов, подписание заявления, открытие счёта.
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur-sm p-4">
        <div className="max-w-2xl mx-auto px-4">
          <Button className="w-full h-12" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Отправляем..." : "Отправить заявку"}
          </Button>
        </div>
      </div>
    </div>
  );
}

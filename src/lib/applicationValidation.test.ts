import { describe, expect, it } from "vitest";
import type { BusinessData, PassportData } from "@/context/AppContext";
import { getApplicantValidation, getBusinessValidation } from "./applicationValidation";

const validOooBusiness: BusinessData = {
  okvedCodes: ["62.01", "63.11"],
  primaryOkvedCode: "62.01",
  taxRegime: "usn6",
  companyName: 'ООО "Ромашка"',
  companyNameFull: 'Общество с ограниченной ответственностью "Ромашка"',
  charterCapital: "10000",
  founderCount: "one",
  founderCitizenship: "ru",
  founderRegistrationAddress: "г. Москва, ул. Тверская, д. 1, кв. 12",
  legalAddress: "г. Москва, ул. Тверская, д. 1, кв. 12",
  directorIsFounder: true,
  addressIsFounder: true,
  directorPosition: "Генеральный директор",
  directorTerm: "5 лет",
  charterType: "generated",
  hasSeal: false,
};

const validPassport: PassportData = {
  lastName: "Иванов",
  firstName: "Иван",
  birthDate: "01.01.1990",
  gender: "Мужской",
  birthPlace: "г. Москва",
  citizenship: "ru",
  documentType: "passport_rf",
  passportSeries: "45 12",
  passportNumber: "123456",
  issuedBy: "ОВД Тверской",
  issueDate: "01.01.2010",
  divisionCode: "770-001",
  inn: "770012345678",
  snils: "123-456-789 00",
  registrationAddress: "г. Москва, ул. Тверская, д. 1, кв. 12",
};

describe("application validation", () => {
  it("accepts a complete supported ООО business profile", () => {
    expect(getBusinessValidation("ooo", validOooBusiness).isComplete).toBe(true);
  });

  it("requires ООО name, capital, primary OKVED, confirmations, founder address, and director term", () => {
    const result = getBusinessValidation("ooo", {
      ...validOooBusiness,
      companyName: "",
      charterCapital: "5000",
      primaryOkvedCode: undefined,
      founderCount: undefined,
      founderCitizenship: undefined,
      founderRegistrationAddress: "",
      directorIsFounder: undefined,
      directorTerm: "",
    });

    expect(result.isComplete).toBe(false);
    expect(result.missingFields).toContain("Краткое наименование ООО");
    expect(result.missingFields).toContain("Уставной капитал от 10 000 ₽");
    expect(result.missingFields).toContain("Основной ОКВЭД");
    expect(result.missingFields).toContain("Количество учредителей");
    expect(result.missingFields).toContain("Гражданство учредителя");
    expect(result.missingFields).toContain("Подтверждение: руководитель является учредителем");
    expect(result.missingFields).toContain("Адрес регистрации учредителя");
    expect(result.missingFields).toContain("Срок избрания руководителя");
  });

  it("routes unsupported ООО scenarios to manager", () => {
    const result = getBusinessValidation("ooo", {
      ...validOooBusiness,
      founderCount: "multiple",
      directorIsFounder: false,
      charterType: "custom",
    });

    expect(result.isComplete).toBe(false);
    expect(result.managerReasons).toEqual([
      "Онлайн-подача для ООО доступна только с одним учредителем",
      "Руководитель должен быть учредителем",
      "Свой устав или загрузку документов проверит менеджер",
    ]);
  });

  it("requires primary OKVED for ИП business step", () => {
    const result = getBusinessValidation("ip", {
      okvedCodes: ["62.01"],
      taxRegime: "usn6",
    });

    expect(result.isComplete).toBe(false);
    expect(result.missingFields).toContain("Основной ОКВЭД");
  });

  it("requires ИП registration address and email on applicant step", () => {
    const result = getApplicantValidation("ip", {
      ...validPassport,
      registrationAddress: "",
    }, "", "+7 985 999 99 99");

    expect(result.isComplete).toBe(false);
    expect(result.missingFields).toContain("Email");
    expect(result.missingFields).toContain("Адрес регистрации");
  });

  it("requires ИП citizenship and document type on applicant step", () => {
    const result = getApplicantValidation("ip", {
      ...validPassport,
      citizenship: undefined,
      documentType: undefined,
    }, "client@example.ru", "+7 985 999 99 99");

    expect(result.isComplete).toBe(false);
    expect(result.missingFields).toContain("Гражданство");
    expect(result.missingFields).toContain("Вид документа");
  });

  it("routes unsupported ИП applicant documents to manager", () => {
    const result = getApplicantValidation("ip", {
      ...validPassport,
      citizenship: "foreign",
      documentType: "other",
    }, "client@example.ru", "+7 985 999 99 99");

    expect(result.isComplete).toBe(false);
    expect(result.managerReasons).toEqual([
      "Онлайн-подача ИП доступна только для граждан РФ",
      "Иной документ, удостоверяющий личность, проверит менеджер",
    ]);
  });

  it("accepts complete ИП applicant data", () => {
    const result = getApplicantValidation("ip", validPassport, "client@example.ru", "+7 985 999 99 99");

    expect(result.isComplete).toBe(true);
  });
});

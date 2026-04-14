import { describe, expect, it } from "vitest";
import type { BusinessData, PassportData } from "@/context/AppContext";
import { getApplicantValidation, getBusinessValidation } from "./applicationValidation";

const validOooBusiness: BusinessData = {
  okvedCodes: ["62.01", "63.11"],
  primaryOkvedCode: "62.01",
  taxRegime: "usn6",
  companyName: 'ООО "Ромашка"',
  companyNameFull: 'Общество с ограниченной ответственностью "Ромашка"',
  legalEntityEmail: "ooo@example.ru",
  registrationResultEmail: "fns@example.ru",
  charterCapital: "10000",
  capitalType: "charter",
  legalLocation: "г. Москва",
  founderCount: "one",
  founderCitizenship: "ru",
  founderDocumentType: "passport_rf",
  founderRegistrationAddress: "г. Москва, ул. Тверская, д. 1, кв. 12",
  founderSharePercent: "100",
  legalAddress: "г. Москва, ул. Тверская, д. 1, кв. 12",
  directorIsFounder: true,
  addressIsFounder: true,
  directorPosition: "Генеральный директор",
  directorTerm: "5 лет",
  charterType: "generated",
  typicalCharterNumber: "36",
  applicantRole: "founder_individual",
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
      legalLocation: "",
      charterCapital: "5000",
      capitalType: undefined,
      primaryOkvedCode: undefined,
      founderCount: undefined,
      founderCitizenship: undefined,
      founderDocumentType: undefined,
      founderRegistrationAddress: "",
      founderSharePercent: undefined,
      directorIsFounder: undefined,
      directorTerm: "",
      typicalCharterNumber: "",
      applicantRole: undefined,
    });

    expect(result.isComplete).toBe(false);
    expect(result.missingFields).toContain("Краткое наименование ООО");
    expect(result.missingFields).toContain("Уставной капитал от 10 000 ₽");
    expect(result.missingFields).toContain("Вид капитала");
    expect(result.missingFields).toContain("Место нахождения юридического лица");
    expect(result.missingFields).toContain("Основной ОКВЭД");
    expect(result.missingFields).toContain("Количество учредителей");
    expect(result.missingFields).toContain("Гражданство учредителя");
    expect(result.missingFields).toContain("Вид документа учредителя");
    expect(result.missingFields).toContain("Подтверждение: руководитель является учредителем");
    expect(result.missingFields).toContain("Адрес регистрации учредителя");
    expect(result.missingFields).toContain("Доля учредителя 100%");
    expect(result.missingFields).toContain("Срок избрания руководителя");
    expect(result.missingFields).toContain("Номер типового устава");
    expect(result.missingFields).toContain("Роль заявителя");
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
      "Для нескольких учредителей менеджер поможет подготовить комплект документов",
      "Если руководитель не является учредителем, менеджер уточнит данные для документов",
      "Менеджер проверит устав и поможет подготовить комплект документов",
    ]);
  });

  it("ignores stale manager flags when current ООО fields are supported", () => {
    const result = getBusinessValidation("ooo", {
      ...validOooBusiness,
      requiresManager: true,
      managerReason: "Если руководитель не является учредителем, менеджер уточнит данные для документов",
    });

    expect(result.isComplete).toBe(true);
    expect(result.managerReasons).toEqual([]);
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
    expect(result.missingFields).toContain("Email ИП");
    expect(result.missingFields).toContain("Email для документов ФНС");
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
      "Для иностранного гражданства потребуется дополнительная проверка документов",
      "Иной документ, удостоверяющий личность, проверит менеджер",
    ]);
  });

  it("accepts complete ИП applicant data", () => {
    const result = getApplicantValidation("ip", validPassport, "client@example.ru", "+7 985 999 99 99");

    expect(result.isComplete).toBe(true);
  });
});

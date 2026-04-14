import type { BusinessData, PassportData, ProductType } from "@/context/AppContext";

export interface ValidationResult {
  isComplete: boolean;
  missingFields: string[];
  managerReasons: string[];
}

const isFilled = (value?: string) => Boolean(value?.trim());

export const isValidEmail = (email?: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || "");

export function getBusinessEmail(productType: ProductType | undefined, business: BusinessData, fallbackEmail?: string): string {
  if (productType === "ooo") return business.legalEntityEmail || fallbackEmail || "";
  if (productType === "ip") return business.entrepreneurEmail || fallbackEmail || "";
  return fallbackEmail || "";
}

export function getRegistrationResultEmail(business: BusinessData, fallbackEmail?: string): string {
  return business.registrationResultEmail || fallbackEmail || "";
}

export function getCompanyFullName(business: BusinessData): string {
  if (isFilled(business.companyNameFull)) return business.companyNameFull!.trim();

  const shortName = business.companyName?.trim() || "";
  const quotedName = shortName.match(/"([^"]+)"/)?.[1]?.trim();
  const bareName = shortName.replace(/^ООО\s*/i, "").replace(/^"|"$/g, "").trim();
  const name = quotedName || bareName;

  return name ? `Общество с ограниченной ответственностью "${name}"` : "";
}

export function getManagerReasons(business: BusinessData): string[] {
  const reasons: string[] = [];

  if (business.founderCount === "multiple") {
    reasons.push("Для нескольких учредителей менеджер поможет подготовить комплект документов");
  }
  if (business.founderCitizenship === "foreign") {
    reasons.push("Для учредителя с иностранным гражданством потребуется дополнительная проверка документов");
  }
  if (business.founderDocumentType === "other") {
    reasons.push("Иной документ учредителя проверит менеджер");
  }
  if (business.directorIsFounder === false) {
    reasons.push("Если руководитель не является учредителем, менеджер уточнит данные для документов");
  }
  if (business.addressIsFounder === false) {
    reasons.push("Менеджер проверит юридический адрес перед подготовкой документов");
  }
  if (business.charterType === "custom") {
    reasons.push("Менеджер проверит устав и поможет подготовить комплект документов");
  }
  if (business.requiresManager && reasons.length === 0) {
    reasons.push(business.managerReason || "Требуется помощь менеджера");
  }

  return reasons;
}

export function getBusinessValidation(productType: ProductType | undefined, business: BusinessData): ValidationResult {
  const missingFields: string[] = [];
  const managerReasons = productType === "ooo" ? getManagerReasons(business) : [];

  if (!business.taxRegime) missingFields.push("Налоговый режим");
  if (business.okvedCodes.length === 0) missingFields.push("ОКВЭД");
  if (!business.primaryOkvedCode || !business.okvedCodes.includes(business.primaryOkvedCode)) {
    missingFields.push("Основной ОКВЭД");
  }

  if (productType === "ooo") {
    if (!isFilled(business.companyName)) missingFields.push("Краткое наименование ООО");
    if (!getCompanyFullName(business)) missingFields.push("Полное наименование ООО");
    if (!business.charterCapital || Number(business.charterCapital) < 10000) {
      missingFields.push("Уставной капитал от 10 000 ₽");
    }
    if (business.capitalType !== "charter") missingFields.push("Вид капитала");
    if (!isFilled(business.legalLocation)) missingFields.push("Место нахождения юридического лица");
    if (!business.founderCount) missingFields.push("Количество учредителей");
    if (!business.founderCitizenship) missingFields.push("Гражданство учредителя");
    if (!business.founderDocumentType) missingFields.push("Вид документа учредителя");
    if (business.directorIsFounder === undefined) {
      missingFields.push("Подтверждение: руководитель является учредителем");
    }
    if (!isFilled(business.founderRegistrationAddress)) {
      missingFields.push("Адрес регистрации учредителя");
    }
    if (business.founderSharePercent !== "100") missingFields.push("Доля учредителя 100%");
    if (!isFilled(business.directorPosition)) missingFields.push("Должность руководителя");
    if (!isFilled(business.directorTerm)) missingFields.push("Срок избрания руководителя");
    if (!business.charterType) missingFields.push("Тип устава");
    if (business.charterType === "generated" && !isFilled(business.typicalCharterNumber)) {
      missingFields.push("Номер типового устава");
    }
    if (business.applicantRole !== "founder_individual") missingFields.push("Роль заявителя");
    if (business.hasSeal === undefined) missingFields.push("Печать организации");
  }

  return {
    isComplete: missingFields.length === 0 && managerReasons.length === 0,
    missingFields,
    managerReasons,
  };
}

export function getApplicantValidation(
  productType: ProductType | undefined,
  passport: PassportData,
  email?: string,
  phone?: string,
  business?: BusinessData,
): ValidationResult {
  const missingFields: string[] = [];
  const managerReasons: string[] = [];

  if (!isFilled(passport.lastName)) missingFields.push("Фамилия");
  if (!isFilled(passport.firstName)) missingFields.push("Имя");
  if (!isFilled(passport.birthDate)) missingFields.push("Дата рождения");
  if (!isFilled(passport.gender)) missingFields.push("Пол");
  if (!isFilled(passport.birthPlace)) missingFields.push("Место рождения");
  if (productType === "ip") {
    if (!passport.citizenship) {
      missingFields.push("Гражданство");
    } else if (passport.citizenship !== "ru") {
      managerReasons.push("Для иностранного гражданства потребуется дополнительная проверка документов");
    }
    if (!passport.documentType) {
      missingFields.push("Вид документа");
    } else if (passport.documentType !== "passport_rf") {
      managerReasons.push("Иной документ, удостоверяющий личность, проверит менеджер");
    }
  }
  if (!isFilled(passport.passportSeries)) missingFields.push("Серия паспорта");
  if (!isFilled(passport.passportNumber)) missingFields.push("Номер паспорта");
  if (!isFilled(passport.issuedBy)) missingFields.push("Кем выдан паспорт");
  if (!isFilled(passport.issueDate)) missingFields.push("Дата выдачи паспорта");
  if (!isFilled(passport.divisionCode)) missingFields.push("Код подразделения");
  if (!isFilled(passport.snils)) missingFields.push("СНИЛС");
  if (productType === "ip" && !isFilled(passport.inn)) missingFields.push("ИНН");
  const businessEmail = getBusinessEmail(productType, business || { okvedCodes: [] }, email);
  const registrationResultEmail = getRegistrationResultEmail(business || { okvedCodes: [] }, email);

  if (productType === "ip") {
    if (!isValidEmail(businessEmail)) missingFields.push("Email ИП");
  } else if (productType === "ooo") {
    if (!isValidEmail(businessEmail)) missingFields.push("Email юридического лица");
  } else if (!isValidEmail(email)) {
    missingFields.push("Email");
  }
  if (!isValidEmail(registrationResultEmail)) missingFields.push("Email для документов ФНС");
  if ((phone || "").replace(/\D/g, "").length < 10) missingFields.push("Телефон");

  const registrationAddress =
    productType === "ooo"
      ? business?.founderRegistrationAddress || passport.registrationAddress
      : passport.registrationAddress;
  if (!isFilled(registrationAddress)) missingFields.push("Адрес регистрации");

  return {
    isComplete: missingFields.length === 0 && managerReasons.length === 0,
    missingFields,
    managerReasons,
  };
}

import type { BusinessData, PassportData, ProductType } from "@/context/AppContext";

export interface ValidationResult {
  isComplete: boolean;
  missingFields: string[];
  managerReasons: string[];
}

const isFilled = (value?: string) => Boolean(value?.trim());

export const isValidEmail = (email?: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || "");

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
    reasons.push("Онлайн-подача для ООО доступна только с одним учредителем");
  }
  if (business.founderCitizenship === "foreign") {
    reasons.push("Онлайн-подача недоступна для иностранных граждан");
  }
  if (business.directorIsFounder === false) {
    reasons.push("Руководитель должен быть учредителем");
  }
  if (business.addressIsFounder === false) {
    reasons.push("Нестандартный юридический адрес проверит менеджер");
  }
  if (business.charterType === "custom") {
    reasons.push("Свой устав или загрузку документов проверит менеджер");
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
    if (!business.founderCount) missingFields.push("Количество учредителей");
    if (!business.founderCitizenship) missingFields.push("Гражданство учредителя");
    if (business.directorIsFounder === undefined) {
      missingFields.push("Подтверждение: руководитель является учредителем");
    }
    if (!isFilled(business.founderRegistrationAddress)) {
      missingFields.push("Адрес регистрации учредителя");
    }
    if (!isFilled(business.directorPosition)) missingFields.push("Должность руководителя");
    if (!isFilled(business.directorTerm)) missingFields.push("Срок избрания руководителя");
    if (!business.charterType) missingFields.push("Тип устава");
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
      managerReasons.push("Онлайн-подача ИП доступна только для граждан РФ");
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
  if (!isValidEmail(email)) missingFields.push("Email");
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

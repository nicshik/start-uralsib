export type { OkvedCode } from "./okvedData";
export { OKVED_FULL as OKVED_CODES, OKVED_SECTIONS } from "./okvedData";

export const MOCK_PASSPORT_DATA = {
  lastName: "Иванов",
  firstName: "Алексей",
  middleName: "Сергеевич",
  birthDate: "15.03.1990",
  gender: "Мужской",
  birthPlace: "г. Москва",
  passportSeries: "45 12",
  passportNumber: "345678",
  issuedBy: "Отделом УФМС России по гор. Москве по району Тверской",
  issueDate: "20.05.2010",
  divisionCode: "770-045",
  inn: "770012345678",
  snils: "123-456-789 00",
  registrationAddress: "г. Москва, ул. Тверская, д. 1, кв. 12",
};

export const TAX_REGIMES = [
  { id: "usn6", name: "УСН 6%", description: "Упрощённая система, 6% от дохода. Подходит для услуг и IT.", availableFor: ["ip", "ooo"] as string[] },
  { id: "usn15", name: "УСН 15%", description: "Упрощённая система, 15% от прибыли. Подходит при больших расходах.", availableFor: ["ip", "ooo"] as string[] },
  { id: "patent", name: "Патент", description: "Фиксированный платёж за год. Только для ИП, не для всех видов деятельности.", availableFor: ["ip"] as string[] },
  { id: "osn", name: "ОСН", description: "Общая система. Нужна для работы с НДС и крупными компаниями.", availableFor: ["ip", "ooo"] as string[] },
];

export const CITIES = [
  "Москва", "Санкт-Петербург", "Уфа", "Екатеринбург", "Новосибирск",
  "Казань", "Нижний Новгород", "Челябинск", "Самара", "Краснодар",
];

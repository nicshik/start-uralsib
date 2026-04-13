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
};

export const TAX_REGIMES = [
  { id: "usn6", name: "УСН 6%", description: "Упрощённая система, 6% от дохода. Подходит для услуг и IT." },
  { id: "usn15", name: "УСН 15%", description: "Упрощённая система, 15% от прибыли. Подходит при больших расходах." },
  { id: "osn", name: "ОСН", description: "Общая система. Нужна для работы с НДС и крупными компаниями." },
];

export const CITIES = [
  "Москва", "Санкт-Петербург", "Уфа", "Екатеринбург", "Новосибирск",
  "Казань", "Нижний Новгород", "Челябинск", "Самара", "Краснодар",
];

import type { PassportData, BusinessData } from "@/context/AppContext";

export interface MockIncomingApplication {
  id: string;
  type: "ip" | "ooo" | "rko";
  title: string;
  subtitle: string;
  status: "submitted_to_fns" | "draft" | "online_light_submitted" | "assisted_submitted" | "rko_submitted" | "rko_active";
  statusLabel: string;
  date: string;
  applicationNumber: string;
  phone: string;
  email: string;
  paperDocuments: boolean;
  passport?: PassportData;
  business?: BusinessData;
}

export const MOCK_INCOMING_APPLICATIONS: MockIncomingApplication[] = [
  {
    id: "1",
    type: "ip",
    title: "ИП — Индивидуальный предприниматель",
    subtitle: "Иванов Иван Иванович",
    status: "submitted_to_fns",
    statusLabel: "Отправлено в ФНС",
    date: "10 апр 2025",
    applicationNumber: "УС-2025-04-0842",
    phone: "+7 (916) 123-45-67",
    email: "ivanov.ivan@gmail.com",
    paperDocuments: false,
    passport: {
      lastName: "Иванов",
      firstName: "Иван",
      middleName: "Иванович",
      birthDate: "15.03.1990",
      gender: "Мужской",
      birthPlace: "г. Москва",
      citizenship: "ru",
      documentType: "passport_rf",
      passportSeries: "45 12",
      passportNumber: "345678",
      issuedBy: "Отделом УФМС России по гор. Москве по району Тверской",
      issueDate: "20.05.2010",
      divisionCode: "770-045",
      inn: "770012345678",
      snils: "123-456-789 00",
      registrationAddress: "г. Москва, ул. Тверская, д. 1, кв. 12",
    },
    business: {
      taxRegime: "usn6",
      okvedCodes: ["62.01", "62.02", "63.11"],
      primaryOkvedCode: "62.01",
      entrepreneurEmail: "ivanov.ivan@gmail.com",
      registrationResultEmail: "ivanov.ivan@gmail.com",
      founderCount: "one",
      founderCitizenship: "ru",
      founderDocumentType: "passport_rf",
    },
  },
  {
    id: "2",
    type: "ooo",
    title: "ООО — Ромашка",
    subtitle: "Регистрация общества",
    status: "draft",
    statusLabel: "Черновик — ожидает оформления",
    date: "12 апр 2025",
    applicationNumber: "УС-2025-04-0915",
    phone: "+7 (903) 987-65-43",
    email: "romashka@yandex.ru",
    paperDocuments: false,
    passport: {
      lastName: "Петрова",
      firstName: "Елена",
      middleName: "Дмитриевна",
      birthDate: "22.07.1985",
      gender: "Женский",
      birthPlace: "г. Санкт-Петербург",
      citizenship: "ru",
      documentType: "passport_rf",
      passportSeries: "40 08",
      passportNumber: "112233",
      issuedBy: "Отделом УФМС России по г. Санкт-Петербургу по Центральному р-ну",
      issueDate: "14.09.2008",
      divisionCode: "780-001",
      inn: "780098765432",
      snils: "987-654-321 00",
      registrationAddress: "г. Санкт-Петербург, ул. Невский проспект, д. 88, кв. 5",
    },
    business: {
      taxRegime: "usn15",
      okvedCodes: ["47.91", "47.99", "52.10"],
      primaryOkvedCode: "47.91",
      companyName: 'ООО "Ромашка"',
      companyNameFull: 'Общество с ограниченной ответственностью "Ромашка"',
      charterCapital: "10000",
      capitalType: "charter",
      legalLocation: "г. Санкт-Петербург",
      legalAddress: "г. Санкт-Петербург, ул. Невский проспект, д. 88, кв. 5",
      legalEntityEmail: "romashka@yandex.ru",
      registrationResultEmail: "romashka@yandex.ru",
      founderCount: "one",
      founderCitizenship: "ru",
      founderDocumentType: "passport_rf",
      founderRegistrationAddress: "г. Санкт-Петербург, ул. Невский проспект, д. 88, кв. 5",
      founderSharePercent: "100",
      directorIsFounder: true,
      addressIsFounder: true,
      directorPosition: "Генеральный директор",
      directorTerm: "5 лет",
      charterType: "generated",
      typicalCharterNumber: "36",
      applicantRole: "founder_individual",
      hasSeal: false,
    },
  },
  {
    id: "3",
    type: "rko",
    title: "Расчётный счёт — ИП Иванов",
    subtitle: "Открыт · тариф Стартовый",
    status: "rko_active",
    statusLabel: "Счёт открыт",
    date: "15 апр 2025",
    applicationNumber: "РС-2025-04-1103",
    phone: "+7 (916) 123-45-67",
    email: "ivanov.ivan@gmail.com",
    paperDocuments: false,
  },
  {
    id: "4",
    type: "rko",
    title: "Расчётный счёт — ООО Ромашка",
    subtitle: "Заявка на открытие счёта",
    status: "rko_submitted",
    statusLabel: "Заявка принята",
    date: "14 апр 2025",
    applicationNumber: "РС-2025-04-1089",
    phone: "+7 (903) 987-65-43",
    email: "romashka@yandex.ru",
    paperDocuments: false,
  },
];

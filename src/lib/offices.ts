export const OFFICES = {
  "Москва": {
    cities: {
      "Москва": ["ДО «Петровский», ул. Тверская, д. 22", "ДО «Арбат», ул. Новый Арбат, д. 12"],
    },
  },
  "Санкт-Петербург": {
    cities: {
      "Санкт-Петербург": ["ДО «Невский», Невский проспект, д. 55", "ДО «Петроградский», Каменноостровский проспект, д. 26"],
    },
  },
  "Калужская область": {
    cities: {
      "Калуга": ["ДО «Калуга», ул. Кирова, д. 33"],
    },
  },
  "Свердловская область": {
    cities: {
      "Екатеринбург": ["ДО «Екатеринбург», ул. Малышева, д. 51"],
    },
  },
  "Новосибирская область": {
    cities: {
      "Новосибирск": ["ДО «Новосибирск», Красный проспект, д. 29"],
    },
  },
  "Нижегородская область": {
    cities: {
      "Нижний Новгород": ["ДО «Нижегородский», ул. Большая Покровская, д. 18"],
    },
  },
  "Ставропольский край": {
    cities: {
      "Ставрополь": ["ДО «Ставрополь», ул. Ленина, д. 251"],
    },
  },
  "Волгоградская область": {
    cities: {
      "Волгоград": ["ДО «Волгоград», проспект Ленина, д. 15"],
    },
  },
} as const;

export type VisitRegion = keyof typeof OFFICES;
export type VisitPreference = "manager_pick" | "office";

export function getDefaultVisitCity(region: VisitRegion): string {
  return Object.keys(OFFICES[region].cities)[0] || "";
}

export function getOffices(region: VisitRegion, city: string): string[] {
  return [...(OFFICES[region].cities[city as keyof (typeof OFFICES)[VisitRegion]["cities"]] || [])];
}

export function getDefaultVisitOffice(region: VisitRegion, city = getDefaultVisitCity(region)): string {
  return getOffices(region, city)[0] || "";
}

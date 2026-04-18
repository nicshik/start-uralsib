# Start Uralsib

Прототип онлайн-регистрации ИП и ООО для проектной работы по кейсу Уралсиб.

Проект показывает клиентскую воронку регистрации бизнеса, assisted-сценарий с участием менеджера и демонстрационный CRM-экран для обработки заявки.

## Стек

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- Vitest

## Быстрый старт

```bash
npm install
npm run dev
```

Локальный адрес по умолчанию: `http://localhost:8080`.

## Команды

```bash
npm run dev       # локальный dev-сервер
npm run build     # production-сборка
npm run preview   # просмотр production-сборки
npm run lint      # статическая проверка
npm run test      # unit-тесты
```

В репозитории используется npm. `package-lock.json` является единственным lock-файлом.

## Основные сценарии

- `/` — лендинг и старт регистрации.
- `/sms-auth` — подтверждение телефона.
- `/step/1`...`/step/4` — заполнение данных бизнеса, паспорта, контактов и финальная проверка.
- `/success` — успешная отправка заявки.
- `/manager` и `/manager-request` — assisted-сценарий с подключением менеджера.
- `/rko-request` и `/my-applications` — дополнительные клиентские экраны прототипа.

## Demo/debug-режим

Служебные экраны и консоль событий скрыты в публичной production-сборке.
CRM-экран менеджера `/office-agent` остаётся доступным как часть демонстрационного сценария.

В dev-режиме они доступны автоматически. Для production-демонстрации задайте:

```bash
VITE_ENABLE_DEMO_TOOLS=true
```

После этого доступны:

- `/design` и `/coverage` — служебные экраны проверки дизайна и покрытия полей.
- `?debug=true` — включает Metrika Live console и вывод analytics-событий в консоль браузера.

## Проверка перед сдачей

```bash
npm run lint
npm run test
npm run build
```

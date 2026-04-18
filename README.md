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

## Переменные окружения

Для локального запуска скопируйте `.env.example` в `.env` и заполните значения Supabase:

```bash
cp .env.example .env
```

```bash
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-public-anon-key"
```

Эти значения используются для загрузки demo-видео и poster из Supabase Storage. `.env` не хранится в репозитории.

## Основные сценарии

- `/` — лендинг и старт регистрации.
- `/sms-auth` — подтверждение телефона.
- `/step/1`...`/step/4` — заполнение данных бизнеса, паспорта, контактов и финальная проверка.
- `/success` — успешная отправка заявки.
- `/manager` и `/manager-request` — assisted-сценарий с подключением менеджера.
- `/rko-request` и `/my-applications` — дополнительные клиентские экраны прототипа.

## Демонстрационные и debug-режимы

Демонстрационные экраны доступны в публичной production-сборке:

- `/office-agent` — CRM-экран сотрудника.
- `/design` и `/coverage` — экраны проверки дизайна и покрытия полей.

Debug-консоль событий скрыта в публичной production-сборке.

В dev-режиме она доступна автоматически. Для production-демонстрации задайте:

```bash
VITE_ENABLE_DEMO_TOOLS=true
```

После этого `?debug=true` включает Metrika Live console и вывод analytics-событий в консоль браузера.

## Проверка перед сдачей

```bash
npm run lint
npm run test
npm run build
```

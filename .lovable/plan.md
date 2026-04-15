

## План: Новая страница `/coverage` — Матрица покрытия полей

### Что делаем
Создаём страницу `/coverage` на основе предоставленного React-кода. Адаптируем его под стилистику проекта: используем `AppHeader`, CSS-переменные Tailwind вместо хардкод-цветов, компоненты `Card` и `Table` из UI-библиотеки.

### Изменения

**1. `src/pages/FieldCoverage.tsx`** — новый файл
- Берём предоставленный код за основу
- Заменяем inline `COLORS` на Tailwind-классы (`text-primary`, `bg-primary`, `text-muted-foreground`, `border-border` и т.д.)
- Заменяем кастомный header на `AppHeader` с `showBack`
- Заменяем raw `<table>` на компоненты `Table/TableHeader/TableBody/TableRow/TableHead/TableCell`
- Оборачиваем секции в `Card`
- Убираем `style={{ fontFamily }}` (уже задан глобально)
- Сохраняем всю логику: `MATRIX_DATA`, `StatBar`, `ScenarioCard`, `StatusBadge`, `DetailedTable`, секции «Уровень покрытия» и «Заполняется менеджером»

**2. `src/App.tsx`** — добавить маршрут
- Импорт `FieldCoverage` 
- Добавить `<Route path="/coverage" element={<FieldCoverage />} />`
- Существующий `/design` → `Coverage` остаётся как есть

### Стилистические правки
- Hero-секция: оставляем gradient `#2D1B69 → #1A0E45` (совпадает с `AppHeader`)
- Rounded corners: `rounded-2xl` (как `Card`)
- Цвета бейджей: `text-primary` вместо `#6440BF`, `text-muted-foreground` вместо `#6B6B6B`
- Ссылки в ScenarioCard — относительные пути (`/`, `/assisted-start`, `/office-agent`) вместо абсолютных URL


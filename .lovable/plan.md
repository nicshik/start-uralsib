

## План: Якорная навигация и легенда статусов на `/coverage`

### Что добавляем

**1. Sticky-навигация с якорями** — горизонтальная полоска под hero, фиксируется при скролле. Содержит ссылки на 4 секции:
- Сценарии (`#scenarios`)
- Покрытие (`#coverage`)
- Менеджер (`#manager-gap`)
- Матрица (`#matrix`)
- Источники (`#sources`)

Активная секция подсвечивается через `IntersectionObserver`. На mobile — горизонтальный скролл.

**2. Легенда статусов** — компактная горизонтальная полоска с 4 бейджами, размещается перед детальной матрицей:
- ✅ Да — клиент заполняет
- 🔒 Авто — заполняется автоматически
- → В CRM — дозаполняет менеджер
- — Нет — не применимо

### Технические детали

**Файл:** `src/pages/FieldCoverage.tsx`

- Добавить `id` к каждой секции (`id="scenarios"`, `id="coverage"`, и т.д.)
- Добавить компонент `SectionNav` — sticky bar (`sticky top-0 z-20 bg-background/95 backdrop-blur border-b`) с горизонтальным списком кнопок-якорей. Использует `useEffect` + `IntersectionObserver` для отслеживания активной секции
- Добавить компонент `StatusLegend` — `Card` с inline-flex бейджами, использующими те же `StatusBadge` компоненты. Размещается прямо перед `<DetailedTable />`
- Smooth scroll: `scroll-behavior: smooth` или `element.scrollIntoView({ behavior: 'smooth' })`


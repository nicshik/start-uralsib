
## Uralsib IP/OOO Registration Prototype — Implementation Plan

### Overview
A mobile-first, Russian-language clickable prototype for the redesigned Uralsib business registration flow. Frontend-only with mock data, localStorage drafts, and console.log analytics.

### Screens & Flow

**1. Landing Page**
- Hero: "Зарегистрируйте ИП или ООО за ~10 минут онлайн"
- Badges: бесплатно, без госпошлины
- 3 CTAs: "Открыть ИП" / "Открыть ООО" / "Помогите выбрать"
- Document checklist (паспорт, ИНН, СНИЛС)
- Support block, FAQ accordion

**2. Branching Questions**
- For ИП: citizenship, self-service vs. manager, city
- For ООО: founder count, director = founder?, foreign citizens, city
- "Помогите выбрать" → mini quiz (solo/partners, liability, hiring)
- Routes to online flow or manager handoff per rules in TZ

**3. Manager Handoff Screen**
- Positive framing: "Для вашего случая удобнее оформить с менеджером"
- 3 contact options: callback, chat, office visit
- Shows previously collected answers will be passed to manager

**4. SMS Auth Screen**
- Phone input → mock OTP with timer and resend
- Reassurance: "Ваш прогресс сохранится"
- Mini roadmap: бизнес → паспорт → проверка → встреча
- Draft warning if existing draft detected

**5. Step 1/3: Business**
- Progress bar "Шаг 1 из 3 · ~3 минуты"
- OKVED selector with search by name/code, list view default, reset button, tooltips for linked codes
- Tax regime picker (УСН 6%, УСН 15%, ОСН)
- For ООО: company name, shortcuts on by default (director=founder, legal address=founder address)
- Autosave indicator
- Support: "Не знаете ОКВЭД? Поможем выбрать"
- Completion message: "Шаг 1 готов. Осталось подтвердить паспорт"

**6. Step 2/3: Passport & OCR**
- Progress bar "Шаг 2 из 3 · ~5 минут"
- CTA: "Сфотографируйте паспорт" with fake upload
- Animated OCR progress: "Распознаём → Проверяем → Готово"
- Shows 8 auto-filled fields (ФИО, DOB, gender, birthplace, passport series/number, issued by, issue date, division code)
- Remaining manual fields: ИНН, СНИЛС
- Fallback: manual entry option
- Message: "Заполнили 8 полей, проверьте данные"

**7. Step 3/3: Review & Submit**
- Summary cards: business data, passport data, tax regime
- "Что уточнит сотрудник на встрече" block
- Submit CTA → success state
- Message: "Онлайн-часть готова. Остальные детали уточним на встрече"

**8. Success / Final State**
- "Заявка отправлена, менеджер свяжется для встречи"
- Clear office visit explanation
- Support contacts

### Cross-cutting Features
- **localStorage autosave** with draft resume and "У вас есть черновик" warning
- **Analytics debug panel** (toggleable) logging all events from TZ section 7
- **Support entry points** on every key screen
- **Mobile-first responsive** layout with clean bank UI (Uralsib blue/green palette)
- **Progress indicators** and micro-reinforcements throughout

### Technical Approach
- React pages with react-router, state managed via React context
- Mock OKVED data (~20 popular codes with hierarchy)
- Mock OCR with 1.5s delay animation
- All copy in Russian per TZ
- Tailwind for styling, shadcn/ui components

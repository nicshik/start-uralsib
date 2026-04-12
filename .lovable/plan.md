

## Desktop-First Layout + Remove Upfront Branching Questions

### Problem
1. The app is mobile-first with `max-w-lg` everywhere — looks narrow on desktop
2. The `/branching` page asks 3 filtering questions before the main flow. Per agreement, complex cases should be detected *during* the form steps and redirected to manager handoff — not via upfront quiz

### Changes

**1. Remove `/branching` route and page**
- Delete `src/pages/Branching.tsx`
- Remove route from `App.tsx`
- Landing page product choice ("ИП" / "ООО") navigates directly to `/sms-auth`
- "Помогите выбрать" navigates directly to `/manager` (manager handoff)

**2. Move eligibility checks into the form steps**
- In Step 1 (Business), for ООО: if user toggles "Директор = учредитель" OFF or adds multiple founders info → show inline prompt redirecting to manager
- In Step 2 (Passport): if user indicates foreign citizenship → redirect to manager handoff
- These are soft, contextual redirects with positive copy, not upfront blockers

**3. Desktop-first layout across all pages**
- Replace `max-w-lg` (512px) with `max-w-2xl` (672px) for form content
- Landing page: wider hero, 3 CTA cards in a horizontal row on desktop (`grid grid-cols-1 md:grid-cols-3`)
- Steps 1-3: two-column layout on desktop where appropriate (e.g., OKVED list + tax regime side by side)
- Header: full-width with centered content, `max-w-5xl`
- FAQ and checklist: side-by-side on desktop
- Fixed bottom CTA bar: centered with `max-w-2xl`
- All layouts remain single-column on mobile (`< md` breakpoint)

**4. Update Landing page**
- Remove "Помогите выбрать" quiz description, change to "Поможем подобрать форму" → links to manager
- Hero section wider, badges inline
- CTA cards as horizontal grid on desktop

**5. Clean up AppContext**
- Remove `BranchingAnswers` type and `SET_BRANCHING` action (no longer needed)
- Keep `flowType` for manager vs online distinction

### Files to modify
- `src/App.tsx` — remove branching route
- `src/pages/Landing.tsx` — desktop layout, direct navigation to `/sms-auth`
- `src/pages/Step1Business.tsx` — desktop layout, add inline manager redirect for ООО edge cases
- `src/pages/Step2Passport.tsx` — desktop layout, add citizenship check with manager redirect
- `src/pages/Step3Review.tsx` — desktop layout
- `src/pages/SmsAuth.tsx` — desktop layout
- `src/pages/Success.tsx` — desktop layout
- `src/pages/ManagerHandoff.tsx` — desktop layout
- `src/context/AppContext.tsx` — remove branching-related state
- Delete `src/pages/Branching.tsx`

### What stays the same
- All mock data, analytics, autosave, support blocks
- Manager handoff page content and positive framing
- OCR mock flow
- Russian copy throughout


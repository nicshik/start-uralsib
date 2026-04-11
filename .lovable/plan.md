

## Apply Uralsib Brand Design System

The current prototype uses a generic blue theme. The uploaded design spec defines Uralsib's actual brand: purple primary (`#6440BF`), Roboto font, specific component styles, and spacing conventions. This plan applies that design system across the entire prototype.

### Changes

**1. Update CSS variables and font (`src/index.css`)**
- Primary color → `#6440BF` (purple) in HSL: `~262 50% 57%`
- Primary dark (hover) → `#4B2D96`
- Background → `#FFFFFF`, light bg → `#F4F3F7`
- Text primary → `#212121`, secondary → `#6B6B6B`
- Border → `#E5E0EB`
- Input bg → `#F5F5F5`
- Success → `#34C759`, destructive → `#FF3B30`
- Add `@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap')`
- Set body font-family to `'Roboto', sans-serif`
- Increase `--radius` to `0.75rem` (12px for inputs, 16px for cards)

**2. Update Tailwind config (`tailwind.config.ts`)**
- No structural changes needed — colors flow from CSS variables

**3. Update `index.html`**
- Add Roboto font preconnect for performance

**4. Restyle components to match Uralsib conventions**
- **Buttons**: `border-radius: 8px`, padding `12px 24px`, font-weight 500
- **Cards**: `border-radius: 16px`, bg `#F4F3F7` or white with `#E5E0EB` border, no shadow
- **Inputs**: height 56px, bg `#F5F5F5`, border-radius 12px, focus ring purple
- **Progress bar**: purple indicator color (already follows `--primary`)

**5. Update Landing page hero section**
- Add dark purple gradient hero background (`#2D1B69 → #1A0E45`) with white text
- Style CTA buttons: primary purple bg, outline variant with purple border
- Badges: use Uralsib-style light purple badges (`#F0ECFA` bg, `#6440BF` text)

**6. Update all page headers**
- Style "УРАЛСИБ" text in purple (`#6440BF`) consistently
- Clean flat design, remove unnecessary shadows

### Files to modify
- `index.html` — font preconnect
- `src/index.css` — CSS custom properties, font import
- `src/pages/Landing.tsx` — hero gradient styling, badge colors
- `src/components/ui/button.tsx` — border-radius 8px default
- `src/components/ui/card.tsx` — border-radius 16px, flat style
- `src/components/ui/input.tsx` — height, bg, border-radius adjustments

### What stays the same
- All routing, state management, flow logic — untouched
- All page content and copy — untouched
- Component structure — untouched


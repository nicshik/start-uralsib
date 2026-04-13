

## Add Social Image and OG Meta Tags

### What's missing
The `index.html` has `og:title` and `og:description` but no `og:image` / `twitter:image`. The publish preview shows a broken image icon because there's no social image set.

### Plan

**1. Generate a social image (1200×630px)**
- Create a branded OG image using a script — purple gradient background (#2D1B69 → #1A0E45) with "Регистрация ИП и ООО" text and Уралсиб logo
- Save to `public/og-image.png`

**2. Update `index.html` meta tags**
- Add `og:image` pointing to the absolute URL: `https://start-uralsib.lovable.app/og-image.png`
- Add `og:url` meta tag
- Add `twitter:image` and change `twitter:card` from `summary` to `summary_large_image`
- Add `og:site_name`

**3. Ensure favicon references are complete**
- Already has `favicon.png` and `apple-touch-icon.png` — add `favicon-192.png` as a `rel="icon" sizes="192x192"` link

### Files to modify
- `index.html` — add missing meta tags
- `public/og-image.png` — generate new social image


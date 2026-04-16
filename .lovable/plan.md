

## Ответ на вопрос о Lovable CDN и Range Requests

**Краткий ответ:** официальная документация Lovable не подтверждает поддержку HTTP Range Requests для статических файлов из `public/`, и Lovable явно **не рекомендует** хранить большие видео в репозитории. Конфиги хостинг-провайдеров (`netlify.toml`, `_headers`, `vercel.json`) на Lovable-хостинге **не применяются** — Lovable использует собственный CDN, а не Netlify/Vercel, поэтому твоя текущая [netlify.toml](netlify.toml) ни на что не влияет на `*.lovable.app`.

Поведение, которое ты видишь, согласуется с этим: в превью редактора видео отдаётся dev-сервером Vite (он поддерживает Range), а на проде CDN отвечает `200 OK` целиком — Chrome тогда не даёт перематывать, Safari/Firefox более снисходительны.

**Возможности «включить Range на Lovable CDN»:** такого переключателя в панели нет, кастомные заголовки для статики не настраиваются. Поэтому правильное решение — вынести видео из `public/` на внешний сторадж, который умеет Range из коробки.

## План

Перенести `demo.mp4` со статики Lovable на внешний хостинг с поддержкой Range Requests и поменять `<source src="/demo.mp4">` на новый URL. Варианты — на твой выбор:

1. **Lovable Cloud Storage (Supabase Storage)** — рекомендуемый вариант «внутри Lovable». Создаём публичный bucket `media`, заливаем `demo.mp4`, получаем публичный URL вида `https://<project>.supabase.co/storage/v1/object/public/media/demo.mp4`. Supabase Storage отдаёт `206 Partial Content` и `Accept-Ranges: bytes` — Chrome перематывает.
2. **Cloudflare R2 / AWS S3 / Bunny / любой объектный сторадж** — тоже из коробки поддерживают Range. Просто подставляем публичную ссылку.
3. **YouTube/Vimeo (iframe)** — самый простой путь, рекомендованный самой документацией Lovable, если устраивает их плеер и брендинг.

### Что меняется в коде

- [src/pages/Landing.tsx](src/pages/Landing.tsx) (строка 452): заменить `src="/demo.mp4"` на новый URL (Supabase Storage / R2 / iframe YouTube).
- [public/demo.mp4](public/demo.mp4): удалить из репозитория, чтобы не раздувать билды и клон.
- [netlify.toml](netlify.toml): удалить — на Lovable CDN не действует, только вводит в заблуждение.

### Рекомендуемый путь

Lovable Cloud Storage — он уже интегрирован в проект, не требует внешних аккаунтов, поддерживает Range, и публичный bucket даёт стабильный CDN-URL. После апрува я:

1. Включу/проверю Lovable Cloud, создам публичный bucket `media`.
2. Дам тебе короткую инструкцию загрузить `demo.mp4` через UI Cloud → Storage (или, если разрешишь, через миграцию/edge function — но проще руками, файл один).
3. Обновлю `<source>` в [Landing.tsx](src/pages/Landing.tsx) на публичный URL.
4. Удалю `public/demo.mp4` и [netlify.toml](netlify.toml).
5. Проверим в Chrome, что приходит `206 Partial Content` и перемотка работает.

Если предпочитаешь YouTube/Vimeo или собственный R2/S3 — скажи, и я подставлю соответствующий вариант вместо шага 1–2.


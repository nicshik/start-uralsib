import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "colors", label: "Цвета" },
  { id: "typography", label: "Типографика" },
  { id: "components", label: "Компоненты" },
  { id: "radius", label: "Border-Radius" },
  { id: "spacing", label: "Spacing" },
  { id: "shadows", label: "Тени" },
  { id: "icons", label: "Иконография" },
  { id: "responsive", label: "Адаптивность" },
  { id: "animations", label: "Анимации" },
  { id: "css-vars", label: "CSS-переменные" },
  { id: "references", label: "Референсы" },
  { id: "principles", label: "Принципы" },
];

function ColorSwatch({ hex }: { hex: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block w-5 h-5 rounded border border-border shrink-0"
        style={{ backgroundColor: hex }}
      />
      <code className="text-xs">{hex}</code>
    </span>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-muted rounded-lg p-4 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
      {children.trim()}
    </pre>
  );
}

function SectionCard({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
      </Card>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-medium">{title}</h3>
      {children}
    </div>
  );
}

export default function Coverage() {
  const [active, setActive] = useState("colors");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBack backTo="/" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:grid lg:grid-cols-[200px_1fr] lg:gap-8">
        {/* Sidebar nav — desktop sticky, mobile horizontal scroll */}
        <nav className="lg:sticky lg:top-20 lg:self-start mb-6 lg:mb-0">
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  "whitespace-nowrap text-sm px-3 py-1.5 rounded-lg transition-colors shrink-0",
                  active === s.id
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Main content */}
        <div className="space-y-6">
          <div className="mb-2">
            <h1 className="text-2xl font-bold tracking-tight">Дизайн-код Уралсиб</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Полная спецификация. Источники: uralsib.ru, start.uralsib.ru
            </p>
          </div>

          {/* 1. Colors */}
          <SectionCard id="colors" title="1. Цветовая палитра">
            <SubSection title="1.1 Основные цвета бренда">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Роль</TableHead>
                    <TableHead>Цвет</TableHead>
                    <TableHead className="hidden sm:table-cell">RGB</TableHead>
                    <TableHead>Использование</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Primary Purple", "#6440BF", "100, 64, 191", "CTA-кнопки, ссылки, иконки, активные табы"],
                    ["Primary Purple Dark", "#4B2D96", "75, 45, 150", "Hover-состояния кнопок"],
                    ["Primary Purple Light", "#7B5CD0", "123, 92, 208", "Вторичные акценты, progress"],
                  ].map(([role, hex, rgb, use]) => (
                    <TableRow key={role}>
                      <TableCell className="font-medium text-sm">{role}</TableCell>
                      <TableCell><ColorSwatch hex={hex} /></TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{rgb}</TableCell>
                      <TableCell className="text-sm">{use}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SubSection>

            <SubSection title="1.2 Hero-градиент">
              <CodeBlock>{`background: linear-gradient(180deg, #2D1B69 0%, #1A0E45 100%);

--hero-bg-dark: #2D1B69;   /* Верхняя часть hero */
--hero-bg-darker: #1A0E45; /* Нижняя часть hero */
--hero-bg-mid: #3A2080;    /* Средний тон */

/* Glow/свечение */
background: radial-gradient(ellipse at 50% 0%, rgba(100, 64, 191, 0.4) 0%, transparent 70%);`}</CodeBlock>
            </SubSection>

            <SubSection title="1.3 Фоны и поверхности">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Роль</TableHead>
                    <TableHead>Цвет</TableHead>
                    <TableHead>Использование</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Background White", "#FFFFFF", "Основной фон секций"],
                    ["Background Light", "#F4F3F7", "Карточки, секции, alt-rows"],
                    ["Background Warm Gray", "#EDE9E3", "Hero-фон на start.uralsib.ru"],
                    ["Background Input", "#F5F5F5", "Поля ввода"],
                    ["Border Light", "#E5E0EB", "Разделители, границы карточек"],
                    ["Border Purple", "#D4CCE6", "Акцентные границы"],
                  ].map(([role, hex, use]) => (
                    <TableRow key={role}>
                      <TableCell className="font-medium text-sm">{role}</TableCell>
                      <TableCell><ColorSwatch hex={hex} /></TableCell>
                      <TableCell className="text-sm">{use}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SubSection>

            <SubSection title="1.4 Текстовые цвета">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Роль</TableHead>
                    <TableHead>Цвет</TableHead>
                    <TableHead>Использование</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Text Primary", "#212121", "Заголовки, основной текст"],
                    ["Text Secondary", "#6B6B6B", "Подписи, пояснения"],
                    ["Text Muted", "#3E5E81", "Body-текст start.uralsib"],
                    ["Text on Dark", "#FFFFFF", "Текст на тёмном hero"],
                    ["Text on Dark Secondary", "#C4B7E0", "Подписи на тёмном фоне"],
                    ["Link Purple", "#6440BF", "Ссылки в тексте"],
                  ].map(([role, hex, use]) => (
                    <TableRow key={role}>
                      <TableCell className="font-medium text-sm">{role}</TableCell>
                      <TableCell><ColorSwatch hex={hex} /></TableCell>
                      <TableCell className="text-sm">{use}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SubSection>

            <SubSection title="1.5 Семантические цвета">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Роль</TableHead>
                    <TableHead>Цвет</TableHead>
                    <TableHead>Использование</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Success Green", "#34C759", "Галочки, подтверждения"],
                    ["Warning Orange", "#FF9500", "Предупреждения, бейджи"],
                    ["Error Red", "#FF3B30", "Ошибки валидации"],
                    ["Info Blue", "#007AFF", "Информационные подсказки"],
                  ].map(([role, hex, use]) => (
                    <TableRow key={role}>
                      <TableCell className="font-medium text-sm">{role}</TableCell>
                      <TableCell><ColorSwatch hex={hex} /></TableCell>
                      <TableCell className="text-sm">{use}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SubSection>

            <SubSection title="1.6 Бейджи / Теги">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Тип</TableHead>
                    <TableHead>BG</TableHead>
                    <TableHead>Text</TableHead>
                    <TableHead>Пример</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Purple (active)", "#6440BF", "#FFFFFF", "«Для ИП», «12 месяцев»"],
                    ["Light purple", "#F0ECFA", "#6440BF", "«Дебетовая карта»"],
                    ["Orange/pink", "#FFE0D0", "#FF6B2B", "«Доставим сегодня»"],
                    ["Green", "#E8F5E9", "#2E7D32", "«Подключены», акции"],
                    ["Neutral", "#F4F3F7", "#212121", "«1 месяц» (inactive)"],
                  ].map(([type, bg, text, ex]) => (
                    <TableRow key={type}>
                      <TableCell className="font-medium text-sm">{type}</TableCell>
                      <TableCell><ColorSwatch hex={bg} /></TableCell>
                      <TableCell><ColorSwatch hex={text} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ex}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SubSection>
          </SectionCard>

          {/* 2. Typography */}
          <SectionCard id="typography" title="2. Типографика">
            <SubSection title="2.1 Шрифтовой стек">
              <CodeBlock>{`font-family: 'Roboto', sans-serif;
/* Fallback */
font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;`}</CodeBlock>
              <p className="text-sm text-muted-foreground">
                Roboto используется единообразно на всех субдоменах. Никаких serif или display-шрифтов.
              </p>
            </SubSection>

            <SubSection title="2.2 Шкала типографики">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Уровень</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead className="hidden sm:table-cell">Line-height</TableHead>
                    <TableHead className="hidden md:table-cell">Letter-spacing</TableHead>
                    <TableHead>Использование</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Display / H1 Hero", "48px", "700", "56px (1.17)", "-0.02em", "Hero-заголовок uralsib.ru"],
                    ["H1 (start)", "40px", "500", "48px (1.2)", "normal", "Заголовок start.uralsib.ru"],
                    ["H2", "32px", "500", "36px (1.125)", "normal", "Заголовки секций"],
                    ["H3", "28px", "500", "31px (1.11)", "normal", "Подзаголовки"],
                    ["H4", "24px", "500", "28px (1.17)", "normal", "Заголовки карточек"],
                    ["Body Large", "18px", "400", "28px (1.56)", "normal", "Подзаголовок hero"],
                    ["Body", "16px", "400", "24px (1.5)", "normal", "Основной текст"],
                    ["Body Bold", "16px", "500", "24px (1.5)", "normal", "Кнопки, навигация"],
                    ["Small", "14px", "400", "20px (1.43)", "normal", "Подписи, мелкий текст"],
                    ["Caption", "12px", "400", "16px (1.33)", "0.02em", "Сноски, копирайт"],
                  ].map(([level, size, weight, lh, ls, use]) => (
                    <TableRow key={level}>
                      <TableCell className="font-medium text-sm">{level}</TableCell>
                      <TableCell className="text-sm">{size}</TableCell>
                      <TableCell className="text-sm">{weight}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{lh}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{ls}</TableCell>
                      <TableCell className="text-sm">{use}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SubSection>

            <SubSection title="2.3 Цвета текста по уровням">
              <CodeBlock>{`h1, h2, h3, h4 { color: #212121; font-weight: 500; } /* На светлом фоне */
h1, h2, h3, h4 { color: #FFFFFF; }                   /* На тёмном hero */
p, body { color: #212121; }
.subtitle { color: #6B6B6B; }
a { color: #6440BF; text-decoration: underline; }
a:hover { color: #4B2D96; }`}</CodeBlock>
            </SubSection>
          </SectionCard>

          {/* 3. Components */}
          <SectionCard id="components" title="3. Компоненты">
            <SubSection title="3.1 Кнопки">
              <h4 className="text-sm font-medium text-muted-foreground">Primary Button (CTA)</h4>
              <CodeBlock>{`.btn-primary {
  background-color: #6440BF;
  color: #FFFFFF;
  font-size: 16px; font-weight: 500;
  padding: 12px 24px;       /* standard */
  padding: 16px 32px;       /* large (hero CTA) */
  border-radius: 8px;
  transition: background-color 0.2s ease;
}
.btn-primary:hover { background-color: #4B2D96; }
.btn-primary:active { background-color: #3A2080; }`}</CodeBlock>

              <h4 className="text-sm font-medium text-muted-foreground mt-4">Secondary / Outline Button</h4>
              <CodeBlock>{`.btn-secondary {
  background-color: transparent;
  color: #6440BF;
  padding: 12px 24px;
  border: 1.5px solid #6440BF;
  border-radius: 8px;
}
.btn-secondary:hover { background-color: rgba(100, 64, 191, 0.08); }`}</CodeBlock>

              <h4 className="text-sm font-medium text-muted-foreground mt-4">White Button (Hero)</h4>
              <CodeBlock>{`.btn-white {
  background-color: #FFFFFF;
  color: #6440BF;
  padding: 16px 40px;
  border-radius: 32px;     /* pill */
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}`}</CodeBlock>

              <h4 className="text-sm font-medium text-muted-foreground mt-4">Tertiary / Text-Link</h4>
              <CodeBlock>{`.btn-text {
  background: none; border: none;
  color: #6440BF; font-weight: 500;
  text-decoration: underline;
}
.btn-text::after { content: ' ›'; }`}</CodeBlock>
            </SubSection>

            <SubSection title="3.2 Header / Навигация">
              <CodeBlock>{`.header {
  position: sticky; top: 0; z-index: 100;
  background-color: transparent; /* на тёмном hero */
  height: 64px;
  transition: background-color 0.3s ease;
}
.header__logo { height: 24px; /* mobile */ height: 32px; /* desktop */ }
.header__login { font-size: 14px; padding: 8px 20px; border-radius: 8px; border: 1.5px solid currentColor; }`}</CodeBlock>
            </SubSection>

            <SubSection title="3.3 Карточки (Cards)">
              <CodeBlock>{`/* Стандартная */
.card { background: #F4F3F7; border-radius: 16px; padding: 24px; border: none; box-shadow: none; }

/* С бордером */
.card--product { background: #FFFFFF; border-radius: 20px; padding: 24px; border: 1px solid #E5E0EB; }

/* Акцентная */
.card--accent { border: 2px solid #6440BF; box-shadow: 0 0 0 2px rgba(100, 64, 191, 0.3); }

/* Тариф */
.card--tariff.active {
  border-color: #6440BF;
  background: linear-gradient(135deg, rgba(100,64,191,0.05), rgba(100,64,191,0.02));
}`}</CodeBlock>
            </SubSection>

            <SubSection title="3.5 Tabs / Pills">
              <CodeBlock>{`.tabs { display: inline-flex; border-radius: 24px; border: 1px solid #E5E0EB; padding: 4px; background: #F4F3F7; }
.tab { padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 500; }
.tab--active { background-color: #6440BF; color: #FFFFFF; }`}</CodeBlock>
            </SubSection>

            <SubSection title="3.6 Input / Поля ввода">
              <CodeBlock>{`.input {
  height: 56px; padding: 16px;
  background-color: #F5F5F5;
  border: 1px solid #E5E0EB; border-radius: 12px;
  font-size: 16px; color: #212121;
}
.input::placeholder { color: #9E9E9E; }
.input:focus { border-color: #6440BF; box-shadow: 0 0 0 3px rgba(100,64,191,0.15); }
.input--error { border-color: #FF3B30; box-shadow: 0 0 0 3px rgba(255,59,48,0.1); }`}</CodeBlock>
            </SubSection>

            <SubSection title="3.7 Footer">
              <CodeBlock>{`.footer { background: #F4F3F7; padding: 32px 16px; border-top: 1px solid #E5E0EB; }
.footer__contacts { background: #6440BF; border-radius: 16px; padding: 20px 24px; color: #FFFFFF; }
.footer__phone { font-size: 24px; font-weight: 700; color: #212121; }
.footer__legal { font-size: 12px; color: #6B6B6B; line-height: 18px; }`}</CodeBlock>
            </SubSection>

            <SubSection title="3.8 Промо-баннер">
              <CodeBlock>{`.promo-bar { background: #FFFFFF; padding: 12px 16px; border-bottom: 1px solid #E5E0EB; }
.promo-bar__cta { background: #6440BF; color: #FFFFFF; padding: 8px 16px; border-radius: 8px; }`}</CodeBlock>
            </SubSection>

            <SubSection title="3.9 Чат-бот (Floating)">
              <CodeBlock>{`.chat-fab {
  position: fixed; bottom: 24px; right: 24px;
  width: 56px; height: 56px; border-radius: 50%;
  background-color: #2D1B69; color: #FFFFFF;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  z-index: 1000;
}`}</CodeBlock>
            </SubSection>

            <SubSection title="3.10 Прогресс-бар / Шаги">
              <CodeBlock>{`.stepper__dot { width: 8px; height: 8px; border-radius: 50%; background: #E5E0EB; }
.stepper__dot--active { background: #6440BF; width: 24px; border-radius: 4px; }
.stepper__dot--completed { background: #6440BF; }`}</CodeBlock>
            </SubSection>
          </SectionCard>

          {/* 4. Border-Radius */}
          <SectionCard id="radius" title="4. Border-Radius шкала">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Размер</TableHead>
                  <TableHead>Значение</TableHead>
                  <TableHead>Использование</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["XS", "4px", "Мелкие бейджи, inline-элементы"],
                  ["SM", "8px", "Кнопки, инпуты, мелкие карточки"],
                  ["MD", "12px", "Поля ввода, средние блоки"],
                  ["LG", "16px", "Карточки секций, модалки"],
                  ["XL", "20px", "Крупные карточки, промо-блоки"],
                  ["2XL", "24px", "Tabs контейнер, hero-элементы"],
                  ["Pill", "32px — 9999px", "Pill-кнопки, round tabs"],
                  ["Circle", "50%", "Аватарки, FAB-кнопки"],
                ].map(([size, val, use]) => (
                  <TableRow key={size}>
                    <TableCell className="font-medium text-sm">{size}</TableCell>
                    <TableCell className="text-sm font-mono">{val}</TableCell>
                    <TableCell className="text-sm">{use}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>

          {/* 5. Spacing */}
          <SectionCard id="spacing" title="5. Spacing / Отступы">
            <SubSection title="5.1 Шкала пространства">
              <CodeBlock>{`/* Base unit: 4px */
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;
--space-4: 16px;  --space-5: 20px;  --space-6: 24px;
--space-8: 32px;  --space-10: 40px; --space-12: 48px;
--space-16: 64px; --space-20: 80px;`}</CodeBlock>
            </SubSection>
            <SubSection title="5.2 Секционный ритм">
              <CodeBlock>{`/* Между секциями */
section + section { margin-top: 48px; }  /* mobile */
section + section { margin-top: 64px; }  /* desktop */

/* Внутренние отступы */
section { padding: 32px 16px; }  /* mobile */
section { padding: 48px 40px; }  /* desktop */

/* Контейнер */
.container { max-width: 1200px; margin: 0 auto; padding: 0 16px; /* mobile → 40px desktop */ }`}</CodeBlock>
            </SubSection>
          </SectionCard>

          {/* 6. Shadows */}
          <SectionCard id="shadows" title="6. Тени (Box-shadow)">
            <CodeBlock>{`--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);            /* Карточки при hover */
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.1);            /* Приподнятые элементы */
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.15);            /* Модалки, dropdown */
--shadow-focus: 0 0 0 3px rgba(100, 64, 191, 0.15);     /* Focus-состояние */
--shadow-hero-btn: 0 4px 16px rgba(100, 64, 191, 0.3);  /* Пурпурный glow */`}</CodeBlock>
            <p className="text-sm text-muted-foreground bg-accent/50 rounded-lg p-3">
              💡 Дизайн Уралсиб <strong>преимущественно flat</strong> — тени используются очень умеренно. Основной приём разделения — цвет фона (#F4F3F7 vs #FFFFFF), а не тени.
            </p>
          </SectionCard>

          {/* 7. Icons */}
          <SectionCard id="icons" title="7. Иконография и иллюстрации">
            <SubSection title="7.1 Стиль иконок">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Характеристика</TableHead>
                    <TableHead>Значение</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Формат", "SVG (inline)"],
                    ["Стиль", "Outline / Rounded stroke"],
                    ["Размер stroke", "1.5px — 2px"],
                    ["Размеры", "20px (inline), 24px (nav), 32px (feature)"],
                    ["Цвет", "Inherit / #6440BF (акцент) / #6B6B6B (secondary)"],
                  ].map(([k, v]) => (
                    <TableRow key={k}>
                      <TableCell className="font-medium text-sm">{k}</TableCell>
                      <TableCell className="text-sm">{v}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SubSection>

            <SubSection title="7.2 3D-иллюстрации">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Характеристика</TableHead>
                    <TableHead>Описание</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["Палитра", "Фиолетовый (#6440BF) + лавандовый + серебристый-металлик"],
                    ["Поверхность", "Глянцевый, с рефлексами и soft shadows"],
                    ["Объекты", "Банковские карты, монеты (₽), калькулятор, чемодан, галочка"],
                    ["Фон", "Прозрачный (PNG) или на тёмном градиенте"],
                    ["Анимация", "Лёгкое покачивание при scroll (parallax)"],
                  ].map(([k, v]) => (
                    <TableRow key={k}>
                      <TableCell className="font-medium text-sm">{k}</TableCell>
                      <TableCell className="text-sm">{v}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SubSection>

            <SubSection title="7.3 Галочки / Чекмарки">
              <CodeBlock>{`.check-item::before { content: '✓'; color: #6440BF; font-weight: 700; margin-right: 8px; }
.bullet-item::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #6440BF; margin-right: 12px; }`}</CodeBlock>
            </SubSection>
          </SectionCard>

          {/* 8. Responsive */}
          <SectionCard id="responsive" title="8. Адаптивность">
            <SubSection title="8.1 Breakpoints">
              <CodeBlock>{`@media (min-width: 576px)  { /* SM */ }
@media (min-width: 768px)  { /* MD — tablets */ }
@media (min-width: 1024px) { /* LG — desktop */ }
@media (min-width: 1200px) { /* XL — wide */ }`}</CodeBlock>
            </SubSection>

            <SubSection title="8.2 Адаптивная типографика">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Элемент</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Desktop</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["H1 Hero", "32px → 48px", "48px"],
                    ["H1 start", "40px", "48px"],
                    ["H2", "24px → 28px", "32px"],
                    ["H3", "20px → 24px", "28px"],
                    ["Body", "16px", "16px"],
                    ["Small", "14px", "14px"],
                  ].map(([el, mob, desk]) => (
                    <TableRow key={el}>
                      <TableCell className="font-medium text-sm">{el}</TableCell>
                      <TableCell className="text-sm">{mob}</TableCell>
                      <TableCell className="text-sm">{desk}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SubSection>

            <SubSection title="8.3 Адаптивные паттерны">
              <CodeBlock>{`/* Кнопки — full-width на mobile */
@media (max-width: 767px) {
  .btn-primary, .btn-secondary { width: 100%; text-align: center; }
}

/* Карточки — stack → grid */
.cards-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 768px)  { .cards-grid { grid-template-columns: 1fr 1fr; gap: 24px; } }
@media (min-width: 1024px) { .cards-grid { grid-template-columns: repeat(3, 1fr); } }`}</CodeBlock>
            </SubSection>
          </SectionCard>

          {/* 9. Animations */}
          <SectionCard id="animations" title="9. Анимации и переходы">
            <CodeBlock>{`--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;

button { transition: background-color var(--transition-normal), box-shadow var(--transition-normal); }

/* Hover lift */
.card:hover { transform: translateY(-2px); transition: transform var(--transition-normal); }

/* Hero carousel */
.hero-slide { transition: opacity 500ms ease-in-out; }

/* Scroll-triggered fade-in */
.section--animate { opacity: 0; transform: translateY(20px); transition: opacity 600ms ease, transform 600ms ease; }
.section--animate.is-visible { opacity: 1; transform: translateY(0); }`}</CodeBlock>
          </SectionCard>

          {/* 10. CSS Variables */}
          <SectionCard id="css-vars" title="10. CSS-переменные — Полный набор">
            <CodeBlock>{`:root {
  /* === ЦВЕТА === */
  --color-primary: #6440BF;
  --color-primary-dark: #4B2D96;
  --color-primary-light: #7B5CD0;
  --color-primary-subtle: #F0ECFA;
  --color-primary-ghost: rgba(100, 64, 191, 0.08);

  /* Hero gradient */
  --color-hero-top: #2D1B69;
  --color-hero-bottom: #1A0E45;

  /* Neutrals */
  --color-bg-white: #FFFFFF;
  --color-bg-light: #F4F3F7;
  --color-bg-warm: #EDE9E3;
  --color-bg-input: #F5F5F5;
  --color-border: #E5E0EB;
  --color-border-strong: #D4CCE6;

  /* Text */
  --color-text-primary: #212121;
  --color-text-secondary: #6B6B6B;
  --color-text-muted: #9E9E9E;
  --color-text-on-dark: #FFFFFF;
  --color-text-on-dark-2: #C4B7E0;

  /* Semantic */
  --color-success: #34C759;
  --color-warning: #FF9500;
  --color-error: #FF3B30;
  --color-info: #007AFF;

  /* === ТИПОГРАФИКА === */
  --font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-xs: 12px;  --font-size-sm: 14px;
  --font-size-md: 16px;  --font-size-lg: 18px;
  --font-size-xl: 24px;  --font-size-2xl: 28px;
  --font-size-3xl: 32px; --font-size-4xl: 40px;
  --font-size-5xl: 48px;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* === BORDER-RADIUS === */
  --radius-xs: 4px;   --radius-sm: 8px;
  --radius-md: 12px;  --radius-lg: 16px;
  --radius-xl: 20px;  --radius-2xl: 24px;
  --radius-pill: 9999px;
  --radius-circle: 50%;

  /* === SPACING === */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 20px;  --space-6: 24px;
  --space-8: 32px;  --space-10: 40px; --space-12: 48px;
  --space-16: 64px;

  /* === ТЕНИ === */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.1);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.15);
  --shadow-focus: 0 0 0 3px rgba(100,64,191,0.15);
  --shadow-purple: 0 4px 16px rgba(100,64,191,0.3);

  /* === TRANSITIONS === */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
}`}</CodeBlock>
          </SectionCard>

          {/* 11. References */}
          <SectionCard id="references" title="11. Визуальные референсы">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "Hero uralsib.ru — тёмный градиент + белая CTA + 3D-иллюстрация",
                "Продуктовые карточки + промо-секция с формой",
                "Business: тарифы, табы, pills-переключатели",
                "Business/RKO — полная страница с формой + тарифами",
                "start.uralsib.ru — hero с CTA",
                "start.uralsib.ru — полная landing (мобильная)",
                "Footer — контакты, соцсети, юр. информация",
              ].map((ref) => (
                <li key={ref} className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  {ref}
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* 12. Principles */}
          <SectionCard id="principles" title="12. Ключевые дизайн-принципы">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead>Принцип</TableHead>
                  <TableHead>Реализация</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["1", "Purple-first", "Фиолетовый = единственный акцентный цвет. Всё вторичное — серое"],
                  ["2", "Flat > Shadows", "Разделение пространства через цвет фона, а не тени"],
                  ["3", "Rounded", "Всё скруглено: 8px кнопки, 12px инпуты, 16-20px карточки"],
                  ["4", "Mobile-first", "Full-width кнопки, stacked layout, горизонтальный скролл для табов"],
                  ["5", "3D Illustrations", "Фиолетовые 3D-объекты вместо flat-иконок для Hero и промо"],
                  ["6", "Typography = Roboto", "Один шрифт, различия только в weight (400/500/700)"],
                  ["7", "No decorative elements", "Минимум декора: нет patterns, нет textures, чистый white space"],
                  ["8", "Consistent purple CTA", "Все CTA фиолетовые, вторичные — outline с фиолетовым бордером"],
                  ["9", "Hero contrast", "Тёмный gradient hero (uralsib.ru) vs светлый hero (start.uralsib.ru)"],
                  ["10", "Бренд-единство", "Логотип одинаков; палитра не отличается между субдоменами"],
                ].map(([n, principle, impl]) => (
                  <TableRow key={n}>
                    <TableCell className="font-medium text-sm">{n}</TableCell>
                    <TableCell className="font-medium text-sm">{principle}</TableCell>
                    <TableCell className="text-sm">{impl}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

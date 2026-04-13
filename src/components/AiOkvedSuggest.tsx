import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";
import { OKVED_FULL, OkvedCode } from "@/lib/okvedData";
import { Sparkles, Check, Loader2 } from "lucide-react";

interface AiOkvedSuggestProps {
  selectedCodes: string[];
  onToggle: (code: string) => void;
  onClose: () => void;
}

// Keyword → OKVED mapping for smart matching
const KEYWORD_MAP: Record<string, string[]> = {
  // IT
  "программ": ["62.01", "62.02", "62.09", "63.11"],
  "сайт": ["62.01", "63.12", "62.09"],
  "приложен": ["62.01", "62.09", "58.29"],
  "разработ": ["62.01", "62.02", "62.09"],
  "it": ["62.01", "62.02", "62.09", "63.11"],
  "ит ": ["62.01", "62.02", "62.09"],
  "софт": ["62.01", "58.29"],
  "веб": ["62.01", "63.12"],
  "хост": ["63.11"],
  "данн": ["63.11", "62.03"],
  // Торговля
  "магазин": ["47.11", "47.19", "47.91"],
  "интернет-магазин": ["47.91", "47.99"],
  "маркетплейс": ["47.91", "63.12"],
  "торгов": ["47.91", "47.19", "46.90"],
  "продаж": ["47.91", "47.19", "46.90"],
  "опт": ["46.90", "46.49", "46.41"],
  "розниц": ["47.11", "47.19", "47.91"],
  "одежд": ["47.71", "14.13", "14.19"],
  "обув": ["47.72", "15.20"],
  "продукт": ["47.11", "10.89"],
  "еда": ["56.10", "47.11", "10.89"],
  // Общепит
  "ресторан": ["56.10", "56.29"],
  "кафе": ["56.10", "56.30"],
  "бар": ["56.30"],
  "кейтеринг": ["56.21"],
  "доставк": ["56.10", "53.20"],
  "кух": ["56.10", "56.29"],
  "повар": ["56.10"],
  "пекарн": ["10.71", "56.10"],
  // Строительство
  "строи": ["41.20", "43.99", "41.10"],
  "ремонт квартир": ["43.39", "43.34", "43.31"],
  "ремонт": ["43.39", "95.11", "95.21", "45.20"],
  "отделк": ["43.39", "43.34", "43.31"],
  "электрик": ["43.21"],
  "сантехник": ["43.22"],
  "плитк": ["43.33", "43.39"],
  // Красота
  "салон красот": ["96.02"],
  "парикмахер": ["96.02"],
  "маникюр": ["96.02"],
  "косметолог": ["96.02", "86.90"],
  "барбер": ["96.02"],
  "красот": ["96.02"],
  // Транспорт
  "такси": ["49.32"],
  "грузоперевоз": ["49.41"],
  "перевоз": ["49.41", "49.31"],
  "логист": ["52.29", "52.10"],
  "курьер": ["53.20"],
  "склад": ["52.10"],
  // Образование
  "обуча": ["85.41", "85.42"],
  "репетитор": ["85.41"],
  "курс": ["85.41", "85.42"],
  "тренинг": ["85.42"],
  "школ": ["85.41"],
  // Дизайн и креатив
  "дизайн": ["74.10", "73.11"],
  "реклам": ["73.11", "73.12"],
  "маркетинг": ["73.11", "73.20"],
  "smm": ["73.11", "63.12"],
  "фото": ["74.20"],
  "видео": ["59.11"],
  "кино": ["59.11"],
  "музык": ["59.20", "90.01"],
  // Консалтинг и право
  "консалтинг": ["70.22", "62.02"],
  "консульт": ["70.22", "62.02"],
  "юрист": ["69.10"],
  "адвокат": ["69.10"],
  "бухгалтер": ["69.20"],
  "аудит": ["69.20"],
  // Недвижимость
  "недвижим": ["68.31", "68.20", "68.10"],
  "аренд": ["68.20", "77.11"],
  "риэлтор": ["68.31"],
  // Здоровье
  "врач": ["86.21", "86.22"],
  "медицин": ["86.90", "86.21"],
  "стоматолог": ["86.23"],
  "клиник": ["86.10", "86.22"],
  "массаж": ["86.90", "96.04"],
  "психолог": ["86.90", "88.10"],
  // Спорт
  "фитнес": ["93.13", "96.04"],
  "спорт": ["93.12", "93.19"],
  "тренер": ["93.13", "85.41"],
  "йога": ["93.13", "96.04"],
  // Туризм
  "туризм": ["79.11", "79.12"],
  "путешеств": ["79.11"],
  "гостиниц": ["55.10", "55.20"],
  "отель": ["55.10"],
  // Производство
  "производ": ["32.99", "25.11"],
  "мебел": ["31.01", "31.09"],
  "шить": ["14.13", "14.19"],
  "ателье": ["14.13", "96.02"],
  // Клининг
  "уборк": ["81.21", "81.10"],
  "клининг": ["81.21", "81.10"],
  // Охрана
  "охран": ["80.10"],
  "безопас": ["80.10"],
  // Авто
  "авто": ["45.20", "45.11"],
  "машин": ["45.20", "45.11"],
  "сто ": ["45.20"],
};

function suggestOkveds(description: string): OkvedCode[] {
  const lower = description.toLowerCase();
  const matchedCodes = new Set<string>();

  for (const [keyword, codes] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) {
      codes.forEach((c) => matchedCodes.add(c));
    }
  }

  // Fallback: also match directly against OKVED names
  if (matchedCodes.size === 0) {
    const words = lower.split(/\s+/).filter((w) => w.length > 3);
    for (const word of words) {
      for (const okved of OKVED_FULL) {
        if (okved.name.toLowerCase().includes(word)) {
          matchedCodes.add(okved.code);
        }
      }
    }
  }

  return OKVED_FULL.filter((c) => matchedCodes.has(c.code));
}

export function AiOkvedSuggest({ selectedCodes, onToggle, onClose }: AiOkvedSuggestProps) {
  const [description, setDescription] = useState("");
  const [suggestions, setSuggestions] = useState<OkvedCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSuggest = () => {
    if (!description.trim()) return;
    setLoading(true);
    trackEvent("ai_okved_suggest", { description: description.substring(0, 100) });

    // Simulate AI thinking
    setTimeout(() => {
      const results = suggestOkveds(description);
      setSuggestions(results);
      setLoading(false);
      setSearched(true);
    }, 1200 + Math.random() * 800);
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-b from-[#F0ECFA]/50 to-white">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6440BF] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">ИИ-подбор ОКВЭД</p>
            <p className="text-xs text-muted-foreground">Опишите бизнес — мы подберём коды</p>
          </div>
        </div>

        <textarea
          className="w-full h-24 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          placeholder="Например: «Хочу открыть кофейню с доставкой еды» или «Занимаюсь разработкой мобильных приложений и веб-сайтов»"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSuggest(); } }}
        />

        <div className="flex gap-2">
          <Button
            onClick={handleSuggest}
            disabled={!description.trim() || loading}
            className="bg-[#6440BF] hover:bg-[#5535a6] gap-2"
            size="sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Анализирую..." : "Подобрать"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Закрыть
          </Button>
        </div>

        {searched && suggestions.length > 0 && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-xs font-medium text-muted-foreground">
              Рекомендуем ({suggestions.length}):
            </p>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {suggestions.map((c) => {
                const isSelected = selectedCodes.includes(c.code);
                return (
                  <button
                    key={c.code}
                    onClick={() => onToggle(c.code)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-start gap-2.5 transition-colors ${isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/50"}`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"}`}>
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <div>
                      <span className="font-mono text-xs text-muted-foreground">{c.code}</span>{" "}
                      <span>{c.name}</span>
                      {c.section && <span className="text-xs text-muted-foreground ml-1">· {c.section}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {searched && suggestions.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground text-center py-3">
            Не удалось подобрать коды автоматически. Попробуйте описать подробнее или выберите вручную из списка.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

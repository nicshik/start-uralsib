import { useState, useEffect } from "react";
import { getEvents, subscribe, type AnalyticsEvent } from "@/lib/analytics";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalyticsPanel() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    setEvents(getEvents());
    const unsub = subscribe(() => setEvents(getEvents()));
    return () => { unsub(); };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-2 w-80 max-h-64 overflow-auto rounded-lg border bg-card shadow-lg p-3 text-xs font-mono">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-sm">Analytics ({events.length})</span>
            <button className="text-muted-foreground" onClick={() => setOpen(false)}>✕</button>
          </div>
          {events.length === 0 && <p className="text-muted-foreground">Нет событий</p>}
          {events.slice().reverse().map((e, i) => (
            <div key={i} className="border-b py-1 last:border-0">
              <span className="text-primary font-medium">{e.event}</span>
              {e.data && <pre className="text-muted-foreground whitespace-pre-wrap">{JSON.stringify(e.data, null, 1)}</pre>}
              <span className="text-muted-foreground">{new Date(e.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
      <Button size="icon" variant="outline" className="rounded-full shadow-lg" onClick={() => setOpen(!open)}>
        <Bug className="h-4 w-4" />
      </Button>
    </div>
  );
}

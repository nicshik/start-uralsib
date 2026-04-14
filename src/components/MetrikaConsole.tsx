import { useState, useEffect } from "react";
import { getEvents, subscribe, clearEvents, AnalyticsEvent } from "@/lib/analytics";
import { Activity, X, ChevronDown, ChevronUp, Clock, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function MetrikaConsole() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hidden by default, enable with ?debug=true
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'true') {
      setIsVisible(true);
    }

    setEvents(getEvents());
    return subscribe(() => {
      setEvents(getEvents());
    });
  }, []);

  if (!isVisible) return null;

  const onlineEvents = events.filter((event) => event.data?.flowType === "online_light").length;
  const assistedEvents = events.filter((event) => event.data?.flowType === "assisted").length;
  const officeEvents = events.filter((event) => event.data?.flowType === "office_crm").length;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[100] bg-slate-900 border border-slate-700 text-white p-3 rounded-full shadow-2xl hover:bg-slate-800 transition-all group"
        title="Метрика: Мониторинг событий"
      >
        <Activity className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] font-bold px-1.5 rounded-full">
          {events.length}
        </span>
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-4 right-4 z-[100] bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden flex flex-col ${
        isMinimized ? 'w-64 h-12' : 'w-80 h-96'
      }`}
    >
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-green-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Metrika Live</span>
          <Badge variant="outline" className="text-[10px] h-4 bg-green-500/10 text-green-400 border-green-500/20">
            Active
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-2">
            <div className="mb-2 grid grid-cols-3 gap-2">
              <div className="rounded bg-slate-800/70 p-2 text-[10px] text-slate-300">
                <div className="text-slate-500">Online</div>
                <div className="font-mono text-sm font-bold text-blue-300">{onlineEvents}</div>
              </div>
              <div className="rounded bg-slate-800/70 p-2 text-[10px] text-slate-300">
                <div className="text-slate-500">Assisted</div>
                <div className="font-mono text-sm font-bold text-emerald-300">{assistedEvents}</div>
              </div>
              <div className="rounded bg-slate-800/70 p-2 text-[10px] text-slate-300">
                <div className="text-slate-500">CRM</div>
                <div className="font-mono text-sm font-bold text-amber-300">{officeEvents}</div>
              </div>
            </div>
            <div className="space-y-2">
              {[...events].reverse().map((ev, i) => (
                <div key={i} className="p-2 rounded bg-slate-800/50 border border-slate-700/50 text-[11px] space-y-1">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-green-300 font-bold">{ev.event}</span>
                      {ev.data?.flowType && (
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          ev.data.flowType === "assisted"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : ev.data.flowType === "office_crm"
                              ? "bg-amber-500/10 text-amber-300"
                              : "bg-blue-500/10 text-blue-300"
                        }`}>
                          {String(ev.data.flowType)}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  {ev.data && Object.keys(ev.data).length > 0 && (
                    <pre className="text-[10px] text-slate-400 overflow-x-auto bg-slate-900/50 p-1 rounded mt-1">
                      {JSON.stringify(ev.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
              {events.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Activity className="h-8 w-8 opacity-20" />
                  <p className="text-xs">Ожидаем событий...</p>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-2 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Всего: {events.length}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-[10px] text-slate-400 hover:text-white"
              onClick={() => clearEvents()}
            >
              Очистить
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

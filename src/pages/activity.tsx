import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetActivityFeed, getGetActivityFeedQueryKey } from "@workspace/api-client-react";
import {
  MessageCircleHeart,
  ImageIcon,
  Sparkles,
  Heart,
  Smile,
  Activity as ActivityIcon,
} from "lucide-react";
import { format, formatDistanceToNow, parseISO, isToday, isYesterday } from "date-fns";
import { EmptyState } from "@/components/EmptyState";

type Filter = "all" | "note" | "moment" | "wish" | "mood" | "signal";

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "All" },
  { key: "note", label: "Notes" },
  { key: "moment", label: "Moments" },
  { key: "mood", label: "Moods" },
  { key: "wish", label: "Dreams" },
  { key: "signal", label: "Signals" },
];

const KIND_ICON = {
  note: MessageCircleHeart,
  moment: ImageIcon,
  wish: Sparkles,
  mood: Smile,
  signal: Heart,
} as const;

function dayLabel(d: Date): string {
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMM d");
}

export default function Activity() {
  const { data: items, isLoading } = useGetActivityFeed({
    query: { queryKey: getGetActivityFeedQueryKey(), refetchInterval: 5000 },
  });

  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (!items) return [];
    return filter === "all" ? items : items.filter((i) => i.kind === filter);
  }, [items, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const item of filtered) {
      const key = format(parseISO(item.at), "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(item);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="p-6 pt-8 pb-32 min-h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-serif text-foreground">Activity</h1>
        <p className="text-sm text-muted-foreground mt-1">Everything you two have shared.</p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide mb-4">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title="Nothing here yet"
          description="Start sharing notes, moments, and moods — they'll all show up here on a timeline."
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([dayKey, dayItems]) => (
            <section key={dayKey}>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-1">
                {dayLabel(parseISO(dayKey + "T00:00:00"))}
              </h2>
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {dayItems.map((item, idx) => {
                    const Icon = KIND_ICON[item.kind];
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.2) }}
                        className="bg-card rounded-2xl p-4 border border-border shadow-sm flex gap-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          {item.emoji ? (
                            <span className="text-lg">{item.emoji}</span>
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="text-sm font-medium text-foreground truncate">
                              {item.sender ? `${item.sender} • ` : ""}
                              {item.title}
                            </div>
                            <span className="text-[11px] text-muted-foreground flex-shrink-0 tabular-nums">
                              {formatDistanceToNow(parseISO(item.at), { addSuffix: false })}
                            </span>
                          </div>
                          {item.subtitle && (
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                              {item.subtitle}
                            </p>
                          )}
                          {item.imageUrl && (
                            <img
                              src={`/api/storage${item.imageUrl}`}
                              alt=""
                              className="mt-2 w-full max-w-[200px] h-24 object-cover rounded-xl border border-border"
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

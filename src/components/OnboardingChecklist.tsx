import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, ChevronRight, X } from "lucide-react";

export interface ChecklistSignals {
  hasPhoto: boolean;
  hasNote: boolean;
  hasMoment: boolean;
  hasDream: boolean;
  hasMood: boolean;
}

interface Props {
  signals: ChecklistSignals;
}

const DISMISS_KEY = "justus_checklist_dismissed";

export function OnboardingChecklist({ signals }: Props) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
  }, []);

  const items = [
    { key: "photo", label: "Add a profile photo", done: signals.hasPhoto, href: "/us" },
    { key: "mood", label: "Share today's mood", done: signals.hasMood, href: "/home" },
    { key: "note", label: "Send your first love note", done: signals.hasNote, href: "/notes" },
    { key: "moment", label: "Save a moment together", done: signals.hasMoment, href: "/moments" },
    { key: "dream", label: "Add a shared dream", done: signals.hasDream, href: "/dreams" },
  ];

  const completed = items.filter((i) => i.done).length;
  const total = items.length;
  const allDone = completed === total;
  const pct = Math.round((completed / total) * 100);

  // Hide entirely once everything's done OR if user has dismissed it.
  if (allDone || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  // Build SVG progress ring
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden"
      >
        <div className="flex items-center gap-4 p-5">
          <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="4"
              />
              <motion.circle
                cx="28"
                cy="28"
                r={radius}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </svg>
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {completed}/{total}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">Set up your space</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              A few small things to make Just Us feel like home.
            </p>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss checklist"
            className="w-7 h-7 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center justify-center flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="border-t border-border/60 divide-y divide-border/60">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors ${
                item.done ? "opacity-60" : ""
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                  item.done
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-muted-foreground/40"
                }`}
              >
                {item.done && <Check className="w-3 h-3" strokeWidth={3} />}
              </div>
              <span
                className={`flex-1 text-sm ${
                  item.done ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {item.label}
              </span>
              {!item.done && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </Link>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

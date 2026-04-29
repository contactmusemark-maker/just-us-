import { Check } from "lucide-react";
import { motion } from "framer-motion";

export type ThemeAccent = "rose" | "lavender" | "sky" | "peach" | "mint";

interface Props {
  value: ThemeAccent;
  onChange: (next: ThemeAccent) => void;
}

const THEMES: Array<{ key: ThemeAccent; label: string; swatch: string }> = [
  { key: "rose", label: "Rose", swatch: "bg-rose-300" },
  { key: "lavender", label: "Lavender", swatch: "bg-violet-300" },
  { key: "sky", label: "Sky", swatch: "bg-sky-300" },
  { key: "peach", label: "Peach", swatch: "bg-orange-300" },
  { key: "mint", label: "Mint", swatch: "bg-emerald-300" },
];

export function ThemePicker({ value, onChange }: Props) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium text-foreground">Theme accent</div>
          <div className="text-xs text-muted-foreground capitalize">{value}</div>
        </div>
      </div>
      <div className="flex gap-3 justify-between">
        {THEMES.map((t) => {
          const active = value === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              aria-label={`Theme ${t.label}`}
              className="flex flex-col items-center gap-1.5 group"
            >
              <motion.div
                whileTap={{ scale: 0.92 }}
                className={`relative w-10 h-10 rounded-full ${t.swatch} ring-offset-2 ring-offset-card transition-all ${
                  active ? "ring-2 ring-foreground/70" : "ring-0"
                }`}
              >
                {active && (
                  <span className="absolute inset-0 flex items-center justify-center text-white">
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </span>
                )}
              </motion.div>
              <span
                className={`text-[10px] ${
                  active ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

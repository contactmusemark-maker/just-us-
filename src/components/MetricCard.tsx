import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: number | string;
  hint?: string;
  accent?: "primary" | "secondary" | "amber";
  delay?: number;
}

const ACCENTS: Record<NonNullable<Props["accent"]>, { bg: string; fg: string }> = {
  primary: { bg: "bg-primary/10", fg: "text-primary" },
  secondary: { bg: "bg-secondary/40", fg: "text-secondary-foreground" },
  amber: { bg: "bg-amber-100", fg: "text-amber-600" },
};

export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "primary",
  delay = 0,
}: Props) {
  const a = ACCENTS[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-3 min-w-0"
    >
      <div className={`w-10 h-10 rounded-xl ${a.bg} ${a.fg} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xl font-semibold text-foreground tabular-nums leading-none">
          {value}
        </div>
        <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-1.5 truncate">
          {label}
        </div>
        {hint && (
          <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{hint}</div>
        )}
      </div>
    </motion.div>
  );
}

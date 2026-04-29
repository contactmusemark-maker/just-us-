import { motion } from "framer-motion";
import { useGetStorageStats, getGetStorageStatsQueryKey } from "@workspace/api-client-react";
import { HardDrive, ImageIcon, MessageCircleHeart, Sparkles } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function StorageBar() {
  const { data, isLoading } = useGetStorageStats({
    query: { queryKey: getGetStorageStatsQueryKey(), refetchInterval: 30000 },
  });

  if (isLoading || !data) {
    return (
      <div className="bg-card rounded-2xl border border-border p-5 animate-pulse h-28" />
    );
  }

  const pct = Math.min(100, (data.estimatedBytes / data.quotaBytes) * 100);
  const pctDisplay = pct < 1 ? "<1" : pct.toFixed(0);

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <HardDrive className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">App storage</div>
          <div className="text-xs text-muted-foreground">
            {formatBytes(data.estimatedBytes)} of {formatBytes(data.quotaBytes)} used
          </div>
        </div>
        <div className="text-sm font-semibold text-primary tabular-nums">{pctDisplay}%</div>
      </div>

      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-primary via-primary/90 to-secondary-foreground/60"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <Pill icon={ImageIcon} label="Moments" value={data.momentsCount} />
        <Pill icon={MessageCircleHeart} label="Notes" value={data.notesCount} />
        <Pill icon={Sparkles} label="Dreams" value={data.wishesCount} />
      </div>
    </div>
  );
}

function Pill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof HardDrive;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-xs font-semibold text-foreground tabular-nums leading-none">
          {value}
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{label}</div>
      </div>
    </div>
  );
}

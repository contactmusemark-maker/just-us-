import { useEffect, useMemo, useState } from "react";
import { useGetHomeSummary, getGetHomeSummaryQueryKey } from "@workspace/api-client-react";

export type ActivityKind = "notes" | "moments" | "wishes" | "moods" | "signals";

const STORAGE_PREFIX = "justus_lastSeen_";

function storageKey(kind: ActivityKind) {
  return `${STORAGE_PREFIX}${kind}`;
}

function getCurrentUser(): string {
  return typeof window === "undefined"
    ? ""
    : localStorage.getItem("justus_currentUser") ?? "";
}

function getLastSeen(kind: ActivityKind): number {
  if (typeof window === "undefined") return 0;
  const v = localStorage.getItem(storageKey(kind));
  return v ? parseInt(v, 10) || 0 : 0;
}

function setLastSeen(kind: ActivityKind, ts: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(kind), String(ts));
  window.dispatchEvent(new CustomEvent("justus:lastSeenChanged"));
}

export function markSeen(kind: ActivityKind) {
  setLastSeen(kind, Date.now());
}

export function useUnread() {
  const { data } = useGetHomeSummary({
    query: { queryKey: getGetHomeSummaryQueryKey(), refetchInterval: 5000 },
  });

  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handler = () => setVersion((v) => v + 1);
    window.addEventListener("justus:lastSeenChanged", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("justus:lastSeenChanged", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return useMemo(() => {
    void version;
    const me = getCurrentUser();
    const empty: Record<ActivityKind, boolean> = {
      notes: false,
      moments: false,
      wishes: false,
      moods: false,
      signals: false,
    };
    const activity = data?.latestActivity;
    if (!activity) return empty;

    const check = (kind: ActivityKind) => {
      const a = activity[kind];
      if (!a?.at) return false;
      const ts = new Date(a.at).getTime();
      if (Number.isNaN(ts)) return false;
      // If we know the sender and it's me, never mark unread.
      if (a.sender && me && a.sender === me) return false;
      return ts > getLastSeen(kind);
    };

    return {
      notes: check("notes"),
      moments: check("moments"),
      wishes: check("wishes"),
      moods: check("moods"),
      signals: check("signals"),
    };
  }, [data, version]);
}

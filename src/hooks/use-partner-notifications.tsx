import { useEffect, useRef } from "react";
import {
  useGetActivityFeed,
  getGetActivityFeedQueryKey,
  useGetCouple,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const SEEN_KEY = "justus_partner_notif_lastSeenAt";

interface ActivityItem {
  id: string;
  kind: "note" | "moment" | "wish" | "mood" | "signal";
  sender: string | null;
  at: string;
  title: string;
  subtitle: string | null;
  emoji: string | null;
}

const ACTION_LABEL: Record<ActivityItem["kind"], (item: ActivityItem) => string> = {
  note: () => "sent you a love note",
  moment: () => "added a new moment",
  wish: (i) => (i.title.startsWith("Fulfilled") ? "fulfilled a dream" : "added a dream"),
  mood: () => "checked in with a mood",
  signal: () => "is missing you 💗",
};

/**
 * Polls the activity feed and surfaces a toast for each new item that came
 * from the *other* partner since the user last saw the feed. Persists the
 * last-seen timestamp in localStorage so toasts don't replay on reload.
 *
 * On the very first load (no SEEN_KEY yet) we treat everything as already
 * seen — we don't want to spam the user with backfilled notifications.
 */
export function usePartnerNotifications() {
  const { toast } = useToast();
  const { data: coupleData } = useGetCouple();
  const { data } = useGetActivityFeed({
    query: {
      queryKey: getGetActivityFeedQueryKey(),
      refetchInterval: 7000,
      enabled: Boolean(coupleData?.couple),
    },
  });

  const lastSeenRef = useRef<number | null>(null);

  // Initialize lastSeen on first run.
  useEffect(() => {
    if (lastSeenRef.current !== null) return;
    const stored = localStorage.getItem(SEEN_KEY);
    if (stored) {
      lastSeenRef.current = Number(stored);
    } else {
      // First-ever load: mark "now" as seen so we don't spam history.
      const now = Date.now();
      lastSeenRef.current = now;
      localStorage.setItem(SEEN_KEY, String(now));
    }
  }, []);

  useEffect(() => {
    if (!data || !coupleData?.couple) return;
    if (coupleData.couple.notificationsEnabled === false) return;
    const lastSeen = lastSeenRef.current;
    if (lastSeen === null) return;

    const currentUser =
      localStorage.getItem("justus_currentUser") || coupleData.couple.user1Name;

    const fresh = (data as ActivityItem[]).filter((item) => {
      const ts = new Date(item.at).getTime();
      if (ts <= lastSeen) return false;
      // Don't notify the user about their OWN actions.
      if (item.sender && item.sender === currentUser) return false;
      // Skip senderless items that aren't mood/signal/note (e.g., moments
      // with no sender that current user might have added themselves — we
      // can't tell. Show them, but not every refresh).
      return true;
    });

    if (fresh.length === 0) return;

    // Show a toast per new item, latest first, capped to 3 to avoid spam.
    const toShow = fresh.slice(0, 3);
    for (const item of toShow) {
      const action = ACTION_LABEL[item.kind](item);
      const who = item.sender || "Your partner";
      toast({
        title: `${item.emoji ?? "💗"}  ${who} ${action}`,
        description: item.subtitle ?? undefined,
      });
    }

    const newest = Math.max(
      ...fresh.map((i) => new Date(i.at).getTime()),
      lastSeen,
    );
    lastSeenRef.current = newest;
    localStorage.setItem(SEEN_KEY, String(newest));
  }, [data, coupleData, toast]);
}

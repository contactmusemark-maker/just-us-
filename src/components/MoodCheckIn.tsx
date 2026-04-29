import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useSetTodayMood,
  getGetHomeSummaryQueryKey,
  getGetTodayMoodsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Mood } from "@workspace/api-client-react";
import { Avatar } from "@/components/Avatar";

const MOOD_OPTIONS = [
  { emoji: "🥰", label: "loved" },
  { emoji: "😊", label: "happy" },
  { emoji: "🤗", label: "cozy" },
  { emoji: "🥱", label: "tired" },
  { emoji: "🥺", label: "missing you" },
  { emoji: "😔", label: "low" },
  { emoji: "😤", label: "stressed" },
  { emoji: "✨", label: "inspired" },
];

interface Props {
  user1Name: string;
  user2Name: string;
  user1Photo?: string | null;
  user2Photo?: string | null;
  user1Mood: Mood | null;
  user2Mood: Mood | null;
  currentSender: string;
}

export function MoodCheckIn({
  user1Name,
  user2Name,
  user1Photo,
  user2Photo,
  user1Mood,
  user2Mood,
  currentSender,
}: Props) {
  const queryClient = useQueryClient();
  const [picking, setPicking] = useState(false);
  const setMood = useSetTodayMood();

  const isUser1 = currentSender === user1Name;
  const myMood = isUser1 ? user1Mood : user2Mood;
  const myPhoto = isUser1 ? user1Photo : user2Photo;
  const partnerName = isUser1 ? user2Name : user1Name;
  const partnerMood = isUser1 ? user2Mood : user1Mood;
  const partnerPhoto = isUser1 ? user2Photo : user1Photo;

  const handlePick = (emoji: string) => {
    if (!currentSender) return;
    setMood.mutate(
      { data: { sender: currentSender, mood: emoji } },
      {
        onSuccess: () => {
          setPicking(false);
          queryClient.invalidateQueries({ queryKey: getGetHomeSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTodayMoodsQueryKey() });
        },
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
      className="bg-card rounded-3xl p-5 shadow-sm border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Today's Vibe
        </div>
        <div className="text-[10px] text-muted-foreground/70">
          {new Date().toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Me */}
        <button
          onClick={() => setPicking(true)}
          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-secondary/20 hover:bg-secondary/30 transition-colors border border-transparent hover:border-secondary/50"
        >
          <div className="relative">
            <Avatar name={currentSender} photo={myPhoto} size="md" variant="secondary" />
            <motion.div
              key={myMood?.mood ?? "empty"}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-sm border border-border flex items-center justify-center text-base"
            >
              {myMood?.mood ?? "＋"}
            </motion.div>
          </div>
          <div className="text-[11px] font-medium truncate max-w-full mt-1">
            {currentSender}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {myMood ? "you" : "tap to share"}
          </div>
        </button>

        {/* Partner */}
        <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-primary/10 border border-transparent">
          <div className="relative">
            <Avatar name={partnerName} photo={partnerPhoto} size="md" variant="primary" />
            <motion.div
              key={partnerMood?.mood ?? "empty"}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-sm border border-border flex items-center justify-center text-base"
            >
              {partnerMood?.mood ?? "···"}
            </motion.div>
          </div>
          <div className="text-[11px] font-medium truncate max-w-full mt-1">
            {partnerName}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {partnerMood ? "them" : "waiting"}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {picking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
            onClick={() => setPicking(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-5">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  How are you feeling?
                </div>
                <div className="font-serif text-lg">{currentSender}, today</div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {MOOD_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.emoji}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePick(opt.emoji)}
                    disabled={setMood.isPending}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-colors ${
                      myMood?.mood === opt.emoji
                        ? "bg-primary/20 ring-2 ring-primary/40"
                        : "bg-secondary/20 hover:bg-secondary/30"
                    }`}
                  >
                    <div className="text-3xl">{opt.emoji}</div>
                    <div className="text-[10px] text-muted-foreground capitalize">
                      {opt.label}
                    </div>
                  </motion.button>
                ))}
              </div>
              <button
                onClick={() => setPicking(false)}
                className="w-full mt-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

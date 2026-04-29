import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetHomeSummary, useSendMissYou, getGetHomeSummaryQueryKey, getGetLatestSignalQueryKey } from "@workspace/api-client-react";
import { Heart, MessageCircleHeart, ImageIcon, Sparkles, Flame, CalendarHeart, Camera } from "lucide-react";
import { MoodCheckIn } from "@/components/MoodCheckIn";
import { Avatar } from "@/components/Avatar";
import { MomentsCarousel } from "@/components/MomentsCarousel";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { MetricCard } from "@/components/MetricCard";
import { FavoriteSong } from "@/components/FavoriteSong";
import { useUpdateCouple, getGetCoupleQueryKey } from "@workspace/api-client-react";
import { differenceInDays, formatDistanceToNow, parseISO } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

export default function Home() {
  const queryClient = useQueryClient();
  const { data: summary, isLoading } = useGetHomeSummary({
    query: { queryKey: getGetHomeSummaryQueryKey(), refetchInterval: 5000 }
  });
  const sendMissYou = useSendMissYou();
  const updateCouple = useUpdateCouple();
  
  const [floatingTexts, setFloatingTexts] = useState<{id: number, text: string}[]>([]);
  const [missYouSender, setMissYouSender] = useState<string>("");

  useEffect(() => {
    // Check local storage for current user to prefill sender
    const saved = localStorage.getItem("justus_currentUser");
    if (saved && summary?.couple) {
      setMissYouSender(saved);
    } else if (summary?.couple) {
      setMissYouSender(summary.couple.user1Name);
    }
  }, [summary]);

  const handleMissYou = () => {
    if (!missYouSender || sendMissYou.isPending) return;
    
    sendMissYou.mutate(
      { data: { sender: missYouSender } },
      {
        onSuccess: () => {
          const newId = Date.now();
          setFloatingTexts(prev => [...prev, { id: newId, text: `${missYouSender} misses you 💛` }]);
          setTimeout(() => {
            setFloatingTexts(prev => prev.filter(t => t.id !== newId));
          }, 2500);
          queryClient.invalidateQueries({ queryKey: getGetLatestSignalQueryKey() });
        }
      }
    );
  };

  if (isLoading || !summary?.couple) {
    return <div className="p-6 pt-6 space-y-5 animate-pulse">
      <div className="h-44 bg-muted rounded-3xl" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-20 bg-muted rounded-2xl" />
        <div className="h-20 bg-muted rounded-2xl" />
        <div className="h-20 bg-muted rounded-2xl" />
      </div>
      <div className="h-40 bg-muted rounded-3xl" />
    </div>;
  }

  const { couple, latestNote, latestMoment, upcomingWish, latestSignal, user1MoodToday, user2MoodToday } = summary;

  const checklistSignals = {
    hasPhoto: Boolean(couple.user1Photo || couple.user2Photo),
    hasNote: summary.notesCount > 0,
    hasMoment: summary.momentsCount > 0,
    hasDream: summary.wishesTotalCount > 0,
    hasMood: Boolean(user1MoodToday || user2MoodToday),
  };

  return (
    <div className="p-6 pt-6 space-y-5 pb-24 min-h-full">
      {/* Latest Signal Banner */}
      <AnimatePresence>
        {latestSignal && differenceInDays(new Date(), parseISO(latestSignal.createdAt)) === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-primary/10 text-primary-foreground px-4 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            <Heart className="w-4 h-4 fill-white text-white" />
            <span className="text-sm font-medium text-white">{latestSignal.sender} sent a miss you signal recently</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Couple Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-card rounded-3xl p-8 text-center shadow-sm border border-border overflow-hidden"
      >
        <MomentsCarousel />
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-5">
            <Avatar name={couple.user1Name} photo={couple.user1Photo} size="md" variant="primary" ring />
            <Heart className="w-4 h-4 text-primary fill-primary/30" />
            <Avatar name={couple.user2Name} photo={couple.user2Photo} size="md" variant="secondary" ring />
          </div>
          <h1 className="text-lg font-serif mb-5 text-foreground">
            {couple.user1Name} & {couple.user2Name}
          </h1>
          <div className="space-y-1">
            <div className="text-5xl font-light text-primary drop-shadow-sm">{summary.daysTogether}</div>
            <div className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Days Together</div>
          </div>
          {summary.dailyStreak > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-700 text-xs font-medium shadow-sm"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
              {summary.dailyStreak}-day streak
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Onboarding Checklist - hidden when complete or dismissed */}
      <OnboardingChecklist signals={checklistSignals} />

      {/* Metric strip */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard
          icon={Flame}
          value={summary.dailyStreak}
          label="Day streak"
          accent="amber"
          delay={0.05}
        />
        <MetricCard
          icon={MessageCircleHeart}
          value={summary.notesThisWeek}
          label="Notes / wk"
          accent="primary"
          delay={0.1}
        />
        <MetricCard
          icon={Camera}
          value={summary.momentsThisWeek}
          label="Moments / wk"
          accent="secondary"
          delay={0.15}
        />
      </div>

      {/* Anniversary + Latest Moment row */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card rounded-3xl p-5 shadow-sm border border-border flex flex-col justify-between aspect-square"
        >
          <div className="w-9 h-9 rounded-xl bg-secondary/40 flex items-center justify-center mb-2">
            <CalendarHeart className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <div className="text-3xl font-light tabular-nums">{summary.daysUntilAnniversary}</div>
            <div className="text-xs text-muted-foreground mt-1 leading-tight">Days until anniversary</div>
          </div>
        </motion.div>

        {latestMoment ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="rounded-3xl p-5 shadow-sm border border-border flex flex-col justify-between aspect-square relative overflow-hidden group"
          >
            <img 
              src={`/api/storage${latestMoment.imageUrl}`} 
              alt="Latest moment" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="relative z-10 flex justify-end">
              <div className="w-9 h-9 rounded-xl bg-white/25 backdrop-blur-md flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="relative z-10 mt-auto">
              <div className="text-xs text-white/90 font-medium">Latest moment</div>
              {latestMoment.caption && (
                <div className="text-sm text-white truncate mt-0.5">{latestMoment.caption}</div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="bg-card rounded-3xl p-5 shadow-sm border border-border flex flex-col justify-between aspect-square"
          >
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center mb-2">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground leading-tight">Add your first moment.</div>
          </motion.div>
        )}
      </div>

      {/* Mood Check-In */}
      {missYouSender && (
        <MoodCheckIn
          user1Name={couple.user1Name}
          user2Name={couple.user2Name}
          user1Photo={couple.user1Photo}
          user2Photo={couple.user2Photo}
          user1Mood={user1MoodToday}
          user2Mood={user2MoodToday}
          currentSender={missYouSender}
        />
      )}

      {/* Favorite Songs */}
      {missYouSender && (
        <div className="space-y-3">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-1">
            Our soundtrack
          </div>
          <FavoriteSong
            name={couple.user1Name}
            photo={couple.user1Photo}
            variant="primary"
            song={couple.user1FavSong}
            editable={missYouSender === couple.user1Name}
            saving={updateCouple.isPending}
            onSave={(track) => {
              updateCouple.mutate(
                { data: { user1FavSong: track } },
                {
                  onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: getGetCoupleQueryKey() });
                    queryClient.invalidateQueries({ queryKey: getGetHomeSummaryQueryKey() });
                  },
                },
              );
            }}
          />
          <FavoriteSong
            name={couple.user2Name}
            photo={couple.user2Photo}
            variant="secondary"
            song={couple.user2FavSong}
            editable={missYouSender === couple.user2Name}
            saving={updateCouple.isPending}
            onSave={(track) => {
              updateCouple.mutate(
                { data: { user2FavSong: track } },
                {
                  onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: getGetCoupleQueryKey() });
                    queryClient.invalidateQueries({ queryKey: getGetHomeSummaryQueryKey() });
                  },
                },
              );
            }}
          />
        </div>
      )}

      {/* Miss You Button Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-col items-center justify-center py-8 relative"
      >
        <AnimatePresence>
          {floatingTexts.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: -60, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute top-0 text-primary font-medium pointer-events-none"
            >
              {item.text}
            </motion.div>
          ))}
        </AnimatePresence>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleMissYou}
          disabled={sendMissYou.isPending}
          className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-primary/80 text-white shadow-xl shadow-primary/20 flex flex-col items-center justify-center gap-2 transition-transform relative overflow-hidden group"
        >
          <Heart className="w-8 h-8 fill-white/20" />
          <span className="font-serif font-medium tracking-wide">Miss You</span>
        </motion.button>

        {/* Sender toggle for Miss You */}
        <div className="mt-6 flex items-center gap-2 bg-card px-3 py-1.5 rounded-full border border-border shadow-sm text-sm">
          <span className="text-muted-foreground text-xs">Sending as:</span>
          <button 
            onClick={() => {
              const newSender = missYouSender === couple.user1Name ? couple.user2Name : couple.user1Name;
              setMissYouSender(newSender);
              localStorage.setItem("justus_currentUser", newSender);
            }}
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            {missYouSender}
          </button>
        </div>
      </motion.div>

      {/* Snippets */}
      <div className="space-y-4">
        {latestNote && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-card rounded-3xl p-5 shadow-sm border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <MessageCircleHeart className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Latest Note</span>
            </div>
            <p className="text-foreground mb-2 line-clamp-2">"{latestNote.message}"</p>
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>From {latestNote.sender} {latestNote.mood && <span className="ml-1">{latestNote.mood}</span>}</span>
              <span>{formatDistanceToNow(parseISO(latestNote.createdAt))} ago</span>
            </div>
          </motion.div>
        )}

        {upcomingWish && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-card rounded-3xl p-5 shadow-sm border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-secondary-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Upcoming Dream</span>
            </div>
            <p className="text-foreground">{upcomingWish.text}</p>
          </motion.div>
        )}
      </div>

    </div>
  );
}

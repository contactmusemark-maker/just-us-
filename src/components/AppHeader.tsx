import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Bell, Heart, Search } from "lucide-react";
import { useGetCouple } from "@workspace/api-client-react";
import { Avatar } from "@/components/Avatar";
import { useUnread } from "@/hooks/use-unread";
import { useEffect, useState } from "react";

interface Props {
  onOpenCommand?: () => void;
}

export function AppHeader({ onOpenCommand }: Props) {
  const [location] = useLocation();
  const { data } = useGetCouple();
  const unread = useUnread();
  const [currentUser, setCurrentUser] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("justus_currentUser");
    if (saved && data?.couple) setCurrentUser(saved);
    else if (data?.couple) setCurrentUser(data.couple.user1Name);
  }, [data]);

  if (!data?.couple) return null;

  const isMe = currentUser === data.couple.user1Name;
  const myPhoto = isMe ? data.couple.user1Photo : data.couple.user2Photo;

  const toggleUser = () => {
    if (!data.couple) return;
    const next = isMe ? data.couple.user2Name : data.couple.user1Name;
    setCurrentUser(next);
    localStorage.setItem("justus_currentUser", next);
  };

  const hasUnread =
    unread.notes ||
    unread.moments ||
    unread.wishes ||
    unread.moods ||
    unread.signals;

  const isActivityPage = location.startsWith("/activity");

  return (
    <header className="sticky top-0 z-30 w-full bg-background/85 backdrop-blur-xl border-b border-border/60">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/home" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm shadow-primary/20">
            <Heart className="w-4 h-4 text-white fill-white/40" />
          </div>
          <span className="font-serif text-base text-foreground tracking-tight group-hover:text-primary transition-colors">
            Just Us
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          {onOpenCommand && (
            <button
              onClick={onOpenCommand}
              aria-label="Search"
              className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>
          )}

          <Link
            href="/activity"
            aria-label="Activity"
            className={`relative w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors ${
              isActivityPage ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bell className="w-[18px] h-[18px]" />
            {hasUnread && !isActivityPage && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background"
              />
            )}
          </Link>

          <button
            onClick={toggleUser}
            className="ml-1 flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Switch active user"
          >
            <Avatar
              name={currentUser || data.couple.user1Name}
              photo={myPhoto}
              size="sm"
              variant={isMe ? "primary" : "secondary"}
            />
            <span className="text-xs font-medium text-foreground">{currentUser}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

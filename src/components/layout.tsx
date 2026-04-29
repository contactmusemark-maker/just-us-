import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, MessageCircleHeart, Image as ImageIcon, Sparkles, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUnread, markSeen, type ActivityKind } from "@/hooks/use-unread";
import { AppHeader } from "@/components/AppHeader";
import { CommandPalette } from "@/components/CommandPalette";

interface LayoutProps {
  children: React.ReactNode;
}

const PATH_TO_KIND: Record<string, ActivityKind | "homeAggregate" | "allAggregate"> = {
  "/notes": "notes",
  "/moments": "moments",
  "/dreams": "wishes",
  "/home": "homeAggregate",
  "/activity": "allAggregate",
};

export function AppLayout({ children }: LayoutProps) {
  const [location] = useLocation();
  const unread = useUnread();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Auto-mark seen when user opens a tab. Home aggregates moods + signals.
  useEffect(() => {
    const mapping = PATH_TO_KIND[location];
    if (!mapping) return;
    if (mapping === "homeAggregate") {
      markSeen("moods");
      markSeen("signals");
    } else if (mapping === "allAggregate") {
      markSeen("notes");
      markSeen("moments");
      markSeen("wishes");
      markSeen("moods");
      markSeen("signals");
    } else {
      markSeen(mapping);
    }
  }, [location]);

  const navItems: Array<{ href: string; icon: typeof Home; label: string; unread: boolean }> = [
    { href: "/home", icon: Home, label: "Home", unread: unread.moods || unread.signals },
    { href: "/notes", icon: MessageCircleHeart, label: "Notes", unread: unread.notes },
    { href: "/moments", icon: ImageIcon, label: "Moments", unread: unread.moments },
    { href: "/dreams", icon: Sparkles, label: "Dreams", unread: unread.wishes },
    { href: "/us", icon: Heart, label: "Us", unread: false },
  ];

  // Do not show tab bar/header on onboarding or lock screens
  const showNav = !["/onboarding", "/lock", "/"].includes(location);
  const showHeader = showNav;

  return (
    <div className="flex justify-center w-full min-h-[100dvh] bg-stone-100/50">
      <div className="relative w-full max-w-md bg-background min-h-[100dvh] flex flex-col shadow-xl overflow-hidden">
        {showHeader && <AppHeader onOpenCommand={() => setPaletteOpen(true)} />}
        {showHeader && (
          <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        )}
        <main className="flex-1 overflow-y-auto pb-24 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {showNav && (
          <nav className="absolute bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-border/50 pb-safe pt-2 px-4 flex justify-between items-center rounded-t-3xl z-50">
            {navItems.map((item) => {
              const isActive = location.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center w-16 h-14">
                  <motion.div
                    animate={{ 
                      scale: isActive ? 1.15 : 1,
                      color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative"
                  >
                    <Icon strokeWidth={isActive ? 2.5 : 2} className="w-6 h-6 mb-1" />
                    <AnimatePresence>
                      {item.unread && !isActive && (
                        <motion.span
                          key="badge"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-white"
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

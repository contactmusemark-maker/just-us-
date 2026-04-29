import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  useListNotes,
  useListMoments,
  useListWishes,
  getListNotesQueryKey,
  getListMomentsQueryKey,
  getListWishesQueryKey,
} from "@workspace/api-client-react";
import {
  Home as HomeIcon,
  MessageCircleHeart,
  ImageIcon,
  Sparkles,
  Heart,
  Activity as ActivityIcon,
  User,
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: Props) {
  const [, setLocation] = useLocation();

  // Only fetch when the palette is open to avoid extra polling load.
  const { data: notes } = useListNotes({
    query: { queryKey: getListNotesQueryKey(), enabled: open },
  });
  const { data: moments } = useListMoments({
    query: { queryKey: getListMomentsQueryKey(), enabled: open },
  });
  const { data: wishes } = useListWishes({
    query: { queryKey: getListWishesQueryKey(), enabled: open },
  });

  // Cmd/Ctrl+K toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const go = (path: string) => {
    setLocation(path);
    onOpenChange(false);
  };

  const recentNotes = useMemo(() => (notes ?? []).slice(0, 6), [notes]);
  const recentMoments = useMemo(() => (moments ?? []).slice(0, 6), [moments]);
  const activeDreams = useMemo(
    () => (wishes ?? []).filter((w) => !w.completed).slice(0, 6),
    [wishes],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search notes, moments, dreams…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Jump to">
          <CommandItem onSelect={() => go("/home")}>
            <HomeIcon className="mr-2 text-muted-foreground" />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/notes")}>
            <MessageCircleHeart className="mr-2 text-muted-foreground" />
            <span>Love Notes</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/moments")}>
            <ImageIcon className="mr-2 text-muted-foreground" />
            <span>Moments</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/dreams")}>
            <Sparkles className="mr-2 text-muted-foreground" />
            <span>Our Dreams</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/activity")}>
            <ActivityIcon className="mr-2 text-muted-foreground" />
            <span>Activity Feed</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/us")}>
            <User className="mr-2 text-muted-foreground" />
            <span>Us · Settings</span>
          </CommandItem>
        </CommandGroup>

        {recentNotes.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Notes">
              {recentNotes.map((n) => (
                <CommandItem
                  key={`note-${n.id}`}
                  value={`note ${n.sender} ${n.message}`}
                  onSelect={() => go("/notes")}
                >
                  <MessageCircleHeart className="mr-2 text-primary" />
                  <span className="truncate">
                    <span className="text-muted-foreground">{n.sender}: </span>
                    {n.message}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {recentMoments.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Moments">
              {recentMoments.map((m) => (
                <CommandItem
                  key={`moment-${m.id}`}
                  value={`moment ${m.caption ?? "photo"}`}
                  onSelect={() => go("/moments")}
                >
                  <ImageIcon className="mr-2 text-primary" />
                  <span className="truncate">
                    {m.caption || "Untitled moment"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {activeDreams.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Active Dreams">
              {activeDreams.map((w) => (
                <CommandItem
                  key={`wish-${w.id}`}
                  value={`dream ${w.text}`}
                  onSelect={() => go("/dreams")}
                >
                  <Sparkles className="mr-2 text-primary" />
                  <span className="truncate">{w.text}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go("/home")}>
            <Heart className="mr-2 text-primary" />
            <span>Send a Miss You</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

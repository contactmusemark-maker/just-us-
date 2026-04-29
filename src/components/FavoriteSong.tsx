import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Pencil, X, Check } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  name: string;
  photo: string | null | undefined;
  variant?: "primary" | "secondary";
  song: string | null | undefined;
  editable: boolean;
  onSave: (track: string | null) => void;
  saving?: boolean;
}

/**
 * Extracts a Spotify track ID from a variety of accepted inputs:
 * - https://open.spotify.com/track/<id>?si=...
 * - spotify:track:<id>
 * - <id> directly (22 char base62)
 */
function parseSpotifyTrackId(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // URL form
  const urlMatch = trimmed.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1] ?? null;
  // URI form
  const uriMatch = trimmed.match(/^spotify:track:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1] ?? null;
  // Bare id
  if (/^[a-zA-Z0-9]{15,30}$/.test(trimmed)) return trimmed;
  return null;
}

export function FavoriteSong({
  name,
  photo,
  variant = "primary",
  song,
  editable,
  onSave,
  saving,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(song ?? "");

  const trackId = song ? parseSpotifyTrackId(song) : null;

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      onSave(null);
    } else {
      onSave(trimmed);
    }
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar name={name} photo={photo} size="sm" variant={variant} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{name}'s song</div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Music className="w-3 h-3" />
            {trackId ? "Now playing on repeat" : "No song picked yet"}
          </div>
        </div>
        {editable && !editing && (
          <button
            onClick={() => {
              setDraft(song ?? "");
              setEditing(true);
            }}
            className="w-8 h-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
            aria-label="Edit favorite song"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence initial={false} mode="wait">
        {editing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 space-y-2"
          >
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Paste Spotify song link…"
              className="rounded-xl text-sm h-10"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground leading-snug">
              Open the song in Spotify → Share → Copy Song Link.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl flex-1"
              >
                <Check className="w-4 h-4 mr-1" /> Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(false)}
                className="rounded-xl flex-1"
              >
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
            </div>
          </motion.div>
        ) : trackId ? (
          <motion.div
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-3 pb-3"
          >
            <iframe
              key={trackId}
              src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
              width="100%"
              height="80"
              frameBorder={0}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl"
              title={`${name}'s favorite song`}
            />
          </motion.div>
        ) : (
          editable && (
            <motion.button
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setEditing(true)}
              className="w-full px-4 pb-4 text-left text-xs text-primary hover:underline"
            >
              + Add a song
            </motion.button>
          )
        )}
      </AnimatePresence>
    </motion.div>
  );
}

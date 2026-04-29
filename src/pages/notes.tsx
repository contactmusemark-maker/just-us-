import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListNotes, useCreateNote, useGetCouple, getListNotesQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Plus, MessageCircleHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/components/EmptyState";

const MOODS = ["💛", "🥺", "🥰", "✨", "🦋", "🌸", "☁️", "☕️"];

export default function Notes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: coupleData } = useGetCouple();
  const { data: notes, isLoading } = useListNotes({
    query: { queryKey: getListNotesQueryKey(), refetchInterval: 5000 }
  });
  const createNote = useCreateNote();

  const [isComposing, setIsComposing] = useState(false);
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [mood, setMood] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("justus_currentUser");
    if (saved && coupleData?.couple) {
      setSender(saved);
    } else if (coupleData?.couple) {
      setSender(coupleData.couple.user1Name);
    }
  }, [coupleData]);

  const handleSubmit = () => {
    if (!message.trim()) return;
    
    createNote.mutate(
      { data: { sender, message, mood: mood || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
          setMessage("");
          setMood("");
          setIsComposing(false);
        },
        onError: () => {
          toast({ title: "Couldn't save note", variant: "destructive" });
        }
      }
    );
  };

  const toggleSender = () => {
    if (!coupleData?.couple) return;
    const newSender = sender === coupleData.couple.user1Name ? coupleData.couple.user2Name : coupleData.couple.user1Name;
    setSender(newSender);
    localStorage.setItem("justus_currentUser", newSender);
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="p-6 pt-6 pb-32">
        <h1 className="text-3xl font-serif mb-6 text-foreground">Love Notes</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : notes?.length === 0 ? (
          <EmptyState
            icon={MessageCircleHeart}
            title="No notes yet"
            description="Leave a little message to brighten their day. Tap the + button to write your first one."
            action={
              <Button onClick={() => setIsComposing(true)} className="rounded-full">
                <Plus className="w-4 h-4 mr-1" /> Write a note
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {notes?.map((note, i) => {
              const date = new Date(note.createdAt);
              const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-card p-5 rounded-3xl shadow-sm border border-border relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-medium text-primary text-sm">{note.sender}</span>
                    <span className="text-xs text-muted-foreground">
                      {isToday ? format(date, 'h:mm a') : format(date, 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-foreground text-base leading-relaxed whitespace-pre-wrap pr-8">
                    {note.message}
                  </p>
                  {note.mood && (
                    <div className="absolute bottom-4 right-4 text-2xl opacity-80">
                      {note.mood}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button / Composer */}
      <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end">
        <AnimatePresence>
          {isComposing && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card p-5 rounded-3xl shadow-xl border border-border w-[calc(100vw-3rem)] max-w-sm mb-4 origin-bottom-right"
            >
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={toggleSender}
                  className="text-sm font-medium px-3 py-1 bg-muted rounded-full hover:bg-muted/80 transition-colors"
                >
                  From: <span className="text-primary">{sender}</span>
                </button>
              </div>
              
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write something sweet..."
                className="w-full bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground min-h-[100px]"
                autoFocus
              />
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {MOODS.map(m => (
                    <button
                      key={m}
                      onClick={() => setMood(m === mood ? "" : m)}
                      className={`text-xl p-1 rounded-full transition-transform ${mood === m ? 'scale-125 bg-muted' : 'opacity-60 hover:opacity-100'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!message.trim() || createNote.isPending}
                  className="rounded-full px-6 ml-2"
                >
                  Send
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsComposing(!isComposing)}
          className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-colors hover:bg-primary/90"
        >
          <motion.div animate={{ rotate: isComposing ? 45 : 0 }}>
            <Plus className="w-6 h-6" />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}

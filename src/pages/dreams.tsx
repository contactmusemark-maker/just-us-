import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListWishes, useCreateWish, useUpdateWish, useDeleteWish, getListWishesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/EmptyState";

export default function Dreams() {
  const queryClient = useQueryClient();
  const { data: wishes, isLoading } = useListWishes({
    query: { queryKey: getListWishesQueryKey(), refetchInterval: 5000 }
  });
  
  const createWish = useCreateWish();
  const updateWish = useUpdateWish();
  const deleteWish = useDeleteWish();

  const [newText, setNewText] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    createWish.mutate(
      { data: { text: newText } },
      {
        onSuccess: () => {
          setNewText("");
          queryClient.invalidateQueries({ queryKey: getListWishesQueryKey() });
        }
      }
    );
  };

  const toggleComplete = (id: number, completed: boolean) => {
    updateWish.mutate(
      { id, data: { completed: !completed } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWishesQueryKey() });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteWish.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWishesQueryKey() });
        }
      }
    );
  };

  const activeWishes = wishes?.filter(w => !w.completed) || [];
  const completedWishes = wishes?.filter(w => w.completed) || [];

  return (
    <div className="p-6 pt-6 pb-32 min-h-full">
      <h1 className="text-3xl font-serif mb-2 text-foreground">Our Dreams</h1>
      <p className="text-muted-foreground text-sm mb-6">Things we want to do together.</p>

      <form onSubmit={handleAdd} className="mb-8 relative">
        <Input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a new dream..."
          className="rounded-full bg-card border-border pr-12 h-14 shadow-sm"
        />
        <button 
          type="submit"
          disabled={!newText.trim() || createWish.isPending}
          className="absolute right-2 top-2 bottom-2 w-10 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted rounded-2xl" />)}
        </div>
      ) : wishes?.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No dreams yet"
          description="What do you want to do together? Trips, restaurants, little goals — type one above."
        />
      ) : (
        <div className="space-y-8">
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {activeWishes.map((wish) => (
                <motion.div
                  key={wish.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-card rounded-2xl p-4 shadow-sm border border-border flex items-center gap-4 group"
                >
                  <button 
                    onClick={() => toggleComplete(wish.id, wish.completed)}
                    className="w-6 h-6 rounded-full border-2 border-primary flex-shrink-0 flex items-center justify-center transition-colors hover:bg-primary/10"
                  />
                  <span className="flex-1 text-foreground font-medium">{wish.text}</span>
                  <button 
                    onClick={() => handleDelete(wish.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {completedWishes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest pl-2">Fulfilled</h2>
              <AnimatePresence mode="popLayout">
                {completedWishes.map((wish) => (
                  <motion.div
                    key={wish.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.6, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-muted/50 rounded-2xl p-4 border border-transparent flex items-center gap-4 group"
                  >
                    <button 
                      onClick={() => toggleComplete(wish.id, wish.completed)}
                      className="w-6 h-6 rounded-full border-2 border-primary bg-primary flex-shrink-0 flex items-center justify-center transition-colors"
                    />
                    <span className="flex-1 text-foreground line-through">{wish.text}</span>
                    <button 
                      onClick={() => handleDelete(wish.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

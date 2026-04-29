import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListMoments, useCreateMoment, useDeleteMoment, getListMomentsQueryKey } from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function Moments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: moments, isLoading } = useListMoments({
    query: { queryKey: getListMomentsQueryKey(), refetchInterval: 5000 }
  });
  const createMoment = useCreateMoment();
  const deleteMoment = useDeleteMoment();

  const [selectedMoment, setSelectedMoment] = useState<number | null>(null);

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (res) => {
      createMoment.mutate(
        { data: { imageUrl: res.objectPath } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListMomentsQueryKey() });
          },
          onError: () => {
            toast({ title: "Failed to save photo", variant: "destructive" });
          }
        }
      );
    },
    onError: () => {
      toast({ title: "Failed to upload photo", variant: "destructive" });
    }
  });

  const handleDelete = (id: number) => {
    deleteMoment.mutate(
      { id }, // Requires api-client generated hook to accept id in this way, assuming standard orval generation
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMomentsQueryKey() });
          setSelectedMoment(null);
        }
      }
    );
  };

  const selectedMomentData = moments?.find(m => m.id === selectedMoment);

  return (
    <div className="p-6 pt-6 pb-32 min-h-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif text-foreground">Moments</h1>
        
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
            }}
            disabled={isUploading}
          />
          <button 
            className={`w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground transition-opacity ${isUploading ? 'opacity-50' : ''}`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-square bg-muted rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : moments?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No moments saved yet.</p>
          <p className="text-sm mt-2">Upload a photo to start your gallery.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {moments?.map((moment, i) => (
            <motion.div
              key={moment.id}
              layoutId={`moment-${moment.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => setSelectedMoment(moment.id)}
              className="aspect-square rounded-3xl overflow-hidden cursor-pointer shadow-sm relative group bg-muted"
            >
              <img 
                src={`/api/storage${moment.imageUrl}`} 
                alt={moment.caption || "Moment"} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Fullscreen View */}
      <AnimatePresence>
        {selectedMomentData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
            onClick={() => setSelectedMoment(null)}
          >
            <div className="absolute top-safe pt-4 right-4 flex gap-4 z-50">
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(selectedMomentData.id); }}
                className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-foreground hover:bg-destructive hover:text-white transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setSelectedMoment(null)}
                className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <motion.div
              layoutId={`moment-${selectedMomentData.id}`}
              className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={`/api/storage${selectedMomentData.imageUrl}`} 
                alt={selectedMomentData.caption || "Moment"} 
                className="w-full object-contain max-h-[80vh]"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
                <p className="text-sm font-medium opacity-80">
                  {format(new Date(selectedMomentData.createdAt), 'MMMM d, yyyy')}
                </p>
                {selectedMomentData.caption && (
                  <p className="mt-2 text-lg">{selectedMomentData.caption}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

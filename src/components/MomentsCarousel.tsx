import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListMoments,
  getListMomentsQueryKey,
} from "@workspace/api-client-react";

interface Props {
  intervalMs?: number;
}

export function MomentsCarousel({ intervalMs = 5000 }: Props) {
  const { data: moments } = useListMoments({
    query: { queryKey: getListMomentsQueryKey(), refetchInterval: 30000 },
  });

  const photos = moments ?? [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [photos.length, intervalMs]);

  // Keep index valid when photos shrink (e.g., after deletion).
  useEffect(() => {
    if (photos.length > 0 && index >= photos.length) {
      setIndex(0);
    }
  }, [photos.length, index]);

  if (photos.length === 0) return null;

  const current = photos[index];
  if (!current) return null;

  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
      <AnimatePresence mode="sync">
        <motion.img
          key={current.id}
          src={`/api/storage${current.imageUrl}`}
          alt=""
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 1.2 }, scale: { duration: 6, ease: "linear" } }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      {/* Soft cream wash to keep text readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/80 via-card/70 to-card/85" />
      <div className="absolute inset-0 bg-card/30" />
    </div>
  );
}

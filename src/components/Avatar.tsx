import { motion } from "framer-motion";
import { User } from "lucide-react";

const SIZE_MAP = {
  xs: "w-7 h-7 text-[10px]",
  sm: "w-10 h-10 text-sm",
  md: "w-14 h-14 text-base",
  lg: "w-20 h-20 text-xl",
} as const;

type Size = keyof typeof SIZE_MAP;

interface AvatarProps {
  name: string;
  photo?: string | null;
  size?: Size;
  variant?: "primary" | "secondary";
  ring?: boolean;
  className?: string;
}

export function Avatar({
  name,
  photo,
  size = "md",
  variant = "primary",
  ring = false,
  className = "",
}: AvatarProps) {
  const initial = name?.[0]?.toUpperCase() ?? "";
  const sizeCls = SIZE_MAP[size];
  const bg =
    variant === "primary"
      ? "bg-primary/15 text-primary"
      : "bg-secondary/40 text-secondary-foreground";
  const ringCls = ring ? "ring-2 ring-white shadow-sm" : "";

  return (
    <div
      className={`${sizeCls} ${ringCls} rounded-full overflow-hidden flex items-center justify-center font-medium ${bg} ${className}`}
    >
      {photo ? (
        <img
          src={`/api/storage${photo}`}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : initial ? (
        <span>{initial}</span>
      ) : (
        <User className="w-1/2 h-1/2 opacity-60" />
      )}
    </div>
  );
}

interface AvatarUploadProps {
  name: string;
  photo?: string | null;
  size?: Size;
  variant?: "primary" | "secondary";
  uploading?: boolean;
  onPickFile: (file: File) => void;
}

export function AvatarUpload({
  name,
  photo,
  size = "lg",
  variant = "primary",
  uploading = false,
  onPickFile,
}: AvatarUploadProps) {
  return (
    <label
      className={`relative inline-flex cursor-pointer group ${
        uploading ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      <Avatar name={name} photo={photo} size={size} variant={variant} ring />
      <motion.span
        whileHover={{ scale: 1.05 }}
        className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-medium uppercase tracking-wider"
      >
        {uploading ? "..." : photo ? "change" : "add"}
      </motion.span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPickFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}

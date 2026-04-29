import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  useGetCouple,
  useUpdateCouple,
  useResetCouple,
  getGetCoupleQueryKey,
  getGetHomeSummaryQueryKey,
} from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { differenceInDays, parseISO, format } from "date-fns";
import {
  Heart,
  ChevronRight,
  Lock,
  Trash2,
  Pencil,
  Bell,
  CalendarHeart,
  Music,
  Palette,
  HardDrive,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { AvatarUpload } from "@/components/Avatar";
import { StorageBar } from "@/components/StorageBar";
import { ThemePicker, type ThemeAccent } from "@/components/ThemePicker";

const sectionFade = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export default function Us() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: coupleData, isLoading } = useGetCouple();
  const updateCouple = useUpdateCouple();
  const resetCouple = useResetCouple();

  const [editingNames, setEditingNames] = useState(false);
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [editingAnniv, setEditingAnniv] = useState(false);
  const [annivDraft, setAnnivDraft] = useState("");
  const [uploadingFor, setUploadingFor] = useState<"user1" | "user2" | null>(null);

  const couple = coupleData?.couple;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetCoupleQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetHomeSummaryQueryKey() });
  };

  const { uploadFile } = useUpload({
    onSuccess: (res) => {
      const field = uploadingFor;
      if (!field) return;
      const data =
        field === "user1"
          ? { user1Photo: res.objectPath }
          : { user2Photo: res.objectPath };
      updateCouple.mutate(
        { data },
        {
          onSuccess: () => {
            invalidate();
            setUploadingFor(null);
            toast({ title: "Profile photo updated" });
          },
          onError: () => {
            setUploadingFor(null);
            toast({ title: "Couldn't save photo", variant: "destructive" });
          },
        },
      );
    },
    onError: () => {
      setUploadingFor(null);
      toast({ title: "Upload failed", variant: "destructive" });
    },
  });

  const handlePickPhoto = (which: "user1" | "user2", file: File) => {
    setUploadingFor(which);
    uploadFile(file);
  };

  const handleSaveNames = () => {
    if (!name1.trim() || !name2.trim()) return;
    updateCouple.mutate(
      { data: { user1Name: name1.trim(), user2Name: name2.trim() } },
      {
        onSuccess: () => {
          invalidate();
          setEditingNames(false);
          toast({ title: "Names updated" });
        },
      },
    );
  };

  const handleSaveAnniversary = () => {
    if (!annivDraft) return;
    updateCouple.mutate(
      { data: { anniversary: annivDraft } },
      {
        onSuccess: () => {
          invalidate();
          setEditingAnniv(false);
          toast({ title: "Anniversary updated" });
        },
      },
    );
  };

  const handleToggleNotifications = (next: boolean) => {
    updateCouple.mutate(
      { data: { notificationsEnabled: next } },
      { onSuccess: invalidate },
    );
  };

  const handleThemeChange = (next: ThemeAccent) => {
    updateCouple.mutate(
      { data: { themeAccent: next } },
      { onSuccess: invalidate },
    );
  };

  const handleLock = () => {
    localStorage.removeItem("justus_unlocked");
    setLocation("/lock");
  };

  const handleReset = () => {
    resetCouple.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("justus_unlocked");
        localStorage.removeItem("justus_currentUser");
        queryClient.clear();
        setLocation("/onboarding");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 pt-6 animate-pulse space-y-6">
        <div className="h-64 bg-muted rounded-3xl" />
      </div>
    );
  }

  if (!couple) return null;

  const daysTogether = differenceInDays(new Date(), parseISO(couple.anniversary));

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="p-5 pt-6 pb-32 min-h-full space-y-6"
    >
      <motion.header variants={sectionFade}>
        <h1 className="text-2xl font-serif text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Your shared space</p>
      </motion.header>

      {/* Profile Card */}
      <motion.section
        variants={sectionFade}
        className="bg-card rounded-2xl p-6 border border-border shadow-sm"
      >
        <div className="flex items-center justify-center gap-5">
          <AvatarUpload
            name={couple.user1Name}
            photo={couple.user1Photo}
            variant="primary"
            uploading={uploadingFor === "user1"}
            onPickFile={(f) => handlePickPhoto("user1", f)}
          />
          <Heart className="w-5 h-5 text-primary fill-primary/20 shrink-0" />
          <AvatarUpload
            name={couple.user2Name}
            photo={couple.user2Photo}
            variant="secondary"
            uploading={uploadingFor === "user2"}
            onPickFile={(f) => handlePickPhoto("user2", f)}
          />
        </div>
        <div className="text-center mt-5">
          <h2 className="text-lg font-medium">
            {couple.user1Name} & {couple.user2Name}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Tap a photo to {couple.user1Photo || couple.user2Photo ? "change" : "add"} it
          </p>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section variants={sectionFade} className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="text-2xl font-light text-primary">{daysTogether}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Days together</div>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="text-sm font-medium text-foreground">
            {format(parseISO(couple.anniversary), "MMM d, yyyy")}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Anniversary</div>
        </div>
      </motion.section>

      {/* Storage */}
      <motion.section variants={sectionFade}>
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
          <HardDrive className="w-3 h-3" /> Storage
        </div>
        <StorageBar />
      </motion.section>

      {/* Preferences */}
      <motion.section variants={sectionFade}>
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Preferences
        </div>
        <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border shadow-sm">
          <div className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Partner notifications</div>
              <div className="text-xs text-muted-foreground">
                Get a toast when your partner adds something
              </div>
            </div>
            <Switch
              checked={couple.notificationsEnabled}
              onCheckedChange={handleToggleNotifications}
              disabled={updateCouple.isPending}
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <ThemePicker
                value={(couple.themeAccent as ThemeAccent) ?? "rose"}
                onChange={handleThemeChange}
              />
            </div>
          </div>

          <Row
            icon={<Music className="w-4 h-4" />}
            label="Favorite songs"
            hint="Pick your soundtrack on the home screen"
            onClick={() => setLocation("/home")}
          />
        </div>
      </motion.section>

      {/* Account section */}
      <motion.section variants={sectionFade}>
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Account
        </div>
        <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border shadow-sm">
          {editingNames ? (
            <div className="p-4 space-y-3">
              <Input
                value={name1}
                onChange={(e) => setName1(e.target.value)}
                placeholder="First name"
                className="rounded-xl"
              />
              <Input
                value={name2}
                onChange={(e) => setName2(e.target.value)}
                placeholder="Second name"
                className="rounded-xl"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveNames}
                  disabled={updateCouple.isPending}
                  className="flex-1 rounded-xl"
                >
                  Save
                </Button>
                <Button
                  onClick={() => setEditingNames(false)}
                  variant="outline"
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Row
              icon={<Pencil className="w-4 h-4" />}
              label="Edit names"
              hint={`${couple.user1Name} & ${couple.user2Name}`}
              onClick={() => {
                setName1(couple.user1Name);
                setName2(couple.user2Name);
                setEditingNames(true);
              }}
            />
          )}

          {editingAnniv ? (
            <div className="p-4 space-y-3">
              <Input
                type="date"
                value={annivDraft}
                onChange={(e) => setAnnivDraft(e.target.value)}
                className="rounded-xl"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveAnniversary}
                  disabled={updateCouple.isPending}
                  className="flex-1 rounded-xl"
                >
                  Save
                </Button>
                <Button
                  onClick={() => setEditingAnniv(false)}
                  variant="outline"
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Row
              icon={<CalendarHeart className="w-4 h-4" />}
              label="Edit anniversary"
              hint={format(parseISO(couple.anniversary), "MMMM d, yyyy")}
              onClick={() => {
                setAnnivDraft(couple.anniversary);
                setEditingAnniv(true);
              }}
            />
          )}

          <Row
            icon={<Lock className="w-4 h-4" />}
            label="Lock app"
            hint="Require PIN to enter"
            onClick={handleLock}
          />
        </div>
      </motion.section>

      {/* Danger zone */}
      <motion.section variants={sectionFade}>
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Danger zone
        </div>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full flex items-center gap-3 text-left p-4 active:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-destructive text-sm">Reset all data</div>
                  <div className="text-xs text-muted-foreground">Permanently delete everything</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your shared space, notes, photos, and dreams.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2 sm:space-x-0">
                <AlertDialogCancel className="rounded-xl mt-0">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </motion.section>
    </motion.div>
  );
}

function Row({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 text-left p-4 active:bg-muted/50 transition-colors"
    >
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{label}</div>
        {hint && (
          <div className="text-xs text-muted-foreground truncate">{hint}</div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}

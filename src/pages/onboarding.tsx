import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useCreateCouple, useGetCouple } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createCouple = useCreateCouple();
  const { data: existing } = useGetCouple();

  useEffect(() => {
    if (existing?.couple) {
      setLocation("/lock");
    }
  }, [existing, setLocation]);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    user1Name: "",
    user2Name: "",
    anniversary: "",
    pin: "",
  });

  const handleNext = () => {
    if (step === 1 && (!formData.user1Name || !formData.user2Name)) {
      toast({ title: "Please enter both names", variant: "destructive" });
      return;
    }
    if (step === 2 && !formData.anniversary) {
      toast({ title: "Please select your anniversary", variant: "destructive" });
      return;
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = () => {
    if (formData.pin.length !== 4) {
      toast({ title: "PIN must be exactly 4 digits", variant: "destructive" });
      return;
    }
    
    createCouple.mutate(
      { data: formData },
      {
        onSuccess: () => {
          toast({ title: "Welcome to your shared space 💛" });
          setLocation("/lock");
        },
        onError: (err: unknown) => {
          const status = (err as { status?: number } | undefined)?.status;
          if (status === 409) {
            toast({ title: "Your space already exists — taking you to the lock screen." });
            setLocation("/lock");
            return;
          }
          toast({ title: "Failed to create space. Try again.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 bg-gradient-to-b from-rose-50/50 to-orange-50/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif text-foreground font-medium">Just Us</h1>
          <p className="text-muted-foreground text-sm">A private space for the two of you.</p>
        </div>

        <div className="bg-card p-6 rounded-3xl shadow-sm border border-border">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="space-y-2">
                <Label>Your Name</Label>
                <Input 
                  value={formData.user1Name}
                  onChange={(e) => setFormData({ ...formData, user1Name: e.target.value })}
                  placeholder="e.g. Alice"
                  className="rounded-xl bg-muted/50 border-transparent focus-visible:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label>Their Name</Label>
                <Input 
                  value={formData.user2Name}
                  onChange={(e) => setFormData({ ...formData, user2Name: e.target.value })}
                  placeholder="e.g. Bob"
                  className="rounded-xl bg-muted/50 border-transparent focus-visible:border-primary"
                />
              </div>
              <Button onClick={handleNext} className="w-full rounded-xl mt-4">Next</Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="space-y-2">
                <Label>When did it all begin?</Label>
                <Input 
                  type="date"
                  value={formData.anniversary}
                  onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                  className="rounded-xl bg-muted/50 border-transparent focus-visible:border-primary"
                />
              </div>
              <Button onClick={handleNext} className="w-full rounded-xl mt-4">Next</Button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="space-y-2">
                <Label>Set a 4-digit PIN</Label>
                <p className="text-xs text-muted-foreground pb-2">This keeps your space private. You'll share the same PIN.</p>
                <Input 
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/[^0-9]/g, '') })}
                  placeholder="0000"
                  className="rounded-xl bg-muted/50 border-transparent focus-visible:border-primary text-center text-2xl tracking-widest"
                />
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={createCouple.isPending}
                className="w-full rounded-xl mt-4"
              >
                {createCouple.isPending ? "Creating..." : "Create Our Space"}
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

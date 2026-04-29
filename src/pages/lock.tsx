import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useVerifyPin, useGetCouple } from "@workspace/api-client-react";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar } from "@/components/Avatar";

export default function Lock() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data } = useGetCouple();
  const verifyPin = useVerifyPin();
  const verifyingRef = useRef(false);

  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4 && !verifyingRef.current) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    if (verifyingRef.current) return;
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length !== 4 || verifyingRef.current) return;
    verifyingRef.current = true;
    verifyPin.mutate(
      { data: { pin } },
      {
        onSuccess: (res) => {
          if (res.valid) {
            localStorage.setItem("justus_unlocked", "true");
            setLocation("/home");
          } else {
            setPin("");
            setError(true);
            verifyingRef.current = false;
          }
        },
        onError: () => {
          setPin("");
          setError(true);
          verifyingRef.current = false;
          toast({ title: "Error verifying PIN", variant: "destructive" });
        },
      },
    );
    // We intentionally only depend on `pin`. Including `verifyPin` causes
    // the effect to refire on every render and spawn parallel requests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gradient-to-b from-rose-50/50 to-orange-50/50 px-6">
      <div className="w-full max-w-sm flex flex-col items-center space-y-12">
        
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="flex items-center justify-center gap-2 mx-auto"
          >
            {data?.couple ? (
              <>
                <Avatar name={data.couple.user1Name} photo={data.couple.user1Photo} size="md" variant="primary" ring />
                <Heart className="w-4 h-4 text-primary fill-primary/30" />
                <Avatar name={data.couple.user2Name} photo={data.couple.user2Photo} size="md" variant="secondary" ring />
              </>
            ) : (
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary fill-primary/20" />
              </div>
            )}
          </motion.div>
          <div className="space-y-1">
            <h2 className="text-2xl font-serif text-foreground">Welcome back</h2>
            {data?.couple && (
              <p className="text-sm text-muted-foreground">
                {data.couple.user1Name} & {data.couple.user2Name}
              </p>
            )}
          </div>
        </div>

        <div className="flex space-x-4">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 ${
                pin.length > i 
                  ? "bg-primary border-primary" 
                  : error 
                    ? "border-destructive" 
                    : "border-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-light text-foreground active:bg-muted/50 transition-colors"
            >
              {num}
            </button>
          ))}
          <div /> {/* Empty space */}
          <button
            onClick={() => handleKeyPress("0")}
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-light text-foreground active:bg-muted/50 transition-colors"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-lg font-light text-muted-foreground active:bg-muted/50 transition-colors"
          >
            Delete
          </button>
        </div>

      </div>
    </div>
  );
}

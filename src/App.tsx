import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { useGetCouple } from "@workspace/api-client-react";
import { applyThemeAccent, type ThemeAccent } from "@/lib/theme-accent";
import { usePartnerNotifications } from "@/hooks/use-partner-notifications";

import { AppLayout } from "@/components/layout";
import Onboarding from "@/pages/onboarding";
import Lock from "@/pages/lock";
import Home from "@/pages/home";
import Notes from "@/pages/notes";
import Moments from "@/pages/moments";
import Dreams from "@/pages/dreams";
import Us from "@/pages/us";
import Activity from "@/pages/activity";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    }
  }
});

function Bootstrapper() {
  const [location, setLocation] = useLocation();
  const { data, isLoading } = useGetCouple();

  // Live partner activity → toast notifications.
  usePartnerNotifications();

  // Apply chosen theme accent globally whenever it changes.
  useEffect(() => {
    if (data?.couple?.themeAccent) {
      applyThemeAccent(data.couple.themeAccent as ThemeAccent);
    }
  }, [data?.couple?.themeAccent]);

  useEffect(() => {
    if (isLoading) return;

    // Ignore if already on onboarding or lock to prevent infinite loops
    if (location === "/onboarding" || location === "/lock") return;

    if (!data?.couple) {
      setLocation("/onboarding");
      return;
    }

    const isUnlocked = localStorage.getItem("justus_unlocked") === "true";
    if (!isUnlocked) {
      setLocation("/lock");
      return;
    }

    if (location === "/") {
      setLocation("/home");
    }
  }, [data, isLoading, location, setLocation]);

  if (isLoading) {
    return <div className="min-h-[100dvh] flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/lock" component={Lock} />
        <Route path="/home" component={Home} />
        <Route path="/notes" component={Notes} />
        <Route path="/moments" component={Moments} />
        <Route path="/dreams" component={Dreams} />
        <Route path="/activity" component={Activity} />
        <Route path="/us" component={Us} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Bootstrapper />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

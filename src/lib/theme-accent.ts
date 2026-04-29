export type ThemeAccent = "rose" | "lavender" | "sky" | "peach" | "mint";

interface AccentSpec {
  primary: string;
  primaryFg: string;
  secondary: string;
}

// Each value is HSL "h s% l%" matching the existing CSS-variable convention.
const ACCENTS: Record<ThemeAccent, AccentSpec> = {
  rose: {
    primary: "351 70% 73%",
    primaryFg: "0 0% 100%",
    secondary: "39 79% 88%",
  },
  lavender: {
    primary: "265 55% 75%",
    primaryFg: "0 0% 100%",
    secondary: "270 50% 92%",
  },
  sky: {
    primary: "205 75% 70%",
    primaryFg: "0 0% 100%",
    secondary: "200 70% 92%",
  },
  peach: {
    primary: "20 85% 72%",
    primaryFg: "0 0% 100%",
    secondary: "30 90% 90%",
  },
  mint: {
    primary: "160 50% 60%",
    primaryFg: "0 0% 100%",
    secondary: "150 55% 90%",
  },
};

export function applyThemeAccent(accent: ThemeAccent | null | undefined) {
  const spec = ACCENTS[accent ?? "rose"] ?? ACCENTS.rose;
  const root = document.documentElement;
  root.style.setProperty("--primary", spec.primary);
  root.style.setProperty("--primary-foreground", spec.primaryFg);
  root.style.setProperty("--secondary", spec.secondary);
}

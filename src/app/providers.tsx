"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      enableSystem={false}
      defaultTheme="dark"
      themes={["light", "dark"]}
      storageKey="theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}



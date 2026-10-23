"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useUserStore } from "@/lib/store";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setUser(null);
      return;
    }

    let cancelled = false;

    fetch("/api/user", { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // DB not reachable yet (no DATABASE_URL) — app still usable in UI-only mode.
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, setUser]);

  return children;
}

"use client";

import type { ReactNode } from "react";
import {
  SessionProvider as NextAuthSessionProvider,
  type SessionProviderProps,
} from "next-auth/react";

// Re-type for React 19 JSX compatibility (editor squiggle workaround)
const SessionProvider = NextAuthSessionProvider as unknown as (
  props: SessionProviderProps
) => ReactNode;

export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
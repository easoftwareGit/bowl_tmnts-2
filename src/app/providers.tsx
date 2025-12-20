"use client";

import type { ReactNode } from "react";
import type { Session } from "next-auth";
import {
  SessionProvider as NextAuthSessionProvider,
  type SessionProviderProps,
} from "next-auth/react";

// Re-type for React 19 JSX compatibility (editor squiggle workaround)
const SessionProvider = NextAuthSessionProvider as unknown as (
  props: SessionProviderProps
) => ReactNode;

type Props = {
  children: ReactNode;
  session: Session | null;
};

export function Providers({ children, session }: Props) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
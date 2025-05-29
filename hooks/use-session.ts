'use client';

import {Session} from 'next-auth';
import {SessionProvider} from 'next-auth/react';

export function useSession(): {
  session: Session | null;
  status: string;
  isAuthenticated: boolean;
} {
  const {session, status, isAuthenticated} = useSession();
  return {session, status, isAuthenticated: status === 'authenticated'};
}

export {SessionProvider};

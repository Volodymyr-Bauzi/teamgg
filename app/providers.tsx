'use client';

import {trpc} from '@/lib/trpc/client';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {httpBatchLink} from '@trpc/client';
import {SessionProvider} from 'next-auth/react';
import superjson from 'superjson';

export default function Providers({children}: {children: React.ReactNode}) {
  const queryClient = new QueryClient();

  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        transformer: superjson,
      }),
    ],
  });

  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}

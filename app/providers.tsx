'use client';

import {trpc} from '@/lib/trpc/client';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {httpBatchLink} from '@trpc/client';
import {SessionProvider} from 'next-auth/react';
import superjson from 'superjson';
import {ThemeProvider} from 'next-themes';
import {useState, type ReactNode} from 'react';
import {Toaster} from '@/components/ui/toaster';

export default function Providers({children}: {children: ReactNode}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5000,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="theme-preference"
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}

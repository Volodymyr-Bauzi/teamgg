import {appRouter} from '@/lib/trpc/router';
import {createContext} from '@/lib/trpc/context';
import {fetchRequestHandler} from '@trpc/server/adapters/fetch';
import {NextRequest} from 'next/server';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({req}),
  });

export {handler as GET, handler as POST};

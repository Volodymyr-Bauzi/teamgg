import {appRouter} from '@/lib/trpc/router';
import {createContext} from '@/lib/trpc/context';
import {fetchRequestHandler} from '@trpc/server/adapters/fetch';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({req}),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({error, path}) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
            );
          }
        : undefined,
  });

export {handler as GET, handler as POST};

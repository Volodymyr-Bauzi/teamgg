import {createTRPCRouter} from './trpc';
import {applicationRouter} from './routers/application';

export const appRouter = createTRPCRouter({
  application: applicationRouter,
});

export type AppRouter = typeof appRouter;

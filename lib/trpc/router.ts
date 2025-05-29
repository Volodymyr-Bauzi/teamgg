import {router} from './trpc';
import {applicationRouter} from './routers/application';

export const appRouter = router({
  application: applicationRouter,
});

export type AppRouter = typeof appRouter;

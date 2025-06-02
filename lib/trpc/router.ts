import {createTRPCRouter} from './trpc';
import {applicationRouter} from './routers/application';
import {userRouter} from './routers/user.router';

export const appRouter = createTRPCRouter({
  application: applicationRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

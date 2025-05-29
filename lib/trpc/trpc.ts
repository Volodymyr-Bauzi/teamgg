import {initTRPC, TRPCError} from '@trpc/server';
import superjson from 'superjson';
const {getServerSession} = require('next-auth/next-auth'); // Adjust import based on your Next.js version
import {authOptions} from '@/app/api/auth/[...nextauth]/route'; // adjust path
import {Context} from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const isAuthed = t.middleware(async ({ctx, next}) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new TRPCError({code: 'UNAUTHORIZED'});
  }

  return next({
    ctx: {
      session,
      user: session.user,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

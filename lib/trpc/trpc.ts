import {initTRPC, TRPCError} from '@trpc/server';
import superjson from 'superjson';
import {ZodError} from 'zod';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth-options';
import {db} from '@/lib/db';
import {Context} from './context';

export const createTRPCContext = async (opts: {headers: Headers}) => {
  const session = await getServerSession(authOptions);

  return {
    session,
    headers: opts.headers,
    db, // Assuming db is a Prisma client instance or similar
    user: session?.user || null,
  };
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({shape, error}) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const enforceUserIsAuthed = t.middleware(async ({ctx, next}) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource.',
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: {...ctx.session, user: ctx.session.user},
      user: ctx.user,
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

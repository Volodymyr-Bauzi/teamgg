import {z} from 'zod';
import {db} from '@/lib/db';
import {publicProcedure, router} from '../trpc';

export const userRouter = router({
  getById: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({input}) => {
      const user = await db.user.findUnique({
        where: {id: input.id},
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });
      return user;
    }),
});

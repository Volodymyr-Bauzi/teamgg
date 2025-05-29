import {z} from 'zod';
import {createTRPCRouter, publicProcedure, protectedProcedure} from '../trpc';

export const applicationRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ctx, input}) => {
      const {gameId, page, limit} = input;

      const [items, total] = await Promise.all([
        ctx.db.application.findMany({
          where: {gameId},
          orderBy: {createdAt: 'desc'},
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.application.count({where: {gameId}}),
      ]);
      return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
        contact: z.string(),
        tags: z.record(z.string()),
      })
    )
    .mutation(async ({ctx, input}) => {
      return await ctx.db.application.create({
        data: {
          ...input,
          userId: ctx.user?.id,
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({id: z.string()}))
    .mutation(async ({ctx, input}) => {
      return await (await ctx).db.application.delete({where: {id: input.id}});
    }),
});

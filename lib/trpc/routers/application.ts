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
      
      // Ensure tags is always an object
      const formattedItems = items.map(item => ({
        ...item,
        tags: item.tags || {}
      }));
      
      return {
        items: formattedItems,
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
        userId: z.string().optional(),
      })
    )
    .mutation(async ({ctx, input}) => {
      const userId = ctx.user?.id || input.userId;
      if (!userId) {
        throw new Error('User ID is required');
      }

      return await ctx.db.application.create({
        data: {
          gameId: input.gameId,
          contact: input.contact,
          tags: input.tags,
          userId,
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({id: z.string()}))
    .mutation(async ({ctx, input}) => {
      return await ctx.db.application.delete({where: {id: input.id}});
    }),
});

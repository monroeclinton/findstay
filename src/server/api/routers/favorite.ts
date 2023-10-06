import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const favoriteRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                locationId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const session = ctx.session;

            return ctx.prisma.airbnbLocationFavorite.upsert({
                where: {
                    locationId_userId: {
                        locationId: input.locationId,
                        userId: session.user.id,
                    },
                },
                update: {},
                create: {
                    locationId: input.locationId,
                    userId: session.user.id,
                },
            });
        }),
    delete: protectedProcedure
        .input(
            z.object({
                locationId: z.string(),
            })
        )
        .mutation(async ({ ctx }) => {
            const session = ctx.session;

            return ctx.prisma.user.delete({
                where: { id: session.user.id },
            });
        }),
});

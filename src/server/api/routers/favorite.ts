import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { addComputedFields } from "~/utils/home";

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
        .mutation(async ({ ctx, input }) => {
            const session = ctx.session;

            return ctx.prisma.airbnbLocationFavorite.delete({
                where: {
                    locationId_userId: {
                        locationId: input.locationId,
                        userId: session.user.id,
                    },
                },
            });
        }),
    getAll: protectedProcedure.query(async ({ ctx, input }) => {
        const session = ctx.session;

        const favorites = await ctx.prisma.airbnbLocationFavorite.findMany({
            where: {
                userId: session.user.id,
            }
        })

        const locations = await ctx.prisma.airbnbLocation.findMany({
            where: {
                id: {
                    in: favorites.map(favorite => favorite.locationId),
                },
            }
        });

        return addComputedFields(locations, session.user.id);
    })
});

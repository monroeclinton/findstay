import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { addComputedFields } from "~/utils/home";

export const favoriteRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                locationId: z.string(),
                folderId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const session = ctx.session;

            return ctx.prisma.airbnbLocationFavorite.upsert({
                where: {
                    locationId_userId_folderId: {
                        locationId: input.locationId,
                        userId: session.user.id,
                        folderId: input.folderId,
                    },
                },
                update: {},
                create: {
                    locationId: input.locationId,
                    userId: session.user.id,
                    folderId: input.folderId,
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

            return ctx.prisma.airbnbLocationFavorite.deleteMany({
                where: {
                    locationId: input.locationId,
                    userId: session.user.id,
                },
            });
        }),
    getAll: protectedProcedure
        .input(z.object({
            folderId: z.string().nullish(),
        }))
        .query(async ({ ctx, input }) => {
            const session = ctx.session;

            const favorites = await ctx.prisma.airbnbLocationFavorite.findMany({
                where: {
                    userId: session.user.id,
                    ...(input.folderId ? { folderId: input.folderId } : {}),
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
        }),
    createFolder: protectedProcedure
        .input(z.object({
            name: z.string().min(3),
        }))
        .mutation(async ({ ctx, input }) => {
            const session = ctx.session;

            return await ctx.prisma.airbnbLocationFavoriteFolder.create({
                data: {
                    name: input.name,
                    userId: session.user.id,
                }
            });
        }),
    getFolders: protectedProcedure.query(async ({ ctx, input }) => {
        const session = ctx.session;

        return await ctx.prisma.airbnbLocationFavoriteFolder.findMany({
            where: {
                userId: session.user.id,
            }
        });
    })
});

import { type GoogleMapsLocation, Prisma } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createAirbnbSync, syncAirbnbPage } from "~/utils/airbnb";
import { syncSuperMarkets } from "~/utils/gmm";
import { getMidPoint } from "~/utils/geometry";

export const homeRouter = createTRPCRouter({
    createSync: protectedProcedure
        .input(
            z.object({
                search: z.string().min(5),
            })
        )
        .query(async ({ input }) => {
            const airbnbSync = await createAirbnbSync(input.search);

            if (!airbnbSync) throw new Error("Airbnb sync not successful.");

            const midpoint = getMidPoint(
                airbnbSync.neLatitude.toNumber(),
                airbnbSync.neLongitude.toNumber(),
                airbnbSync.swLatitude.toNumber(),
                airbnbSync.swLongitude.toNumber()
            );
            await syncSuperMarkets(midpoint.latitude, midpoint.longitude);

            return {
                id: airbnbSync.id,
                cursors: airbnbSync.cursors,
                midpoint,
            };
        }),
    getPage: protectedProcedure
        .input(
            z.object({
                syncId: z.string(),
                cursor: z.string().nullish(),
            })
        )
        .query(async ({ ctx, input }) => {
            const airbnbSync = await syncAirbnbPage(input.syncId, input.cursor);
            if (!airbnbSync) throw new Error("Airbnb sync not successful.");

            const midpoint = getMidPoint(
                airbnbSync.neLatitude.toNumber(),
                airbnbSync.neLongitude.toNumber(),
                airbnbSync.swLatitude.toNumber(),
                airbnbSync.swLongitude.toNumber()
            );

            const supermarkets = await ctx.prisma.$queryRaw<
                GoogleMapsLocation[]
            >(
                Prisma.sql`
                    SELECT
                        id,
                        "syncId",
                        name,
                        type,
                        reviews,
                        stars,
                        hex,
                        uri,
                        link,
                        latitude,
                        longitude,
                        "updatedAt",
                        "createdAt"
                    FROM
                        google_maps_location
                    WHERE
                        ST_DistanceSphere(
                            coordinate,
                            ST_MakePoint(${midpoint.latitude}, ${midpoint.longitude})
                        ) <= 2000
                `
            );

            const closestSupermarket = ({
                latitude,
                longitude,
            }: {
                latitude: number;
                longitude: number;
            }): number => {
                let shortest = null;

                for (const supermarket of supermarkets) {
                    const distance = getDistanceFromLatLonInKm(
                        supermarket.latitude.toNumber(),
                        supermarket.longitude.toNumber(),
                        latitude,
                        longitude
                    );

                    if (shortest === null || shortest > distance) {
                        shortest = distance;
                    }
                }

                return Math.round((shortest || 0) * 1000);
            };

            const page =
                airbnbSync.pages.find((page) => page.cursor === input.cursor) ||
                airbnbSync.pages.at(0);

            if (!page) throw new Error("Unable to fetch page of listings");

            const favorites = await ctx.prisma.airbnbLocationFavorite.findMany({
                where: {
                    userId: ctx.session?.user.id,
                },
            });
            const favoriteIds = favorites.map(
                (favorite) => favorite.locationId
            );

            const locations = [];
            for (const result of page.locations) {
                const home = result.location;

                locations.push({
                    id: home.id,
                    name: home.name,
                    price: home.price,
                    ratings: home.rating,
                    longitude: home.longitude.toNumber(),
                    latitude: home.latitude.toNumber(),
                    supermarket: closestSupermarket({
                        longitude: home.longitude.toNumber(),
                        latitude: home.latitude.toNumber(),
                    }),
                    images: home.images,
                    link: "https://airbnb.com/rooms/" + home.id,
                    isFavorited: favoriteIds.includes(home.id),
                });
            }

            const cursorPos: number = input.cursor
                ? airbnbSync.cursors.indexOf(input.cursor) || 0
                : 0;

            const nextCursor: string | null =
                airbnbSync.cursors.length - 1 > cursorPos
                    ? airbnbSync.cursors.at(cursorPos + 1) || null
                    : null;

            return {
                syncId: airbnbSync.id,
                midpoint,
                locations,
                cursor: input.cursor as string,
                nextCursor,
            };
        }),
});

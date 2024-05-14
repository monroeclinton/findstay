import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createAirbnbSync, syncAirbnbPage } from "~/utils/airbnb";
import { getMidPoint } from "~/utils/geometry";
import { syncSuperMarkets } from "~/utils/gmm";
import { addComputedFields, getPointsOfInterest } from "~/utils/home";

export const homeRouter = createTRPCRouter({
    createSync: protectedProcedure
        .input(
            z.object({
                location: z.string().min(3),
                maxPrice: z.number().int().nullish(),
                dimensions: z.object({
                    width: z.number(),
                    height: z.number(),
                }),
                boundingBox: z
                    .object({
                        neLat: z.number(),
                        neLng: z.number(),
                        swLat: z.number(),
                        swLng: z.number(),
                    })
                    .nullish(),
            })
        )
        .query(async ({ input }) => {
            const airbnbSync = await createAirbnbSync(
                input.location,
                input.maxPrice,
                input.dimensions,
                input.boundingBox
            );

            if (!airbnbSync) throw new Error("Airbnb sync not successful.");

            const midpoint = getMidPoint(
                airbnbSync.neLatitude.toNumber(),
                airbnbSync.neLongitude.toNumber(),
                airbnbSync.swLatitude.toNumber(),
                airbnbSync.swLongitude.toNumber()
            );
            await syncSuperMarkets(midpoint.latitude, midpoint.longitude);

            const poi = await getPointsOfInterest({
                neLat: airbnbSync.neLatitude.toNumber(),
                neLng: airbnbSync.neLongitude.toNumber(),
                swLat: airbnbSync.swLatitude.toNumber(),
                swLng: airbnbSync.swLongitude.toNumber(),
            });

            return {
                id: airbnbSync.id,
                cursors: airbnbSync.cursors,
                midpoint,
                clientBoundingBox: input.boundingBox,
                poi: poi.map((point) => ({
                    ...point,
                    longitude: point.longitude.toNumber(),
                    latitude: point.latitude.toNumber(),
                    stars: point.stars.toNumber(),
                })),
                boundingBox: {
                    neLat: airbnbSync.neLatitude.toNumber(),
                    neLng: airbnbSync.neLongitude.toNumber(),
                    swLat: airbnbSync.swLatitude.toNumber(),
                    swLng: airbnbSync.swLongitude.toNumber(),
                },
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

            const page =
                airbnbSync.pages.find((page) => page.cursor === input.cursor) ||
                airbnbSync.pages.at(0);

            const stays = page
                ? await addComputedFields(
                      page.locations.map((result) => result.location),
                      ctx.session.user.id
                  )
                : [];

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
                stays,
                cursor: input.cursor as string,
                nextCursor,
            };
        }),
});

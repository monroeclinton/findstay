import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { InterestType } from "~/types/interests";
import { syncAirbnbPage } from "~/utils/airbnb";
import { getMidPoint } from "~/utils/geometry";
import { syncInterest } from "~/utils/gmm";
import { addComputedFields, getPointsOfInterest } from "~/utils/home";
import { createSync, getSyncById } from "~/utils/sync";

export const stayRouter = createTRPCRouter({
    createSync: protectedProcedure
        .input(
            z.object({
                params: z.object({
                    location: z.string().min(3),
                    stay: z.object({
                        maxPrice: z.number().int().nullable(),
                    }),
                    dates: z.object({
                        checkin: z.coerce.date(),
                        checkout: z.coerce.date(),
                        flexible: z.string().nullable(),
                    }),
                    poi: z.object({
                        interests: z.array(z.nativeEnum(InterestType)),
                        minRating: z.number().nullable(),
                        minReviews: z.number().nullable(),
                    }),
                }),
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
                    .nullable(),
            })
        )
        .query(async ({ input }) => {
            const sync = await createSync(
                input.dimensions,
                input.boundingBox,
                input.params
            );

            if (!sync) throw new Error("Sync not successful.");

            const midpoint = getMidPoint(
                sync.params.neLatitude.toNumber(),
                sync.params.neLongitude.toNumber(),
                sync.params.swLatitude.toNumber(),
                sync.params.swLongitude.toNumber()
            );

            return {
                id: sync.id,
                cursors: sync.airbnbSync.cursors,
                midpoint,
                clientBoundingBox: input.boundingBox,
                boundingBox: {
                    neLat: sync.params.neLatitude.toNumber(),
                    neLng: sync.params.neLongitude.toNumber(),
                    swLat: sync.params.swLatitude.toNumber(),
                    swLng: sync.params.swLongitude.toNumber(),
                },
            };
        }),
    getPage: protectedProcedure
        .input(
            z.object({
                syncId: z.string(),
                page: z.number(),
            })
        )
        .query(async ({ ctx, input }) => {
            const sync = await getSyncById(input.syncId);

            const airbnbPage = await syncAirbnbPage(
                sync.airbnbSync,
                input.page
            );

            if (!airbnbPage) throw new Error("Airbnb sync not successful.");

            const midpoint = getMidPoint(
                sync.params.neLatitude.toNumber(),
                sync.params.neLongitude.toNumber(),
                sync.params.swLatitude.toNumber(),
                sync.params.swLongitude.toNumber()
            );

            const stays = await addComputedFields(
                airbnbPage.locations.map((result) => result.location),
                sync.params,
                ctx.session.user.id
            );

            const coordinates = [];
            for (const stay of stays) {
                coordinates.push({
                    latitude: stay.latitude,
                    longitude: stay.longitude,
                });
            }

            for (const interest of sync.params.poiInterests as InterestType[]) {
                await syncInterest(interest, coordinates);
            }

            const poi = await getPointsOfInterest(sync.params);

            return {
                midpoint,
                stays,
                poi: poi.map((point) => ({
                    ...point,
                    longitude: point.longitude.toNumber(),
                    latitude: point.latitude.toNumber(),
                    stars: point.stars.toNumber(),
                })),
            };
        }),
});

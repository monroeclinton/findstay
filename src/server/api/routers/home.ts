import { type GoogleMapsLocation, Prisma } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createAirbnbSync, syncAirbnbPage } from "~/utils/airbnb";
import { syncSuperMarkets } from "~/utils/gmm";

// https://stackoverflow.com/q/18883601
function getDistanceFromLatLonInKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1); // deg2rad below
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

// https://stackoverflow.com/a/4656937
function getMidPoint(lat1: number, lon1: number, lat2: number, lon2: number) {
    const dLon = deg2rad(lon2 - lon1);

    lat1 = deg2rad(lat1);
    lat2 = deg2rad(lat2);
    lon1 = deg2rad(lon1);

    const Bx = Math.cos(lat2) * Math.cos(dLon);
    const By = Math.cos(lat2) * Math.sin(dLon);
    const lat3 = Math.atan2(
        Math.sin(lat1) + Math.sin(lat2),
        Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By)
    );
    const lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

    return {
        latitude: rad2deg(lat3),
        longitude: rad2deg(lon3),
    };
}

function rad2deg(rad: number) {
    return rad * (180 / Math.PI);
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export const homeRouter = createTRPCRouter({
    createSync: publicProcedure
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
            };
        }),
    getPage: publicProcedure
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

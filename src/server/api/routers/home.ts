import { type GoogleMapsLocation, Prisma } from "@prisma/client";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { syncAirbnbListings } from "~/utils/airbnb";
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
    getAll: publicProcedure.query(async ({ ctx }) => {
        const airbnbSync = await syncAirbnbListings("Roma norte");

        if (!airbnbSync) throw new Error();

        const midpoint = getMidPoint(
            airbnbSync.neBBox.coordinates[1],
            airbnbSync.neBBox.coordinates[0],
            airbnbSync.swBBox.coordinates[1],
            airbnbSync.swBBox.coordinates[0]
        );
        await syncSuperMarkets(midpoint.latitude, midpoint.longitude);
        const supermarkets = await prisma.$queryRaw<GoogleMapsLocation[]>(
            Prisma.sql`
                SELECT
                    *
                FROM
                    google_maps_location
                WHERE
                    ST_DistanceSphere(
                        coordinate,
                        ST_MakePoint(${midpoint.longitude}, ${midpoint.latitude})
                    ) <= 1
            `
        );

        const records = [];

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

        for (const home of airbnbSync.locations) {
            records.push({
                id: home.id,
                name: home.name,
                ratings: home.rating,
                supermarket: closestSupermarket({
                    longitude: home.longitude.toNumber(),
                    latitude: home.latitude.toNumber(),
                }),
                link: home.link,
            });
        }

        return records;
    }),
});

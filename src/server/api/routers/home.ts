import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
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

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export const homeRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        await syncSuperMarkets(19.4181529, -99.1703512);
        await syncAirbnbListings("Roma norte");

        const records = [];
        const supermarkets = await ctx.prisma.googleMapsLocation.findMany();
        const homes = await ctx.prisma.airbnbLocation.findMany();

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

        for (const home of homes) {
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

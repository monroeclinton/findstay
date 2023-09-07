import homes from "~/data/airbnb.json";
import supermarkets from "~/data/google_maps.json";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

interface Record {
    listing: {
        name: string;
        avgRatingA11yLabel: string;
    };
}

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
    getAll: publicProcedure.query(() => {
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
                    supermarket.coordinate.latitude,
                    supermarket.coordinate.longitude,
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
                id: home.listing.id,
                name: home.listing.name,
                ratings: home.listing.avgRatingA11yLabel,
                supermarket: closestSupermarket(home.listing.coordinate),
                link: "https://airbnb.com/rooms/" + home.listing.id,
            });
        }

        return records;
    }),
});

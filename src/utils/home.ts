import { AirbnbLocation, GoogleMapsLocation, Prisma } from "@prisma/client";
import { prisma } from "~/server/db";
import { getDistanceFromLatLonInKm } from "./geometry";

const closestSupermarket = ({
    latitude,
    longitude,
}: {
    latitude: number;
    longitude: number;
}, supermarkets: GoogleMapsLocation[]): number => {
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

export type Location = {
    id: string;
    name: string;
    price: number;
    ratings: string;
    longitude: number;
    latitude: number;
    supermarket: number;
    images: string[];
    link: string;
    isFavorited: boolean,
}

export const addComputedFields = async (airbnbLocations: AirbnbLocation[], userId: string): Promise<Location[]> => {
    if (airbnbLocations.length === 0) return [];

    const favorites = await prisma.airbnbLocationFavorite.findMany({
        where: {
            userId,
        },
    });

    const favoriteIds = favorites.map(
        (favorite) => favorite.locationId
    );

    const supermarkets = await prisma.$queryRaw<
        Array<{ airbnbId: string, supermarketId: string, distance: number }>
    >(
        Prisma.sql`
            SELECT
                airbnb.id as "airbnbId",
                supermarket.id as "supermarketId",
                supermarket.distance::int as distance
            FROM
                airbnb_location
            AS
                airbnb
            CROSS JOIN LATERAL 
                (SELECT
                    id, 
                    ST_Distance(ST_MakePoint(google_maps_location.longitude, google_maps_location.latitude), ST_MakePoint(airbnb.longitude, airbnb.latitude)::geography) as distance
                    FROM google_maps_location
                    ORDER BY ST_MakePoint(google_maps_location.longitude, google_maps_location.latitude) <-> ST_MakePoint(airbnb.longitude, airbnb.latitude)
                LIMIT 1) AS supermarket
            WHERE
                airbnb.id IN (${Prisma.join(airbnbLocations.map((location) => location.id))})
        `
    );
    console.log(supermarkets);

    const locations = [];
    for (const location of airbnbLocations) {
        locations.push({
            id: location.id,
            name: location.name,
            price: location.price,
            ratings: location.rating,
            longitude: location.longitude.toNumber(),
            latitude: location.latitude.toNumber(),
            supermarket: supermarkets.find(supermarket => supermarket.airbnbId === location.id)?.distance as number,
            images: location.images,
            link: "https://airbnb.com/rooms/" + location.id,
            isFavorited: favoriteIds.includes(location.id),
        });
    }


    return locations;
};
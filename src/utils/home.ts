import {
    type AirbnbLocation,
    type GoogleMapsLocation,
    Prisma,
} from "@prisma/client";

import { prisma } from "~/server/db";

import { type BoundingBox } from "./geometry";

export type Location = {
    id: string;
    name: string;
    price: number;
    rating?: number;
    ratingCount?: number;
    ratingLocalized: string;
    longitude: number;
    latitude: number;
    supermarket: number;
    images: string[];
    link: string;
    isFavorited: boolean;
};

export const getPointsOfInterest = async (
    boundingBox: BoundingBox
): Promise<GoogleMapsLocation[]> => {
    return await prisma.$queryRaw<GoogleMapsLocation[]>(
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
            FROM google_maps_location gml
            WHERE ST_Contains(
                ST_MakeEnvelope(
                    ${boundingBox.swLng},
                    ${boundingBox.swLat},
                    ${boundingBox.neLng},
                    ${boundingBox.neLat},
                    4326
                ),
                gml.coordinate
            )
        `
    );
};

export const addComputedFields = async (
    airbnbLocations: AirbnbLocation[],
    userId: string
): Promise<Location[]> => {
    if (airbnbLocations.length === 0) return [];

    const favorites = await prisma.airbnbLocationFavorite.findMany({
        where: {
            userId,
        },
    });

    const favoriteIds = favorites.map((favorite) => favorite.locationId);

    const supermarkets = await prisma.$queryRaw<
        Array<{ airbnbId: string; supermarketId: string; distance: number }>
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
                airbnb.id IN (${Prisma.join(
                    airbnbLocations.map((location) => location.id)
                )})
        `
    );

    const locations = [];
    for (const location of airbnbLocations) {
        locations.push({
            id: location.id,
            name: location.name,
            price: location.price,
            rating: location.rating?.toNumber(),
            ratingCount: location.ratingCount?.toNumber(),
            ratingLocalized: location.ratingLocalized,
            longitude: location.longitude.toNumber(),
            latitude: location.latitude.toNumber(),
            supermarket: supermarkets.find(
                (supermarket) => supermarket.airbnbId === location.id
            )?.distance as number,
            images: location.images,
            link: "https://airbnb.com/rooms/" + location.airbnbId,
            isFavorited: favoriteIds.includes(location.id),
        });
    }

    return locations;
};

import {
    type AirbnbLocation,
    type GoogleMapsLocation,
    Prisma,
    type StaySyncParams,
} from "@prisma/client";

import { prisma } from "~/server/db";

export type Location = {
    id: string;
    name: string;
    price: number;
    rating?: number;
    ratingCount?: number;
    ratingLocalized: string;
    longitude: number;
    latitude: number;
    interests: Array<{ interest: string; distance: number }>;
    images: string[];
    link: string;
    isFavorited: boolean;
};

export const getPointsOfInterest = async (
    params: StaySyncParams
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
            WHERE
                ST_Contains(
                    ST_MakeEnvelope(
                        ${params.swLongitude.toNumber()},
                        ${params.swLatitude.toNumber()},
                        ${params.neLongitude.toNumber()},
                        ${params.neLatitude.toNumber()},
                        4326
                    ),
                    gml.coordinate
                )
                AND stars >= (${params.poiMinRating || 0})::numeric
                AND reviews >= (${params.poiMinReviews || 0})::numeric
                AND type IN (${Prisma.join(params.poiInterests)})
        `
    );
};

export const addComputedFields = async (
    airbnbLocations: AirbnbLocation[],
    params: StaySyncParams,
    userId: string
): Promise<Location[]> => {
    if (airbnbLocations.length === 0) return [];

    const favorites = await prisma.airbnbLocationFavorite.findMany({
        where: {
            userId,
        },
    });

    const favoriteIds = favorites.map((favorite) => favorite.locationId);

    const interests = await prisma.$queryRaw<
        Array<{
            airbnbId: string;
            locationId: string;
            interest: string;
            distance: number;
        }>
    >(
        Prisma.sql`
            SELECT
                airbnb.id as "airbnbId",
                interest.id as "supermarketId",
                interest.type as interest,
                interest.distance::int as distance
            FROM
                airbnb_location
            AS
                airbnb
            CROSS JOIN LATERAL
                (SELECT
                    id,
                    type,
                    ST_Distance(ST_MakePoint(google_maps_location.longitude, google_maps_location.latitude), ST_MakePoint(airbnb.longitude, airbnb.latitude)::geography) as distance
                    FROM google_maps_location
                    WHERE google_maps_location.stars >= (${
                        params.poiMinRating || 0
                    })::numeric
                    AND google_maps_location.type IN (${Prisma.join(
                        params.poiInterests
                    )})
                    ORDER BY ST_MakePoint(google_maps_location.longitude, google_maps_location.latitude) <-> ST_MakePoint(airbnb.longitude, airbnb.latitude)
                LIMIT 1) AS interest
            WHERE
                supermarket.distance < 5000 AND
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
            interests: interests.filter(
                (interest) => interest.airbnbId === location.id
            ),
            images: location.images,
            link: "https://airbnb.com/rooms/" + location.airbnbId,
            isFavorited: favoriteIds.includes(location.id),
        });
    }

    return locations;
};

import {
    type AirbnbLocationPrice,
    type GoogleMapsLocation,
    Prisma,
    type StaySyncParams,
} from "@prisma/client";

import { prisma } from "~/server/db";

import { type AirbnbLocationWithPrices } from "./airbnb";

export type Location = {
    id: string;
    name: string;
    price?: AirbnbLocationPrice;
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
    airbnbLocations: AirbnbLocationWithPrices[],
    params: StaySyncParams | null,
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
            DISTINCT ON (interest.type, airbnb.id)
                airbnb.id as "airbnbId",
                airbnb.distance,
                interest.type as interest
            FROM
                google_maps_location interest
            CROSS JOIN LATERAL (
                SELECT
                    id,
                    ST_Distance(ST_MakePoint(interest.longitude, interest.latitude), ST_MakePoint(airbnb.longitude, airbnb.latitude)::geography)::int as distance
                FROM
                    airbnb_location airbnb
                WHERE
                    airbnb.id IN (${Prisma.join(
                        airbnbLocations.map((location) => location.id)
                    )})
            ) AS airbnb
            WHERE
            ${
                params
                    ? Prisma.sql`
                    interest.stars >= (${params.poiMinRating || 0})::numeric
                    AND
                        interest.type IN (${Prisma.join(params.poiInterests)})
                    AND
            `
                    : Prisma.sql`0 != 0 AND`
            }
                airbnb.distance < 5000
            ORDER BY
                interest.type,
                airbnb.id,
                airbnb.distance
        `
    );

    const locations = [];
    for (const location of airbnbLocations) {
        locations.push({
            id: location.id,
            name: location.name,
            price: params
                ? location.prices.find(
                      (l) =>
                          l.checkin.getTime() === params.checkin.getTime() &&
                          l.checkout.getTime() === params.checkout.getTime()
                  )
                : undefined,
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

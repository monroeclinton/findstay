import { createId } from "@paralleldrive/cuid2";
import { Prisma } from "@prisma/client";
import axios, { type AxiosResponse } from "axios";

import { prisma } from "~/server/db";

const headers = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0",
    "Content-Type":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
};

const getArray = (
    json: unknown,
    indices: Array<number>,
    fallback: unknown = null
): unknown => {
    for (const i of indices) {
        if (Array.isArray(json) && json.indexOf(i) !== 1) {
            json = json[i];
        } else {
            return fallback;
        }
    }

    return json;
};

const getLink = (
    latitude: number,
    longitude: number,
    hex: string,
    uri: string
): string => {
    return `https://www.google.com/maps/place/@${latitude},${longitude},15z/data=!4m6!3m5!1s${hex}!8m2!3d${latitude}!4d${longitude}!16s${uri}`;
};

export const syncSuperMarkets = async (latitude: number, longitude: number) => {
    const isSynced = (
        await prisma.$queryRaw<[{ count: number }]>(
            Prisma.sql`
                SELECT
                    COUNT(*) as count
                FROM
                    google_maps_sync
                WHERE
                    ST_DistanceSphere(
                        coordinate,
                        ST_MakePoint(${longitude}, ${latitude})
                    ) <= 200
            `
        )
    ).at(0);

    if (!isSynced || isSynced.count > 0) return null;

    const res: AxiosResponse<string> = await axios.get(
        `https://www.google.com/maps/search/supermarket/@${latitude},${longitude},16z?entry=ttu`,
        {
            headers,
        }
    );

    const raw = res.data
        .split(";window.APP_INITIALIZATION_STATE=")
        .at(1)
        ?.split(";window.APP_FLAGS")
        .at(0)
        ?.replace("\\", "");

    const initializationState: unknown = raw ? JSON.parse(raw) : null;
    const searchProtoBufString = (
        getArray(initializationState, [3, 2], "") as string
    ).substring(5);
    if (searchProtoBufString.length === 0) return null;
    const searchProtoBuf: unknown = JSON.parse(searchProtoBufString);

    const locationResults = getArray(searchProtoBuf, [0, 1]);
    if (!Array.isArray(locationResults)) return null;
    locationResults.shift();

    await prisma.$transaction(async (tx) => {
        const sync = (
            await tx.$queryRaw<[{ id: string }]>(
                Prisma.sql`
                INSERT INTO google_maps_sync (
                    id,
                    search,
                    coordinate,
                    latitude,
                    longitude,
                    "updatedAt",
                    "createdAt"
                )
                VALUES (
                    ${createId()},
                    'supermarkets',
                    ST_POINT(
                        ${longitude},
                        ${latitude}
                    ),
                    ${latitude},
                    ${longitude},
                    NOW(),
                    NOW()
                )
                RETURNING id
            `
            )
        ).at(0);

        if (!sync) return null;

        for (const store of locationResults) {
            const name = getArray(store, [14, 11]);
            const type = getArray(store, [14, 88, 1]);
            const reviews = getArray(store, [14, 4, 8]);
            const stars = getArray(store, [14, 4, 7]);
            const latitude = getArray(store, [14, 9, 2]);
            const longitude = getArray(store, [14, 9, 3]);
            const hex = getArray(store, [14, 10]);
            const uri = getArray(store, [14, 89]);

            if (
                name === null ||
                type === null ||
                reviews === null ||
                stars === null ||
                latitude === null ||
                longitude === null ||
                hex === null
            ) {
                continue;
            }

            const location = {
                name: name as string,
                type: type as string,
                reviews: reviews as number,
                stars: new Prisma.Decimal(stars as number),
                hex: hex as string,
                uri: uri as string,
                link: getLink(
                    latitude as number,
                    longitude as number,
                    hex as string,
                    uri as string
                ),
                latitude: new Prisma.Decimal(latitude as number),
                longitude: new Prisma.Decimal(longitude as number),
            };

            await tx.$queryRaw<[{ id: string }]>(
                Prisma.sql`
                INSERT INTO google_maps_location (
                    id,
                    "syncId",
                    name,
                    type,
                    reviews,
                    stars,
                    hex,
                    uri,
                    link,
                    coordinate,
                    latitude,
                    longitude,
                    "updatedAt",
                    "createdAt"
                )
                VALUES (
                    ${createId()},
                    ${sync.id},
                    ${location.name},
                    ${location.type},
                    ${location.reviews},
                    ${location.stars},
                    ${location.hex},
                    ${location.uri},
                    ${location.link},
                    ST_POINT(
                        ${location.longitude},
                        ${location.latitude}
                    ),
                    ${location.latitude},
                    ${location.longitude},
                    NOW(),
                    NOW()
                )
                ON CONFLICT (hex) DO NOTHING
            `
            );
        }
    });
};

import { createId } from "@paralleldrive/cuid2";
import { Prisma } from "@prisma/client";
import axios, { type AxiosResponse } from "axios";
import sql, { bulk } from "sql-template-tag";

import { prisma } from "~/server/db";
import { type InterestType } from "~/types/interests";

import { getDistanceFromLatLonInKm } from "./geometry";
import { getInterestTranslation } from "./translation";

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

const EARTH_RADIUS_IN_METERS = 6371010;
const TILE_SIZE = 256;
const SCREEN_PIXEL_HEIGHT = 960;
const RADIUS_X_PIXEL_HEIGHT =
    27.3611 * EARTH_RADIUS_IN_METERS * SCREEN_PIXEL_HEIGHT;

const getAltitude = (zoom: number, latitude: number) => {
    return (
        (RADIUS_X_PIXEL_HEIGHT * Math.cos((latitude * Math.PI) / 180)) /
        (2 ** zoom * TILE_SIZE)
    );
};

const getApiLink = (query: string, latitude: number, longitude: number) => {
    const altitude = getAltitude(15, latitude);
    const token = "00000000000000000000000";
    const baseUrl =
        "https://www.google.com/search?tbm=map&authuser=0&hl=en&gl=us";
    const pb = `!4m9!1m3!1d${altitude}!2d${longitude}!3d${latitude}!2m0!3m2!1i936!2i925!4f13.1!7i20!8i0!10b1!12m17!1m2!18b1!30b1!2m3!5m1!6e2!20e3!10b1!12b1!13b1!16b1!17m1!3e1!20m3!5e2!6b1!14b1!19m4!2m3!1i360!2i120!4i8!20m57!2m2!1i203!2i100!3m2!2i4!5b1!6m6!1m2!1i86!2i86!1m2!1i408!2i240!7m42!1m3!1e1!2b0!3e3!1m3!1e2!2b1!3e2!1m3!1e2!2b0!3e3!1m3!1e8!2b0!3e3!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e9!2b1!3e2!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e10!2b0!3e4!2b1!4b1!9b0!22m6!1s${token}:3!2s1i:0,t:11886,p:${token}:3!7e81!12e5!17s${token}:00!18e15!24m95!1m31!13m9!2b1!3b1!4b1!6i1!8b1!9b1!14b1!20b1!25b1!18m20!3b1!4b1!5b1!6b1!9b1!12b1!13b1!14b1!17b1!20b1!21b1!22b1!25b1!27m1!1b0!28b0!31b0!32b0!33m1!1b0!10m1!8e3!11m1!3e1!14m1!3b1!17b1!20m2!1e3!1e6!24b1!25b1!26b1!29b1!30m1!2b1!36b1!39m3!2m2!2i1!3i1!43b1!52b1!54m1!1b1!55b1!56m1!1b1!65m5!3m4!1m3!1m2!1i224!2i298!71b1!72m19!1m5!1b1!2b1!3b1!5b1!7b1!4b1!8m10!1m6!4m1!1e1!4m1!1e3!4m1!1e4!3sother_user_reviews!6m1!1e1!9b1!89b1!103b1!113b1!117b1!122m1!1b1!125b0!126b1!26m4!2m3!1i80!2i92!4i8!30m28!1m6!1m2!1i0!2i0!2m2!1i530!2i925!1m6!1m2!1i886!2i0!2m2!1i936!2i925!1m6!1m2!1i0!2i0!2m2!1i936!2i20!1m6!1m2!1i0!2i905!2m2!1i936!2i925!34m18!2b1!3b1!4b1!6b1!8m6!1b1!3b1!4b1!5b1!6b1!7b1!9b1!12b1!14b1!20b1!23b1!25b1!26b1!37m1!1e81!42b1!47m0!49m9!3b1!6m2!1b1!2b1!7m2!1e3!2b1!8b1!9b1!50m4!2e2!3m2!1b1!3b1!61b1!67m2!7b1!10b1!69i699`;
    return `${baseUrl}&pb=${pb}&q=${query}&oq=${query}&tch=1`;
};

const scrapeInterest = async (
    query: string,
    latitude: number,
    longitude: number
) => {
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
                    ) <= 1000
                AND
                    query = ${query}
            `
        )
    ).at(0);

    if (!isSynced || isSynced.count > 0) return null;

    const res: AxiosResponse<string> = await axios.get(
        getApiLink(query, latitude, longitude),
        {
            headers,
        }
    );

    const json = JSON.parse(res.data.slice(0, -6)) as { d: string };
    const protobufData: string = json.d.slice(5);
    const protobuf: unknown = JSON.parse(protobufData);
    const locationResults: unknown = getArray(protobuf, [0, 1]);

    if (!Array.isArray(locationResults)) return;
    locationResults.shift();

    await prisma.$transaction(async (tx) => {
        const sync = (
            await tx.$queryRaw<[{ id: string }]>(
                Prisma.sql`
                INSERT INTO google_maps_sync (
                    id,
                    query,
                    coordinate,
                    latitude,
                    longitude,
                    "updatedAt",
                    "createdAt"
                )
                VALUES (
                    ${createId()},
                    ${query},
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

        if (!sync) return;

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

export const syncInterest = async (
    query: InterestType,
    coordinates: Array<{ latitude: number; longitude: number }>
) => {
    const first = coordinates.at(0);
    if (!first) return;

    const translation = await getInterestTranslation(
        query,
        first.latitude,
        first.longitude
    );

    const notSynced = await prisma.$queryRaw<
        [{ latitude: number; longitude: number }]
    >(
        sql`
            WITH coordinates (longitude, latitude) AS (
                VALUES ${bulk(
                    coordinates.map((c) => [c.longitude, c.latitude])
                )}
            )
            SELECT
                c.latitude, c.longitude
            FROM
                coordinates c
            LEFT JOIN google_maps_sync gms
            ON ST_DistanceSphere(
                coordinate,
                ST_MakePoint(c.longitude, c.latitude)
            ) <= 400
            WHERE gms.id IS NULL
            AND gms.query = ${translation}
        `
    );

    const synced = [];
    sync: for (const { latitude, longitude } of notSynced) {
        for (const sync of synced) {
            if (
                getDistanceFromLatLonInKm(
                    latitude,
                    longitude,
                    sync.latitude,
                    sync.longitude
                ) <= 1
            ) {
                continue sync;
            }
        }

        await scrapeInterest(translation, latitude, longitude);
        synced.push({ latitude, longitude });
    }
};

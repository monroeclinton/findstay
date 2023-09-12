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

export const syncSuperMarkets = async (
    latitude: number,
    longitutde: number
) => {
    const res: AxiosResponse<string> = await axios.get(
        `https://www.google.com/maps/search/supermarket/@${latitude},${longitutde},16z?entry=ttu`,
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

    const searchResults = getArray(searchProtoBuf, [0, 0]);
    if (!searchResults) return null;

    const locationResults = getArray(searchResults, [0, 1]);
    console.log(locationResults);
    if (!Array.isArray(locationResults)) return null;
    locationResults.shift();

    const results = [];
    for (const store of locationResults) {
        const name = getArray(store, [14, 11]);
        const type = getArray(store, [14, 88, 1]);
        const reviews = getArray(store, [14, 4, 8]);
        const stars = getArray(store, [14, 4, 7]);
        const latitude = getArray(store, [14, 9, 2]);
        const longitude = getArray(store, [14, 9, 3]);
        const hex = getArray(store, [14, 4, 10]);
        const uri = getArray(store, [14, 4, 89]);

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

        results.push({
            name: name as string,
            type: type as string,
            reviews: reviews as number,
            stars: stars as number,
            hex: hex as string,
            uri: uri as string,
            link: getLink(
                latitude as number,
                longitude as number,
                hex as string,
                uri as string
            ),
            coordinates: {
                latitude: latitude as number,
                longitutde: longitude as number,
            },
        });
    }

    return results;
};

export const syncSuperMarkets = async (
    latitude: number,
    longitutde: number
) => {
    const res: AxiosResponse<string> = await axios.get(
        `https://www.google.com/maps/search/supermarket/@${latitude},${longitutde},16z?entry=ttu`,
        {
            headers,
        }
    );
};

import axios, { type AxiosResponse } from "axios";

export interface ISearchLocation {
    name: string;
    type: string;
    reviews: number;
    stars: number;
    link: string;
    coordinates: {
        latitude: number;
        longitutde: number;
    };
}

export interface ISearchData {
    search: string;
    results: Array<ISearchLocation>;
}

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

export const parseBuffer = (data: unknown): ISearchData | null => {
    const search = getArray(data, [0, 0]);
    if (!search) return null;

    const raw = getArray(data, [0, 1]);
    if (!Array.isArray(raw)) return null;
    raw.shift();

    const results: Array<ISearchLocation> = [];
    for (const store of raw) {
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

    return {
        search: search as string,
        results,
    };
};

export const getInitialData = async (
    latitude: number,
    longitutde: number
): Promise<ISearchData | null> => {
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

    const rawJson: unknown = raw ? JSON.parse(raw) : null;
    const pb = getArray(rawJson, [3, 2], "") as string;
    const dataString = pb.substring(5);
    const data = JSON.parse(dataString) as IInitialData;

    return data;
};

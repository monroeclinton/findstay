import axios, { type AxiosResponse } from "axios";

export interface IInitialData {
    [index: number]: unknown;
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

export const getInitialData = async (
    latitude: number,
    longitutde: number
): Promise<IInitialData> => {
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

    const json: unknown = raw ? JSON.parse(raw) : null;
    const pb = getArray(json, [3, 2], "") as string;
    const data = pb.substring(5);

    return {
        data,
    };
};

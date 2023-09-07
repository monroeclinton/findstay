import axios, { type AxiosResponse } from "axios";

export interface IInitialData {
    data: string;
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
        if (
            Array.isArray(json) &&
            json?.indexOf(i) !== -1 &&
            Array.isArray(json[i])
        ) {
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
        `https://www.google.com/maps/@${latitude},${longitutde},16z?entry=ttu`,
        {
            headers,
        }
    );

    const match = /window\["APP_INITIALIZATION_STATE"\] = (.*);/gm.exec(
        res.data
    );

    const json: unknown = match && match[1] ? JSON.parse(match[1]) : null;
    const data = getArray(json, [3, 2], "") as string;

    return {
        data,
    };
};

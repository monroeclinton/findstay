import axios, { type AxiosResponse } from "axios";

const headers = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0",
};

const scrapeAirbnbApi = async (apiKey: string) => {
    const res: AxiosResponse<string> = await axios.post(
        `https://www.airbnb.com/api/v3/StaysMapS2Search?operationName=StaysMapS2Search&locale=en&currency=USD`,
        {
            headers: {
                ...headers,
                "X-Airbnb-API-Key": apiKey,
                "Content-Type": "application/json",
            },
        }
    );

    console.log(res.data);
};

export const syncAirbnbListings = async (location: string) => {
    const res: AxiosResponse<string> = await axios.get(
        `https://www.airbnb.com/s/${location}/homes`,
        {
            headers: {
                ...headers,
                "Content-Type":
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            },
        }
    );

    const apiKey = res.data
        .split('"baseUrl":"/api","key":"')
        .at(1)
        ?.split('"},')
        .at(0);

    return;
};

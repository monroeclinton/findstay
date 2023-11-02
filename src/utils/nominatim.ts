import { type NominatimSearch } from "@prisma/client";
import axios from "axios";

import { prisma } from "~/server/db";

interface NominatimSearchResponse {
    lat: string;
    lon: string;
    boundingbox: Array<string>;
}

export const searchToCoordinates = async (
    search: string
): Promise<NominatimSearch> => {
    const nominatimSearch = await prisma.nominatimSearch.findFirst({
        where: {
            search,
        },
    });

    if (nominatimSearch) return nominatimSearch;

    const res = await axios.get<Array<NominatimSearchResponse>>(
        `https://nominatim.openstreetmap.org/search?q=${search}&layer=address&format=json&limit=1`,
        {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "curl/7.72.0",
            },
            validateStatus: () => true,
        }
    );

    const places = res.data;
    const result = places.at(0);
    if (!result) throw new Error("Could not locate search request");

    return await prisma.nominatimSearch.create({
        data: {
            search,
            latitude: Number(result.lat),
            longitude: Number(result.lon),
            neLatitude: Number(result.boundingbox.at(1)),
            neLongitude: Number(result.boundingbox.at(3)),
            swLatitude: Number(result.boundingbox.at(0)),
            swLongitude: Number(result.boundingbox.at(2)),
        },
    });
};

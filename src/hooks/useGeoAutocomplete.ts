import axios, { type AxiosResponse } from "axios";
import { useEffect, useState } from "react";

interface SearchResponse {
    features: Array<{
        properties: {
            country: string;
            name: string;
            state: string;
            city?: string;
            type: string;
        };
    }>;
}

export type GeoAutocomplete = SearchResponse["features"][0]["properties"];

const useGeoAutocomplete = (query: string): Array<GeoAutocomplete> => {
    const [locations, setLocations] = useState<Array<GeoAutocomplete>>([]);

    const fetchLocations = async (query: string) => {
        const res: AxiosResponse<SearchResponse> = await axios.get(
            `https://photon.komoot.io/api/?q=${query}&layer=city&layer=district&layer=locality`
        );

        setLocations(res.data.features.map((location) => location.properties));
    };

    useEffect(() => void fetchLocations(query), [query]);

    return locations;
};

export default useGeoAutocomplete;

import { iso1A2Code } from "@rapideditor/country-coder";
import clm from "country-locale-map";

import { INTERESTS, type InterestType } from "~/types/interests";

const getLanguageCode = (
    latitude: number,
    longitude: number
): string | null => {
    const countryCode = iso1A2Code([longitude, latitude]);

    if (!countryCode) {
        return null;
    }

    const country = clm.getCountryByAlpha2(countryCode);

    if (country?.languages.length !== 1) {
        return null;
    }

    return country.languages.at(0) as string;
};

export const getInterestTranslation = (
    query: InterestType,
    latitude: number,
    longitude: number
): string => {
    const code = getLanguageCode(latitude, longitude);

    if (!code) {
        return query;
    }

    const interest = INTERESTS.find((i) => i.name === query);

    const translation = interest?.i18n[code];
    if (translation) return translation;

    return query;
};

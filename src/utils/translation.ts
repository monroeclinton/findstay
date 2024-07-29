import ollama from "ollama";

import { INTERESTS, type InterestType } from "~/types/interests";

const getLanguageCode = async (latitude: number, longitude: number) => {
    const response = await ollama.chat({
        model: "llama2:instruct",
        messages: [
            {
                role: "user",
                content: `You are a coordinate to ISO 639-1 tool. Given the coordinates (${latitude}, ${longitude}) return the ISO 639-1 for it and nothing else.`,
            },
        ],
    });

    return response.message.content;
};

export const getInterestTranslation = async (
    query: InterestType,
    latitude: number,
    longitude: number
): Promise<string> => {
    const code = await getLanguageCode(latitude, longitude);

    const interest = INTERESTS.find((i) => i.name === query);

    const translation = interest?.i18n[code];
    if (translation) return translation;

    return query;
};

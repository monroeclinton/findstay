import { createId } from "@paralleldrive/cuid2";
import { Prisma } from "@prisma/client";
import { iso1A2Code } from "@rapideditor/country-coder";
import { Ollama } from "ollama";

import { prisma } from "~/server/db";
import { INTERESTS, type InterestType } from "~/types/interests";

const getLanguageCode = async (
    latitude: number,
    longitude: number
): Promise<string | null> => {
    const countryCode = iso1A2Code([longitude, latitude]);

    if (!countryCode) {
        return null;
    }

    const result = (
        await prisma.$queryRaw<[{ languageCode: string }]>(
            Prisma.sql`
                SELECT
                    "languageCode"
                FROM
                    geo_language_code
                WHERE
                    ST_DistanceSphere(
                        coordinate,
                        ST_MakePoint(${longitude}, ${latitude})
                    ) <= 25000
                AND
                    "countryCode" = ${countryCode.toLowerCase()}
                LIMIT 1
            `
        )
    ).at(0);

    if (result) {
        return result.languageCode;
    }

    const ollama = new Ollama({ host: "http://findstay-ollama:11434" });
    const response = await ollama.chat({
        model: "llama3:instruct",
        messages: [
            {
                role: "user",
                content: `
                    You are a coordinate to ISO 639-1 tool.
                    Given the coordinates (${latitude}, ${longitude}) return the ISO 639-1
                    for the official language at the coordinates and nothing else.
                `,
            },
        ],
    });

    const languageCode = response.message.content;

    if (languageCode.length !== 2) {
        return null;
    }

    await prisma.$queryRaw<[{ id: string }]>(
        Prisma.sql`
                INSERT INTO geo_language_code (
                    id,
                    "countryCode",
                    "languageCode",
                    coordinate,
                    "updatedAt",
                    "createdAt"
                )
                VALUES (
                    ${createId()},
                    ${countryCode.toLowerCase()},
                    ${languageCode.toLowerCase()},
                    ST_POINT(
                        ${longitude},
                        ${latitude}
                    ),
                    NOW(),
                    NOW()
                )
            `
    );

    return languageCode.toLowerCase();
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

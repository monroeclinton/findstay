import { createId } from "@paralleldrive/cuid2";
import {
    type AirbnbLocationSync,
    Prisma,
    type Prisma as PrismaType,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { prisma } from "~/server/db";

import { createAirbnbSync } from "./airbnb";
import { type BoundingBox } from "./geometry";
import { searchToCoordinates } from "./nominatim";

type StaySync = PrismaType.StaySyncGetPayload<{
    include: {
        params: true;
        airbnbSync: {
            include: {
                pages: {
                    include: {
                        locations: {
                            include: {
                                location: true;
                            };
                        };
                    };
                };
            };
        };
    };
}>;

export const getSyncById = async (
    id: string | undefined
): Promise<StaySync> => {
    return await prisma.staySync.findUniqueOrThrow({
        where: {
            id: id,
        },
        include: {
            params: true,
            airbnbSync: {
                include: {
                    pages: {
                        include: {
                            locations: true,
                        },
                    },
                },
            },
        },
    });
};

export const createSync = async (
    dimensions: { width: number; height: number },
    clientBoundingBox: BoundingBox | undefined | null,
    params: {
        location: string;
        stay: {
            maxPrice: number | null;
        };
        poi: {
            minRating: number | null;
            minReviews: number | null;
        };
    }
): Promise<StaySync> => {
    const nominatim = await searchToCoordinates(params.location);

    if (!nominatim) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "This location does not exist.",
        });
    }

    const boundingBox: BoundingBox = clientBoundingBox
        ? clientBoundingBox
        : {
              neLat: nominatim.neLatitude.toNumber(),
              neLng: nominatim.neLongitude.toNumber(),
              swLat: nominatim.swLatitude.toNumber(),
              swLng: nominatim.swLongitude.toNumber(),
          };

    const airbnbSync = await createAirbnbSync(
        params.location,
        params.stay.maxPrice,
        dimensions,
        boundingBox
    );

    if (!airbnbSync) {
        throw new TRPCError({
            code: "NOT_FOUND",
            message: "This location does not exist.",
        });
    }

    const inserted = (
        await prisma.$queryRaw<[{ id: string }]>(
            Prisma.sql`
                INSERT INTO stay_sync (
                    id,
                    "airbnbSyncId",
                    "neBBox",
                    "neLatitude",
                    "neLongitude",
                    "swBBox",
                    "swLatitude",
                    "swLongitude",
                    "updatedAt"
                )
                VALUES (
                    ${createId()},
                    ${airbnbSync.id},
                    ST_POINT(
                        ${boundingBox.neLng},
                        ${boundingBox.neLat}
                    ),
                    ${boundingBox.neLat},
                    ${boundingBox.neLng},
                    ST_POINT(
                        ${boundingBox.swLng},
                        ${boundingBox.swLat}
                    ),
                    ${boundingBox.swLat},
                    ${boundingBox.swLng},
                    CURRENT_TIMESTAMP
                )
                ON CONFLICT (id) DO NOTHING
                RETURNING id
            `
        )
    ).at(0);

    return getSyncById(inserted?.id);
};

import { createId } from "@paralleldrive/cuid2";
import {
    type AirbnbLocationSync,
    Prisma,
    type Prisma as PrismaType,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { prisma } from "~/server/db";
import { type InterestType } from "~/types/interests";

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
                            locations: {
                                include: {
                                    location: true,
                                },
                            },
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
        dates: {
            checkin: Date;
            checkout: Date;
            flexible: string | null;
        };
        stay: {
            maxPrice: number | null;
        };
        poi: {
            interests: InterestType[];
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
        params.dates,
        dimensions,
        boundingBox
    );

    if (!airbnbSync) {
        throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Failed to create Airbnb sync.",
        });
    }

    const inserted = (
        await prisma.$queryRaw<[{ id: string }]>(
            Prisma.sql`
                INSERT INTO stay_sync_params (
                    id,
                    location,
                    checkin,
                    checkout,
                    "flexibleDate",
                    "stayMaxPrice",
                    "poiInterests",
                    "poiMinRating",
                    "poiMinReviews",
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
                    ${params.location},
                    ${params.dates.checkin},
                    ${params.dates.checkout},
                    ${params.dates.flexible},
                    ${params.stay.maxPrice},
                    ${params.poi.interests},
                    ${params.poi.minRating},
                    ${params.poi.minReviews},
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

    if (!inserted?.id) {
        throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Failed to create Stay sync.",
        });
    }

    const sync = await prisma.staySync.create({
        data: {
            airbnbSyncId: airbnbSync.id,
            paramsId: inserted?.id,
        },
    });

    return getSyncById(sync.id);
};

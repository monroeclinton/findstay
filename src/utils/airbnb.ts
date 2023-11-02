import { createId } from "@paralleldrive/cuid2";
import {
    type AirbnbLocationSync,
    Prisma,
    type Prisma as PrismaType,
} from "@prisma/client";
import axios, { type AxiosResponse } from "axios";

import { prisma } from "~/server/db";

interface Coordinate {
    longitude: number;
    latitude: number;
}

interface BoundingBox {
    northeast: Coordinate;
    southwest: Coordinate;
}

interface MapSearchResponse {
    errors?: Array<{
        extensions: {
            response: {
                body: string;
            };
        };
    }>;
    data: {
        presentation: {
            staysSearch: {
                results: {
                    paginationInfo: {
                        pageCursors: Array<string>;
                    };
                    searchResults: Array<{
                        listing: {
                            id: string;
                            coordinate: Coordinate;
                            name: string;
                            avgRatingA11yLabel: string;
                            contextualPictures: Array<{
                                picture: string;
                            }>;
                        };
                        pricingQuote: {
                            rate: {
                                amount: number;
                            };
                        };
                    }>;
                };
            };
        };
    };
}

type AirbnbLocationSyncWithPages = PrismaType.AirbnbLocationSyncGetPayload<{
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
}>;

const headers = {
    "Content-Type": "text/html",
    "User-Agent": "curl/7.72.0",
};

const scrapeAirbnbApi = async (sync: AirbnbLocationSync, cursor: string) => {
    const res: AxiosResponse<MapSearchResponse> = await axios.post(
        `https://www.airbnb.com/api/v3/StaysSearch?operationName=StaysSearch&locale=en&currency=USD`,
        {
            operationName: "StaysMapS2Search",
            variables: {
                decomposeCleanupEnabled: true,
                feedMapDecoupleEnabled: true,
                isLeanTreatment: false,
                staysMapSearchRequestV2: {
                    cursor,
                    requestedPageType: "STAYS_SEARCH",
                    metadataOnly: false,
                    treatmentFlags: [
                        "decompose_stays_search_m2_treatment",
                        "flex_destinations_june_2021_launch_web_treatment",
                        "new_filter_bar_v2_fm_header",
                        "new_filter_bar_v2_and_fm_treatment",
                        "flexible_dates_12_month_lead_time",
                        "lazy_load_flex_search_map_compact",
                        "lazy_load_flex_search_map_wide",
                        "im_flexible_may_2022_treatment",
                        "search_add_category_bar_ui_ranking_web",
                        "feed_map_decouple_m11_treatment",
                        "feed_map_decouple_homepage_treatment",
                        "decompose_filters_treatment",
                        "flexible_dates_options_extend_one_three_seven_days",
                        "super_date_flexibility",
                        "micro_flex_improvements",
                        "micro_flex_show_by_default",
                        "search_input_placeholder_phrases",
                        "pets_fee_treatment",
                        "upfront_pricing_enabled",
                    ],
                    rawParams: [
                        {
                            filterName: "cdnCacheSafe",
                            filterValues: ["false"],
                        },
                        {
                            filterName: "itemsPerGrid",
                            filterValues: ["18"],
                        },
                        {
                            filterName: "neLat",
                            filterValues: [sync.neLatitude.toString()],
                        },
                        {
                            filterName: "neLng",
                            filterValues: [sync.neLongitude.toString()],
                        },
                        {
                            filterName: "query",
                            filterValues: [sync.search],
                        },
                        {
                            filterName: "refinementPaths",
                            filterValues: ["/homes"],
                        },
                        {
                            filterName: "screenSize",
                            filterValues: ["large"],
                        },
                        {
                            filterName: "swLat",
                            filterValues: [sync.swLatitude.toString()],
                        },
                        {
                            filterName: "swLng",
                            filterValues: [sync.swLongitude.toString()],
                        },
                        {
                            filterName: "tabId",
                            filterValues: ["home_tab"],
                        },
                        {
                            filterName: "version",
                            filterValues: ["1.8.3"],
                        },
                        {
                            filterName: "zoomLevel",
                            filterValues: ["16"],
                        },
                    ],
                },
                staysSearchRequest: {
                    metadataOnly: false,
                    rawParams: [
                        {
                            filterName: "cdnCacheSafe",
                            filterValues: ["false"],
                        },
                        {
                            filterName: "channel",
                            filterValues: ["EXPLORE"],
                        },
                        {
                            filterName: "datePickerType",
                            filterValues: ["calendar"],
                        },
                        {
                            filterName: "flexibleTripLengths",
                            filterValues: ["one_week"],
                        },
                        {
                            filterName: "itemsPerGrid",
                            filterValues: ["18"],
                        },
                        {
                            filterName: "monthlyLength",
                            filterValues: ["3"],
                        },
                        {
                            filterName: "monthlyStartDate",
                            filterValues: ["2023-11-01"],
                        },
                        {
                            filterName: "neLat",
                            filterValues: [sync.neLatitude.toString()],
                        },
                        {
                            filterName: "neLng",
                            filterValues: [sync.neLongitude.toString()],
                        },
                        {
                            filterName: "priceFilterInputType",
                            filterValues: ["0"],
                        },
                        {
                            filterName: "priceFilterNumNights",
                            filterValues: ["5"],
                        },
                        {
                            filterName: "query",
                            filterValues: [sync.search],
                        },
                        {
                            filterName: "refinementPaths",
                            filterValues: ["/homes"],
                        },
                        {
                            filterName: "screenSize",
                            filterValues: ["large"],
                        },
                        {
                            filterName: "searchByMap",
                            filterValues: ["true"],
                        },
                        {
                            filterName: "swLat",
                            filterValues: [sync.swLatitude.toString()],
                        },
                        {
                            filterName: "swLng",
                            filterValues: [sync.swLongitude.toString()],
                        },
                        {
                            filterName: "tabId",
                            filterValues: ["home_tab"],
                        },
                        {
                            filterName: "version",
                            filterValues: ["1.8.3"],
                        },
                        {
                            filterName: "zoomLevel",
                            filterValues: ["16"],
                        },
                    ],
                    requestedPageType: "STAYS_SEARCH",
                    searchType: "user_map_move",
                    source: "structured_search_input_header",
                    treatmentFlags: [
                        "new_filter_bar_v2_fm_header",
                        "feed_map_decouple_m11_treatment",
                    ],
                },
            },
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash:
                        "ec7165512f4a12cc00f169462bbcfffcdb33c231506761deb872b4b18ff23c6c",
                },
                operationName: "StaysSearch",
            },
        },
        {
            headers: {
                ...headers,
                "X-Airbnb-API-Key": sync.apiKey,
                "Content-Type": "application/json",
            },
        }
    );

    if (res.data.errors?.length !== undefined && res.data.errors.length > 0) {
        console.log(res.data.errors.at(0)?.extensions.response);
    }

    return res.data.data.presentation.staysSearch.results.searchResults;
};

export const createAirbnbSync = async (
    search: string
): Promise<AirbnbLocationSync | null> => {
    const recentSync = await prisma.airbnbLocationSync.findFirst({
        where: {
            AND: [
                { search: search },
                {
                    createdAt: {
                        gte: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                    },
                },
            ],
        },
        include: {
            pages: {
                include: {
                    locations: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (recentSync) return recentSync;

    const res: AxiosResponse<string> = await axios.get(
        `https://www.airbnb.com/s/${search.replace(/ /g, "+")}/homes`,
        {
            headers,
            validateStatus: () => true,
        }
    );

    const apiConfig = res.data.split('"api_config":{').at(1)?.split("},").at(0);
    if (!apiConfig) throw new Error("No API config");

    const apiKey = (JSON.parse("{" + apiConfig + "}") as { key: string })[
        "key"
    ];
    if (!apiKey) throw new Error("No API key");

    const cursorsString = res.data
        .split('"pageCursors":')
        .at(1)
        ?.split(',"previousPageCursor":null')
        .at(0) as string;
    if (!cursorsString) throw new Error("No available cursors");
    const cursors = JSON.parse(cursorsString) as string[];

    const boundingBoxString = res.data
        .split('"mapBoundsHint":')
        .at(1)
        ?.split(',"poiTagsForFlexCategory"')
        .at(0) as string;
    if (!boundingBoxString) throw new Error("No bounding box");
    const boundingBox = JSON.parse(boundingBoxString) as BoundingBox;

    const sync = (
        await prisma.$queryRaw<[{ id: string }]>(
            Prisma.sql`
                INSERT INTO airbnb_location_sync (
                    id,
                    search,
                    "apiKey",
                    cursors,
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
                    ${search},
                    ${apiKey},
                    ${cursors},
                    ST_POINT(
                        ${boundingBox.northeast.longitude},
                        ${boundingBox.northeast.latitude}
                    ),
                    ${boundingBox.northeast.latitude},
                    ${boundingBox.northeast.longitude},
                    ST_POINT(
                        ${boundingBox.southwest.longitude},
                        ${boundingBox.southwest.latitude}
                    ),
                    ${boundingBox.southwest.latitude},
                    ${boundingBox.southwest.longitude},
                    CURRENT_TIMESTAMP
                )
                ON CONFLICT (id) DO NOTHING
                RETURNING id
            `
        )
    ).at(0);

    return await prisma.airbnbLocationSync.findUniqueOrThrow({
        where: {
            id: sync?.id,
        },
        include: {
            pages: {
                include: {
                    locations: true,
                },
            },
        },
    });
};

export const syncAirbnbPage = async (
    syncId: string,
    cursor: string | undefined | null = undefined
): Promise<AirbnbLocationSyncWithPages | null> => {
    const sync = await prisma.airbnbLocationSync.findUniqueOrThrow({
        where: {
            id: syncId,
        },
        include: {
            pages: true,
        },
    });

    const curCursor = cursor || sync.cursors.at(0);
    if (!curCursor) return null;

    if (!sync.pages.map((page) => page.cursor).includes(curCursor)) {
        const locationResults = await scrapeAirbnbApi(sync, curCursor);

        await prisma.$transaction(async (tx) => {
            const locations = [];
            for (const location of locationResults) {
                const record = await tx.airbnbLocation.upsert({
                    where: {
                        airbnbId: location.listing.id,
                    },
                    update: {
                        name: location.listing.name,
                        price: location.pricingQuote.rate.amount,
                        images: location.listing.contextualPictures.map(
                            (ctx) => ctx.picture
                        ),
                        rating: location.listing.avgRatingA11yLabel || "None",
                        latitude: location.listing.coordinate.latitude,
                        longitude: location.listing.coordinate.longitude,
                    },
                    create: {
                        airbnbId: location.listing.id,
                        name: location.listing.name,
                        price: location.pricingQuote.rate.amount,
                        images: location.listing.contextualPictures.map(
                            (ctx) => ctx.picture
                        ),
                        rating: location.listing.avgRatingA11yLabel || "None",
                        latitude: location.listing.coordinate.latitude,
                        longitude: location.listing.coordinate.longitude,
                    },
                });

                locations.push(record);
            }

            const page = await tx.airbnbLocationSyncPage.create({
                data: {
                    cursor: curCursor,
                    syncId: sync.id,
                },
            });

            await tx.airbnbLocationsOnPages.createMany({
                data: locations.map((location) => ({
                    locationId: location.id,
                    pageId: page.id,
                })),
            });
        });
    }

    return await prisma.airbnbLocationSync.findUniqueOrThrow({
        where: {
            id: sync.id,
        },
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
    });
};

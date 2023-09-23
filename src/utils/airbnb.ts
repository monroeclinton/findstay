import { createId } from "@paralleldrive/cuid2";
import { Prisma } from "@prisma/client";
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
            explore: {
                sections: {
                    sectionIndependentData: {
                        staysMapSearch: {
                            mapSearchResults: Array<{
                                listing: {
                                    id: string;
                                    coordinate: Coordinate;
                                    name: string;
                                    avgRatingA11yLabel: string;
                                    contextualPictures: Array<{
                                        picture: string;
                                    }>;
                                };
                            }>;
                        };
                    };
                };
            };
        };
    };
}

type AirbnbLocationSync = Prisma.AirbnbLocationSyncGetPayload<{
    include: {
        locations: true;
    };
}>;

const headers = {
    "Content-Type": "text/html",
    "User-Agent": "curl/7.72.0",
};

const scrapeAirbnbApi = async (
    search: string,
    apiKey: string,
    boundingBox: BoundingBox
) => {
    const res: AxiosResponse<MapSearchResponse> = await axios.post(
        `https://www.airbnb.com/api/v3/StaysMapS2Search?operationName=StaysMapS2Search&locale=en&currency=USD`,
        {
            operationName: "StaysMapS2Search",
            variables: {
                staysMapSearchRequestV2: {
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
                        { filterName: "cdnCacheSafe", filterValues: ["false"] },
                        { filterName: "itemsPerGrid", filterValues: ["18"] },
                        {
                            filterName: "neLat",
                            filterValues: [
                                boundingBox.northeast.latitude.toString(),
                            ],
                        },
                        {
                            filterName: "neLng",
                            filterValues: [
                                boundingBox.northeast.longitude.toString(),
                            ],
                        },
                        {
                            filterName: "query",
                            filterValues: [search],
                        },
                        {
                            filterName: "refinementPaths",
                            filterValues: ["/homes"],
                        },
                        { filterName: "screenSize", filterValues: ["large"] },
                        {
                            filterName: "swLat",
                            filterValues: [
                                boundingBox.southwest.latitude.toString(),
                            ],
                        },
                        {
                            filterName: "swLng",
                            filterValues: [
                                boundingBox.southwest.longitude.toString(),
                            ],
                        },
                        { filterName: "tabId", filterValues: ["home_tab"] },
                        { filterName: "version", filterValues: ["1.8.3"] },
                        {
                            filterName: "zoomLevel",
                            filterValues: ["16"],
                        },
                    ],
                },
            },
            extensions: {
                persistedQuery: {
                    version: 1,
                    sha256Hash:
                        "63159bb86aab7260c73e654a3e33e0b9b08ca21813ebca34969938ead98dc000",
                },
            },
        },
        {
            headers: {
                ...headers,
                "X-Airbnb-API-Key": apiKey,
                "Content-Type": "application/json",
            },
        }
    );

    if (res.data.errors?.length !== undefined && res.data.errors.length > 0) {
        console.log(res.data.errors.at(0)?.extensions.response);
    }

    return res.data.data.presentation.explore.sections.sectionIndependentData
        .staysMapSearch.mapSearchResults;
};

export const syncAirbnbListings = async (
    search: string,
    syncId: string | undefined
): Promise<AirbnbLocationSync | null> => {
    const previousSync = await prisma.airbnbLocationSync.findFirst({
        where: {
            search: search,
            createdAt: {
                gte: new Date(Date.now() - 1800),
            },
        },
        include: {
            locations: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (previousSync) return previousSync;

    const res: AxiosResponse<string> = await axios.get(
        `https://www.airbnb.com/s/${search.replace(/ /g, "+")}/homes`,
        {
            headers,
            validateStatus: () => true,
        }
    );

    const apiKey = res.data
        .split('"baseUrl":"/api","key":"')
        .at(1)
        ?.split('"},')
        .at(0);

    if (!apiKey) return null;

    const cursorsString = res.data
        .split('"pageCursors":')
        .at(1)
        ?.split(',"previousPageCursor":null')
        .at(0) as string;
    if (!cursorsString) return null;
    const cursors = JSON.parse(cursorsString) as string[];

    const boundingBoxString = res.data
        .split('"mapBoundsHint":')
        .at(1)
        ?.split(',"poiTagsForFlexCategory"')
        .at(0) as string;
    if (!boundingBoxString) return null;
    const boundingBox = JSON.parse(boundingBoxString) as BoundingBox;

    const locationResults = await scrapeAirbnbApi(search, apiKey, boundingBox);

    return await prisma.$transaction(async (tx) => {
        const sync = (
            await tx.$queryRaw<[{ id: string }]>(
                Prisma.sql`
                INSERT INTO airbnb_location_sync (
                    id,
                    search,
                    "apiKey",
                    page,
                    cursors,
                    "neBBox",
                    "swBBox",
                    "updatedAt",
                    "createdAt"
                )
                VALUES (
                    ${syncId ? syncId : createId()},
                    ${search},
                    ${apiKey},
                    1,
                    ${cursors},
                    ST_POINT(
                        ${boundingBox.northeast.longitude},
                        ${boundingBox.northeast.latitude}
                    ),
                    ST_POINT(
                        ${boundingBox.southwest.longitude},
                        ${boundingBox.southwest.latitude}
                    ),
                    NOW(),
                    NOW()
                )
                ON CONFLICT (id) DO NOTHING
                RETURNING id
            `
            )
        ).at(0);

        if (!sync) return null;

        for (const location of locationResults) {
            await tx.airbnbLocation.upsert({
                where: {
                    syncId_airbnbId: {
                        airbnbId: location.listing.id,
                        syncId: sync.id,
                    },
                },
                update: {
                    name: location.listing.name,
                    images: location.listing.contextualPictures.map(
                        (ctx) => ctx.picture
                    ),
                    rating: location.listing.avgRatingA11yLabel || "None",
                    latitude: location.listing.coordinate.latitude,
                    longitude: location.listing.coordinate.longitude,
                },
                create: {
                    syncId: sync.id,
                    airbnbId: location.listing.id,
                    name: location.listing.name,
                    images: location.listing.contextualPictures.map(
                        (ctx) => ctx.picture
                    ),
                    rating: location.listing.avgRatingA11yLabel || "None",
                    latitude: location.listing.coordinate.latitude,
                    longitude: location.listing.coordinate.longitude,
                },
            });
        }

        return await tx.airbnbLocationSync.findUniqueOrThrow({
            where: {
                id: sync.id,
            },
            include: {
                locations: true,
            },
        });
    });
};

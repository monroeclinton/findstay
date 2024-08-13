import { createId } from "@paralleldrive/cuid2";
import {
    type AirbnbLocationSync,
    Prisma,
    type Prisma as PrismaType,
} from "@prisma/client";
import axios, { type AxiosResponse } from "axios";

import { prisma } from "~/server/db";

import {
    type BoundingBox,
    getMidPoint,
    latLngToBounds,
    zoomLevel,
} from "./geometry";

interface Coordinate {
    longitude: number;
    latitude: number;
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
                            avgRatingLocalized: string | null;
                            contextualPictures: Array<{
                                picture: string;
                            }>;
                        };
                        pricingQuote: {
                            structuredStayDisplayPrice: {
                                primaryLine:
                                    | {
                                          displayComponentType: "DISCOUNTED_DISPLAY_PRICE_LINE";
                                          discountedPrice: string;
                                          originalPrice: string;
                                          qualifier: string;
                                      }
                                    | {
                                          displayComponentType: "BASIC_DISPLAY_PRICE_LINE";
                                          price: string;
                                          qualifier: string;
                                      }
                                    | {
                                          displayComponentType: "QUALIFIED_DISPLAY_PRICE_LINE";
                                          price: string;
                                          qualifier: string;
                                      };
                            };
                        };
                    }>;
                };
            };
        };
    };
}

export type AirbnbLocationWithPrices = PrismaType.AirbnbLocationGetPayload<{
    include: {
        prices: true;
    };
}>;

type AirbnbLocationSyncPageWithLocations =
    PrismaType.AirbnbLocationSyncPageGetPayload<{
        include: {
            locations: {
                include: {
                    location: {
                        include: {
                            prices: true;
                        };
                    };
                };
            };
        };
    }>;

type AirbnbLocationSyncWithPages = PrismaType.AirbnbLocationSyncGetPayload<{
    include: {
        pages: {
            include: {
                locations: {
                    include: {
                        location: {
                            include: {
                                prices: true;
                            };
                        };
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

const fetchAirbnbApi = async (
    apiKey: string,
    search: string,
    checkin: Date | null,
    checkout: Date | null,
    flexibleDate: string | null,
    priceMax: number | undefined | null,
    neLatitude: number,
    neLongitude: number,
    swLatitude: number,
    swLongitude: number,
    zoom: number,
    cursor: undefined | string = undefined
) => {
    const res: AxiosResponse<MapSearchResponse> = await axios.post(
        `https://www.airbnb.com/api/v3/StaysSearch?operationName=StaysSearch&locale=en&currency=USD`,
        {
            operationName: "StaysMapS2Search",
            variables: {
                decomposeCleanupEnabled: true,
                feedMapDecoupleEnabled: true,
                isLeanTreatment: false,
                staysMapSearchRequestV2: {
                    ...(cursor ? { cursor } : {}),
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
                            filterValues: [neLatitude.toString()],
                        },
                        {
                            filterName: "neLng",
                            filterValues: [neLongitude.toString()],
                        },
                        {
                            filterName: "query",
                            filterValues: [search],
                        },
                        checkin
                            ? {
                                  filterName: "checkin",
                                  filterValues: [
                                      checkin.toISOString().split("T")[0],
                                  ],
                              }
                            : {},
                        checkout
                            ? {
                                  filterName: "checkout",
                                  filterValues: [
                                      checkout.toISOString().split("T")[0],
                                  ],
                              }
                            : {},
                        priceMax
                            ? {
                                  filterName: "priceMax",
                                  filterValues: [priceMax.toString()],
                              }
                            : {},
                        flexibleDate
                            ? {
                                  filterName: "flexibleDateSearchFilterType",
                                  filterValues: [flexibleDate],
                              }
                            : {},
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
                            filterValues: [swLatitude.toString()],
                        },
                        {
                            filterName: "swLng",
                            filterValues: [swLongitude.toString()],
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
                            filterValues: [zoom.toString()],
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
                            filterName: "neLat",
                            filterValues: [neLatitude.toString()],
                        },
                        {
                            filterName: "neLng",
                            filterValues: [neLongitude.toString()],
                        },
                        {
                            filterName: "query",
                            filterValues: [search],
                        },
                        checkin
                            ? {
                                  filterName: "checkin",
                                  filterValues: [
                                      checkin.toISOString().split("T")[0],
                                  ],
                              }
                            : {},
                        checkout
                            ? {
                                  filterName: "checkout",
                                  filterValues: [
                                      checkout.toISOString().split("T")[0],
                                  ],
                              }
                            : {},
                        priceMax
                            ? {
                                  filterName: "priceMax",
                                  filterValues: [priceMax.toString()],
                              }
                            : {},
                        flexibleDate
                            ? {
                                  filterName: "flexibleDateSearchFilterType",
                                  filterValues: [flexibleDate],
                              }
                            : {},
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
                            filterValues: [swLatitude.toString()],
                        },
                        {
                            filterName: "swLng",
                            filterValues: [swLongitude.toString()],
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
                            filterValues: [zoom.toString()],
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
                "X-Airbnb-API-Key": apiKey,
                "Content-Type": "application/json",
            },
        }
    );

    if (res.data.errors?.length !== undefined && res.data.errors.length > 0) {
        console.log(res.data.errors.at(0)?.extensions.response);
    }

    return res.data;
};

const scrapeAirbnbLocations = async (
    sync: AirbnbLocationSync,
    cursor: string
) => {
    const scrape = await fetchAirbnbApi(
        sync.apiKey,
        sync.search,
        sync.checkin,
        sync.checkout,
        sync.flexibleDate,
        sync.priceMax,
        sync.neLatitude.toNumber(),
        sync.neLongitude.toNumber(),
        sync.swLatitude.toNumber(),
        sync.swLongitude.toNumber(),
        16,
        cursor
    );

    return scrape.data.presentation.staysSearch.results.searchResults;
};

const scrapeAirbnbApiKey = async (search: string) => {
    const recentApiKey = await prisma.airbnbApi.findFirst({
        where: {
            createdAt: {
                gte: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (recentApiKey) return recentApiKey.apiKey;

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

    await prisma.airbnbApi.create({
        data: {
            apiKey,
        },
    });

    return apiKey;
};

const createAirbnbPage = async (
    sync: AirbnbLocationSync,
    curCursor: string,
    locationResults: MapSearchResponse["data"]["presentation"]["staysSearch"]["results"]["searchResults"]
) => {
    const parseRating = (
        airbnbRating: string | null
    ): { rating: number; count: number } | null => {
        if (typeof airbnbRating === "string") {
            const split = airbnbRating.split(" ");

            const rating = Number.parseFloat(split.at(0) as string);
            const count = Number.parseInt(split.at(0) as string);

            if (split.length < 2 || !rating || !count) {
                return null;
            }

            return { rating, count };
        }

        return null;
    };

    const parsePrice = (
        result: MapSearchResponse["data"]["presentation"]["staysSearch"]["results"]["searchResults"][0]
    ): number | null => {
        if (
            result.pricingQuote.structuredStayDisplayPrice.primaryLine
                .displayComponentType === "DISCOUNTED_DISPLAY_PRICE_LINE"
        ) {
            return parseInt(
                result.pricingQuote.structuredStayDisplayPrice.primaryLine.discountedPrice
                    .replace("$", "")
                    .replace(",", "")
            );
        }

        if (result.pricingQuote.structuredStayDisplayPrice.primaryLine.price) {
            return parseInt(
                result.pricingQuote.structuredStayDisplayPrice.primaryLine.price
                    .replace("$", "")
                    .replace(",", "")
            );
        }

        return null;
    };

    await prisma.$transaction(async (tx) => {
        const locations = [];
        for (const location of locationResults.filter(
            (result) => result.listing !== undefined
        )) {
            const ratings = parseRating(location.listing.avgRatingLocalized);
            const record = await tx.airbnbLocation.upsert({
                where: {
                    airbnbId: location.listing.id,
                },
                update: {
                    name: location.listing.name,
                    images: location.listing.contextualPictures.map(
                        (ctx) => ctx.picture
                    ),
                    rating: ratings?.rating,
                    ratingCount: ratings?.count,
                    ratingLocalized:
                        location.listing.avgRatingLocalized || "New",
                    latitude: location.listing.coordinate.latitude,
                    longitude: location.listing.coordinate.longitude,
                },
                create: {
                    airbnbId: location.listing.id,
                    name: location.listing.name,
                    images: location.listing.contextualPictures.map(
                        (ctx) => ctx.picture
                    ),
                    rating: ratings?.rating,
                    ratingCount: ratings?.count,
                    ratingLocalized:
                        location.listing.avgRatingLocalized || "New",
                    latitude: location.listing.coordinate.latitude,
                    longitude: location.listing.coordinate.longitude,
                },
            });

            const price = parsePrice(location);
            console.log(
                price,
                location.pricingQuote.structuredStayDisplayPrice.primaryLine
            );
            if (price) {
                await tx.airbnbLocationPrice.upsert({
                    where: {
                        locationId_checkin_checkout: {
                            locationId: record.id,
                            checkin: sync.checkin,
                            checkout: sync.checkout,
                        },
                    },
                    update: {
                        price,
                        qualifier:
                            location.pricingQuote.structuredStayDisplayPrice
                                .primaryLine.qualifier,
                    },
                    create: {
                        locationId: record.id,
                        checkin: sync.checkin,
                        checkout: sync.checkout,
                        price,
                        qualifier:
                            location.pricingQuote.structuredStayDisplayPrice
                                .primaryLine.qualifier,
                    },
                });
            }

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
};

export const createAirbnbSync = async (
    search: string,
    priceMax: number | undefined | null,
    dates: {
        checkin: Date;
        checkout: Date;
        flexible: string | null;
    },
    dimensions: { width: number; height: number },
    boundingBox: BoundingBox
): Promise<AirbnbLocationSync | null> => {
    const recentSync = await prisma.airbnbLocationSync.findFirst({
        where: {
            AND: [
                { search: search },
                { priceMax: priceMax },
                {
                    checkin: dates.checkin,
                    checkout: dates.checkout,
                    flexibleDate: dates.flexible,
                },
                {
                    createdAt: {
                        gte: new Date(Date.now() - 1000 * 60).toISOString(),
                    },
                },
                {
                    neLatitude: boundingBox.neLat,
                    neLongitude: boundingBox.neLng,
                    swLatitude: boundingBox.swLat,
                    swLongitude: boundingBox.swLng,
                },
                {
                    cursors: {
                        isEmpty: false,
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

    const apiKey = await scrapeAirbnbApiKey(search);

    let zoom = zoomLevel(
        boundingBox.neLat,
        boundingBox.neLng,
        boundingBox.swLat,
        boundingBox.swLng,
        { width: dimensions.width, height: dimensions.height }
    );

    if (zoom < 12) {
        zoom = 12;

        const { latitude, longitude } = getMidPoint(
            boundingBox.neLat,
            boundingBox.neLng,
            boundingBox.swLat,
            boundingBox.swLng
        );

        boundingBox = latLngToBounds(
            latitude,
            longitude,
            zoom,
            dimensions.width,
            dimensions.height
        );
    }

    const locationResults = await fetchAirbnbApi(
        apiKey,
        search,
        dates.checkin,
        dates.checkout,
        dates.flexible,
        priceMax,
        boundingBox.neLat,
        boundingBox.neLng,
        boundingBox.swLat,
        boundingBox.swLng,
        16
    );
    const cursors =
        locationResults.data.presentation.staysSearch.results.paginationInfo
            .pageCursors;

    const inserted = (
        await prisma.$queryRaw<[{ id: string }]>(
            Prisma.sql`
                INSERT INTO airbnb_location_sync (
                    id,
                    search,
                    "priceMax",
                    checkin,
                    checkout,
                    "flexibleDate",
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
                    ${priceMax},
                    ${dates.checkin},
                    ${dates.checkout},
                    ${dates.flexible},
                    ${apiKey},
                    ${cursors},
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

    const sync = await prisma.airbnbLocationSync.findUniqueOrThrow({
        where: {
            id: inserted?.id,
        },
        include: {
            pages: {
                include: {
                    locations: true,
                },
            },
        },
    });

    if (cursors.length > 0) {
        await createAirbnbPage(
            sync,
            cursors.at(0) as string,
            locationResults.data.presentation.staysSearch.results.searchResults
        );
    }

    return sync;
};

export const syncAirbnbPage = async (
    sync: AirbnbLocationSyncWithPages,
    page: number
): Promise<AirbnbLocationSyncPageWithLocations | null> => {
    const cursor = sync.cursors.at(page);
    if (!cursor) return null;

    const existing = sync.pages.find((p) => p.cursor === cursor);

    if (existing) {
        return existing;
    }

    const locationResults = await scrapeAirbnbLocations(sync, cursor);
    await createAirbnbPage(sync, cursor, locationResults);

    return prisma.airbnbLocationSyncPage.findFirstOrThrow({
        where: {
            syncId: sync.id,
            cursor,
        },
        include: {
            locations: {
                include: {
                    location: {
                        include: {
                            prices: {
                                where: {
                                    checkin: sync.checkin,
                                    checkout: sync.checkout,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};

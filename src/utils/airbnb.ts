import axios, { type AxiosResponse } from "axios";

import { prisma } from "~/server/db";

interface MapSearchResponse {
    data: {
        presentation: {
            explore: {
                sections: {
                    sectionIndependentData: {
                        staysMapSearch: {
                            mapSearchResults: Array<{
                                listing: {
                                    id: string;
                                    coordinate: {
                                        longitude: number;
                                        latitude: number;
                                    };
                                    name: string;
                                    avgRatingA11yLabel: string;
                                };
                            }>;
                        };
                    };
                };
            };
        };
    };
}

const headers = {
    "Content-Type": "text/html",
    "User-Agent": "curl/7.72.0",
};

const scrapeAirbnbApi = async (apiKey: string) => {
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
                    ],
                    rawParams: [
                        { filterName: "cdnCacheSafe", filterValues: ["false"] },
                        { filterName: "itemsPerGrid", filterValues: ["18"] },
                        {
                            filterName: "neLat",
                            filterValues: ["19.429199181849693"],
                        },
                        {
                            filterName: "neLng",
                            filterValues: ["-99.15389840993276"],
                        },
                        {
                            filterName: "query",
                            filterValues: ["Roma Norte mexico"],
                        },
                        {
                            filterName: "refinementPaths",
                            filterValues: ["/homes"],
                        },
                        { filterName: "screenSize", filterValues: ["large"] },
                        {
                            filterName: "swLat",
                            filterValues: ["19.406978102941135"],
                        },
                        {
                            filterName: "swLng",
                            filterValues: ["-99.16909159006713"],
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

    return res.data.data.presentation.explore.sections.sectionIndependentData
        .staysMapSearch.mapSearchResults;
};

export const syncAirbnbListings = async (location: string) => {
    const res: AxiosResponse<string> = await axios.get(
        `https://www.airbnb.com/s/${location.replace(/ /g, "+")}/homes`,
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

    if (!apiKey) return;

    const locationResults = await scrapeAirbnbApi(apiKey);

    await prisma.$transaction(async (tx) => {
        for (const location of locationResults) {
            await tx.airbnbLocation.upsert({
                where: {
                    airbnbId: location.listing.id,
                },
                update: {
                    name: location.listing.name,
                    rating: location.listing.avgRatingA11yLabel,
                    latitude: location.listing.coordinate.latitude,
                    longitude: location.listing.coordinate.longitude,
                },
                create: {
                    airbnbId: location.listing.id,
                    name: location.listing.name,
                    link: "https://airbnb.com/rooms/" + location.listing.id,
                    rating: location.listing.avgRatingA11yLabel,
                    latitude: location.listing.coordinate.latitude,
                    longitude: location.listing.coordinate.longitude,
                },
            });
        }
    });
};

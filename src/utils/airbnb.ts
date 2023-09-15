import axios, { type AxiosResponse } from "axios";

interface MapSearchResponse {
    data: {
        presentation: {
            explore: {
                sections: {
                    sectionIndependentData: {
                        staysMapSearch: {
                            mapSearchResults: {
                                id: string;
                                coordinate: {
                                    longitude: number;
                                    latitude: number;
                                };
                                name: string;
                                avgRatingA11yLabel: string;
                            };
                        };
                    };
                };
            };
        };
    };
}

const headers = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0",
};

const scrapeAirbnbApi = async (apiKey: string) => {
    const res: AxiosResponse<string> = await axios.post(
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
                            filterValues: ["15.532285409424183"],
                        },
                        {
                            filterName: "mapCellTokens",
                            filterValues: [
                                "85d1ff3b",
                                "85d1ff39",
                                "85d1ff31",
                                "85d1ff37",
                                "85d1ff3d",
                                "85d1ff25",
                                "85d1ff3f",
                                "85d1ff47",
                                "85d1ff2f",
                                "85d1ff23",
                                "85d1ff49",
                                "85d1ff41",
                                "85d1ff33",
                                "85d1ff35",
                                "85d1ff27",
                                "85d1ff17",
                                "85d1ff15",
                                "85d1ff2d",
                                "85d1ff4b",
                                "85d1ff29",
                                "85d1ff21",
                                "85d1ff45",
                                "85d1ff19",
                                "85d1ff4f",
                                "85d1ff6b",
                                "85d1ff43",
                                "85d1ff2b",
                                "85d1f8cb",
                                "85d1f8cd",
                                "85d1ff4d",
                                "85d1ff1f",
                                "85d1fed9",
                                "85d1f8b5",
                                "85d1ff11",
                                "85d1fedf",
                                "85d1fed7",
                                "85d1f8d3",
                                "85d1ff13",
                                "85d1ff5b",
                                "85d1ff69",
                                "85d1ff51",
                                "85d1ff1b",
                                "85d1ff5d",
                                "85d1ff6d",
                                "85d1fee1",
                                "85d1f8b3",
                                "85d1fed5",
                                "85d1ff53",
                                "85d1f8d5",
                                "85d1ff1d",
                                "85d1f8c9",
                                "85d1fedb",
                                "85d1f8cf",
                                "85d1ff67",
                                "85d1fedd",
                                "85d1ff6f",
                                "85d1fed1",
                                "85d1f8b7",
                                "85d1f8d1",
                                "85d1ff0f",
                                "85d1f8ad",
                                "85d1ff0d",
                                "85d1fee3",
                                "85d1f92b",
                                "85d1ff05",
                                "85d1fee7",
                                "85d1fed3",
                                "85d1f8b1",
                                "85d1ff73",
                                "85d1f8d7",
                                "85d1ff03",
                                "85d1ff65",
                                "85d1fee5",
                                "85d1ff71",
                                "85d1f8c7",
                                "85d1f8c5",
                                "85d1f8af",
                                "85d1f92d",
                                "85d1fefd",
                                "85d1f8b9",
                            ],
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

    console.log(res.data);
};

export const syncAirbnbListings = async (location: string) => {
    const res: AxiosResponse<string> = await axios.get(
        `https://www.airbnb.com/s/${location}/homes`,
        {
            headers: {
                ...headers,
                "Content-Type":
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            },
        }
    );

    const apiKey = res.data
        .split('"baseUrl":"/api","key":"')
        .at(1)
        ?.split('"},')
        .at(0);

    if (!apiKey) return;

    await scrapeAirbnbApi(apiKey);

    return;
};

import {
    Center,
    Flex,
    Loader,
    Pagination,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { IconDatabaseOff } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

import FilterBar, {
    FILTER_BAR_HEIGHT,
    type SearchFilters,
} from "~/components/FilterBar";
import { filtersToGeoString } from "~/components/FilterBar";
import HomeCard from "~/components/HomeCard";
import Layout from "~/components/Layout";
import { useQueryParams } from "~/hooks/useQueryParams";
import { type FindBasePage } from "~/types/next";
import { api } from "~/utils/api";
import { type BoundingBox } from "~/utils/geometry";

const Map = dynamic(() => import("~/components/Map"), {
    loading: () => (
        <Center style={{ flex: 1, width: "100%" }}>
            <Loader />
        </Center>
    ),
    ssr: false,
});
const Search: FindBasePage = () => {
    const [activePage, setPage] = useState(0);

    const [searchParams, setQueryParams] = useQueryParams();
    const [initialized, setInitialized] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({
        neighborhood: "",
        city: "",
        country: "",
        maxPrice: null,
    });
    const queryFilters: SearchFilters = Object.keys(filters)
        .filter(
            (key) =>
                !filters[key as keyof SearchFilters] &&
                searchParams.get(key)?.length
        )
        .reduce(
            (o, key) => Object.assign(o, { [key]: searchParams.get(key) }),
            filters
        );
    const search = filtersToString(filters);

    const [boundingBox, setBoundingBox] = useDebouncedState<BoundingBox | null>(
        null,
        100
    );
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const sync = api.home.createSync.useQuery(
        {
            search,
            dimensions: {
                width: mapContainerRef.current?.clientWidth as number,
                height: mapContainerRef.current?.clientHeight as number,
            },
            boundingBox,
        },
        {
            enabled: search.length > 3 && !!mapContainerRef.current,
            refetchOnWindowFocus: false,
            keepPreviousData: search.length > 3,
        }
    );

    const homes = api.home.getPage.useQuery(
        {
            syncId: sync.data?.id as string,
            cursor: sync.data?.cursors.at(activePage),
        },
        {
            enabled: sync.data?.id !== undefined,
            refetchOnWindowFocus: false,
            keepPreviousData: search.length > 3,
        }
    );

    const handleMove = (boundingBox: BoundingBox) => {
        if (homes.data && !homes.isFetching) {
            setBoundingBox(boundingBox);
        }
    };

    const handleSearch = (filters: SearchFilters) => {
        setBoundingBox(null);
        setQueryParams(filters);
        setFilters(filters);
    };

    useEffect(() => {
        if (initialized || !queryFilters) return;

        setFilters(queryFilters);
        setInitialized(true);
    }, [filters, queryFilters, initialized]);

    useEffect(() => {
        const timeout = setTimeout(
            () =>
                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                }),
            200
        );

        return () => clearTimeout(timeout);
    }, [activePage]);

    return (
        <>
            <Head>
                <title>FindBase</title>
                <meta name="description" content="Find the perfect stay." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout container={false}>
                <Flex columnGap="sm">
                    <Flex
                        direction="column"
                        align="start"
                        style={{
                            height: `calc(100vh - var(--mantine-spacing-sm) * 2)`,
                            flex: 1,
                            position: "sticky",
                            top: "var(--mantine-spacing-sm)",
                        }}
                        ref={mapContainerRef}
                    >
                        <FilterBar onChange={handleSearch} values={filters} />
                        {sync.isInitialLoading && (
                            <Center style={{ flex: 1, width: "100%" }}>
                                <Loader />
                            </Center>
                        )}
                        {sync.data && mapContainerRef.current && (
                            <Map
                                isLoading={sync.isFetching || homes.isFetching}
                                data={homes.data}
                                sync={sync.data}
                                map={{
                                    width: mapContainerRef.current.clientWidth,
                                    height: mapContainerRef.current
                                        .clientHeight,
                                }}
                                page={activePage}
                                onMove={handleMove}
                            />
                        )}
                        {search.length === 0 && (
                            <Center
                                style={{
                                    flex: 1,
                                    width: "100%",
                                    flexDirection: "column",
                                }}
                            >
                                <ThemeIcon
                                    variant="light"
                                    color="gray"
                                    size="xl"
                                >
                                    <IconDatabaseOff />
                                </ThemeIcon>
                                <Text mt="sm">No listings</Text>
                            </Center>
                        )}
                    </Flex>
                    <Flex
                        direction="column"
                        rowGap="sm"
                        my="md"
                        style={{
                            flexBasis: "60%",
                        }}
                    >
                        {!homes.isInitialLoading &&
                            homes.data?.locations.length === 0 && (
                                <Center
                                    style={{
                                        flex: 1,
                                        width: "100%",
                                        flexDirection: "column",
                                    }}
                                >
                                    <ThemeIcon
                                        variant="light"
                                        color="gray"
                                        size="xl"
                                    >
                                        <IconDatabaseOff />
                                    </ThemeIcon>
                                    <Text mt="sm">No listings</Text>
                                </Center>
                            )}
                        {homes.data?.locations.map((record) => (
                            <HomeCard key={record.id} home={record} />
                        ))}
                        {homes.isInitialLoading && (
                            <Center style={{ flex: 1, width: "100%" }}>
                                <Loader />
                            </Center>
                        )}
                        {sync.data && (
                            <Pagination
                                mt="auto"
                                value={activePage + 1}
                                onChange={(pos) => setPage(pos - 1)}
                                total={sync.data.cursors.length}
                            />
                        )}
                    </Flex>
                </Flex>
            </Layout>
        </>
    );
};

Search.authRequired = true;

export default Search;

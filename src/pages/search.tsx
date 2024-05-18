import {
    Alert,
    Center,
    Flex,
    Loader,
    Pagination,
    Pill,
    PillGroup,
    SegmentedControl,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { useDebouncedState, useMediaQuery } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconDatabaseOff, IconInfoCircle } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

import FilterBar, { type SearchFilters } from "~/components/FilterBar";
import HomeCard from "~/components/HomeCard";
import Layout from "~/components/Layout";
import { SIDE_BREAKPOINT } from "~/components/Side";
import { useQueryParams } from "~/hooks/useQueryParams";
import { type FindStayPage } from "~/types/next";
import { api } from "~/utils/api";
import { type BoundingBox } from "~/utils/geometry";

const Map = dynamic(() => import("~/components/HomeMap"), {
    loading: () => (
        <Center style={{ flex: 1, width: "100%" }}>
            <Loader />
        </Center>
    ),
    ssr: false,
});

const CONTROL = {
    LIST: "LIST",
    MAP: "MAP",
};

const Search: FindStayPage = () => {
    const utils = api.useContext();

    const isMobile = useMediaQuery(`(max-width: ${SIDE_BREAKPOINT}px)`);
    const [activePage, setPage] = useState(0);
    const [control, setControl] = useState<string>(CONTROL.LIST);

    const [searchParams, setQueryParams] = useQueryParams();
    const [initialized, setInitialized] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({
        location: "",
        maxPrice: null,
        poiMinRating: null,
        poiMinReviews: null,
    });

    const filterPills = Object.entries(filters)
        .filter(([_, value]) => value !== null && value !== "")
        .map(([key, value]) => (
            <Pill style={{ textTransform: "capitalize" }} key={key}>
                {key.replace(/([A-Z])/g, " $1").trim()}: {value}
            </Pill>
        ));

    const [boundingBox, setBoundingBox] = useDebouncedState<BoundingBox | null>(
        null,
        250
    );
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const sync = api.stay.createSync.useQuery(
        {
            params: {
                location: filters.location,
                stay: {
                    maxPrice: filters.maxPrice
                        ? parseInt(filters.maxPrice)
                        : null,
                },
                poi: {
                    minRating: filters.poiMinRating
                        ? parseFloat(filters.poiMinRating)
                        : null,
                    minReviews: filters.poiMinReviews
                        ? parseFloat(filters.poiMinReviews)
                        : null,
                },
            },
            dimensions: {
                width: mapContainerRef.current?.clientWidth as number,
                height: mapContainerRef.current?.clientHeight as number,
            },
            boundingBox,
        },
        {
            enabled: filters.location.length > 3 && !!mapContainerRef.current,
            refetchOnWindowFocus: false,
            keepPreviousData: filters.location.length > 3,
        }
    );

    const homes = api.stay.getPage.useQuery(
        {
            syncId: sync.data?.id as string,
            page: activePage,
        },
        {
            enabled: sync.data?.id !== undefined,
            refetchOnWindowFocus: false,
            keepPreviousData:
                filters.location.length > 3 && boundingBox !== null,
        }
    );

    const handleMove = (boundingBox: BoundingBox) => {
        if (homes.data && !homes.isFetching) {
            setBoundingBox(boundingBox);
        }
    };

    const handleSearch = (filters: SearchFilters) => {
        console.log(filters);
        setBoundingBox(null);
        setQueryParams(filters);
        setFilters(filters);

        void utils.stay.createSync.reset();
        void utils.stay.getPage.reset();
    };

    useEffect(() => {
        if (!sync.error) return;

        modals.closeAll();
        modals.openConfirmModal({
            title: "Error with search",
            children: (
                <Alert icon={<IconInfoCircle />}>{sync.error.message}</Alert>
            ),
            labels: { confirm: "Edit Filters", cancel: "Close" },
            onConfirm: () => document.getElementById("filter-bar")?.click(),
        });
    }, [sync.data, sync.error]);

    useEffect(() => {
        const isReady = Object.keys(filters).some((key) =>
            searchParams.has(key)
        );

        if (initialized || !isReady) return;

        const queryFilters: SearchFilters = Object.keys(filters)
            .filter(
                (key) =>
                    !filters[key as keyof SearchFilters] &&
                    searchParams.get(key)?.length
            )
            .reduce(
                (o, key) => Object.assign(o, { [key]: searchParams.get(key) }),
                structuredClone(filters)
            );

        setFilters(queryFilters);
        setInitialized(true);
    }, [filters, searchParams, initialized]);

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
                <title>FindStay</title>
                <meta name="description" content="Find the perfect stay." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout container={false}>
                {isMobile && (
                    <>
                        <FilterBar onChange={handleSearch} values={filters} />

                        {filterPills.length > 0 && (
                            <PillGroup mb="md">{filterPills}</PillGroup>
                        )}

                        {sync.data && (
                            <SegmentedControl
                                value={control}
                                onChange={setControl}
                                data={[
                                    { label: "List", value: CONTROL.LIST },
                                    { label: "Map", value: CONTROL.MAP },
                                ]}
                            />
                        )}
                    </>
                )}

                <Flex columnGap="sm">
                    <Flex
                        direction="column"
                        align="start"
                        display={
                            isMobile && control !== CONTROL.MAP
                                ? "none"
                                : "flex"
                        }
                        style={{
                            height: `calc(100vh - var(--mantine-spacing-sm) * 2)`,
                            flex: 1,
                            position: "sticky",
                            top: "var(--mantine-spacing-sm)",
                        }}
                        ref={mapContainerRef}
                    >
                        {!isMobile && (
                            <FilterBar
                                onChange={handleSearch}
                                values={filters}
                            />
                        )}

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
                                dimensions={{
                                    width: mapContainerRef.current.clientWidth,
                                    height: mapContainerRef.current
                                        .clientHeight,
                                }}
                                page={activePage}
                                onMove={handleMove}
                            />
                        )}
                        {(filters.location.length === 0 ||
                            (!sync.data && !sync.isInitialLoading)) && (
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
                        display={
                            isMobile && control !== CONTROL.LIST
                                ? "none"
                                : "flex"
                        }
                        style={{
                            flexBasis: isMobile ? "100%" : "60%",
                        }}
                    >
                        {!isMobile && filterPills.length > 0 && (
                            <PillGroup>{filterPills}</PillGroup>
                        )}
                        {!homes.isInitialLoading &&
                            homes.data?.stays.length === 0 && (
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
                        {homes.data?.stays.map((record) => (
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

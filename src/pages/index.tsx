import {
    Center,
    Flex,
    Loader,
    Pagination,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { useDebouncedState, useDebouncedValue } from "@mantine/hooks";
import { IconDatabaseOff } from "@tabler/icons-react";
import { type NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import FilterBar from "~/components/FilterBar";
import HomeCard from "~/components/HomeCard";
import Layout from "~/components/Layout";
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

const Home: NextPage = () => {
    const utils = api.useContext();
    const router = useRouter();
    const [activePage, setPage] = useState(0);
    const [search, setSearch] = useState((router.query.q as string) || "");
    const [debouncedSearch] = useDebouncedValue(search, 200);
    const [boundingBox, setBoundingBox] = useDebouncedState<BoundingBox | null>(
        null,
        100
    );
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const sync = api.home.createSync.useQuery(
        {
            search: debouncedSearch,
            boundingBox,
        },
        {
            enabled: debouncedSearch.length > 3,
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

    if (homes.isFetched && router.query.q !== search) {
        const url = new URL(window.location.href);
        url.searchParams.set("q", search);

        if (search.length === 0) {
            url.searchParams.delete("q");
        }

        window.history.replaceState(null, "", url);
    }

    if (search.length <= 3 && (sync.data || homes.data)) {
        void utils.home.createSync.reset();
        void utils.home.getPage.reset();
    }

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
                        <FilterBar search={search} setSearch={setSearch} />
                        {sync.isInitialLoading && (
                            <Center style={{ flex: 1, width: "100%" }}>
                                <Loader />
                            </Center>
                        )}
                        {sync.data && mapContainerRef.current && (
                            <Map
                                isLoading={sync.isFetching || homes.isFetching}
                                data={homes.data}
                                midpoint={sync.data.midpoint}
                                boundingBox={sync.data.boundingBox}
                                map={{
                                    width: mapContainerRef.current.clientWidth,
                                    height: mapContainerRef.current
                                        .clientHeight,
                                }}
                                page={activePage}
                                onMove={handleMove}
                            />
                        )}
                        {debouncedSearch.length === 0 && (
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

export default Home;

import {
    Center,
    Flex,
    Loader,
    Pagination,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconDatabaseOff } from "@tabler/icons-react";
import { type NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

import FilterBar from "~/components/FilterBar";
import HomeCard from "~/components/HomeCard";
import Layout from "~/components/Layout";
import { api } from "~/utils/api";

const Map = dynamic(() => import("~/components/Map"), {
    loading: () => (
        <Center style={{ flex: 1, width: "100%" }}>
            <Loader />
        </Center>
    ),
    ssr: false,
});

const Home: NextPage = () => {
    const [activePage, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebouncedValue(search, 200);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const sync = api.home.createSync.useQuery(
        {
            search: debouncedSearch,
        },
        {
            enabled: debouncedSearch.length > 3,
            refetchOnWindowFocus: false,
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
        }
    );

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
                        <FilterBar search={search} setSearch={setSearch} />
                        {sync.isInitialLoading && (
                            <Center style={{ flex: 1, width: "100%" }}>
                                <Loader />
                            </Center>
                        )}
                        {sync.data && (
                            <Map
                                data={homes.data}
                                midpoint={sync.data.midpoint}
                                page={activePage}
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

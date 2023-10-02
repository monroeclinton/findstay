import { Button, Center, Flex, Loader, Text, ThemeIcon } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconDatabaseOff } from "@tabler/icons-react";
import { type NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useState } from "react";

import FilterBar from "~/components/FilterBar";
import HomeCard from "~/components/HomeCard";
import Layout from "~/components/Layout";
import { api } from "~/utils/api";

const Map = dynamic(() => import("~/components/Map"), {
    loading: () => (
        <Center style={{ flex: 1 }}>
            <Loader />
        </Center>
    ),
    ssr: false,
});

const Home: NextPage = () => {
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebouncedValue(search, 200);

    const sync = api.home.createSync.useQuery(
        {
            search: debouncedSearch,
        },
        {
            enabled: search.length > 3,
        }
    );

    const homes = api.home.getAll.useInfiniteQuery(
        {
            syncId: sync.data?.id as string,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            enabled: sync.data?.id !== undefined,
            refetchOnWindowFocus: false,
        }
    );

    const activePage =
        sync.data?.cursors.indexOf(homes.data?.pages.at(-1)?.cusor as string) ||
        0;
    const page = homes.data?.pages.at(activePage);

    return (
        <>
            <Head>
                <title>FindBase</title>
                <meta name="description" content="Find the perfect stay." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout>
                <Flex columnGap="sm">
                    <Flex
                        direction="column"
                        align="start"
                        style={{
                            height: `calc(100vh)`,
                            flex: 1,
                            position: "sticky",
                            top: 0,
                        }}
                    >
                        <FilterBar search={search} setSearch={setSearch} />
                        {page && <Map data={page} page={activePage} />}
                        {(search.length === 0 ||
                            homes.data?.pages.length === 0) && (
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
                        {homes.data?.pages
                            ?.at(activePage)
                            ?.locations.map((record) => (
                                <HomeCard key={record.id} home={record} />
                            ))}
                        {homes.isFetching && (
                            <Center style={{ flex: 1 }}>
                                <Loader />
                            </Center>
                        )}
                        <Button onClick={() => void homes.fetchNextPage()}>
                            Next page
                        </Button>
                    </Flex>
                </Flex>
            </Layout>
        </>
    );
};

export default Home;

import {
    ActionIcon,
    Card,
    Center,
    Flex,
    Group,
    Image,
    Loader,
    SimpleGrid,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
    IconDatabaseOff,
    IconHeart,
    IconStarFilled,
} from "@tabler/icons-react";
import { type NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useState } from "react";

import FilterBar from "~/components/FilterBar";
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

    const homes = api.home.getAll.useQuery(
        {
            search: debouncedSearch,
        },
        {
            enabled: search.length > 3,
            refetchOnWindowFocus: false,
        }
    );

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
                        {homes.data && <Map data={homes.data} />}
                    </Flex>
                    <Flex
                        direction="column"
                        rowGap="sm"
                        my="md"
                        style={{
                            flexBasis: "60%",
                        }}
                    >
                        {(search.length === 0 ||
                            homes.data?.locations.length === 0) && (
                            <Center
                                style={{ flex: 1, flexDirection: "column" }}
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
                            <Card withBorder px="lg" py="xl" key={record.id}>
                                <ActionIcon
                                    size="lg"
                                    variant="light"
                                    color="pink"
                                    style={{
                                        position: "absolute",
                                        marginTop: "4px",
                                        marginLeft: "4px",
                                    }}
                                >
                                    <IconHeart />
                                </ActionIcon>
                                {record.images.length > 0 && (
                                    <Card.Section inheritPadding>
                                        <SimpleGrid cols={3}>
                                            {record.images
                                                .slice(0, 3)
                                                .map((image) => (
                                                    <Image
                                                        alt="Airbnb image"
                                                        h={200}
                                                        src={image}
                                                        key={image}
                                                        radius="sm"
                                                    />
                                                ))}
                                        </SimpleGrid>
                                    </Card.Section>
                                )}
                                <Card.Section inheritPadding mt="md">
                                    <Group justify="space-between">
                                        <Flex direction="column">
                                            <Flex align="center">
                                                <ThemeIcon
                                                    size="xs"
                                                    color="yellow"
                                                    variant="light"
                                                >
                                                    <IconStarFilled />
                                                </ThemeIcon>
                                                <Text
                                                    fw={600}
                                                    size="sm"
                                                    c="gray"
                                                    style={{
                                                        marginLeft: "6px",
                                                    }}
                                                >
                                                    {record.ratings
                                                        .split("out of 5")
                                                        .at(0)}
                                                </Text>
                                            </Flex>
                                            <Text fw={600} c="green" mt="xs">
                                                ${record.price} / night
                                            </Text>
                                        </Flex>
                                        <Text fw={500}>{record.name}</Text>
                                    </Group>
                                </Card.Section>
                                <Card.Section inheritPadding mt="md">
                                    <Text
                                        c="dimmed"
                                        size="xs"
                                        tt="uppercase"
                                        fw={700}
                                    >
                                        Supermarket
                                    </Text>
                                    <Text fw={400} size="xl">
                                        {record.supermarket} meters
                                    </Text>
                                </Card.Section>
                            </Card>
                        ))}
                        {homes.isFetching && (
                            <Center style={{ flex: 1 }}>
                                <Loader />
                            </Center>
                        )}
                    </Flex>
                </Flex>
            </Layout>
        </>
    );
};

export default Home;

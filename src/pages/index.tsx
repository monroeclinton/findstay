import {
    Badge,
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
import { IconDatabaseOff } from "@tabler/icons-react";
import { type NextPage } from "next";
import Head from "next/head";
import TileLayer from "ol/layer/Tile";
import Map from "ol/Map";
import { fromLonLat } from "ol/proj";
import XYZ from "ol/source/XYZ";
import View from "ol/View";
import { useEffect, useRef, useState } from "react";

import FilterBar, { FILTER_BAR_HEIGHT } from "~/components/FilterBar";
import Layout from "~/components/Layout";
import { api } from "~/utils/api";

const Home: NextPage = () => {
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebouncedValue(search, 200);
    const map = useRef<null | Map>(null);

    const homes = api.home.getAll.useQuery(
        {
            search: debouncedSearch,
        },
        {
            enabled: search.length > 3,
        }
    );

    useEffect(() => {
        if (map.current || !homes.isFetched) return;

        map.current = new Map({
            target: "map",
            layers: [
                new TileLayer({
                    source: new XYZ({
                        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                    }),
                }),
            ],
            view: new View({
                center: fromLonLat([
                    homes.data?.midpoint.longitude || 0,
                    homes.data?.midpoint.latitude || 0,
                ]),
                zoom: 16,
            }),
        });
    }, [homes.data, homes.isFetched]);

    return (
        <>
            <Head>
                <title>FindBase</title>
                <meta name="description" content="Find the perfect stay." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout>
                <FilterBar search={search} setSearch={setSearch} />
                <Flex columnGap="sm">
                    <Flex
                        direction="column"
                        rowGap="sm"
                        mb="sm"
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
                                <Card.Section inheritPadding>
                                    <Group justify="space-between">
                                        <Text fw={500}>{record.name}</Text>
                                        <Badge color="pink" variant="light">
                                            {record.ratings}
                                        </Badge>
                                    </Group>
                                </Card.Section>
                                {record.images.length > 0 && (
                                    <Card.Section inheritPadding mt="md">
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
                    <Flex
                        align="start"
                        style={{
                            height: `calc(100vh - ${FILTER_BAR_HEIGHT})`,
                            flex: 1,
                            position: "sticky",
                            top: FILTER_BAR_HEIGHT,
                        }}
                        id="map"
                    />
                </Flex>
            </Layout>
        </>
    );
};

export default Home;

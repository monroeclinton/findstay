import { SimpleGrid, TextInput, Title } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { DataTable } from "mantine-datatable";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import TileLayer from "ol/layer/Tile";
import Map from "ol/Map";
import { fromLonLat } from "ol/proj";
import XYZ from "ol/source/XYZ";
import View from "ol/View";
import { useEffect, useRef, useState } from "react";

import Layout from "~/components/Layout";
import { api } from "~/utils/api";

const Home: NextPage = () => {
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebouncedValue(search, 200);
    const map = useRef<null | Map>(null);

    const homes = api.home.getAll.useQuery(
        {
            search,
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
                <SimpleGrid cols={2} mb="sm">
                    <Title order={1}>Homes</Title>
                </SimpleGrid>
                <SimpleGrid cols={2} mb="sm">
                    <TextInput
                        label="Location"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.currentTarget.value)
                        }
                    />
                </SimpleGrid>
                <SimpleGrid cols={2} h="100%">
                    <DataTable
                        highlightOnHover
                        columns={[
                            {
                                accessor: "name",
                            },
                            {
                                accessor: "ratings",
                            },
                            {
                                accessor: "supermarket",
                                render: (record) =>
                                    record.supermarket.toString() + " meters",
                            },
                            {
                                accessor: "link",
                                render: (record) => (
                                    <Link href={record.link}>
                                        View on Airbnb
                                    </Link>
                                ),
                            },
                        ]}
                        fetching={
                            debouncedSearch.length > 3 && !homes.isFetched
                        }
                        records={homes.data?.locations}
                    />
                    <div id="map" />
                </SimpleGrid>
            </Layout>
        </>
    );
};

export default Home;

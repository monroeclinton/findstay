import { SimpleGrid, TextInput, Title } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

import Layout from "~/components/Layout";
import { api } from "~/utils/api";

const Home: NextPage = () => {
    const [search, setSearch] = useState("");

    const homes = api.home.getAll.useQuery(
        {
            search,
        },
        {
            enabled: search.length > 3,
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
                                <Link href={record.link}>View on Airbnb</Link>
                            ),
                        },
                    ]}
                    fetching={search.length > 3 && !homes.isFetched}
                    records={homes.data?.locations}
                />
            </Layout>
        </>
    );
};

export default Home;

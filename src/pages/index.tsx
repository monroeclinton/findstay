import { SimpleGrid, Title } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import Layout from "~/components/Layout";
import { api } from "~/utils/api";

const Home: NextPage = () => {
    const homes = api.home.getAll.useQuery();

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
                    fetching={!homes.isFetched}
                    records={homes.data?.locations}
                />
            </Layout>
        </>
    );
};

export default Home;

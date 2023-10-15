import {
    Center,
    Loader,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { IconDatabaseOff } from "@tabler/icons-react";
import { type NextPage } from "next";
import Head from "next/head";
import { useEffect } from "react";

import FilterBar from "~/components/FilterBar";
import HomeCard from "~/components/HomeCard";
import Layout from "~/components/Layout";
import { api } from "~/utils/api";

const Home: NextPage = () => {
    const homes = api.favorite.getAll.useQuery();

    return (
        <>
            <Head>
                <title>FindBase - Favorites</title>
                <meta name="description" content="Find the perfect stay." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout>
                {homes.data?.length === 0 && (
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
                        <Text mt="sm">No Favorites</Text>
                    </Center>
                )}
                {homes.data?.map((record) => (
                    <HomeCard key={record.id} home={record} mb="sm" />
                ))}
                {homes.isInitialLoading && (
                    <Center style={{ flex: 1 }}>
                        <Loader />
                    </Center>
                )}
            </Layout>
        </>
    );
};

export default Home;

import {
    Center,
    Loader,
    Select,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { IconDatabaseOff } from "@tabler/icons-react";
import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";

import HomeCard from "~/components/HomeCard";
import Layout from "~/components/Layout";
import { api } from "~/utils/api";

const Home: NextPage = () => {
    const [folder, setFolder] = useState<string | null>(null);
    const folders = api.favorite.getFolders.useQuery();
    const homes = api.favorite.getAll.useQuery({
        folderId: folder,
    });

    return (
        <>
            <Head>
                <title>FindBase - Favorites</title>
                <meta name="description" content="Find the perfect stay." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout>
                <Title order={2} mb="sm">Favorites</Title>
                <Select
                placeholder="Folder"
                mb="md"
                value={folder}
                onChange={setFolder}
                data={folders.data?.map(folder => ({ value: folder.id, label: folder.name })) || []}
                clearable />
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

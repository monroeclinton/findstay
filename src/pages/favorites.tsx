import {
    Button,
    Center,
    Flex,
    Loader,
    Select,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconDatabaseOff } from "@tabler/icons-react";
import Head from "next/head";
import { useState } from "react";

import HomeCard from "~/components/HomeCard";
import Layout from "~/components/Layout";
import { type FindStayPage } from "~/types/next";
import { api } from "~/utils/api";

const Favorites: FindStayPage = () => {
    const [folder, setFolder] = useState<string | null>(null);
    const folders = api.favorite.getFolders.useQuery();
    const homes = api.favorite.getAll.useQuery({
        folderId: folder,
    });
    const deleteFolder = api.favorite.deleteFolder.useMutation({
        onSuccess: async () => {
            setFolder(null);
            await folders.refetch();
            await homes.refetch();
        },
    });

    const confirmDelete = () =>
        modals.openConfirmModal({
            title: "Confirm deletion",
            children: (
                <Text size="sm">
                    This will delete{" "}
                    {folders.data?.find((f) => f.id === folder)?.name} and your
                    favorites in it.
                </Text>
            ),
            labels: { confirm: "Confirm", cancel: "Cancel" },
            onConfirm: () => folder && deleteFolder.mutate({ id: folder }),
        });

    return (
        <>
            <Head>
                <title>FindStay - Favorites</title>
                <meta name="description" content="Find the perfect stay." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Layout>
                <Title order={2} mb="sm">
                    Favorites
                </Title>
                <Flex>
                    <Select
                        style={{ flexGrow: 1 }}
                        placeholder="Folder"
                        mb="md"
                        value={folder}
                        onChange={setFolder}
                        data={
                            folders.data?.map((folder) => ({
                                value: folder.id,
                                label: folder.name,
                            })) || []
                        }
                        clearable
                    />
                    {folder && (
                        <Button onClick={confirmDelete} ml="md">
                            Delete
                        </Button>
                    )}
                </Flex>
                {homes.data?.length === 0 && (
                    <Center
                        style={{
                            flex: 1,
                            width: "100%",
                            flexDirection: "column",
                        }}
                    >
                        <ThemeIcon variant="light" color="gray" size="xl">
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

Favorites.authRequired = true;

export default Favorites;

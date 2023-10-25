import {
    ActionIcon,
    Card,
    type CardProps,
    Center,
    Divider,
    Flex,
    Group,
    Image,
    Loader,
    Select,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
    IconHeart,
    IconHeartFilled,
    IconPlus,
    IconStarFilled,
} from "@tabler/icons-react";
import type { inferRouterOutputs } from "@trpc/server";
import { useEffect, useRef, useState } from "react";

import { type AppRouter } from "~/server/api/root";
import { api } from "~/utils/api";

type RouterOutput = inferRouterOutputs<AppRouter>;

interface IHomeCardProps extends CardProps {
    home: RouterOutput["home"]["getPage"]["locations"][0];
}

const FolderSelect = ({ onChange }: { onChange: (_: string) => void }) => {
    const utils = api.useContext();
    const folders = api.favorite.getFolders.useQuery();
    const [folderName, setFolderName] = useState<string>("");
    const createFolder = api.favorite.createFolder.useMutation({
        onSuccess: () => {
            setFolderName("");
            utils.favorite.getFolders.refetch();
        },
    });

    useEffect(() => {
        const defaultFolder = folders.data?.at(0)?.id;
        if (defaultFolder) onChange(defaultFolder);
    }, [folders.data]);

    return (
        <>
            {!folders.data && (
                <Center>
                    <Loader />
                </Center>
            )}

            {folders.data && (
                <Select
                    placeholder="Pick folder"
                    defaultValue={folders.data.at(0)?.id || null}
                    data={folders.data.map((folder) => ({
                        value: folder.id,
                        label: folder.name,
                    }))}
                    allowDeselect={false}
                    onChange={onChange}
                />
            )}

            <Divider my="sm" />

            <Stack>
                <TextInput
                    value={folderName}
                    onChange={(event) =>
                        setFolderName(event.currentTarget.value)
                    }
                    placeholder="Folder name"
                    rightSection={
                        <ActionIcon
                            disabled={folderName.length === 0}
                            onClick={() =>
                                createFolder.mutate({ name: folderName })
                            }
                        >
                            <IconPlus />
                        </ActionIcon>
                    }
                />
            </Stack>
        </>
    );
};

const HomeCard = ({ home, ...props }: IHomeCardProps) => {
    const utils = api.useContext();
    const folderRef = useRef<string>();

    const deleteFavorite = api.favorite.delete.useMutation({
        onSuccess: async () => {
            await utils.home.getPage.invalidate();
        },
    });

    const createFavorite = api.favorite.create.useMutation({
        onSuccess: async () => {
            await utils.home.getPage.invalidate();
            folderRef.current = undefined;
        },
    });

    const favoriteModal = () =>
        modals.openConfirmModal({
            title: "Save to folder",
            children: (
                <FolderSelect
                    onChange={(value) => (folderRef.current = value)}
                />
            ),
            labels: {
                confirm: "Save",
                cancel: "Cancel",
            },
            onCancel: () => (folderRef.current = undefined),
            onConfirm: () =>
                folderRef.current &&
                createFavorite.mutate({
                    locationId: home.id,
                    folderId: folderRef.current,
                }),
        });

    const handleFavorite = () => {
        if (home.isFavorited) {
            deleteFavorite.mutate({
                locationId: home.id,
            });
        } else {
            favoriteModal();
        }
    };

    return (
        <Card withBorder px="lg" py="xl" key={home.id} {...props}>
            <ActionIcon
                onClick={handleFavorite}
                size="lg"
                variant="white"
                color="pink"
                style={{
                    position: "absolute",
                    marginTop: "4px",
                    marginLeft: "4px",
                }}
            >
                {!home.isFavorited && <IconHeart />}
                {home.isFavorited && <IconHeartFilled />}
            </ActionIcon>
            {home.images.length > 0 && (
                <Card.Section inheritPadding>
                    <SimpleGrid cols={3}>
                        {home.images.slice(0, 3).map((image) => (
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
                            <ThemeIcon size="xs" color="yellow" variant="light">
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
                                {home.ratings.split("out of 5").at(0)}
                            </Text>
                        </Flex>
                        <Text fw={600} c="green" mt="xs">
                            ${home.price} / night
                        </Text>
                    </Flex>
                    <Text fw={500}>{home.name}</Text>
                </Group>
            </Card.Section>
            <Card.Section inheritPadding mt="md">
                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    Supermarket
                </Text>
                <Text fw={400} size="xl">
                    {home.supermarket} meters
                </Text>
            </Card.Section>
        </Card>
    );
};

export default HomeCard;

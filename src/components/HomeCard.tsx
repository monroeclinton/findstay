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
import Link from "next/link";
import { type MouseEvent, useEffect, useRef, useState } from "react";

import { type AppRouter } from "~/server/api/root";
import { api } from "~/utils/api";
import { getDistanceFromLatLonInKm } from "~/utils/geometry";

import classes from "./HomeCard.module.css";

type RouterOutput = inferRouterOutputs<AppRouter>;

interface IHomeCardProps extends CardProps {
    home: RouterOutput["stay"]["getPage"]["stays"][0];
    interests: RouterOutput["stay"]["createSync"]["poi"];
}

const FolderSelect = ({ onChange }: { onChange: (_: string) => void }) => {
    const utils = api.useContext();
    const folders = api.favorite.getFolders.useQuery();
    const [folderName, setFolderName] = useState<string>("");
    const createFolder = api.favorite.createFolder.useMutation({
        onSuccess: () => {
            setFolderName("");
            void utils.favorite.getFolders.refetch();
        },
    });

    useEffect(() => {
        const defaultFolder = folders.data?.at(0)?.id;
        if (defaultFolder) onChange(defaultFolder);
    }, [folders.data, onChange]);

    return (
        <>
            {!folders.data && (
                <Center>
                    <Loader />
                </Center>
            )}

            {folders.data?.at(0) !== undefined && (
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
                    placeholder="New folder name"
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

const HomeCard = ({ home, interests, ...props }: IHomeCardProps) => {
    const utils = api.useContext();
    const folderRef = useRef<string>();

    const deleteFavorite = api.favorite.delete.useMutation({
        onSuccess: async () => {
            await utils.favorite.getAll.invalidate();
            await utils.stay.getPage.invalidate();
        },
    });

    const createFavorite = api.favorite.create.useMutation({
        onSuccess: async () => {
            await utils.stay.getPage.invalidate();
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

    const handleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        if (home.isFavorited) {
            deleteFavorite.mutate({
                locationId: home.id,
            });
        } else {
            favoriteModal();
        }
    };

    const handleInterestClick = (interest: string) => {
        modals.open({
            title: (
                <Text style={{ textTransform: "capitalize" }}>
                    {interest}s near by
                </Text>
            ),
            children: interests
                .filter((i) => i.type === interest)
                .sort((i) =>
                    getDistanceFromLatLonInKm(
                        i.latitude,
                        i.longitude,
                        home.latitude,
                        home.longitude
                    )
                )
                .map((i) => (
                    <Link
                        key={i.id}
                        href={i.link}
                        target="_blank"
                        className={classes.cardLink}
                    >
                        <Card
                            withBorder
                            mb="md"
                            className={classes.interestCard}
                        >
                            <Text>{i.name}</Text>

                            <Flex justify="space-between">
                                <Flex align="center" mt="xs">
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
                                        {i.stars}
                                    </Text>
                                </Flex>
                                <Text mt="xs">{i.reviews} reviews</Text>
                            </Flex>
                        </Card>
                    </Link>
                )),
        });
    };

    return (
        <Card
            withBorder
            px="lg"
            py="xl"
            key={home.id}
            className={classes.card}
            onClick={() => window.open(home.link)}
            {...props}
        >
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
                                {home.ratingLocalized}
                            </Text>
                        </Flex>
                        <Text fw={600} c="green" mt="xs">
                            {home.price
                                ? `$${home.price.price.toLocaleString()} / ${
                                      home.price.qualifier
                                  }`
                                : null}
                        </Text>
                    </Flex>
                    <Text fw={500}>{home.name}</Text>
                </Group>
            </Card.Section>
            <Card.Section inheritPadding mt="md">
                <Flex
                    gap="sm"
                    style={{
                        marginLeft: "calc(-1 * var(--mantine-spacing-xs))",
                    }}
                >
                    {home.interests.map((interest) => (
                        <div
                            className={classes.interest}
                            onClick={(event: React.MouseEvent) => {
                                event.stopPropagation();
                                handleInterestClick(interest.interest);
                            }}
                            key={interest.interest}
                        >
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                                {interest.interest}
                            </Text>
                            <Text fw={400} size="xl">
                                {interest.distance}{" "}
                                {interest.distance ? "meters" : "None"}
                            </Text>
                        </div>
                    ))}
                </Flex>
            </Card.Section>
        </Card>
    );
};

export default HomeCard;

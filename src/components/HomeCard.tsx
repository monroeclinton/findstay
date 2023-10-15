import {
    ActionIcon,
    Card,
    CardProps,
    Flex,
    Group,
    Image,
    SimpleGrid,
    Text,
    ThemeIcon,
} from "@mantine/core";
import {
    IconHeart,
    IconHeartFilled,
    IconStarFilled,
} from "@tabler/icons-react";
import type { inferRouterOutputs } from "@trpc/server";

import { type AppRouter } from "~/server/api/root";
import { api } from "~/utils/api";

type RouterOutput = inferRouterOutputs<AppRouter>;

interface IHomeCardProps extends CardProps {
    home: RouterOutput["home"]["getPage"]["locations"][0];
}

const HomeCard = ({ home, ...props }: IHomeCardProps) => {
    const utils = api.useContext();

    const deleteFavorite = api.favorite.delete.useMutation({
        onSuccess: async () => {
            await utils.home.getPage.refetch();
        },
    });

    const createFavorite = api.favorite.create.useMutation({
        onSuccess: async () => {
            await utils.home.getPage.refetch();
        },
    });

    const handleFavorite = () => {
        if (home.isFavorited) {
            deleteFavorite.mutate({
                locationId: home.id,
            });
        } else {
            createFavorite.mutate({
                locationId: home.id,
            });
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

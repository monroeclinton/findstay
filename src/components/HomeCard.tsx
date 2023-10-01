import {
    ActionIcon,
    Card,
    Flex,
    Group,
    Image,
    SimpleGrid,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { IconHeart, IconStarFilled } from "@tabler/icons-react";
import type { inferRouterOutputs } from "@trpc/server";

import { type AppRouter } from "~/server/api/root";

type RouterOutput = inferRouterOutputs<AppRouter>;

interface IHomeCardProps {
    home: RouterOutput["home"]["getAll"]["locations"][0];
}

const HomeCard = ({ home }: IHomeCardProps) => {
    return (
        <Card withBorder px="lg" py="xl" key={home.id}>
            <ActionIcon
                size="lg"
                variant="light"
                color="pink"
                style={{
                    position: "absolute",
                    marginTop: "4px",
                    marginLeft: "4px",
                }}
            >
                <IconHeart />
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

import { Badge, Card, Flex, Image, Text, ThemeIcon } from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import type { inferRouterOutputs } from "@trpc/server";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { useState } from "react";
import { RFeature, RLayerVector, RMap, ROSM, ROverlay } from "rlayers";

import { type AppRouter } from "~/server/api/root";

type RouterOutput = inferRouterOutputs<AppRouter>;

interface IMapProps {
    data: RouterOutput["home"]["getAll"];
}

const Map = ({ data }: IMapProps) => {
    const [selected, setSelected] = useState<null | string>(null);

    return (
        <RMap
            width="100%"
            height="100%"
            initial={{
                center: fromLonLat([
                    data.midpoint.longitude || 0,
                    data.midpoint.latitude || 0,
                ]),
                zoom: 16,
            }}
            onClick={() => setSelected(null)}
        >
            <ROSM />
            <RLayerVector zIndex={100}>
                {data.locations.map((record) => (
                    <RFeature
                        key={record.id}
                        geometry={
                            new Point(
                                fromLonLat([record.longitude, record.latitude])
                            )
                        }
                    >
                        <ROverlay
                            positioning="top-center"
                            offset={[0, 15]}
                            key={record.id}
                        >
                            {selected === record.id && (
                                <Card w={300} withBorder>
                                    <Card.Section mb="md">
                                        <Image
                                            height={200}
                                            width="100%"
                                            src={record.images.at(0)}
                                            alt="Airbnb image"
                                        />
                                    </Card.Section>

                                    <Text fw={500} lineClamp={1}>
                                        {record.name}
                                    </Text>

                                    <Flex justify="space-between">
                                        <Flex align="center">
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
                                                {record.ratings
                                                    .split("out of 5")
                                                    .at(0)}
                                            </Text>
                                        </Flex>
                                        <Text fw={600} c="green" mt="xs">
                                            ${record.price} / night
                                        </Text>
                                    </Flex>
                                </Card>
                            )}
                        </ROverlay>
                    </RFeature>
                ))}
            </RLayerVector>
            <RLayerVector>
                {data.locations.map((record) => (
                    <RFeature
                        key={record.id}
                        geometry={
                            new Point(
                                fromLonLat([record.longitude, record.latitude])
                            )
                        }
                    >
                        <ROverlay positioning="center-center">
                            <Badge
                                style={{
                                    userSelect: "none",
                                    cursor: "pointer",
                                }}
                                color={
                                    selected === record.id ? "black" : "pink"
                                }
                                onClick={() => {
                                    setSelected(record.id);
                                }}
                            >
                                ${record.price}
                            </Badge>
                        </ROverlay>
                    </RFeature>
                ))}
            </RLayerVector>
        </RMap>
    );
};

export default Map;

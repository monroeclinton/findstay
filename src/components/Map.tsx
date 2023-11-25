import {
    Badge,
    Card,
    Center,
    Flex,
    Image,
    Loader,
    Text,
    ThemeIcon,
    Transition,
} from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import type { inferRouterOutputs } from "@trpc/server";
import classNames from "classnames";
import Link from "next/link";
import { type MapBrowserEvent } from "ol";
import { Point } from "ol/geom";
import { fromLonLat, transformExtent } from "ol/proj";
import { useCallback, useEffect, useState } from "react";
import {
    RControl,
    RFeature,
    RLayerVector,
    RMap,
    ROSM,
    ROverlay,
} from "rlayers";
import type { RView } from "rlayers/RMap";

import { type AppRouter } from "~/server/api/root";
import {
    type BoundingBox,
    boundingBoxEqual,
    zoomLevel,
} from "~/utils/geometry";
import round from "~/utils/round";

import classes from "./Map.module.css";

type RouterOutput = inferRouterOutputs<AppRouter>;

interface IMapProps {
    isLoading: boolean;
    data: RouterOutput["home"]["getPage"] | undefined;
    sync: RouterOutput["home"]["createSync"];
    map: {
        width: number;
        height: number;
    };
    page: number;
    onMove: (_: BoundingBox) => void;
}

const Map = ({ isLoading, data, sync, map, page, onMove }: IMapProps) => {
    const [selected, setSelected] = useState<null | string>(null);
    const [viewed, setViewed] = useState<Array<string>>([]);
    const [view, setView] = useState<RView>({
        center: fromLonLat([sync.midpoint.longitude, sync.midpoint.latitude]),
        zoom: zoomLevel(
            sync.boundingBox.neLat,
            sync.boundingBox.neLng,
            sync.boundingBox.swLat,
            sync.boundingBox.swLng,
            map
        ),
    });

    const handleMove = useCallback(
        (e: MapBrowserEvent<UIEvent>) => {
            const extent = transformExtent(
                e.map.getView().calculateExtent(e.map.getSize()),
                e.map.getView().getProjection(),
                "EPSG:4326"
            );

            const neLat = extent[3];
            const neLng = extent[2];
            const swLat = extent[1];
            const swLng = extent[0];

            if (neLat && neLng && swLat && swLng) {
                const newBoundingBox = {
                    neLat: round(neLat, 5),
                    neLng: round(neLng, 5),
                    swLat: round(swLat, 5),
                    swLng: round(swLng, 5),
                };

                if (!boundingBoxEqual(newBoundingBox, sync.boundingBox)) {
                    onMove(newBoundingBox);
                }
            }
        },
        [onMove, sync.boundingBox]
    );

    useEffect(() => {
        if (!sync.clientBoundingBox) {
            setView({
                center: fromLonLat([
                    sync.midpoint.longitude,
                    sync.midpoint.latitude,
                ]),
                zoom: zoomLevel(
                    sync.boundingBox.neLat,
                    sync.boundingBox.neLng,
                    sync.boundingBox.swLat,
                    sync.boundingBox.swLng,
                    map
                ),
            });
        }
    }, [sync.clientBoundingBox, sync.boundingBox, sync.midpoint, map]);

    return (
        <RMap
            width="100%"
            height="100%"
            initial={view}
            view={[view, setView]}
            onMoveEnd={handleMove}
            onClick={() => setSelected(null)}
        >
            <ROSM />
            {data && (
                <div>
                    <RLayerVector zIndex={100}>
                        {data.locations.map((record) => (
                            <RFeature
                                key={record.id}
                                geometry={
                                    new Point(
                                        fromLonLat([
                                            record.longitude,
                                            record.latitude,
                                        ])
                                    )
                                }
                            >
                                <ROverlay
                                    positioning="top-center"
                                    offset={[0, 15]}
                                    key={record.id + "-card-" + page.toString()}
                                >
                                    <Transition
                                        mounted={selected === record.id}
                                        transition="fade"
                                        duration={100}
                                        timingFunction="ease"
                                    >
                                        {(styles) => (
                                            <Link
                                                href={record.link}
                                                target="_blank"
                                                style={styles}
                                                className={classes.cardLink}
                                            >
                                                <Card
                                                    w={300}
                                                    withBorder
                                                    className={classes.card}
                                                >
                                                    <Card.Section mb="sm">
                                                        <Image
                                                            height={200}
                                                            width="100%"
                                                            src={record.images.at(
                                                                0
                                                            )}
                                                            alt="Airbnb image"
                                                        />
                                                    </Card.Section>
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
                                                                    marginLeft:
                                                                        "6px",
                                                                }}
                                                            >
                                                                {record.ratings
                                                                    .split(
                                                                        "out of 5"
                                                                    )
                                                                    .at(0)}
                                                            </Text>
                                                        </Flex>
                                                        <Text
                                                            fw={600}
                                                            c="green"
                                                            mt="xs"
                                                        >
                                                            ${record.price} /
                                                            night
                                                        </Text>
                                                    </Flex>
                                                </Card>
                                            </Link>
                                        )}
                                    </Transition>
                                </ROverlay>
                            </RFeature>
                        ))}
                    </RLayerVector>
                    <RLayerVector>
                        {data.locations.map((record) => (
                            <RFeature
                                key={record.id + "-badge-" + page.toString()}
                                geometry={
                                    new Point(
                                        fromLonLat([
                                            record.longitude,
                                            record.latitude,
                                        ])
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
                                            selected === record.id
                                                ? "black"
                                                : viewed.includes(record.id)
                                                ? "gray"
                                                : "indigo"
                                        }
                                        onClick={() => {
                                            setSelected(record.id);
                                            setViewed([record.id, ...viewed]);
                                        }}
                                    >
                                        ${record.price}
                                    </Badge>
                                </ROverlay>
                            </RFeature>
                        ))}
                    </RLayerVector>
                    <RControl.RCustom
                        key="ol-loader"
                        className={classNames(classes.olSpinner, {
                            [classes.olHidden as string]: !isLoading,
                        })}
                    >
                        <Center>
                            <Loader />
                        </Center>
                    </RControl.RCustom>
                </div>
            )}
        </RMap>
    );
};

export default Map;

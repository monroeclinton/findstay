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
import { Point } from "ol/geom";
import { fromLonLat, transformExtent } from "ol/proj";
import { useEffect, useState } from "react";
import {
    RControl,
    RFeature,
    RLayerVector,
    RMap,
    ROSM,
    ROverlay,
    type RView,
} from "rlayers";

import { type AppRouter } from "~/server/api/root";
import {
    type BoundingBox,
    boundingBoxEqual,
    zoomLevel,
} from "~/utils/geometry";

import classes from "./Map.module.css";

type RouterOutput = inferRouterOutputs<AppRouter>;

interface IMapProps {
    isLoading: boolean;
    data: RouterOutput["home"]["getPage"] | undefined;
    midpoint: {
        latitude: number;
        longitude: number;
    };
    boundingBox: BoundingBox;
    map: {
        width: number;
        height: number;
    };
    page: number;
    onMove: (_: BoundingBox) => void;
}

const Map = ({
    isLoading,
    data,
    midpoint,
    boundingBox,
    map,
    page,
    onMove,
}: IMapProps) => {
    const [selected, setSelected] = useState<null | string>(null);
    const [viewed, setViewed] = useState<Array<string>>([]);
    const [view, setView] = useState<RView>({
        center: fromLonLat([midpoint.longitude, midpoint.latitude]),
        zoom: zoomLevel(
            boundingBox.neLat,
            boundingBox.neLng,
            boundingBox.swLat,
            boundingBox.swLng,
            map
        ),
    });

    const handleMove = (rmap: RMap) => {
        const extent = transformExtent(
            rmap.map.getView().calculateExtent(rmap.map.getSize()),
            rmap.map.getView().getProjection(),
            "EPSG:4326"
        );

        const neLat = extent[3];
        const neLng = extent[2];
        const swLat = extent[1];
        const swLng = extent[0];

        const round = (num: number, places: number): number =>
            Math.round(num * 10 ** places + Number.EPSILON) / 10 ** places;

        if (neLat && neLng && swLat && swLng) {
            const newBoundingBox = {
                neLat: round(neLat, 5),
                neLng: round(neLng, 5),
                swLat: round(swLat, 5),
                swLng: round(swLng, 5),
            };

            if (!boundingBoxEqual(newBoundingBox, boundingBox)) {
                console.log("HEREHERE");
                onMove(newBoundingBox);
            }
        }
    };

    useEffect(() => {
        console.log("SET VIEW");
        setView({
            center: fromLonLat([midpoint.longitude, midpoint.latitude]),
            zoom: zoomLevel(
                boundingBox.neLat,
                boundingBox.neLng,
                boundingBox.swLat,
                boundingBox.swLng,
                map
            ),
        });
    }, [midpoint, boundingBox, map]);

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
                <>
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
                                            <Card
                                                style={styles}
                                                w={300}
                                                withBorder
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
                                                        ${record.price} / night
                                                    </Text>
                                                </Flex>
                                            </Card>
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
                                                : "pink"
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
                </>
            )}
        </RMap>
    );
};

export default Map;

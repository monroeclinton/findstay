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
import { type MapEvent, Overlay } from "ol";
import View from "ol/View.js";
import {
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { type AppRouter } from "~/server/api/root";
import { InterestType } from "~/types/interests";
import {
    type BoundingBox,
    boundingBoxEqual,
    zoomLevel,
} from "~/utils/geometry";
import round from "~/utils/round";

import classes from "./HomeMap.module.css";
import { MapContext, MapContextProvider } from "./Map";

type RouterOutput = inferRouterOutputs<AppRouter>;

interface IMapProps {
    isLoading: boolean;
    data: RouterOutput["stay"]["getPage"] | undefined;
    sync: RouterOutput["stay"]["createSync"];
    dimensions: {
        width: number;
        height: number;
    };
    page: number;
    onMove: (_: BoundingBox) => void;
}

const StayCard = ({
    record,
    selected,
}: {
    record: RouterOutput["stay"]["getPage"]["stays"][0];
    selected: string | null;
    viewed: string[];
}) => {
    const { map } = useContext(MapContext);
    const cardRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!cardRef.current) return;

        const marker = new Overlay({
            id: record.id + "-card",
            position: [record.longitude, record.latitude],
            positioning: "top-center",
            offset: [0, 25],
            element: cardRef.current,
        });

        if (marker) {
            map?.addOverlay(marker);
        }

        return () => {
            map?.removeOverlay(marker);
        };
    }, [cardRef, map]);

    return (
        <div>
            <div ref={cardRef}>
                <Transition
                    mounted={selected === record.id}
                    transition="fade"
                    duration={100}
                    timingFunction="ease"
                    keepMounted={true}
                >
                    {(styles) => (
                        <Link
                            href={record.link}
                            target="_blank"
                            style={styles}
                            className={classes.cardLink}
                        >
                            <Card w={300} withBorder className={classes.card}>
                                <Card.Section mb="sm">
                                    <Image
                                        height={200}
                                        width="100%"
                                        src={record.images.at(0)}
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
                                                marginLeft: "6px",
                                            }}
                                        >
                                            {record.ratingLocalized}
                                        </Text>
                                    </Flex>
                                    <Text fw={600} c="green" mt="xs">
                                        ${record.price} / night
                                    </Text>
                                </Flex>
                            </Card>
                        </Link>
                    )}
                </Transition>
            </div>
        </div>
    );
};

const POICard = ({
    record,
    selected,
}: {
    record: RouterOutput["stay"]["createSync"]["poi"][0];
    selected: string | null;
    viewed: string[];
}) => {
    const { map } = useContext(MapContext);
    const cardRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!cardRef.current) return;

        const marker = new Overlay({
            id: record.id + "-poi-card",
            position: [record.longitude, record.latitude],
            positioning: "top-center",
            offset: [0, 25],
            element: cardRef.current,
        });

        if (marker) {
            map?.addOverlay(marker);
        }

        return () => {
            map?.removeOverlay(marker);
        };
    }, [cardRef, map]);

    return (
        <div>
            <div ref={cardRef}>
                <Transition
                    mounted={selected === record.id}
                    transition="fade"
                    duration={100}
                    timingFunction="ease"
                    keepMounted={true}
                >
                    {(styles) => (
                        <Link
                            href={record.link}
                            target="_blank"
                            style={styles}
                            className={classes.cardLink}
                        >
                            <Card w={300} withBorder className={classes.card}>
                                <Text>{record.name}</Text>

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
                                            {record.stars}
                                        </Text>
                                    </Flex>
                                    <Text mt="xs">
                                        {record.reviews} reviews
                                    </Text>
                                </Flex>
                            </Card>
                        </Link>
                    )}
                </Transition>
            </div>
        </div>
    );
};

const Map = ({
    isLoading,
    data,
    sync,
    dimensions,
    page,
    onMove,
}: IMapProps) => {
    const { map } = useContext(MapContext);
    const [selected, setSelected] = useState<null | string>(null);
    const [viewed, setViewed] = useState<Array<string>>([]);

    const handleMove = useCallback(
        (e: MapEvent) => {
            const extent = e.map.getView().calculateExtent(e.map.getSize());

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

    const handleClick = () => {
        setSelected(null);
    };

    const POIBadge = ({
        record,
    }: {
        record: RouterOutput["stay"]["createSync"]["poi"][0];
    }) => {
        const { map } = useContext(MapContext);
        const badgeRef = useRef<HTMLDivElement>(null);

        const marker = useMemo(
            () =>
                new Overlay({
                    id: record.id + "-poi-badge",
                    position: [record.longitude, record.latitude],
                    positioning: "center-center",
                }),
            [record.id, record.longitude, record.latitude]
        );

        useLayoutEffect(() => {
            if (badgeRef.current) {
                marker.setElement(badgeRef.current);
                map?.addOverlay(marker);
            }

            return () => {
                map?.removeOverlay(marker);
            };
        }, [badgeRef, marker, map]);

        return (
            <div>
                <Badge
                    ref={badgeRef}
                    style={{
                        position: "absolute",
                        userSelect: "none",
                        cursor: "pointer",
                    }}
                    variant="outline"
                    color={selected === record.id ? "black" : "green"}
                    onClick={() => {
                        setSelected(record.id);
                        setViewed([record.id, ...viewed]);
                    }}
                >
                    {record.type === InterestType.Supermarket && "🛒"}
                    {record.type === InterestType.Gym && "🏋️"}
                    {record.type === InterestType.Laundromat && "🧼"}
                    {record.type === InterestType.Cafe && "☕"}
                    {record.type === InterestType.CoworkingSpace && "💻"}
                </Badge>
            </div>
        );
    };

    const StayBadge = ({
        record,
    }: {
        record: RouterOutput["stay"]["getPage"]["stays"][0];
    }) => {
        const { map } = useContext(MapContext);
        const badgeRef = useRef<HTMLDivElement>(null);

        const marker = useMemo(
            () =>
                new Overlay({
                    id: record.id + "-badge",
                    position: [record.longitude, record.latitude],
                    positioning: "center-center",
                }),
            [record.id, record.longitude, record.latitude]
        );

        useLayoutEffect(() => {
            if (badgeRef.current) {
                marker.setElement(badgeRef.current);
                map?.addOverlay(marker);
            }

            return () => {
                map?.removeOverlay(marker);
            };
        }, [badgeRef, marker, map]);

        return (
            <div>
                <Badge
                    ref={badgeRef}
                    style={{
                        position: "absolute",
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
            </div>
        );
    };

    useEffect(() => {
        // For some reason OpenLayers sends a moveend event onload
        setTimeout(() => {
            map?.on("moveend", handleMove);
            map?.on("click", handleClick);
        }, 500);

        return () => {
            map?.un("moveend", handleMove);
            map?.on("click", handleClick);
        };
    }, [map, handleMove, sync, dimensions]);

    return (
        <>
            {data && (
                <>
                    {data.stays.map((record) => (
                        <StayCard
                            key={record.id + "-card-" + page.toString()}
                            record={record}
                            selected={selected}
                            viewed={viewed}
                        />
                    ))}
                    {data.stays.map((record) => (
                        <StayBadge
                            key={record.id + "-badge-" + page.toString()}
                            record={record}
                        />
                    ))}
                    {sync.poi.map((record) => (
                        <POIBadge
                            key={record.id + "-card-" + page.toString()}
                            record={record}
                        />
                    ))}
                    {sync.poi.map((record) => (
                        <POICard
                            key={record.id + "-card-" + page.toString()}
                            record={record}
                            selected={selected}
                            viewed={viewed}
                        />
                    ))}
                </>
            )}
            <div
                key="ol-loader"
                className={classNames(classes.olSpinner, {
                    [classes.olHidden as string]: !isLoading,
                })}
            >
                <Center>
                    <Card shadow="sm" withBorder>
                        <Loader />
                    </Card>
                </Center>
            </div>
        </>
    );
};

const HomeMap = (props: IMapProps) => {
    return (
        <MapContextProvider
            center={[
                props.sync.midpoint.longitude,
                props.sync.midpoint.latitude,
            ]}
            zoom={zoomLevel(
                props.sync.boundingBox.neLat,
                props.sync.boundingBox.neLng,
                props.sync.boundingBox.swLat,
                props.sync.boundingBox.swLng,
                props.dimensions
            )}
        >
            <Map {...props} />
        </MapContextProvider>
    );
};

export default HomeMap;

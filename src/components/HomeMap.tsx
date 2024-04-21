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
import { Feature, type MapEvent, Overlay } from "ol";
import { Point } from "ol/geom";
import { Vector as LayerVector } from "ol/layer";
import TileLayer from "ol/layer/Tile.js";
import OpenLayersMap from "ol/Map.js";
import { fromLonLat, transformExtent } from "ol/proj";
import { Vector as SourceVector } from "ol/source";
import OSM from "ol/source/OSM.js";
import View from "ol/View.js";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

import { type AppRouter } from "~/server/api/root";
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
    data: RouterOutput["home"]["getPage"] | undefined;
    sync: RouterOutput["home"]["createSync"];
    dimensions: {
        width: number;
        height: number;
    };
    page: number;
    onMove: (_: BoundingBox) => void;
}

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

    useEffect(() => {
        if (!sync.clientBoundingBox) {
            //map?.setView(
            //    new View({
            //        center: [sync.midpoint.longitude, sync.midpoint.latitude],
            //        zoom: zoomLevel(
            //            sync.boundingBox.neLat,
            //            sync.boundingBox.neLng,
            //            sync.boundingBox.swLat,
            //            sync.boundingBox.swLng,
            //            dimensions
            //        ),
            //    })
            //);
        }
    }, [
        map,
        sync.clientBoundingBox,
        sync.boundingBox,
        sync.midpoint,
        dimensions,
    ]);

    useEffect(() => {
        map?.on("moveend", handleMove);

        return () => {
            map?.un("moveend", handleMove);
        };
    }, [map, handleMove, sync, dimensions]);

    const MapBadge = ({
        record,
    }: {
        record: RouterOutput["home"]["getPage"]["locations"][0];
    }) => {
        const olRef = useRef<Overlay>();
        const badgeRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (!olRef.current && badgeRef.current) {
                olRef.current = new Overlay({
                    positioning: "center-center",
                });
                //map?.addOverlay(olRef.current);
                //const position = fromLonLat([
                //    record.longitude,
                //    record.latitude,
                //]);
                //olRef.current.setPosition(position);
                olRef.current.setElement(badgeRef.current);
            }

            return () => {
                if (olRef.current) {
                    //map.current?.removeOverlay(olRef.current);
                }
            };
        }, [record, badgeRef]);

        return (
            <Badge
                style={{
                    position: "absolute",
                    userSelect: "none",
                    cursor: "pointer",
                }}
                ref={badgeRef}
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
        );
    };

    return null;
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

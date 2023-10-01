import { Badge } from "@mantine/core";
import type { inferRouterOutputs } from "@trpc/server";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { RFeature, RLayerVector, RMap, ROSM, ROverlay } from "rlayers";

import { type AppRouter } from "~/server/api/root";

type RouterOutput = inferRouterOutputs<AppRouter>;

interface IMapProps {
    data: RouterOutput["home"]["getAll"];
}

const Map = ({ data }: IMapProps) => {
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
        >
            <ROSM />
            <RLayerVector zIndex={10}>
                {data.locations.map((record) => (
                    <RFeature
                        key={record.id}
                        geometry={
                            new Point(
                                fromLonLat([record.longitude, record.latitude])
                            )
                        }
                        onClick={(e) => {
                            console.log("clicked");
                        }}
                    >
                        <ROverlay className="example-overlay">
                            <Badge color="pink">${record.price}</Badge>
                        </ROverlay>
                    </RFeature>
                ))}
            </RLayerVector>
        </RMap>
    );
};

export default Map;

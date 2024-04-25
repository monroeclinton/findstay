import "ol/ol.css";

import { Map, type MapBrowserEvent, type MapEvent, Overlay, View } from "ol";
import { MousePosition, OverviewMap, Zoom } from "ol/control";
import { type Coordinate } from "ol/coordinate";
import { type FeatureLike } from "ol/Feature";
import { type SimpleGeometry } from "ol/geom";
import { type Layer, Vector as VectorLayer } from "ol/layer";
import TileLayer from "ol/layer/Tile";
import { fromLonLat, useGeographic } from "ol/proj";
import { OSM, Vector as VectorSource } from "ol/source";
import { type FitOptions } from "ol/View";
import * as React from "react";
import {
    type DependencyList,
    type MutableRefObject,
    type ReactNode,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { MapContext } from "./Context";
import classes from "./Map.module.css";

(() => {
    useGeographic();
})();

const MapContextProvider = ({
    children,
    center,
    zoom,
}: {
    children: ReactNode;
    center: Coordinate;
    zoom: number;
}) => {
    const mapRef = useRef() as MutableRefObject<HTMLDivElement>;

    const [featureLayers, setFeatureLayers] = useState<Layer[]>([]);
    const [baseLayer, setBaseLayer] = useState<Layer>(
        () =>
            new TileLayer({
                source: new OSM(),
            })
    );
    const vectorSource = new VectorSource();

    const vectorLayer = new VectorLayer({
        source: vectorSource,
    });

    const layers = useMemo(
        () => [baseLayer, vectorLayer, ...featureLayers],
        [featureLayers, baseLayer]
    );

    const map = useMemo(
        () =>
            new Map({
                layers,
                view: new View({
                    center,
                    zoom,
                }),
            }),
        []
    );

    useEffect(() => {
        map.setTarget(mapRef.current);
    }, [map, mapRef]);

    return (
        <MapContext.Provider
            value={{
                map,
                setBaseLayer,
                setFeatureLayers,
            }}
        >
            <div className={classes.mapContainer}>
                {children}
                <div id="map" ref={mapRef} className={classes.map} />
            </div>
        </MapContext.Provider>
    );
};

export { MapContextProvider };

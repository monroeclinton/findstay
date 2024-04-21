import "ol/ol.css";

import { Map, type MapBrowserEvent, type MapEvent, Overlay, View } from "ol";
import { MousePosition, OverviewMap, Zoom } from "ol/control";
import { type Coordinate } from "ol/coordinate";
import { type FeatureLike } from "ol/Feature";
import { type SimpleGeometry } from "ol/geom";
import { type Layer } from "ol/layer";
import TileLayer from "ol/layer/Tile";
import { fromLonLat, useGeographic } from "ol/proj";
import { OSM } from "ol/source";
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
    const overlayRef = useRef() as MutableRefObject<HTMLDivElement>;

    const [featureLayers, setFeatureLayers] = useState<Layer[]>([]);
    const [baseLayer, setBaseLayer] = useState<Layer>(
        () =>
            new TileLayer({
                source: new OSM(),
            })
    );

    const layers = useMemo(
        () => [baseLayer, ...featureLayers],
        [featureLayers, baseLayer]
    );

    const overlay = useMemo(() => new Overlay({}), []);

    const map = useMemo(
        () =>
            new Map({
                layers,
                overlays: [overlay],
                controls: [new Zoom()],
                view: new View({
                    center,
                    zoom,
                }),
            }),
        [overlay]
    );

    const [overlayPosition, setOverlayPosition] = useState<
        number[] | undefined
    >();
    const [overlayContent, setOverlayContent] = useState<
        ReactNode | undefined
    >();

    useEffect(() => {
        overlay.setPosition(overlayPosition);
    }, [overlay, overlayPosition]);

    useEffect(() => {
        map.setTarget(mapRef.current);
        overlay.setElement(overlayRef.current);
    }, [map, mapRef, overlay, overlayRef]);

    return (
        <MapContext.Provider
            value={{
                map,
                overlay,
                setBaseLayer,
                setFeatureLayers,
                setOverlayPosition,
                setOverlayContent,
                overlayContent,
            }}
        >
            <>
                {children}
                <div id="map" ref={mapRef} className={classes.map} />
                <div id="overlay" ref={overlayRef}>
                    {overlayContent}
                </div>
            </>
        </MapContext.Provider>
    );
};

export { MapContextProvider };

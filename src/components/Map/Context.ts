import { type Map, type Overlay } from "ol";
import { type Layer } from "ol/layer";
import * as React from "react";
import { type Dispatch, type ReactNode, type SetStateAction } from "react";

export const MapContext = React.createContext<{
    map?: Map;
    overlay?: Overlay;
    setBaseLayer: Dispatch<SetStateAction<Layer>>;
    setFeatureLayers: Dispatch<SetStateAction<Layer[]>>;
    setOverlayPosition: Dispatch<SetStateAction<number[] | undefined>>;
    overlayContent?: ReactNode | undefined;
    setOverlayContent: Dispatch<SetStateAction<ReactNode | undefined>>;
}>({
    setBaseLayer: () => {
        return;
    },
    setFeatureLayers: () => {
        return;
    },
    setOverlayPosition: () => {
        return;
    },
    setOverlayContent: () => {
        return;
    },
});

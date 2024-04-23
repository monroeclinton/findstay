import { type Map } from "ol";
import { type Layer } from "ol/layer";
import * as React from "react";
import { type Dispatch, type SetStateAction } from "react";

export const MapContext = React.createContext<{
    map?: Map;
    setBaseLayer: Dispatch<SetStateAction<Layer>>;
    setFeatureLayers: Dispatch<SetStateAction<Layer[]>>;
}>({
    setBaseLayer: () => {
        return;
    },
    setFeatureLayers: () => {
        return;
    },
});

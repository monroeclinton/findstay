import round from "~/utils/round";

export type BoundingBox = {
    neLat: number;
    neLng: number;
    swLat: number;
    swLng: number;
};

const EARTH_CIR_METERS = 40075016.686;
const DEGREES_PER_METER = 360 / EARTH_CIR_METERS;

export const boundingBoxEqual = (
    bBox1: BoundingBox,
    bBox2: BoundingBox
): boolean => {
    return (
        round(bBox1.neLat, 2) === round(bBox2.neLat, 2) &&
        round(bBox1.neLng, 2) === round(bBox2.neLng, 2) &&
        round(bBox1.swLat, 2) === round(bBox2.swLat, 2) &&
        round(bBox1.swLng, 2) === round(bBox2.swLng, 2)
    );
};

// https://stackoverflow.com/a/13274361
export const zoomLevel = (
    neLat: number,
    neLng: number,
    swLat: number,
    swLng: number,
    map: { height: number; width: number }
): number => {
    const WORLD_DIM = { height: 256, width: 256 };
    const ZOOM_MAX = 21;

    const zoom = (mapPx: number, worldPx: number, fraction: number): number => {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    };

    const latFraction = (latRad(neLat) - latRad(swLat)) / Math.PI;

    const lngDiff = neLng - swLng;
    const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;

    const latZoom = zoom(map.height, WORLD_DIM.height, latFraction);
    const lngZoom = zoom(map.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
};

// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Lon./lat._to_bbox_2
export const latLngToBounds = (
    lat: number,
    lng: number,
    zoom: number,
    width: number,
    height: number
) => {
    const metersPerPixelEW = EARTH_CIR_METERS / Math.pow(2, zoom + 8);
    const metersPerPixelNS =
        (EARTH_CIR_METERS / Math.pow(2, zoom + 8)) * Math.cos(deg2rad(lat));

    const shiftMetersEW = (width / 2) * metersPerPixelEW;
    const shiftMetersNS = (height / 2) * metersPerPixelNS;

    const shiftDegreesEW = shiftMetersEW * DEGREES_PER_METER;
    const shiftDegreesNS = shiftMetersNS * DEGREES_PER_METER;

    return {
        swLat: lat - shiftDegreesNS,
        swLng: lng - shiftDegreesEW,
        neLat: lat + shiftDegreesNS,
        neLng: lng + shiftDegreesEW,
    };
};

// https://stackoverflow.com/q/18883601
export const getDistanceFromLatLonInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1); // deg2rad below
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

// https://stackoverflow.com/a/4656937
export const getMidPoint = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): {
    latitude: number;
    longitude: number;
} => {
    const dLon = deg2rad(lon2 - lon1);

    lat1 = deg2rad(lat1);
    lat2 = deg2rad(lat2);
    lon1 = deg2rad(lon1);

    const Bx = Math.cos(lat2) * Math.cos(dLon);
    const By = Math.cos(lat2) * Math.sin(dLon);
    const lat3 = Math.atan2(
        Math.sin(lat1) + Math.sin(lat2),
        Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By)
    );
    const lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

    return {
        latitude: rad2deg(lat3),
        longitude: rad2deg(lon3),
    };
};

const rad2deg = (rad: number): number => {
    return rad * (180 / Math.PI);
};

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

const latRad = (lat: number): number => {
    const sin = Math.sin((lat * Math.PI) / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
};

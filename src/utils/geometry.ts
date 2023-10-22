// https://stackoverflow.com/a/13274361
export const zoomLevel = (
    neLat: number,
    neLng: number,
    swLat: number,
    swLng: number,
    map: { height: number, width: number }
): number => {
    let WORLD_DIM = { height: 256, width: 256 };
    let ZOOM_MAX = 21;

    const zoom = (mapPx: number, worldPx: number, fraction: number): number => {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    let latFraction = (latRad(neLat) - latRad(swLat)) / Math.PI;

    let lngDiff = neLng - swLng;
    let lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    let latZoom = zoom(map.height, WORLD_DIM.height, latFraction);
    let lngZoom = zoom(map.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

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
}

// https://stackoverflow.com/a/4656937
export const getMidPoint = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
): { 
    latitude: number, 
    longitude: number
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
}

const rad2deg = (rad: number): number => {
    return rad * (180 / Math.PI);
}

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
}

const latRad = (lat: number): number => {
    let sin = Math.sin(lat * Math.PI / 180);
    let radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
}

const round = (num: number, places: number): number =>
    Math.round(num * 10 ** places + Number.EPSILON) / 10 ** places;

export default round;

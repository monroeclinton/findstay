import { useEffect, useRef } from "react";

export const usePrevious = <T>(value: T): [T | undefined, (_: T) => void] => {
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = value;
    });

    const setPrevious = (value: T) => {
        ref.current = value;
    };

    return [ref.current, setPrevious];
};
